import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, FlatList } from 'react-native';

const HomeScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://192.168.0.118:8000/api/events/');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Fit Fusion</Text>

      <Text style={styles.subtitle}>Upcoming Events:</Text>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.eventItem}>
            <Text>{item.title}</Text>
            <Text>{item.date_time}</Text>
            <Button 
              title="View Event" 
              onPress={() => navigation.navigate('EventScreen', { eventId: item.id })}
            />
          </View>
        )}
      />

      <Button 
        title="Profile" 
        onPress={() => navigation.navigate('Profile')} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: {
      linearGradient: {
        colors: ["#000", "#FF0000", "#006400"],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
      },
    },
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  eventItem: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
  },
});

export default HomeScreen;
