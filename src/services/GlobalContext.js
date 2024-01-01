import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useChat } from '../utils/chats';

const GlobalContext = createContext(null);

export const GlobalProvider = ({ children, userToken, addNotification, markAllAsRead }) => {
  const [webSocket, setWebSocket] = useState(null);
  const reconnectDelay = 5000; // 5 seconds delay for reconnection
  const { handleNewMessage } = useChat();

  // Function to send messages
  const sendMessage = useCallback((message) => {
    if (webSocket && webSocket.readyState === WebSocket.OPEN) {
      webSocket.send(JSON.stringify(message));
    }
  }, [webSocket]);

  const handleMessage = useCallback((e) => {
    try {
      const message = JSON.parse(e.data);
      if (message.type === "chat_message") {
        handleNewMessage(message);
      } else if (message.type === "notification") {
        addNotification(message);
      } else if (message.type === "new_chat_room") {
        handleNewMessage(message.message_content);
        const ws = new WebSocket(`ws://192.168.0.118:8000/ws/common/?token=${userToken}`);
        ws.addEventListener('message', handleMessage);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }, []);

  const connectWebSocket = useCallback(() => {
    if (!userToken) {
      return;
    }

    const ws = new WebSocket(`ws://192.168.0.118:8000/ws/common/?token=${userToken}`);

    ws.onopen = () => {
      console.log('WebSocket Connected');
      setWebSocket(ws);
    };

    ws.onmessage = handleMessage;

    ws.onerror = (e) => {
      console.error('WebSocket Error:', e.message);
    };

    ws.onclose = (e) => {
      console.log('WebSocket Disconnected:', e.reason);
      setWebSocket(null);
      // Reconnect after a delay
      setTimeout(connectWebSocket, reconnectDelay);
    };

    return () => ws.close(); // Cleanup function to close WebSocket
  }, [userToken, handleMessage]);

  useEffect(() => {
    connectWebSocket();
    return () => {
      setWebSocket((ws) => {
        if (ws) ws.close();
        return null;
      });
    };
  }, [connectWebSocket]);

  return (
    <GlobalContext.Provider value={{ userToken, webSocket, sendMessage, markAllAsRead }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);