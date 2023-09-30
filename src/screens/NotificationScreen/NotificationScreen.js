import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/notifications/notifications/`);
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onNavigate = (notification) => {
    // Navigate based on the notification type, e.g., chat, event
    // navigation.navigate('SomeScreen', { someId: notification.relatedId });
  };

  const markAsRead = (notificationId) => {
    // Mark notification as read here
  };

  if (isLoading) return <ActivityIndicator size="large" color="#0000ff" />;

  if (notifications.length === 0) return <Text>No notifications</Text>;

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.notificationContainer}>
            <Text style={styles.message}>{item.message}</Text>
            <TouchableOpacity onPress={() => onNavigate(item)}>
              <Text style={styles.linkText}>View</Text>
            </TouchableOpacity>
            {!item.is_read && (
              <TouchableOpacity onPress={() => markAsRead(item.id)}>
                <Text style={styles.markAsReadText}>Mark as read</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 15,
  },
  notificationContainer: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  message: {
    fontSize: 16,
  },
  linkText: {
    color: 'blue',
    marginTop: 5,
    textDecorationLine: 'underline',
  },
  markAsReadText: {
    color: 'green',
    marginTop: 5,
    textDecorationLine: 'underline',
  },
});

export default NotificationScreen;
