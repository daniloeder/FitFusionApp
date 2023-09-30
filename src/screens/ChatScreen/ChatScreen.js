import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';

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
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  messageBox: {
    backgroundColor: '#e1ffc7',
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
  sendButton: {
    backgroundColor: '#28a745',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginLeft: 10,
  },
  sendText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ChatScreen;
