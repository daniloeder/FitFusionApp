import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, Image, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import GradientBackground from './../../components/GradientBackground/GradientBackground';

const { width } = Dimensions.get('window');

const ChatListScreen = ({ route, navigation }) => {
  const { userToken } = route.params;
  const [chatRooms, setChatRooms] = useState([]);
  const [onlineStatus, setOnlineStatus] = useState({});

  const fetchChatRooms = async () => {
    try {
      const response = await fetch('http://192.168.0.118:8000/api/chatrooms/', {
        headers: {
          'Authorization': `Token ${userToken}`,
        },
      });
      const data = await response.json();

      const onlineStatusData = {};
      data.forEach((chat) => {
        onlineStatusData[chat.id] = chat.is_online;
      });
      setOnlineStatus(onlineStatusData);

      setChatRooms(data);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchChatRooms();
    }, [userToken])
  );

  return (
    <KeyboardAvoidingView
      style={styles.gradientContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />
      <View style={styles.container}>

        <FlatList
          data={chatRooms}
          keyExtractor={(chat) => chat.id.toString()}
          renderItem={({ item: chat }) => {
            const isGroupChat = chat.is_group_chat;
            const chatImage = isGroupChat ? null : chat.participant.profile_image?.image;
            const chatName = isGroupChat ? 'Group Chat' : chat.participant_name;
            const lastMessageText = chat.last_message
              ? ((chat.last_message.text.length > 85 ? chat.last_message.text.slice(0, 85) + '...' : chat.last_message.text) || (chat.last_message.media ? `[${chat.last_message.media}]` : '[Media]'))
              : 'No messages yet';
            const isOnline = onlineStatus[chat.id];
            return (
              <TouchableOpacity
                style={styles.chatRoomBox}
                onPress={() => navigation.navigate('Chat', { chatId: chat.id, participantId: chat.participant.id, chatImage: chatImage, chatName: chatName })}
              >
                {chatImage && !isGroupChat && (
                  <Image
                    source={{ uri: `http://192.168.0.118:8000${chatImage}` }}
                    style={styles.chatImage}
                  />
                )}
                <View style={styles.chatTextContainer}>
                  <Text style={styles.chatRoomText}>{chatName}</Text>
                  <Text style={styles.chatRoomDetailText}>{lastMessageText}</Text>
                </View>

                {isOnline && (
                  <View style={styles.onlineDot}></View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 10,
  },
  chatRoomBox: {
    backgroundColor: 'rgba(45, 55, 72, 0.6)',
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  chatRoomText: {
    fontSize: 16,
    color: '#E2E8F0',
    fontWeight: 'bold',
  },
  chatRoomDetailText: {
    fontSize: 14,
    color: '#CBD5E0',
    marginTop: 5,
  },
  chatImage: {
    width: width * 0.11,
    height: width * 0.11,
    borderRadius: 25,
  },
  onlineDot: {
    width: 10,
    height: 10,
    backgroundColor: 'green',
    borderRadius: 5,
    marginRight: 10,
  },
});

export default ChatListScreen;