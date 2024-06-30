import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Dimensions, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useGlobalContext } from './../../services/GlobalContext';
import { storeData, fetchData, getAllKeys, deleteData } from '../../store/store';
import GradientBackground from './../../components/GradientBackground/GradientBackground';
import { timeAgo } from './../../utils/helpers';
import { BASE_URL } from '@env';

const { width } = Dimensions.get('window');

const Notifications = ({ route, navigation }) => {
  const { userToken } = route.params;

  const [notifications, setNotifications] = useState([]);
  const [localNotifications, setLocalNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(BASE_URL + '/api/notifications/', {
        headers: {
          'Authorization': `Token ${userToken}`,
        },
      });
      const data = await response.json();
      if (data.length > 0) {
        setNotifications(data.reverse());
        for (const notification of data) {
          notification.is_read = true;
          storeData(notification, "notification_" + notification.id);
        }
        markNotificationsRead(data.map(notification => notification.id));
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markNotificationsRead = async (notification_ids) => {
    try {
      const response = await fetch(BASE_URL + `/api/notifications/mark_as_read/?notifications=${notification_ids.join(',')}`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${userToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (localNotifications.length > 200) {
        for (i = localNotifications.length - 1; i > 199; i--) {
          deleteData("notification_" + localNotifications[i].id);
        }
        setLocalNotifications(localNotifications.slice(0, 200));
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchLocalNotifications = async () => {
        const data = await getAllKeys('notification_');
        setLocalNotifications(data.reverse());
      };
      fetchLocalNotifications();
      fetchNotifications();
    }, [])
  );

  return (
    <View style={styles.container}>
      <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />

      <FlatList
        data={[...notifications, ...(localNotifications.length > 0 ? localNotifications.filter(notification => !notifications.map(notification => notification.id).includes(notification.id)) : [])]}
        renderItem={({ item }) => {
          return (
            <Pressable
              key={item.id}
              onLongPress={() => Alert.alert('Delete', 'Are you sure you want to delete this notification?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', onPress: () => {
                  deleteData("notification_" + item.id);
                  setLocalNotifications(localNotifications.filter(notification => notification.id!== item.id));
                  setNotifications(notifications.filter(notification => notification.id!== item.id));
                }},
              ])}
              onPress={() => {
                if (item.type === 'PaymentDayPlaceComming') {
                  navigation.navigate('Place', { placeId: item.item_id, paymentCardVisibel: true });
                } else if (item.type === 'PlaceRequestApproved') {
                  navigation.navigate('Place', { placeId: item.item_id });
                } else if (item.type === 'PlaceRequestedJoin') {
                  navigation.navigate('Manage Place', { placeId: item.item_id, isParticipantRequestModalVisible: true });
                } else if (item.type === 'PaymentDayEventComming') {
                  navigation.navigate('Event', { eventId: item.item_id, paymentCardVisibel: true });
                } else if (item.type === 'NewNearPlace') {
                  navigation.navigate('Event', { eventId: item.item_id });
                } else if (item.type === 'NewNearEvent') {
                  navigation.navigate('Place', { placeId: item.item_id });
                } else if (item.type === 'EventComming') {
                  navigation.navigate('Event', { eventId: item.item_id });
                } else if (item.type === 'NewNearUser') {
                  navigation.navigate('User Profile', { id: item.item_id });
                } else {
                  // Handle the case when 'item.type' is not recognized
                }
              }}
            >
              <View
                style={[
                  styles.notificationCard,
                  {
                    backgroundColor: `rgba(255, 255, 255, ${item.is_read ? 0.6 : 0.9})`,
                  },
                ]}
              >
                <Text style={styles.notificationText}>{item.title}</Text>
                <Text style={[styles.notificationDate, { color: item.is_read ? '#CCC' : '#555' }]}>
                  {timeAgo(item.timestamp)}{item.id}
                </Text>
              </View>
            </Pressable>
          )
        }}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        overScrollMode="never"
        contentContainerStyle={styles.scrollView}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notificationCard: {
    opacity: 0.8,
    borderRadius: width * 0.03,
    padding: width * 0.04,
    marginBottom: width * 0.025,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  notificationText: {
    fontSize: width * 0.04,
  },
  notificationDate: {
    fontSize: width * 0.03,
    marginTop: width * 0.0125,
  },
  scrollView: {
    padding: width * 0.025,
  },
});

export default Notifications;