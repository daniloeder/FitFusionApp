import React, { createContext, useContext, useState, useEffect, useCallback, useRef, act } from 'react';
import { AppState } from 'react-native';
import { deleteAuthToken } from '../store/store';
import { useChat } from '../utils/chats';

const GlobalContext = createContext(null);

export const GlobalProvider = ({
  children,
  userId,
  userToken,
  setUserToken,
  chatId,
  setChatId,
  userSubscriptionPlan,
  setUserSubscriptionPlan,
  addNotification,
  markAllAsRead,
  showNotifications,
  setShowNotifications,
}) => {
  const [online, setOnline] = useState(false);
  const [active, setActive] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showOnline, setShowOnline] = useState(true);
  const [webSocket, setWebSocket] = useState(null);
  const [chatWebSocket, setChatWebSocket] = useState(null);
  const [receivedMessagesIds, setReceivedMessagesIds] = useState(null);
  const reconnectDelay = 5000; // 5 seconds delay for reconnection
  const { handleNewMessage, handleNewMessages, handleChatInfo, userReceivedMessages, handleSendingMessageError, setChats } = useChat();
  const latestUserToken = useRef(userToken);
  const latestShowOnline = useRef(showOnline);
  const intervalRef = useRef(null);

  useEffect(() => {
    latestShowOnline.current = showOnline;
  }, [showOnline]);

  useEffect(() => {
    latestUserToken.current = userToken;
  }, [userToken]);

  useEffect(() => {
    if (latestShowOnline.current) {
      sendMessage({ type: 'is_online', user_id: userId, online });

      return () => {
        clearInterval(intervalRef.current);
      };
    }
  }, [online, chatWebSocket]);

  useEffect(() => {
    if (latestShowOnline.current) {
      const handleAppStateChange = (nextAppState) => {
        if (nextAppState === 'active') {
          setOnline(true);
        } else {
          setOnline(false);
        }
      };

      const subscription = AppState.addEventListener('change', handleAppStateChange);

      return () => {
        subscription.remove();
      };
    }
  }, []);

  const sendMessage = useCallback((message) => {
    if (chatWebSocket && chatWebSocket.readyState === WebSocket.OPEN) {
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

      if (message.type === "online_status") {
        if (message.online_users != onlineUsers) {
          setOnlineUsers(message.online_users);
        }
      } else if (message.type === "chat_message") {
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
      } else if (message.type === "sending_message_error") {
        handleSendingMessageError(userId, message);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }, [userToken]);

  const connectWebSocket = useCallback(() => {
    console.log('Connecting WebSocket');
    if (!latestUserToken.current) {
      return;
    }

    const ws = new WebSocket(`ws://192.168.0.118:8000/ws/common/?token=${latestUserToken.current}`);
    const chatSocket = new WebSocket(`ws://192.168.0.118:8000/ws/chat/?token=${latestUserToken.current}`);

    ws.onopen = () => {
      console.log('WebSocket Connected');
      setWebSocket(ws);
      setActive(true);
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
        setActive(false);
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
    <GlobalContext.Provider value={{
      userId,
      active,
      userToken,
      showOnline,
      chatId,
      setChatId,
      onlineUsers,
      userSubscriptionPlan,
      setUserSubscriptionPlan,
      sendMessage,
      markAllAsRead,
      handleLogout,
      showNotifications,
      setShowNotifications,
      showOnline,
      setShowOnline,
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
