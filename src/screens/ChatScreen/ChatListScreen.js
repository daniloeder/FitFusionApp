import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useGlobalContext } from './../../services/GlobalContext';
import { useChat } from '../../utils/chats';
import GradientBackground from './../../components/GradientBackground/GradientBackground';
import { formatDate } from './../../utils/helpers';
import { BASE_URL } from '@env';
import Icons from '../../components/Icons/Icons';
import { getAllKeys, deleteData } from '../../store/store';

const { width } = Dimensions.get('window');

const ChatListScreen = ({ route, navigation }) => {
  const { userToken } = route.params;
  const [chatRooms, setChatRooms] = useState([]);
  const [onlineStatus, setOnlineStatus] = useState({});

  const { sendMessage, setCurrentChat } = useGlobalContext();

  const { chats, setChats } = useChat();

  const UnreadMessagesNumber = ({ number }) => {
    return (
      <View
        style={{
          paddingHorizontal: width * 0.02,
          borderRadius: width * 0.02,
          backgroundColor: 'rgba(49, 130, 206, 0.8)',
          position: 'absolute',
          left: '2%',
          bottom: '20%',
        }}
      >
        <Text
          style={{
            fontSize: width * 0.03,
            color: '#FFF',
            fontWeight: 'bold',
          }}
        >
          {number}
        </Text>
      </View>
    )
  }

  useEffect(() => {
    if (Object.keys(chats).length === 0) {
      getAllKeys('chats_').then(data => {
        const chatDict = data.reduce((acc, item, index) => {
          acc[item.id] = item;
          if (index > 10) {
            deleteData('chats_' + item.id);
          }
          return acc;
        }, {});
  
        setChats(chatDict);
      });
    }
  }, []);  

  useFocusEffect(
    useCallback(() => {
      setCurrentChat(0);
    }, [userToken, chats])
  );

  const sortedChatRooms = [...chatRooms].sort((a, b) => {
    return new Date(b.last_message_time) - new Date(a.last_message_time);
  });

  useEffect(() => {
    if (Object.keys(chats).length > 0) {
      setChatRooms(Object.values(chats));
    }
  }, [chats]);

  useEffect(() => {
    for (let i = 0; i < chatRooms.length; i++) {
      if (!chatRooms[i].chat_info.id) {
        sendMessage({ type: "get_chat_info", chat_room_id: chatRooms[i].id });
      }
    }
  }, [chatRooms]);

  return (
    <View
      style={styles.gradientContainer}
    >
      <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />
      <View style={styles.container}>

        <FlatList
          data={sortedChatRooms}
          keyExtractor={chat => chat.id}
          renderItem={({ item: chat, index }) => {

            const isGroupChat = chat.is_group_chat;
            const chatImage = chat.chat_info && chat.chat_info.image;
            const chatName = isGroupChat ? 'Group Chat' : chat.chat_info && chat.chat_info.name;

            let lastMessageText = ""
            if (chat.messages) {
              lastMessageText = chat.messages[chat.messages.length - 1].text;
            } else {
              lastMessageText = chat.last_message.text;
            }

            lastMessageText = lastMessageText.length
              ? ((lastMessageText.length > 85 ? lastMessageText.slice(0, 85) + '...' : lastMessageText) || (lastMessageText.media ? `[${lastMessageText.media}]` : '[Media]'))
              : 'No messages yet';
            const isOnline = onlineStatus[chat.id];

            return (
              <TouchableOpacity
                style={styles.chatRoomBox}
                onPress={() => {
                  navigation.navigate('Chat', { chatId: chat.id, participantId: chat.id, chatImage: chatImage, chatName: chatName })
                }}
              >
                {chatImage ?
                  <Image
                    source={{ uri: BASE_URL + `${chatImage}` }}
                    style={styles.chatImage}
                  /> :
                  <View style={{ width: width * 0.105, height: width * 0.105, borderRadius: width * 0.1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.3)' }} >
                    <Icons name="Profile" size={width * 0.085} fill={'#1C274C'} />
                  </View>
                }
                {chats[chat.id] && chats[chat.id].unread > 0 && <UnreadMessagesNumber number={chats[chat.id].unread} />}
                <View style={styles.chatTextContainer}>
                  <Text style={styles.chatRoomText}>{chatName}</Text>
                  <Text style={styles.chatRoomDetailText}>{lastMessageText}</Text>
                </View>

                <View
                  style={styles.chatRoomRightBlock}
                >
                  <Text style={styles.chatRoomDetailLastMessageTime}>{formatDate(chat.messages[chat.messages.length - 1]?.created_at)}</Text>
                  {isOnline && (
                    <View style={styles.onlineDot}></View>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </View>
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
  chatRoomRightBlock: {
    minWidth: width * 0.1,
    height: width * 0.1,
    alignItems: 'center',
    flexDirection: 'row',
  },
  chatRoomDetailLastMessageTime: {
    color: '#FFF',
    fontSize: width * 0.028,
    marginRight: 5,
  },
  onlineDot: {
    width: 10,
    height: 10,
    marginLeft: 'auto',
    backgroundColor: 'green',
    borderRadius: 5,
  },
});

export default ChatListScreen;