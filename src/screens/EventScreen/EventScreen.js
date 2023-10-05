import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import GradientBackground from './../../components/GradientBackground/GradientBackground';
import Icons from '../../components/Icons/Icons';

const width = Dimensions.get('window').width;

const EventScreen = ({ route }) => {
  const [event, setEvent] = useState(null);
  const [joined, setJoined] = useState(false);
  const [participants, setParticipants] = useState([]);
  const navigation = useNavigation();

  const eventId = 2;

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`http://192.168.0.118:8000/api/events/${eventId}`);
      const data = await response.json();
      setEvent(data);
      console.log(data)
      setParticipants(data.participants || []);
    } catch (error) {
      console.error('Error fetching event:', error);
    }
  };

  const onJoinEvent = async () => {
    setJoined(true);
    // Implementation to join event goes here.
  };

  const onLeaveEvent = async () => {
    setJoined(false);
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
        <View style={styles.infoBlock}>
          <Text style={styles.title}>{event.title}</Text>
        </View>

        <View style={[styles.infoBlock, { marginTop: width * 0.05 }]}>
          <Icons name="Map2" size={width * 0.07} style={[styles.infoIcons, { marginTop: -width * 0.02 }]} />
          <Text style={[styles.location, { fontSize: width * 0.05 }]}>{event.address}</Text>
        </View>

        <View style={styles.infoBlock}>
          <Icons name="Map2" size={width * 0.04} style={[styles.infoIcons, { marginLeft: width * 0.1, marginTop: -width * 0.02 }]} />
          <Text style={[styles.location, { fontSize: width * 0.04 }]}>{event.city}</Text>
        </View>

        <View style={[styles.infoBlock, { marginTop: width * 0.05 }]}>
          <Icons name="Date" size={width * 0.06} style={[styles.infoIcons, { marginTop: -width * 0.035 }]} />
          <Text style={styles.dateTime}>{event.date}</Text>
        </View>

        <View style={styles.infoBlock}>
          <Icons name="Watch" size={width * 0.045} style={[styles.infoIcons, { marginLeft: width * 0.1, marginTop: -width * 0.03 }]} />
          <Text style={styles.dateTime}>{event.time}</Text>
        </View>

        <View style={[styles.infoBlock, { marginTop: width * 0.05 }]}>
          <Icons name="Sport" size={width * 0.06} style={[styles.infoIcons, { marginTop: -width * 0.04 }]} />
          <Text style={styles.sportType}>{event.sport_type}</Text>
        </View>

        {joined ?
          <>
            <TouchableOpacity style={[styles.button, { backgroundColor: 'red' }]} onPress={onLeaveEvent}>
              <Text style={styles.buttonText}>Leave Event</Text>
            </TouchableOpacity>
            <View>
              <Text style={[styles.joinText, { color: '#22AA00' }]}>
                You joined this event.
              </Text>
            </View>
          </>
          :
          <>
            <TouchableOpacity style={[styles.button, { backgroundColor: 'green' }]} onPress={onJoinEvent}>
              <Text style={styles.buttonText}>Join Event</Text>
            </TouchableOpacity>
            <View>
              <Text style={[styles.joinText, { color: '#AAA' }]}>
                You are not at this event.
              </Text>
            </View>
          </>
        }

        <Text style={styles.participantTitle}>Participants</Text>
        <View style={styles.participantsImages}>
          {[...Array(5)].map((_, index) => (
            <Image
              key={index}
              source={{ uri: 'https://via.placeholder.com/150' }}
              style={[styles.image, { zIndex: 5 - index }, index == 0 ? { marginLeft: 0 } : {}]}
            />
          ))}
          <Text style={styles.moreText}>+135</Text>
        </View>
        <View style={styles.seeMoreButton}>
          <TouchableOpacity onPress={() => {/* Handle see more action here */ }}>
            <Text style={styles.seeMoreText}>See More</Text>
          </TouchableOpacity>
        </View>

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
    padding: width * 0.04,
  },
  infoBlock: {
    flexDirection: 'row',
    alignItems: 'center',

  },
  title: {
    fontSize: width * 0.07,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: width * 0.025,
  },
  location: {
    fontSize: width * 0.056,
    color: '#A0AEC0',
    marginBottom: width * 0.025,
  },
  dateTime: {
    fontSize: width * 0.045,
    color: '#A0AEC0',
    marginBottom: width * 0.038,
  },
  sportType: {
    fontSize: width * 0.045,
    color: '#3182CE',
    marginBottom: width * 0.05,
  },
  infoIcons: {
    marginRight: width * 0.025,

  },
  button: {
    opacity: 0.8,
    paddingVertical: width * 0.025,
    paddingHorizontal: width * 0.038,
    borderRadius: width * 0.0125,
    marginTop: width * 0.025,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  joinText: {
    marginTop: width * 0.01,
    marginBottom: width * 0.04,
    fontSize: width * 0.045,
    fontWeight: 'bold',
  },
  buttonText: {
    color: '#FFF',
    fontSize: width * 0.04,
    textAlign: 'center',
  },
  participantTitle: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: width * 0.025,
  },
  participant: {
    backgroundColor: '#2D3748',
    opacity: 0.8,
    padding: width * 0.025,
    marginBottom: width * 0.0125,
    borderRadius: 125,
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
    fontSize: width * 0.04,
    color: '#A0AEC0',
  },
  participantsImages: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: width * 0.025,
  },
  image: {
    width: width * 0.1,
    height: width * 0.1,
    borderRadius: width * 0.05,
    borderWidth: 1,
    borderColor: '#000',
    marginLeft: -width * 0.063,
  },
  moreText: {
    color: '#FFF',
    marginLeft: width * 0.025,
  },
  seeMoreText: {
    color: '#FFF',
    marginLeft: 0,
  }
});

export default EventScreen;