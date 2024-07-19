import React, { createContext, useContext, useEffect, useState } from 'react';
import { storeData, deleteData, getAllKeys } from './../store/store';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [chats, setChats] = useState({});
    const [tChat, setTChat] = useState({});

    const markMessagesAsRead = (userId, chatId) => {

        setChats(prevChats => {
            const chat = prevChats[chatId];

            if (chat) {
                storeData({
                    ...chat,
                    unread: 0
                }, `${userId}_chats_${chatId}`)

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

    const handleChatInfo = (userId, message) => {
        setChats(prevChats => {
            const chatId = message.chat_room.id;
            const currentChat = prevChats[chatId]

            if (!currentChat) {
                return prevChats;
            }

            storeData({
                ...currentChat,
                chat_info: {
                    id: message.chat_room.id,
                    name: message.chat_room.name,
                    image: message.chat_room.image,
                    is_group: message.chat_room.is_group_chat,
                    chat_user_id: message.chat_room.user_id,
                }
            }, `${userId}_chats_${chatId}`)

            return {
                ...prevChats,
                [chatId]: {
                    ...currentChat,
                    chat_info: {
                        id: message.chat_room.id,
                        name: message.chat_room.name,
                        image: message.chat_room.image,
                        is_group: message.chat_room.is_group_chat,
                        chat_user_id: message.chat_room.user_id,
                    }
                }
            };
        });
    };

    const handleNewMessage = (userId, chatId, message) => {
        setChats(prevChats => {
            const currentChat = prevChats[chatId] || { id: chatId, messages: [], chat_info: { id: null }, unread: 0 };

            let new_chat = {
                ...currentChat,
                messages: [...(currentChat.messages || []), message].slice(-100),
                unread: currentChat.unread + (message.sender !== userId ? 1 : 0),
                last_message_time: message.created_at,
            };

            if (!message.is_group && message.chat_code && message.receiver && message.sender === userId) {
                setTChat(prevTChats => {
                    if (!prevTChats[message.receiver]) {
                        return prevTChats;
                    }
                    return {
                        ...prevTChats,
                        [message.receiver]: {
                            ...prevTChats[message.receiver],
                            messages: [...(prevTChats[message.receiver].messages.filter(msg => msg.chat_code !== message.chat_code) || [])],
                            chat_info: {
                                ...prevTChats[message.receiver].chat_info,
                                id: chatId,
                                is_defined: true,
                            }
                        }
                    }

                });
            }

            storeData(new_chat, `${userId}_chats_${chatId}`);

            return {
                ...prevChats,
                [chatId]: new_chat
            };
        });
    };

    const handleNewMessages = (userId, messages) => {

        // set new chats
        let new_chats = {};
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            const chatId = message.chat_room;
            const currentChat = new_chats[chatId] || { id: chatId, messages: [], chat_info: { id: null }, unread: 0 };

            new_chats[chatId] = {
                ...currentChat,
                messages: [...(currentChat.messages || []), message].slice(-100),
                unread: currentChat.unread + (message.sender !== userId ? 1 : 0),
                last_message_time: message.created_at
            };
        }

        // get old chats
        getAllKeys(`${userId}_chats_`).then(data => {
            const old_chats = data.reduce((acc, item) => {
                acc[item.id] = {
                    ...item,
                    messages: item.messages.slice(-100),
                };
                return acc;
            }, {});

            // merge chats
            for (const [chatId, newChat] of Object.entries(new_chats)) {
                let existingChat;
                if (old_chats[chatId]) {
                    existingChat = old_chats[chatId]
                } else {
                    existingChat = { id: chatId, messages: [], chat_info: { id: null }, unread: 0 };
                }
                old_chats[chatId] = {
                    ...existingChat,
                    messages: [...(existingChat.messages || []), ...newChat.messages].slice(-100),
                    unread: existingChat.unread + newChat.unread,
                    last_message_time: newChat.last_message_time
                };
                storeData({
                    ...existingChat,
                    messages: [...(existingChat.messages || []), ...newChat.messages].slice(-100),
                    unread: existingChat.unread + newChat.unread,
                    last_message_time: newChat.last_message_time
                }, `${userId}_chats_${chatId}`);
            }

            setChats(old_chats);
        });
    }

    const userReceivedMessages = (userId, messages) => {

        setChats(prevChats => {
            let old_chats = { ...prevChats };
            for (const [chatId, chat] of Object.entries(old_chats)) {
                old_chats[chatId] = {
                    ...chat,
                    messages: chat.messages.map(msg => {
                        if (messages.message_ids.includes(msg.id)) {
                            return {
                                ...msg,
                                received_by: msg.received_by ? [...msg.received_by, messages.user_id] : [messages.user_id]
                            };
                        }

                        return msg;
                    })
                };
            }
            for (const [chatId, chat] of Object.entries(old_chats)) {
                storeData(chat, `${userId}_chats_${chatId}`);
            }
            return old_chats;
        });
    }

    const handleSendingMessageError = (userId, message) => {
        if (message.error === "chat_room_does_not_exist") {
            deleteData(`${userId}_chats_${message.chat_room_id}`);
            setChats(prevChats => Object.values(prevChats).filter(chat => chat.id !== message.chat_room_id));
            console.error("Chat room does not exist");
        }
    }

    return (
        <ChatContext.Provider value={{ chats, setChats, tChat, setTChat, markMessagesAsRead, handleNewMessage, handleNewMessages, handleChatInfo, userReceivedMessages, handleSendingMessageError }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);