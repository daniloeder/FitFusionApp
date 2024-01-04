import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Keyboard, Dimensions, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useGlobalContext } from './../../services/GlobalContext';
import { useChat } from '../../utils/chats';
import GradientBackground from './../../components/GradientBackground/GradientBackground';
import Icons from '../../components/Icons/Icons';
import { formatDate } from './../../utils/helpers';
import { BASE_URL } from '@env';

const { width } = Dimensions.get('window');

const ChatScreen = ({ route, navigation }) => {
  const { chats, markMessagesAsRead, handleNewMessage } = useChat();
  const { userToken, userId, participantId, chatImage, chatName } = route.params;
  const [chatId, setChatId] = useState(false);
  const [input, setInput] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(true);

  const { webSocket, sendMessage, setCurrentChat } = useGlobalContext();

  webSocket.onmessage = (e) => {
    try {
      const message = JSON.parse(e.data);
      if (!chatId && !Object.keys(chats).includes(message.chat_room)) {
        setChatId(message.chat_room);
      }
      handleNewMessage(message);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(BASE_URL + `/api/chatrooms/${chatId}/messages/`, {
        headers: {
          'Authorization': `Token ${userToken}`,
        },
      });
      const data = await response.json();
      //console.log(data)
      //setMessages(data.reverse());
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    setChatId(route.params.chatId || false);
    setCurrentChat(route.params.chatId);
  }, [route.params.chatId]);

  useEffect(() => {

    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true),
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false),
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (isKeyboardVisible) {
      //navigation.setOptions({ tabBarStyle: { display: 'none' } });
    } else {
      //navigation.setOptions({ tabBarStyle: { display: undefined } });
    }
  }, [isKeyboardVisible, navigation]);

  useFocusEffect(
    useCallback(() => {
      if (chatId) {
        fetchMessages();
      }
      return () => {
        markMessagesAsRead(chatId);
      };
    }, [chatId])
  );


  return (
    <KeyboardAvoidingView style={styles.gradientContainer}>
      <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />
      <View style={styles.container}>
        <View style={styles.userInfo}>
          {onlineStatus && (
            <View style={styles.onlineDot}></View>
          )}
          {chatImage ?
            <Image
              source={{ uri: BASE_URL + `${chatImage}` }}
              style={styles.chatImage}
            /> :
            <View style={{ width: width * 0.09, height: width * 0.09, borderRadius: width * 0.1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.3)' }} >
              <Icons name="Profile" size={width * 0.085} fill={'#1C274C'} />
            </View>
          }
          <Text style={styles.chatName}>{chatName}</Text>
        </View>
        {chats[chatId] && chats[chatId].messages && <FlatList
          data={[...chats[chatId].messages].reverse()}
          ListFooterComponent={<View style={{ marginTop: width * 0.12 }}></View>}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View key={item.id} style={[styles.messageBox, item.sender === userId ? styles.myMessage : styles.otherMessage]}>
              <Text style={styles.messageText}>{item.text}</Text>
              <Text style={{ color: item.sender === userId ? '#BBB' : '#888', position: 'absolute', right: 5, bottom: 1, fontSize: 7 }}>
                {formatDate(item.created_at)}
              </Text>
            </View>
          )}
          inverted
        />}
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message"
          placeholderTextColor="#A0AEC0"
        />
        <TouchableOpacity style={styles.sendButton} onPress={() => {
          if (input.trim() !== '') {
            sendMessage(chatId ? { type: "chat_message", text: input, chat_room_id: chatId } : { type: "chat_message", text: input, participant_id: participantId });
            setInput('');
          }
        }}>
          <Icons name="SendMessage" size={width * 0.07} />
        </TouchableOpacity>
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
  userInfo: {
    position: 'absolute',
    top: 10,
    left: 10,
    padding: 5,
    borderRadius: width * 0.03,
    backgroundColor: 'rgba(100, 100, 100, 0.4)',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  chatImage: {
    width: 35,
    height: 35,
    borderRadius: 20,
    marginRight: 10,
  },
  chatName: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: '900',
    textShadowColor: '#000',
    textShadowRadius: 10,
    marginHorizontal: width*0.02,
  },
  messageBox: {
    minWidth: '18%',
    padding: 5,
    paddingBottom: 10,
    paddingHorizontal: 10,
    marginVertical: 3,
    borderRadius: 10,
    maxWidth: '70%',
  },
  myMessage: {
    backgroundColor: 'rgba(49, 130, 206, 0.8)',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: 'rgba(45, 55, 72, 0.8)',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    color: '#E2E8F0',
  },
  inputContainer: {
    width: width,
    height: width * 0.13,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2D3748',
    borderTopColor: '#4A5568',
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  input: {
    flex: 1,
    backgroundColor: '#4A5568',
    borderColor: '#4A5568',
    borderWidth: 1,
    borderRadius: 15,
    padding: 10,
    color: '#A0AEC0',
    marginRight: 5,
  },
  sendButton: {
    width: width * 0.12,
    height: width * 0.12,
    backgroundColor: 'rgba(49, 130, 206, 0.8)',
    borderRadius: width * 0.06,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  onlineDot: {
    width: 10,
    height: 10,
    backgroundColor: 'green',
    borderRadius: 5,
    marginRight: 10,
  },
});

export default ChatScreen;