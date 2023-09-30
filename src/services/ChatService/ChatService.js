import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

class ChatService {
  
  // Create a new Chat
  async createChat(participants) {
    try {
      const response = await axios.post(`${API_URL}chat/chats/`, { participants });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get list of Chats for a User
  async getChats(userId) {
    try {
      const response = await axios.get(`${API_URL}chat/chats/`, { params: { user: userId } });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Send a message in a Chat
  async sendMessage(chatId, senderId, text) {
    try {
      const response = await axios.post(`${API_URL}chat/messages/`, { chat: chatId, sender: senderId, text });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get messages in a Chat
  async getMessages(chatId) {
    try {
      const response = await axios.get(`${API_URL}chat/messages/`, { params: { chat: chatId } });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new ChatService();
