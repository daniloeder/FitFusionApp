import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Dimensions } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

const width = Dimensions.get('window').width;

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

      <Svg style={[StyleSheet.absoluteFill, {width:width}]}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#991B1B" stopOpacity="1" />
            <Stop offset="1" stopColor="#1A202C" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
      </Svg>

      <Text style={styles.title}>Fit Fusion</Text>
      <Text style={styles.subtitle}>Upcoming Events</Text>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.eventItem}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventDate}>{item.date_time}</Text>
            <Pressable 
              style={styles.button} 
              onPress={() => navigation.navigate('EventScreen', { eventId: item.id })}
            >
              <Text style={styles.buttonText}>View Event</Text>
            </Pressable>
          </View>
        )}
      />
      <Pressable 
        style={({ pressed }) => [
          styles.profileButton,
          { backgroundColor: pressed ? '#991B1B' : '#B83030' },
        ]}
        onPress={() => navigation.navigate('Profile')} 
      >
        <Text style={styles.profileButtonText}>Profile</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: width * 0.04,
    backgroundColor: '#aaa',
  },
  title: {
    fontSize: width * 0.085,
    fontWeight: 'bold',
    marginBottom: width * 0.025,
    color: '#E2E8F0',
  },
  subtitle: {
    fontSize: width * 0.06,
    fontWeight: '600',
    marginBottom: width * 0.05,
    color: '#E2E8F0',
  },
  eventItem: {
    padding: width * 0.04,
    backgroundColor: 'rgba(238, 238, 238, 0.1)',
    borderRadius: width * 0.025,
    marginBottom: width * 0.03,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  eventTitle: {
    fontSize: width * 0.045,
    fontWeight: '600',
    marginBottom: width * 0.02,
    color: '#E2E8F0',
  },
  eventDate: {
    fontSize: width * 0.04,
    marginBottom: width * 0.03,
    color: '#CBD5E0',
  },
  button: {
    backgroundColor: '#B83030',
    paddingVertical: width * 0.025,
    paddingHorizontal: width * 0.0375,
    borderRadius: width * 0.0125,
    alignItems: 'center',
  },
  buttonText: {
    color: '#E2E8F0',
    fontWeight: '600',
    fontSize: width * 0.04,
  },
  profileButton: {
    marginTop: width * 0.025,
    backgroundColor: '#B83030',
    paddingVertical: width * 0.03,
    paddingHorizontal: width * 0.05,
    borderRadius: width * 0.0125,
    alignItems: 'center',
  },
  profileButtonText: {
    color: '#E2E8F0',
    fontWeight: '700',
    fontSize: width * 0.045,
  },
});

export default HomeScreen;