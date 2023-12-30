import React, { useEffect, useState , useCallback} from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useWebSocket } from './../../services/WebSocketsContext';
import GradientBackground from './../../components/GradientBackground/GradientBackground';
import { timeAgo } from './../../utils/helpers';
import { BASE_URL } from '@env';

const { width } = Dimensions.get('window');

const Notifications = ({ route, navigation }) => {
  const { userToken } = route.params;
  const { markAllAsRead } = useWebSocket();

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'PlaceRequestApproved', item_id: 3, text: 'You have a payment to be paid in 2 days. Check it out!', date: '5 minutes ago' },
    { id: 2, type: 'NewNearUser', item_id: 11, text: 'There is a new Soccer player next you. Michael.', date: '10 minutes ago' },
    { id: 3, type: 'EventComming', item_id: 1, text: 'You have a joined event Today at 15:00 PM.', date: '15 minutes ago' },
    { id: 4, type: 'PaymentDayComming', item_id: 3, text: 'You have a payment to be paid in 2 days. Check it out!', date: '5 minutes ago' },
    { id: 5, type: 'NewNearUser', item_id: 11, text: 'There is a new Soccer player next you. Michael.', date: '10 minutes ago' },
    { id: 6, type: 'EventComming', item_id: 1, text: 'You have a joined event Today at 15:00 PM.', date: '15 minutes ago' },
    { id: 7, type: 'PaymentDayComming', item_id: 3, text: 'You have a payment to be paid in 2 days. Check it out!', date: '5 minutes ago' },
    { id: 8, type: 'NewNearUser', item_id: 11, text: 'There is a new Soccer player next you. Michael.', date: '10 minutes ago' },
    { id: 9, type: 'EventComming', item_id: 1, text: 'You have a joined event Today at 15:00 PM.', date: '15 minutes ago' },
    { id: 10, type: 'PaymentDayComming', item_id: 3, text: 'You have a payment to be paid in 2 days. Check it out!', date: '5 minutes ago' },
    { id: 11, type: 'NewNearUser', item_id: 11, text: 'There is a new Soccer player next you. Michael.', date: '10 minutes ago' },
    { id: 12, type: 'EventComming', item_id: 1, text: 'You have a joined event Today at 15:00 PM.', date: '15 minutes ago' },
  ]);

  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(BASE_URL + '/api/notifications/', {
        headers: {
          'Authorization': `Token ${userToken}`,
        },
      });
      const data = await response.json();
      setNotifications(data.reverse());
      await fetch(BASE_URL + '/api/notifications/mark_all_as_read/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${userToken}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };


  const handleDelete = () => {
    if (selectedNotification) {
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== selectedNotification.id)
      );
    }
    setDeleteModalVisible(false);
  };

  const showDeleteModal = (notification) => {
    setSelectedNotification(notification);
    setDeleteModalVisible(true);
  };

  const hideDeleteModal = () => {
    setSelectedNotification(null);
    setDeleteModalVisible(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
      markAllAsRead();
    }, [])
  );

  return (
    <View style={styles.container}>
      <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />

      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <Pressable
            key={item.id}
            onLongPress={() => showDeleteModal(item)}
            onPress={() => {
              if (item.type === 'PaymentDayPlaceComming') {
                navigation.navigate('Place', { placeId: item.item_id, paymentCardVisibel: true });
              } else if (item.type === 'PlaceRequestApproved') {
                navigation.navigate('Place', { placeId: item.item_id });
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
              <Text style={styles.notificationText}>{item.message}</Text>
              <Text style={[styles.notificationDate, {color: item.is_read ? '#CCC' : '#555' }]}>
                {timeAgo(item.timestamp)}
              </Text>
            </View>
          </Pressable>
        )}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        overScrollMode="never"
        contentContainerStyle={styles.scrollView}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={isDeleteModalVisible}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>Do you want to delete this notification?</Text>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={hideDeleteModal}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#DDD',
    marginHorizontal: '10%',
    marginVertical: '50%',
    borderRadius: width * 0.025,
    padding: width * 0.05,
  },
  modalText: {
    fontSize: width * 0.045,
    marginBottom: width * 0.05,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: 'red',
    borderRadius: width * 0.02,
    padding: width * 0.03,
    alignItems: 'center',
    marginBottom: width * 0.02,
  },
  cancelButton: {
    backgroundColor: 'gray',
    borderRadius: width * 0.02,
    padding: width * 0.03,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: width * 0.04,
    color: 'white',
  },
});

export default Notifications;