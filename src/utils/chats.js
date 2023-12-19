import React, { createContext, useContext, useState } from 'react';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [chats, setChats] = useState({});

    const markMessagesAsRead = (chatId) => {
        setChats(prevChats => ({
            ...prevChats,
            [chatId]: {
                ...prevChats[chatId],
                unread: 0
            }
        }));
    };

    const handleNewMessage = (message) => {
        setChats(prevChats => {
            const chatId = message.chat_room.toString();
            const currentChat = prevChats[chatId] || { messages: [], unread: 0 };
            
            return {
                ...prevChats,
                [chatId]: {
                    ...currentChat,
                    messages: [...(currentChat.messages || []), message],
                    unread: currentChat.unread + 1
                }
            };
        });
    };
    


    return (
        <ChatContext.Provider value={{ chats, markMessagesAsRead, handleNewMessage }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);