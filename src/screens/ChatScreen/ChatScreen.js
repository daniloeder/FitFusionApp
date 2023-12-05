import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Keyboard, Dimensions, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import GradientBackground from './../../components/GradientBackground/GradientBackground';
import Icons from '../../components/Icons/Icons';
import { BASE_URL } from '@env';

const { width } = Dimensions.get('window');

const ChatListScreen = ({ route, navigation }) => {
  const { userToken, userId, chatId, participantId, chatImage, chatName } = route.params;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(true);

  const fetchMessages = async () => {
    try {
      const response = await fetch(BASE_URL + `/api/chatrooms/${chatId}/messages/`, {
        headers: {
          'Authorization': `Token ${userToken}`,
        },
      });
      const data = await response.json();
      setMessages(data.reverse());
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };


  const sendMessage = async () => {
    if (input.trim() === '') return;
    try {
      let endpoint;
      let requestBody;
      endpoint = BASE_URL + '/api/chatrooms/';
      requestBody = {
        participant_id: participantId,
        text: input,
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${userToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      const newMessage = await response.json();
      if (response.ok) {
        setMessages(previousMessages => [newMessage, ...previousMessages]);
        setInput('');
      } else {
        console.error('Error in response:', newMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };


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
      setMessages([]);
      if (chatId) {
        fetchMessages();
      }
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
          <Image
            source={{ uri: BASE_URL + `${chatImage}` }}
            style={styles.chatImage}
          />
          <Text style={styles.chatName}>{chatName}</Text>
        </View>
        <FlatList
          data={messages}
          ListFooterComponent={<View style={{marginTop:width*0.12}}></View>}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[styles.messageBox, item.sender === userId ? styles.myMessage : styles.otherMessage]}>
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          )}
          inverted
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message"
          placeholderTextColor="#A0AEC0"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
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
  },
  messageBox: {
    padding: 10,
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

export default ChatListScreen;