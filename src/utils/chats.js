import React, { createContext, useContext, useEffect, useState } from 'react';
import { storeData } from './../store/store';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [chats, setChats] = useState({});

    const markMessagesAsRead = (chatId) => {

        setChats(prevChats => {
            const chat = prevChats[chatId];

            if (chat) {
                storeData({
                    ...chat,
                    unread: 0
                }, `chats_${chatId}`)

                return {
                    ...prevChats,
                    [chatId]: {
                        ...chat,
                        unread: 0
                    }
                };
            }

            return prevChats;
        });
    };

    const handleChatInfo = (message) => {
        setChats(prevChats => {
            const chatId = message.chat_room.id;
            const currentChat = prevChats[chatId]

            if (!currentChat) {
                return prevChats;
            }

            return {
                ...prevChats,
                [chatId]: {
                    ...currentChat,
                    chat_info: {
                        id: message.chat_room.id,
                        name: message.chat_room.name,
                        image: message.image
                    }
                }
            };
        });
    };

    const handleNewMessage = (chatId, message) => {
        setChats(prevChats => {
            const currentChat = prevChats[chatId] || { id: chatId, messages: [], chat_info: { id: null }, unread: 0 };

            storeData({
                ...currentChat,
                messages: [...(currentChat.messages || []), message].slice(-100),
                unread: currentChat.unread + 1,
                last_message_time: message.created_at
            }, `chats_${chatId}`);

            return {
                ...prevChats,
                [chatId]: {
                    ...currentChat,
                    messages: [...(currentChat.messages || []), message],
                    unread: currentChat.unread + 1,
                    last_message_time: message.created_at
                }
            };
        });
    };

    return (
        <ChatContext.Provider value={{ chats, setChats, markMessagesAsRead, handleNewMessage, handleChatInfo }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);