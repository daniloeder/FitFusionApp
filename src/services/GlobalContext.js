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
  notifications,
  setNotifications,
  userSubscriptionPlan,
  setUserSubscriptionPlan,
  showNotifications,
  setShowNotifications,
}) => {
  const [online, setOnline] = useState(false);
  const [active, setActive] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showOnline, setShowOnline] = useState(true);
  const [notificationsWebSocket, setNotificationsWebSocket] = useState(null);
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

  const sendNotificationsMessage = useCallback((message) => {
    if (notificationsWebSocket && notificationsWebSocket.readyState === WebSocket.OPEN) {
      notificationsWebSocket.send(JSON.stringify(message));
    }
  }, [notificationsWebSocket]);

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
      } else if (message.type === "notifications") {
        if(message.notifications){
          setNotifications(message.notifications);
        } else if (message.read_notifications) {
          setNotifications(prevNotifications => prevNotifications.map(notification => {
            if(message.read_notifications.includes(notification.id)){
              return {...notification, is_read: true};
            }
            return notification;
          }));
        }
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

    const notificationsSocket = new WebSocket(`ws://192.168.0.118:8000/ws/notifications/?token=${latestUserToken.current}`);
    const chatSocket = new WebSocket(`ws://192.168.0.118:8000/ws/chat/?token=${latestUserToken.current}`);

    notificationsSocket.onopen = () => {
      console.log('Notifications WebSocket Connected');
      setNotificationsWebSocket(notificationsSocket);
      setActive(true);
      notificationsSocket.onmessage = handleMessage;
      notificationsSocket.onerror = (e) => {
        console.error('WebSocket Error:', e.message);
      };
      notificationsSocket.onclose = (e) => {
        console.log('Notifications WebSocket Disconnected:', e.reason);
        setNotificationsWebSocket(null);
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
        console.error('Chat WebSocket Error:', e.message);
      };
      chatSocket.onclose = (e) => {
        console.log('Chat WebSocket Disconnected:', e.reason);
        setChatWebSocket(null);
        setActive(false);
        setTimeout(connectWebSocket, reconnectDelay);
      };
    };

    return () => {
      notificationsSocket.close();
      chatSocket.close();
    };
  }, [handleMessage]);

  const handleLogout = () => {
    setChats({});
    deleteAuthToken();
    setUserToken(null);

    if (notificationsWebSocket) {
      notificationsWebSocket.close();
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
      if (notificationsWebSocket) notificationsWebSocket.close();
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
      notifications,
      setNotifications,
      userSubscriptionPlan,
      setUserSubscriptionPlan,
      sendMessage,
      sendNotificationsMessage,
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
