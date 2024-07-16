import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Dimensions, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useGlobalContext } from './../../services/GlobalContext';
import { storeData, getAllKeys, deleteData } from '../../store/store';
import GradientBackground from './../../components/GradientBackground/GradientBackground';
import { timeAgo } from './../../utils/helpers';

const { width } = Dimensions.get('window');

const Notifications = ({ navigation }) => {
  const { userId, active, notifications, setNotifications, sendNotificationsMessage } = useGlobalContext();

  const [localNotifications, setLocalNotifications] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const fetchLocalNotifications = async () => {
        const data = await getAllKeys(`${userId}_notification_`);
        setLocalNotifications(data.reverse());
      };
      fetchLocalNotifications();

      const unread_notifications = notifications.filter(notification => !notification.is_read);
      if (unread_notifications.length > 0) {
        for (let i = 0; i < unread_notifications.length; i++) {
          storeData({ ...unread_notifications[i], is_read: true }, `${userId}_notification_${unread_notifications[i].id}`);
        }
        const timeoutId = setTimeout(() => {
          if (active) {
            sendNotificationsMessage({ type: 'mark_as_read', notifications_ids: unread_notifications.map(notification => notification.id) });
          }
        }, 4000);

        return () => {
          clearTimeout(timeoutId);
        };
      }
    }, [notifications])
  );

  const shown_notifications = [...notifications, ...(localNotifications.length > 0 ? localNotifications.filter(notification => !notifications.map(notification => notification.id).includes(notification.id)) : [])].sort((a, b) => a.id - b.id).reverse()

  return (
    <View style={styles.container}>
      <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />

      <FlatList
        data={shown_notifications}
        renderItem={({ item }) => {
          return (
            <Pressable
              onLongPress={() => Alert.alert('Delete', 'Are you sure you want to delete this notification?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete', onPress: () => {
                    deleteData(`${userId}_notification_${item.id}`);
                    setLocalNotifications(localNotifications.filter(notification => notification.id !== item.id));
                    setNotifications(notifications.filter(notification => notification.id !== item.id));
                  }
                },
              ])}
              onPress={() => {
                if (item.screen) {
                  navigation.navigate(item.screen, item.extra.params);
                } else if (item.type === 'PaymentDayPlaceComming') {
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
                  {timeAgo(item.timestamp)}
                </Text>
              </View>
            </Pressable>
          )
        }}
        keyExtractor={(item, index) => item.id}
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