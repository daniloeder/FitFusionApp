import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useGlobalContext } from './../../services/GlobalContext';
import { useChat } from '../../utils/chats';
import GradientBackground from './../../components/GradientBackground/GradientBackground';
import { formatDate } from './../../utils/helpers';
import { BASE_URL } from '@env';
import Icons from '../../components/Icons/Icons';
import { getAllKeys, deleteData } from '../../store/store';

const { width } = Dimensions.get('window');

const ChatListScreen = ({ route, navigation }) => {
  const [chatRooms, setChatRooms] = useState([]);
  const [usersIdsOnScreen, setUsersIdsOnScreen] = useState([]);

  const { userId, active, showOnline, onlineUsers, sendMessage, setChatId } = useGlobalContext();

  const [requestedChatInfoIds, setRequestedChatInfoIds] = useState([]);

  const { chats, setChats } = useChat();

  const UnreadMessagesNumber = ({ number, isOnline }) => {
    return (
      <View
        style={{
          paddingHorizontal: width * 0.02,
          borderRadius: width * 0.02,
          backgroundColor: 'rgba(49, 130, 206, 0.8)',
          position: 'absolute',
          left: isOnline ? 20 : 5,
          bottom: '20%',
        }}
      >
        <Text
          style={{
            fontSize: width * 0.03,
            color: '#FFF',
            fontWeight: 'bold',
          }}
        >
          {number}
        </Text>
      </View>
    )
  }

  useEffect(() => {
    if (Object.keys(chats).length > 0) {
      setChatRooms(Object.values(chats).map(chat => {
        return {
          ...chat,
          messages: chat.messages.slice(-1),
        }
      }));
    } else {
      setChatRooms([]);
    }
  }, [chats]);

  useEffect(() => {
    for (let i = chatRooms.length - 1; i >= 0; i--) {
      if (!chatRooms[i].chat_info.id && !requestedChatInfoIds.includes(chatRooms[i].id)) {
        setRequestedChatInfoIds(prev => [...prev, chatRooms[i].id]);
        sendMessage({ type: "get_chat_info", chat_room_id: chatRooms[i].id });
      }
    }
  }, [chatRooms]);

  const sortedChatRooms = [...chatRooms].sort((a, b) => {
    return new Date(b.last_message_time) - new Date(a.last_message_time);
  });

  useFocusEffect(
    useCallback(() => {
      setChatId(null);
      getAllKeys(`${userId}_chats_`).then(data => {
        const chatDict = data.reduce((acc, item) => {
          acc[item.id] = {
            ...item,
            messages: item.messages.slice(-100),
          };
          return acc;
        }, {});

        const sortedRoomsIds = Object.keys(chatDict).sort((a, b) => {
          return new Date(chatDict[b].last_message_time) - new Date(chatDict[a].last_message_time);
        });

        for (let i = 0; i < sortedRoomsIds.length; i++) {
          if (i < 9) {
            chatDict[sortedRoomsIds[i]].messages = chatDict[sortedRoomsIds[i]].messages.slice(-100);
          } else if (i < 30) {
            chatDict[sortedRoomsIds[i]].messages = chatDict[sortedRoomsIds[i]].messages.slice(-15);
          } else {
            chatDict[sortedRoomsIds[i]].messages = []
            deleteData(`${userId}_chats_${sortedRoomsIds[i]}`);
          }
          //deleteData(`${userId}_chats_${sortedRoomsIds[i]}`);
        }

        setChats(chatDict);
      });
    }, [userId])
  );

  useFocusEffect(
    useCallback(() => {
      if (active && showOnline && usersIdsOnScreen.length > 0) {
        let intervalId;
        const timeoutId = setTimeout(() => {
          sendMessage({ type: 'is_online', track: usersIdsOnScreen });
          intervalId = setInterval(() => {
            sendMessage({ type: 'is_online', track: usersIdsOnScreen });
          }, 2500);
        }, 1000);
  
        return () => {
          clearTimeout(timeoutId);
          clearInterval(intervalId);
        };
      }
    }, [usersIdsOnScreen, showOnline])
  );

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if(showOnline){
      setUsersIdsOnScreen(viewableItems.filter(chat => !chat.item.chat_info.is_group).map(chat => chat.item.chat_info.chat_user_id));
    }
  }).current;


  return (
    <View
      style={styles.gradientContainer}
    >
      <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />
      <View style={styles.container}>

        <FlatList
          data={sortedChatRooms}
          keyExtractor={chat => chat.id}

          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={useRef({ viewAreaCoveragePercentThreshold: 5 }).current}

          renderItem={({ item: chat }) => {

            const isGroupChat = chat.chat_info.is_group;
            const chatImage = chat.chat_info && chat.chat_info.image;
            const chatName = isGroupChat ? 'Group Chat' : chat.chat_info && chat.chat_info.name;
            const isOnline = !isGroupChat && chat.chat_info.chat_user_id && onlineUsers.includes(chat.chat_info.chat_user_id);

            if (chat.messages && chat.messages.length > 0) {
              lastMessageText = chat.messages[chat.messages.length - 1].text;
            } else {
              return;
            }

            lastMessageText = lastMessageText.length
              ? ((lastMessageText.length > 85 ? lastMessageText.slice(0, 85) + '...' : lastMessageText) || (lastMessageText.media ? `[${lastMessageText.media}]` : '[Media]'))
              : 'No messages yet';

            return (
              <TouchableOpacity
                style={styles.chatRoomBox}
                onLongPress={() => {
                  Alert.alert('Delete chat', 'Are you sure you want to delete this chat?', [{ text: 'Cancel', style: 'cancel', }, {
                    text: 'OK', style: 'destructive',
                    onPress: () => {
                      deleteData(`${userId}_chats_${chat.id}`);
                      setChats(prev => {
                        const newChats = { ...prev };
                        delete newChats[chat.id];
                        return newChats;
                      });
                    },
                  },
                  ],
                    { cancelable: true },
                  );
                }}
                onPress={() => {
                  setChatId(chat.id);
                  navigation.navigate('Chat', { participantId: chat.chat_info.is_group ? null : chat.chat_info.chat_user_id, chatImage: chatImage, chatName: chatName, isGroupChat: chat.chat_info.is_group });
                }}
              >
                {isOnline && (
                  <View style={styles.onlineDot}></View>
                )}
                {chatImage ?
                  <Image
                    source={{ uri: BASE_URL + `${chatImage}` }}
                    style={styles.chatImage}
                  /> :
                  <View style={{ width: width * 0.105, height: width * 0.105, borderRadius: width * 0.1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.3)' }} >
                    <Icons name="Profile" size={width * 0.085} fill={'#1C274C'} />
                  </View>
                }
                {chats[chat.id] && chats[chat.id].unread > 0 && <UnreadMessagesNumber number={chats[chat.id].unread} isOnline={isOnline} />}
                <View style={styles.chatTextContainer}>
                  <Text style={styles.chatRoomText}>{chatName}</Text>
                  <Text style={styles.chatRoomDetailText}>{lastMessageText}</Text>
                </View>

                <View
                  style={styles.chatRoomRightBlock}
                >
                  <Text style={styles.chatRoomDetailLastMessageTime}>{formatDate(chat.messages[chat.messages.length - 1]?.created_at)}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
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
  chatRoomBox: {
    backgroundColor: 'rgba(45, 55, 72, 0.6)',
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  chatRoomText: {
    fontSize: 16,
    color: '#E2E8F0',
    fontWeight: 'bold',
  },
  chatRoomDetailText: {
    fontSize: 14,
    color: '#CBD5E0',
    marginTop: 5,
  },
  chatImage: {
    width: width * 0.11,
    height: width * 0.11,
    borderRadius: 25,
  },
  chatRoomRightBlock: {
    minWidth: width * 0.1,
    height: width * 0.1,
    alignItems: 'center',
    flexDirection: 'row',
  },
  chatRoomDetailLastMessageTime: {
    color: '#FFF',
    fontSize: width * 0.028,
    marginRight: 5,
  },
  onlineDot: {
    width: 10,
    height: 10,
    right: 8,
    backgroundColor: 'green',
    borderRadius: 5,
  },
});

export default ChatListScreen;