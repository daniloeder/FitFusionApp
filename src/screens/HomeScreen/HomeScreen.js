import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import GradientBackground from './../../components/GradientBackground/GradientBackground';
import { fetchAuthToken, deleteAuthToken } from '../../store/store';

const width = Dimensions.get('window').width;

const HomeScreen = ({ route, navigation }) => {
  const { userToken } = route.params;
  const [data, setData] = useState(null);
  const [places, setPlaces] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://192.168.0.118:8000/api/users/home', {
        method: 'GET',
        headers: {
          Authorization: `Token ${userToken}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setData(data);
      } else if (data && data.detail === "Invalid token."){
        deleteAuthToken();
        navigation.navigate('Auth', { screen: 'LoginScreen' });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {

    }
  };

  useEffect(() => {

    fetchAuthToken()
    .then((userToken) => {
      console.log('userToken', userToken)
      if (userToken) {
        fetchProfile();
      }
    })
    .catch((error) => {
      console.error('Error fetching user token:', error);
    });
  }, []);

  useEffect(() => {
    if (data) {
      setPlaces(data.places);
      setJoinedEvents(data.joined_events);
    }
  }, [data]);

  return (
    <View style={styles.gradientContainer}>
      <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />

      <ScrollView style={styles.container}>
        <Text style={styles.title}>Welcome to Fit Fusion</Text>
        <Text style={styles.subtitle}>My Places:</Text>

        {places.map((place) => (
          <View key={place.id.toString()} style={styles.placeItem}>
            <Text style={styles.placeTitle}>{place.name}</Text>
            {place.events.map((event) => (
              <View key={event.id}>
                <Pressable
                  style={styles.eventButton}
                  onPress={() => {
                    navigation.navigate('Event', { eventId: event.id });
                  }}
                >
                  <Text style={styles.buttonText}>{event.title}</Text>
                  <Text style={styles.eventDate}>Date: {event.date}</Text>
                  <Text style={styles.eventDate}>Time: {event.time}</Text>
                </Pressable>
              </View>
            ))}
            <Pressable
              style={styles.viewPlaceButton}
              onPress={() => {
                navigation.navigate('Place', { placeId: place.id });
              }}
            >
              <Text style={styles.buttonText}>View Place</Text>
            </Pressable>
          </View>
        ))}

        {joinedEvents.length ? <Text style={styles.subtitle}>Events I've Joined:</Text> : ''}
        {joinedEvents.map((event) => (
          <View key={event.id} style={styles.joinedEventItem}>
            <Pressable
              style={styles.joinedEventButton}
              onPress={() => {
                navigation.navigate('Event', { eventId: event.id });
              }}
            >
              <Text style={styles.joinedEventTitle}>{event.title}</Text>
              <Text style={styles.eventDate}>Date: {event.date}</Text>
              <Text style={styles.eventDate}>Time: {event.time}</Text>
            </Pressable>
          </View>
        ))}

        <Pressable
          style={styles.createButton}
          onPress={() => {
            navigation.navigate('CreateEvent');
          }}
        >
          <Text style={styles.createButtonText}>Create Event</Text>
        </Pressable>
        <Pressable
          style={styles.createButton}
          onPress={() => {
            navigation.navigate('CreatePlace');
          }}
        >
          <Text style={styles.createButtonText}>Create Place</Text>
        </Pressable>
        <Pressable
          style={styles.viewProfileButton}
          onPress={() => {
            navigation.navigate('Profile');
          }}
        >
          <Text style={styles.viewProfileButtonText}>View Profile</Text>
        </Pressable>
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
    padding: width * 0.04,
  },
  title: {
    fontSize: width * 0.085,
    fontWeight: 'bold',
    marginBottom: width * 0.025,
    color: '#ffffff',
  },
  subtitle: {
    fontSize: width * 0.06,
    fontWeight: '600',
    marginBottom: width * 0.05,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  placeItem: {
    padding: width * 0.04,
    backgroundColor: 'rgba(50, 50, 50, 0.2)',
    borderRadius: width * 0.025,
    marginBottom: width * 0.03,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  placeTitle: {
    fontSize: width * 0.045,
    fontWeight: '600',
    marginBottom: width * 0.02,
    color: '#16a085',
  },
  eventButton: {
    width: '100%',
    minHeight: width * 0.05,
    borderRadius: width * 0.03,
    marginBottom: '4%',
    marginLeft: '8%',
    backgroundColor: 'rgba(50, 50, 50, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: width * 0.04,
    marginBottom: width * 0.02,
  },
  eventDate: {
    fontSize: width * 0.04,
    marginBottom: width * 0.03,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  viewPlaceButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.5)',
    paddingVertical: width * 0.025,
    paddingHorizontal: width * 0.0375,
    borderRadius: width * 0.0125,
    alignItems: 'center',
  },
  joinedEventItem: {
    padding: width * 0.04,
    backgroundColor: 'rgba(50, 50, 50, 0.2)',
    borderRadius: width * 0.025,
    marginBottom: width * 0.03,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  joinedEventTitle: {
    fontSize: width * 0.045,
    fontWeight: '600',
    marginBottom: width * 0.02,
    color: '#f39c12',
  },
  joinedEventButton: {
    width: '100%',
    minHeight: width * 0.05,
    borderRadius: width * 0.03,
    marginVertical: '2%',
    marginLeft: '-8%',
    backgroundColor: 'rgba(50, 50, 50, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinedEventButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: width * 0.04,
    marginBottom: width * 0.02,
  },
  createButton: {
    marginTop: width * 0.025,
    marginBottom: width * 0.05,
    backgroundColor: 'rgba(255, 0, 0, 0.5)',
    paddingVertical: width * 0.03,
    paddingHorizontal: width * 0.05,
    borderRadius: width * 0.0125,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: width * 0.045,
  },
  viewProfileButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.5)',
    marginTop: width * 0.025,
    marginBottom: width * 0.05,
    paddingVertical: width * 0.03,
    paddingHorizontal: width * 0.05,
    borderRadius: width * 0.0125,
    alignItems: 'center',
  },
  viewProfileButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: width * 0.045,
  },
});

export default HomeScreen;
