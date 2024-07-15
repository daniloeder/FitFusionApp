import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Keyboard, Dimensions, Image, BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useGlobalContext } from './../../services/GlobalContext';
import { useChat } from '../../utils/chats';
import GradientBackground from './../../components/GradientBackground/GradientBackground';
import Icons from '../../components/Icons/Icons';
import { formatDate } from './../../utils/helpers';
import { getAllKeys } from '../../store/store';
import { BASE_URL } from '@env';

const { width } = Dimensions.get('window');

const ChatScreen = ({ route, navigation }) => {
  const { chats, setChats, tChat, setTChat, markMessagesAsRead } = useChat();
  const { userId, participantId, chatImage, chatName, isGroupChat } = route.params;
  const [input, setInput] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const { chatId, showOnline, setChatId, sendMessage, onlineUsers } = useGlobalContext();

  useFocusEffect(
    useCallback(() => {
    if (showOnline && participantId) {
      const intervalId = setInterval(() => {
        sendMessage({ type: 'is_online', track: [participantId] });
      }, 2500);

      return () => clearInterval(intervalId);
    }
  }, [participantId])
);

  useEffect(() => {
    if (chatId) {
      if (chats[chatId]) {
        if (chats[chatId].unread > 0) {
          markMessagesAsRead(userId, chatId);
        }
      } else if (userId) {
        getAllKeys(`${userId}_chats_${chatId}`).then(data => {
          const chatDict = data.reduce((acc, item) => {
            acc[item.id] = {
              ...item,
              messages: item.messages.slice(-100),
            };
            return acc;
          }, {});
          if (Object.keys(chatDict).length > 0) {
            setChats(chatDict);
          }
        });
      }
    }
  }, [chatId, chats]);

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

  useEffect(() => {
    if (participantId && tChat[participantId] && tChat[participantId].chat_info.is_defined) {
      setChatId(tChat[participantId].chat_info.id);
    }
  }, [tChat]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => setChatId(null);
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [])
  );

  const chat_messages = chats[chatId] && chats[chatId].messages ? Object.values(chats[chatId].messages).sort((a, b) => a.id - b.id).reverse() : []
  const t_chat_messages = participantId && tChat[participantId] && tChat[participantId].messages ? Object.values(tChat[participantId].messages).sort((a, b) => a.id - b.id) : []

  return (
    <KeyboardAvoidingView style={styles.gradientContainer}>
      <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => {
            if (!isGroupChat) {
              navigation.navigate('User Profile', { id: participantId })
            }
          }}
          style={styles.userInfo}>
          {participantId && onlineUsers.includes(participantId) && (
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
        </TouchableOpacity>

        {
          <FlatList
            data={t_chat_messages.concat(chat_messages)}
            ListFooterComponent={<View style={{ marginTop: width * 0.12 }}></View>}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              return (
                <View key={item.id} style={[styles.messageBox, item.sender === userId ? styles.myMessage : styles.otherMessage]}>
                  <Text style={styles.messageText}>{item.text}</Text>
                  <View style={{ position: 'absolute', right: 5, bottom: 1, flexDirection: 'row' }}>
                    <Text style={{ color: item.sender === userId ? '#BBB' : '#888', fontSize: 7 }}>{formatDate(item.created_at)}</Text>
                    {item.sender === userId && <Icons name={
                      !item.temp ? (item.received_by && item.received_by.length > 1 ? "DoubleTick" : "SingleTick") : "Watch"
                    } size={width * 0.03} fill={'#ddd'} style={{ marginLeft: 3 }} />}
                  </View>
                </View>
              )
            }}
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

            const chat_code = "chat_" + Math.floor(Math.random() * 1000000000).toString();
            if (chatId) {
              sendMessage({ type: "chat_message", text: input, chat_room_id: chatId, chat_code: chat_code })
            } else {
              sendMessage({ type: "chat_message", text: input, participant_id: participantId, chat_code: chat_code })
            }

            if (participantId) {
              setTChat(prevTChats => {
                p_messages = prevTChats[participantId] ? prevTChats[participantId].messages : []
                return {
                  ...prevTChats,
                  [participantId]: {
                    chat_info: { id: chatId || chat_code, chat_user_id: participantId },
                    messages: [
                      { id: 't_' + p_messages.length, text: input, sender: userId, received_by: [], created_at: new Date().toISOString(), chat_code: chat_code, temp: true },
                      ...p_messages
                    ]
                  }
                }
              });
            }

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
    marginHorizontal: width * 0.02,
  },
  messageBox: {
    minWidth: '25%',
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