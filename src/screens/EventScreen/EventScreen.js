import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const EventScreen = ({ route }) => {
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const navigation = useNavigation();
  
  // Assuming you are passing eventId through route params.
  const { eventId } = route.params;

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/events/${eventId}`);
      const data = await response.json();
      setEvent(data);
      setParticipants(data.participants || []); // Assuming the event object has a participants array
    } catch (error) {
      console.error('Error fetching event:', error);
    }
  };

  const onJoinEvent = async () => {
    // Implementation to join event goes here.
  };

  const onLeaveEvent = async () => {
    // Implementation to leave event goes here.
  };

  const onNavigateToProfile = (userId) => {
    navigation.navigate('ProfileScreen', { userId });
  };

  if (!event) return <Text>Loading...</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.location}>{event.location}</Text>
      <Text style={styles.dateTime}>{event.date_time}</Text>
      <Text style={styles.sportType}>{event.sport_type}</Text>
      
      <TouchableOpacity style={styles.button} onPress={onJoinEvent}>
        <Text style={styles.buttonText}>Join Event</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={onLeaveEvent}>
        <Text style={styles.buttonText}>Leave Event</Text>
      </TouchableOpacity>
      
      <Text style={styles.participantTitle}>Participants</Text>
      
      <FlatList
        data={participants}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onNavigateToProfile(item.id)}>
            <View style={styles.participant}>
              <Text style={styles.participantName}>{item.username}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  location: {
    fontSize: 18,
    marginBottom: 5,
  },
  dateTime: {
    fontSize: 16,
    color: 'grey',
    marginBottom: 10,
  },
  sportType: {
    fontSize: 16,
    color: 'blue',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  participantTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  participant: {
    backgroundColor: '#fff',
    padding: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  participantName: {
    fontSize: 16,
  },
});

export default EventScreen;