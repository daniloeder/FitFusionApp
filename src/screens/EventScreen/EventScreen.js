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
import GradientBackground from './../../components/GradientBackground/GradientBackground';

const EventScreen = ({ route }) => {
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const navigation = useNavigation();

  const { eventId } = route.params;

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`http://192.168.0.118:8000/api/events/${eventId}`);
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
    <View style={styles.gradientContainer}>
      <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />

      <ScrollView style={styles.container}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        overScrollMode="never"
      >
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

        {
          participants.map((participant) => (
            <TouchableOpacity key={participant.id} onPress={() => onNavigateToProfile(participant.id)}>
              <View style={styles.participant}>
                <Text style={styles.participantName}>{participant.username}</Text>
              </View>
            </TouchableOpacity>
          ))
        }
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  location: {
    fontSize: 22,
    color: '#FFF',
    marginBottom: 10,
  },
  dateTime: {
    fontSize: 18,
    color: '#A0AEC0',
    marginBottom: 15,
  },
  sportType: {
    fontSize: 18,
    color: '#3182CE',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2D3748',
    opacity: 0.8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
  },
  participantTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  participant: {
    backgroundColor: '#2D3748',
    opacity: 0.8,
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  participantName: {
    fontSize: 16,
    color: '#A0AEC0',
  },
});

export default EventScreen;