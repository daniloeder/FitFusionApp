import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { deleteAuthToken } from '../store/store';
import { useChat } from '../utils/chats';

const GlobalContext = createContext(null);

export const GlobalProvider = ({ children, userId, userToken, setUserToken, chatId, setChatId, userSubscriptionPlan, setUserSubscriptionPlan, addNotification, markAllAsRead }) => {
  const [online, setOnline] = useState(true);
  const [webSocket, setWebSocket] = useState(null);
  const [chatWebSocket, setChatWebSocket] = useState(null);
  const [receivedMessagesIds, setReceivedMessagesIds] = useState(null);
  const [chatRoomIds, setChatRoomIds] = useState([]);
  const reconnectDelay = 5000; // 5 seconds delay for reconnection
  const { handleNewMessage, handleNewMessages, handleChatInfo, userReceivedMessages, handleSendingMessageError, setChats } = useChat();
  const latestUserToken = useRef(userToken);

  useEffect(() => {
    latestUserToken.current = userToken;
  }, [userToken]);

  const sendMessage = useCallback((message) => {
    if (chatWebSocket && chatWebSocket.readyState === WebSocket.OPEN) {
      //console.log("Sending message: ", message);
      chatWebSocket.send(JSON.stringify(message));
    }
  }, [chatWebSocket]);

  useEffect(() => {
    if (receivedMessagesIds && chatWebSocket) {
      sendMessage({
        type: 'message_arrived',
        message_ids: receivedMessagesIds
      });
    }
  }, [receivedMessagesIds, sendMessage]);

  const handleMessage = useCallback((e) => {
    try {
      const message = JSON.parse(e.data);
      console.log("Received message: ", userId, message);

      if (message.type === "chat_message") {
        const chatId = message.chat_room;
        handleNewMessage(userId, chatId, message);
        setReceivedMessagesIds([message.id]);
      } else if (message.type === "chat_messages") {
        handleNewMessages(userId, message.messages_data);
        setReceivedMessagesIds(message.messages_data.map(message => message.id));
      } else if (message.type === "user_received_messages") {
        userReceivedMessages(userId, message);
      } else if (message.type === "notification") {
        addNotification(message);
      } else if (message.type === "get_chat_info") {
        handleChatInfo(userId, message);
      } else if (message.type === "sending_message_error"){
        handleSendingMessageError(userId, message);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }, [userToken]);

  const connectWebSocket = useCallback(() => {
    if (!latestUserToken.current) {
      return;
    }

    const ws = new WebSocket(`ws://192.168.0.118:8000/ws/common/?token=${latestUserToken.current}`);
    const chatSocket = new WebSocket(`ws://192.168.0.118:8000/ws/chat/?token=${latestUserToken.current}`);

    ws.onopen = () => {
      console.log('WebSocket Connected');
      setWebSocket(ws);
      ws.onmessage = handleMessage;
      ws.onerror = (e) => {
        console.error('WebSocket Error:', e.message);
      };
      ws.onclose = (e) => {
        console.log('WebSocket Disconnected:', e.reason);
        setWebSocket(null);
        // Reconnect after a delay
        setTimeout(() => {
          connectWebSocket();
        }, reconnectDelay);
      };
    };

    chatSocket.onopen = () => {
      setChatWebSocket(chatSocket);
      chatSocket.onmessage = handleMessage;
      chatSocket.onerror = (e) => {
        console.error('WebSocket Error:', e.message);
      };
      chatSocket.onclose = (e) => {
        console.log('WebSocket Disconnected:', e.reason);
        setChatWebSocket(null);
        setTimeout(connectWebSocket, reconnectDelay);
      };
    };

    return () => {
      ws.close();
      chatSocket.close();
    };
  }, [handleMessage]);

  const handleLogout = () => {
    setChats({});
    deleteAuthToken();
    setUserToken(null);

    if (webSocket) {
      webSocket.close();
    }
    if (chatWebSocket) {
      chatWebSocket.close();
    }
  };

  useEffect(() => {
    if (userToken) {
      connectWebSocket();
    }
    return () => {
      if (webSocket) webSocket.close();
      if (chatWebSocket) chatWebSocket.close();
    };
  }, [connectWebSocket, userToken]);

  return (
    <GlobalContext.Provider value={{ userId, online, userToken, chatId, setChatId, userSubscriptionPlan, setUserSubscriptionPlan, sendMessage, markAllAsRead, handleLogout }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
