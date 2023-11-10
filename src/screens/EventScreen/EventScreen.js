import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Dimensions, Modal, Pressable, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import GradientBackground from './../../components/GradientBackground/GradientBackground';
import ShowMedia from '../../components/ShowMedia/ShowMedia';
import { ShowOnMap } from '../../components/GoogleMaps/GoogleMaps.js';
import Icons from '../../components/Icons/Icons';
import { SportsNames } from '../../utils/sports';

const width = Dimensions.get('window').width;

const EventScreen = ({ route }) => {
  const { userToken } = route.params;
  const [event, setEvent] = useState(null);
  const [joined, setJoined] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [participantsModalVisible, setParticipantsModalVisible] = useState(false);
  const [isVideoModalVisible, setVideoModalVisible] = useState(false);
  const navigation = useNavigation();

  const [userImages, setUserImages] = useState([]);

  const eventId = route.params.eventId;

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    } else {
      Alert.alert('Event error.');
    }
  }, [eventId]);

  const fetchUserProfileImages = async (users) => {
    try {
      const response = await fetch(`http://192.168.0.118:8000/api/users/get-user-profile-images/?user_ids=${users.join()}`);
      const data = await response.json();
      setUserImages(data);
    } catch (error) {
      console.error('Error fetching user profile images:', error);
    }
  };

  const fetchEvent = async () => {
    try {
      const response = await fetch(`http://192.168.0.118:8000/api/events/${eventId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${userToken}`,
        }
      });
      const data = await response.json();
      if (data.detail === "Not found.") {
        Alert.alert('Event not found.');
        return;
      }
      setEvent(data);
      setJoined(data.joined);
      setParticipants(data.participants || []);
      fetchUserProfileImages(data.users);
    } catch (error) {
      console.error('Error fetching event:', error);
    }
  };

  const onJoinLeaveEvent = async () => {
    try {
      const response = await fetch(`http://192.168.0.118:8000/api/events/${eventId}/${joined ? 'leave' : 'join'}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${userToken}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (response.status === 200) {
        setJoined(!joined);
      } else if (response.status === 400) {
        setJoined(!joined);
      } else {
        console.error('Failed to join the event.');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  const onNavigateToProfile = (userId) => {
    navigation.navigate('ProfileScreen', { userId });
  };

  const toggleVideoModal = () => {
    setVideoModalVisible(!isVideoModalVisible);
  };

  if (!event || !event.coordinates) return <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />;
  const [longitude, latitude] = event.coordinates.match(/-?\d+\.\d+/g).map(Number);

  return (
    <View style={styles.gradientContainer}>
      <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />

      {event.videos && event.videos.length ?
        <Modal
          animationType="slide"
          transparent={false}
          visible={isVideoModalVisible}
          onRequestClose={toggleVideoModal}
          style={{
            width: '100%',
            height: 200,
            backgroundColor: '#000'
          }}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', backgroundColor: '#000' }}>
            <TouchableOpacity activeOpacity={1}
              style={{ width: '100%', height: '100%', backgroundColor: '#000' }}
            >
              <ShowMedia
                media={event.videos[0].video}
                isVideo={true}
                style={{ width: width, height: width * (9 / 16) }}
              />
            </TouchableOpacity>
          </View>
        </Modal>
        : ''
      }
      <ScrollView style={styles.container}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        overScrollMode="never"
      >
        <View style={styles.infoBlock}>
          <Text style={styles.title}>{event.title}</Text>
        </View>

        <View style={[styles.infoBlock, { marginTop: width * 0.05 }]}>
          <Icons name="Map2" size={width * 0.07} style={[styles.infoIcons, { marginBottom: 'auto', paddingTop: width * 0.08 }]} />
          <Text style={[styles.location, { fontSize: width * 0.05 }]}>{event.location}</Text>
        </View>
        {event.coordinates ? <ShowOnMap coordinates={{ 'latitude': latitude, 'longitude': longitude }} /> : ''}

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
          <Text style={styles.sportType}>
            {event.sport_types.length ? SportsNames(event.sport_types).join(', ') : ''}.
          </Text>
        </View>

        <View style={styles.infoBlock}>
          <Icons name="Description" size={width * 0.055} style={[styles.infoIcons, { marginBottom: 'auto', paddingTop: width * 0.07 }]} />
          <Text style={styles.description}>{event.description}</Text>
        </View>

        {joined ?
          <>
            <TouchableOpacity style={[styles.button, { backgroundColor: 'red' }]} onPress={onJoinLeaveEvent}>
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
            <TouchableOpacity style={[styles.button, { backgroundColor: 'green' }]} onPress={onJoinLeaveEvent}>
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
        <Pressable style={styles.participantsImages}
          onPress={() => {
            setParticipantsModalVisible(participants.length > 0);
          }}
        >
          {userImages.map((image, index) =>
            <View key={index}
              style={[styles.image, { zIndex: 5 - index }, index === 0 ? { marginLeft: 0 } : {}]}
            >
              {image.success ?
                <Image
                  source={{ uri: `data:image/jpeg;base64,${image.profile_image}` }}
                  style={{ width: '100%', height: '100%', borderRadius: 100 }}
                  onError={(error) => console.error('Image Error:', error)}
                />
                :
                <Icons name="Profile2" size={width * 0.05} />
              }
            </View>
          )}
          {event.users_amount > 5 ? (<Text style={styles.moreText}>+{event.users_amount - 5}</Text>) : ''}
          {participants.length > 0 ?
            <View style={styles.seeMoreButton}>
              <Text style={styles.seeAllText}>See All</Text>
            </View> : ''}
        </Pressable>

        <Modal
          animationType="slide"
          transparent={true}
          visible={participantsModalVisible}
          onRequestClose={() => setParticipantsModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <ScrollView>
                {participants.map((participant, index) => (
                  <TouchableOpacity key={index} style={styles.participantContainer}>
                    <View style={styles.iconContainer}>
                      <Icons name="Profile2" size={width * 0.05} />
                    </View>
                    <Text style={styles.participantName}>{participant.username}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                onPress={() => setParticipantsModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {(event.photos && event.photos.length) || (event.videos && event.videos.length) ? <Text style={styles.participantTitle}>Media</Text> : ''}
        {event.photos && event.photos.length ?
          <Text style={{ fontSize: width * 0.05, color: '#FFF', fontWeight: 'bold' }}>Images</Text>
          : ''
        }
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            flexWrap: "wrap",
            justifyContent: "space-evenly",
          }}
        >
          {event.photos && event.photos.map((photo, index) =>
            <ShowMedia key={index} media={photo} video={false} />
          )}
        </View>

        {event.videos && event.videos.length ?
          <>
            <Text style={{ fontSize: width * 0.05, color: '#FFF', fontWeight: 'bold' }}>Videos</Text>
            <Pressable onPress={toggleVideoModal}
              style={{
                width: width * 0.3,
                height: width * 0.3,
                backgroundColor: '#FFF',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icons name="PlayVideo" size={width * 0.3} style={{ backgroundColor: '#DDD' }} />
            </Pressable>
          </>
          : ''
        }

        <View style={{ marginBottom: 100 }}>

        </View>
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
    width: width*0.82,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: width * 0.06,
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
  description: {
    fontSize: width * 0.045,
    color: '#CCCCCC',
    marginBottom: width * 0.038,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantName: {
    fontSize: width * 0.04,
    color: '#A0AEC0',
    marginLeft: '3%',
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
    borderColor: '#777',
    backgroundColor: '#AAA',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -width * 0.055,
  },
  moreText: {
    color: '#FFF',
    marginLeft: width * 0.025,
  },
  seeMoreButton: {
    padding: width * 0.02,
    borderRadius: width * 0.02,
    backgroundColor: 'rgba(100,100,100,0.2)',
    marginLeft: '3%'
  },
  seeAllText: {
    color: '#FFF',
    marginLeft: 0,
  },

  // PARTICIPANTS MODAL

  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(50, 50, 50, 0.6)',
  },
  modalContent: {
    width: width * 0.8,
    maxHeight: width * 1.4,
    backgroundColor: 'white',
    padding: width * 0.04,
    borderRadius: width * 0.02,
  },
  participantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: width * 0.01,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
  },
  iconContainer: {
    width: width * 0.1,
    height: width * 0.1,
    backgroundColor: '#EEE',
    padding: width * 0.04,
    borderRadius: width * 0.05,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#DDD',
  },
  participantName: {
    fontSize: width * 0.04,
    marginLeft: '3%',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: width * 0.04,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: 'gray',
    fontSize: width * 0.04,
  },
});

export default EventScreen;