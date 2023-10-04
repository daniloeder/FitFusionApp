import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import GradientBackground from './../../components/GradientBackground/GradientBackground';

const ChatScreen = ({ route }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  // Assuming you are passing chatId through route params.
  const { chatId } = route.params;

  useEffect(() => {
    // Fetching chat messages from the server
    fetchMessages();
  }, [chatId]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/chat/messages/?chat=${chatId}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (input.trim() === '') return;
    try {
      await fetch('http://localhost:8000/api/chat/messages/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat: chatId,
          text: input,
          // Assuming you have the sender id, or it's being managed by the backend.
        }),
      });

      setInput('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <View style={styles.gradientContainer}>
      <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />
      
      <View style={styles.container}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.messageBox}>
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          )}
          inverted
        />
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message"
            placeholderTextColor="#A0AEC0"
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
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
  messageBox: {
    backgroundColor: '#2D3748',
    opacity: 0.8,
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    color: '#A0AEC0',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#2D3748',
    opacity: 0.8,
    borderTopColor: '#4A5568',
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#4A5568',
    borderColor: '#4A5568',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    color: '#A0AEC0',
  },
  sendButton: {
    backgroundColor: '#3182CE',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginLeft: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  sendText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ChatScreen;