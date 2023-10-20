import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import GradientBackground from './../../components/GradientBackground/GradientBackground';
import AsyncStorage from '@react-native-async-storage/async-storage';

const width = Dimensions.get('window').width;

const HomeScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [userKey, setUserKey] = useState(null);

  const storeAuthToken = async () => {
    try {
      const storedKey = await AsyncStorage.getItem('userKey');
      if (storedKey) {
        setUserKey(storedKey);
        console.log(storedKey)
      }
    } catch (e) {
      console.error("Error fetching userKey:", e);
    }
  }

  useEffect(() => {
    storeAuthToken();
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
    <View style={styles.gradientContainer}>

      <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />


      <ScrollView style={styles.container}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        overScrollMode="never"
      >

        <Text style={styles.title}>Welcome to Fit Fusion</Text>

        <Text style={styles.subtitle}>Upcoming Events:</Text>

        {events.map((item) => (
          <View key={item.id.toString()} style={styles.eventItem}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventDate}>{item.date}</Text>
            <Pressable
              style={styles.button}
              onPress={() => {
                // Handle event click here
                console.log('Event clicked:', item.id);
              }}
            >
              <Text style={styles.buttonText}>View Event</Text>
            </Pressable>
          </View>
        ))}
        {events.map((item) => (
          <View key={item.id.toString()} style={styles.eventItem}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventDate}>{item.date}</Text>
            <Pressable
              style={styles.button}
              onPress={() => {
                // Handle event click here
                console.log('Event clicked:', item.id);
              }}
            >
              <Text style={styles.buttonText}>View Event</Text>
            </Pressable>
          </View>
        ))}
        {events.map((item) => (
          <View key={item.id.toString()} style={styles.eventItem}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventDate}>{item.date}</Text>
            <Pressable
              style={styles.button}
              onPress={() => {
                // Handle event click here
                console.log('Event clicked:', item.id);
              }}
            >
              <Text style={styles.buttonText}>View Event</Text>
            </Pressable>
          </View>
        ))}
        {events.map((item) => (
          <View key={item.id.toString()} style={styles.eventItem}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventDate}>{item.date}</Text>
            <Pressable
              style={styles.button}
              onPress={() => {
                // Handle event click here
                console.log('Event clicked:', item.id);
              }}
            >
              <Text style={styles.buttonText}>View Event</Text>
            </Pressable>
          </View>
        ))}

        <Pressable
          style={styles.profileButton}
          onPress={() => {
            // Handle profile button click
            console.log('Profile button clicked');
          }}
        >
          <Text style={styles.profileButtonText}>View Profile</Text>
        </Pressable>

      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    padding: width * 0.04,
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
    marginBottom: width * 0.2,
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
