import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Dimensions, Modal, Pressable, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import GradientBackground from '../../components/GradientBackground/GradientBackground.js';
import UploadPicker from '../../components/UploadPicker/UploadPicker.js';
import ShowMedia from '../../components/ShowMedia/ShowMedia.js';
import SubscriptionPlansModal from '../../components/Payment/SubscriptionPlansModal';
import { ShowOnMap } from '../../components/GoogleMaps/GoogleMaps.js';
import ManageUsers from '../../components/Management/ManageUsers.js';
import Icons from '../../components/Icons/Icons.js';
import QRScanner from '../../components/QRScanner/QRScanner.js';
import SportsItems from '../../components/SportsItems/SportsItems.js';
import { BASE_URL } from '@env';

const width = Dimensions.get('window').width;

const EventScreen = ({ route, navigation }) => {
  const { eventId, userId, userToken } = route.params;
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [participantsModalVisible, setParticipantsModalVisible] = useState(false);
  const [isClientManagerModalVisible, setClientManagerModalVisible] = useState(false);
  const [subscriptionPlansModalVisible, setSubscriptionPlansModalVisible] = useState(false);
  const [scannedUserModalVisible, setScannedUserModalVisible] = useState(false);
  const [isVideoModalVisible, setVideoModalVisible] = useState(false);

  const [userImages, setUserImages] = useState([]);

  const [selectedImages, setSelectedImages] = useState([]);
  const [editImages, setEditImages] = useState(false);

  const [preview, setPreview] = useState(route.params.eventPreview);

  const [userPayments, setUserPayments] = useState(false);
  const [scannedUserData, setScannedUserData] = useState(null);

  useFocusEffect(
    useCallback(() => {
      fetchEvent();
    }, [])
  );
  useEffect(() => {
    setEvent(preview);
  }, [preview]);

  useEffect(() => {
    setPreview(route.params.eventPreview);
  }, [route.params.eventPreview]);

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    } else if (preview) {
      setEvent(preview);
    } else {
      Alert.alert('Event error.');
    }
  }, [eventId]);

  const fetchUserProfileImages = async (participants) => {
    if (participants.length) {
      try {
        const response = await fetch(BASE_URL + `/api/users/get-user-profile-images/?user_ids=${participants.join()}`);
        const data = await response.json();
        setUserImages(data);
      } catch (error) {
        console.error('Error fetching user profile images:', error);
      }
    }
  };

  const fetchEvent = async () => {
    try {
      const response = await fetch(BASE_URL + `/api/events/${eventId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${userToken}`,
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEvent(data);
        setParticipants(data.participants || []);
        fetchUserProfileImages(data.participants);
        setSelectedImages(data.images)
      } else {
        Alert.alert(response.status === 404 ? 'Event not Found.' : 'Unknown error on fetching event.');
      }
    } catch (error) {
      console.error('Error fetching event:', error);
    }
  };

  const toggleVideoModal = () => {
    setVideoModalVisible(!isVideoModalVisible);
  };
  const updateExistingEventImages = async () => {
    setEditImages(false); // Assuming you have a state management system
    const existingImagesData = selectedImages.map((img, index) => ({
      id: img.id,
      image_id: index + 1
    }));

    const response = await fetch(BASE_URL + `/api/events/${eventId}/update-images/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ images: existingImagesData })
    });

    if (response.ok) {
      uploadEventImages();
    }
  };

  const ScannedUserModal = () => {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={scannedUserModalVisible}
        onRequestClose={() => {
          setScannedUserModalVisible(false);
          setScannedUserData(null);
          setUserPayments(null);
        }}
      >
        <View style={styles.participantManagerModalContainer}>
          <View style={[styles.participantManagerModalContent, { backgroundColor: userPayments && userPayments.payments ? userPayments.regular ? '#98FB98' : '#B22222' : "#FFF" }]}>
            <Text style={styles.participantManagerModalTitle}>Participant Data</Text>

            <View style={{ width: '100%', minHeight: width }}>
              {scannedUserData ?
                <ScrollView style={{ width: '100%' }}>

                  {!userPayments || userPayments.participant || (userPayments.payments) ?
                    <ManageUsers userToken={userToken} item='event' itemId={eventId} />
                    :
                    <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 30 }}>This user is not a participant of this Place.</Text>
                  }

                </ScrollView>
                :
                <QRScanner setScannedUserData={setScannedUserData} />
              }
            </View>

            <TouchableOpacity
              style={[styles.participantRequestButton, { backgroundColor: '#CCC', marginTop: width * 0.1, width: width * 0.5, height: width * 0.1, alignItems: 'center', justifyContent: 'center' }]}
              onPress={() => {
                setScannedUserModalVisible(false);
                setScannedUserData(null);
                setUserPayments(null);
              }}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const uploadEventImages = async () => {
    try {
      // Filter out already uploaded images and only keep new ones
      const newImages = selectedImages.filter(img => !img.image);

      for (let i = 0; i < newImages.length; i++) {
        const img = newImages[i];
        const imageId = selectedImages.indexOf(img) + 1;

        const formData = new FormData();
        formData.append('image_id', imageId);
        formData.append('image', {
          uri: img.uri,
          type: img.mimeType,
          name: img.name,
        });

        const response = await fetch(BASE_URL + `/api/events/${eventId}/upload-image/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${userToken}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Server error response:", errorData);
          break;
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
    fetchEvent(); // Update to fetch the event data
  };

  const ManagerSubscriptionPlansModal = () => {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={subscriptionPlansModalVisible}
        onRequestClose={() => { setSubscriptionPlansModalVisible(false); fetchEvent(); }}
      >
        <View style={styles.clientManagerModalContainer}>
          <View style={[styles.clientManagerModalContent, { padding: 3 }]}>
            <Text style={styles.clientManagerModalTitle}>Subscription Plans</Text>
            <View style={{ width: '100%', minHeight: width, backgroundColor: '#FFF' }}>
              <SubscriptionPlansModal
                userToken={userToken}
                subscriptionTexts={{ button_text: "Testing..." }}
                object={{
                  get_key: 'plans_ids',
                  get_id: event.subscription_plans.map(plan => plan.id),
                  obj_key: 'event_id',
                  obj_id: event.id,
                  plans_in: event.subscription_plans,
                  extra: {
                    type: 'join_event',
                    event_id: event.id,
                  }
                }}
                single
                patternMode='manager'
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const ClientManagerModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isClientManagerModalVisible}
        onRequestClose={() => setClientManagerModalVisible(false)}
      >
        <View style={styles.clientManagerModalContainer}>
          <View style={styles.clientManagerModalContent}>
            <Text style={styles.clientManagerModalTitle}>Clients Management</Text>

            <ScrollView style={{ width: '100%' }}>
              <ManageUsers userToken={userToken} item='event' itemId={eventId} />
            </ScrollView>

            <TouchableOpacity
              style={[styles.clientRequestButton, { backgroundColor: '#CCC', marginTop: width * 0.1, width: width * 0.5, height: width * 0.1, alignItems: 'center', justifyContent: 'center' }]}
              onPress={() => setClientManagerModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  if (!event || !event.coordinates) return <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />;
  const [longitude, latitude] = preview ? [preview.coordinates.longitude, preview.coordinates.latitude] : event.coordinates.match(/-?\d+\.\d+/g).map(Number);

  return (
    <View key={preview ? preview.title : 'loading'} style={styles.gradientContainer}>
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

        <View style={{ flexDirection: 'row' }}>
          {event.creator == userId ?
            <Pressable
              onPress={() => {
                setScannedUserModalVisible(true);
                //fetchPayments(33);
              }}
              style={[styles.createEventButton, { height: 'auto', width: width * 0.3, position: 'absolute', maxWidth: width * 0.3, flexDirection: 'column', padding: width * 0.05, marginTop: width * 0.03 }]}
            >
              <Icons name="Camera" size={width * 0.08} />
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: width * 0.035, marginLeft: '3%' }}>Scan User</Text>
            </Pressable>
            : ''
          }
          {event.creator == userId ?
            <Pressable
              onPress={() => setClientManagerModalVisible(true)}
              style={[styles.createEventButton, { minWidth: width * 0.6 }]}
            >
              <Icons name="ParticipantEdit" size={width * 0.08} />
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: width * 0.035, marginLeft: '3%' }}>Clients Manager</Text>
            </Pressable>
            : ''
          }
        </View>
        
        <ManagerSubscriptionPlansModal />

        <ClientManagerModal />

        <Pressable
          onPress={() => setSubscriptionPlansModalVisible(true)}
          style={[styles.createEventButton, { marginTop: width * 0.03, minWidth: width * 0.6 }]}
        >
          <Icons name="Subscription" size={width * 0.08} />
          <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: width * 0.035, marginLeft: '3%' }}>Subscription Plans</Text>
        </Pressable>

        <ScannedUserModal />
        {event.creator == userId ?
          <Pressable
            onPress={() => {
              navigation.navigate('Create Event', {
                preview: {
                  eventId: eventId,
                  title: event.title,
                  description: event.description,
                  location: event.location,
                  sport_types: event.sport_types,
                  is_private: event.is_private,
                  coordinates: { "latitude": latitude, "longitude": longitude },
                }
              })
            }}
            style={[styles.createEventButton, { marginTop: width * 0.03, minWidth: width * 0.6 }]}
          >
            <Icons name="Edit" size={width * 0.06} />
            <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: width * 0.035, marginLeft: '3%' }}>Edit Event</Text>
          </Pressable>
          : ''
        }

        <View style={styles.infoBlock}>
          <Text style={styles.title}>{event.title}</Text>
        </View>

        <View style={[styles.infoBlock, { marginTop: width * 0.05 }]}>
          <Icons name="Map2" size={width * 0.07} style={[styles.infoIcons, { marginBottom: 'auto', paddingTop: width * 0.08 }]} fill={"#FFF"} />
          <Text style={[styles.location, { fontSize: width * 0.05 }]}>{event.location}</Text>
        </View>
        {event.coordinates ? <ShowOnMap coordinates={{ 'latitude': latitude, 'longitude': longitude }} /> : ''}

        <View style={[styles.infoBlock, { marginTop: width * 0.05 }]}>
          <Icons name="Date" size={width * 0.06} style={[styles.infoIcons, { marginTop: -width * 0.035 }]} />
          <Text style={styles.dateTime}>{event.date}</Text>
        </View>

        <View style={styles.infoBlock}>
          <Icons name="Watch" size={width * 0.045} style={[styles.infoIcons, { marginLeft: width * 0.1, marginTop: -width * 0.03 }]} fill={"#FFF"} />
          <Text style={styles.dateTime}>{event.time}</Text>
        </View>

        <View style={[styles.infoBlock, { marginTop: width * 0.05 }]}>
          <Icons name="Sport" size={width * 0.055} style={[styles.infoIcons, { marginBottom: 'auto', paddingTop: width * 0.08 }]} />
          <SportsItems favoriteSports={event.sport_types} />
        </View>

        <View style={styles.infoBlock}>
          <Icons name="Description" size={width * 0.055} style={[styles.infoIcons, { marginBottom: 'auto', paddingTop: width * 0.07 }]} />
          <Text style={styles.description}>{event.description}</Text>
        </View>

        <Text style={styles.participantTitle}>Participants</Text>
        <Pressable style={styles.participantsImages}
          onPress={() => {
            setParticipantsModalVisible(participants.length > 0);
          }}
        >
          {(preview ? [...Array(5)] : userImages).map((image, index) =>
            <View key={index}
              style={[styles.image, { zIndex: 5 - index }, index === 0 ? { marginLeft: 0 } : {}]}
            >
              {!preview && image.success ?
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
          {event.participants_amount > 5 ? (<Text style={styles.moreText}>+{event.participants_amount - 5}</Text>) : ''}
          {preview ? (<Text style={styles.moreText}>+125</Text>) : ''}
          {participants.length > 0 ?
            //<View style={styles.seeMoreButton}><Text style={styles.seeAllText}>See All</Text></View>
            '' :
            <Text style={styles.moreText}>There is still no participants.</Text>
          }
        </Pressable>

        {(event.photos && event.photos.length) || (event.videos && event.videos.length) ? <Text style={styles.participantTitle}>Media</Text> : ''}
        {event.photos && event.photos.length ?
          <Text style={{ fontSize: width * 0.05, color: '#FFF', fontWeight: 'bold' }}>Images</Text>
          : ''
        }


        {!editImages && event.images && event.images.length ?
          <View
            style={styles.userImagesContainer}
          >
            <View style={styles.infoBlock}>
              <Icons name="Images" size={width * 0.07} style={styles.infoIcons} />
            </View>
            {event.images.map((image, index) => {
              return (
                <View key={index}
                  style={styles.userImagesItems}
                >
                  <ShowMedia media={BASE_URL + `${image.image}`} size={width * 0.26} />
                </View>
              )
            })}
            <TouchableOpacity style={styles.EditInfoIcon} onPress={() => setEditImages(true)}>
              <Icons name="Edit" size={width * 0.1} />
            </TouchableOpacity>
          </View>
          :
          <UploadPicker
            selectedImages={selectedImages}
            setSelectedImages={setSelectedImages}
            max={5}
            upload={updateExistingEventImages}
            setEditImages={setEditImages}
            cancel
          />
        }

        {(event.place_videos && event.place_videos.length) || (preview && event.videos) ?
          <View
            style={styles.userImagesContainer}
          >
            <View style={[styles.infoBlock, { justifyContent: 'center' }]}>
              <Icons name="Images" size={width * 0.07} style={[styles.infoIcons, { position: 'absolute', left: 0, top: 0 }]} />
              <Pressable onPress={toggleVideoModal} >
                <Icons name="PlayVideo" size={width * 0.25} style={{ backgroundColor: '#DDD' }} />
              </Pressable>
            </View>
            <TouchableOpacity style={styles.EditInfoIcon} onPress={{}}>
              <Icons name="Edit" size={width * 0.1} />
            </TouchableOpacity>
          </View>
          : ''
        }

        {(event.place_videos && event.place_videos.length) || (preview && event.videos) ?
          <Modal
            animationType="slide"
            transparent={false}
            visible={isVideoModalVisible}
            onRequestClose={toggleVideoModal}
            style={{ width: '100%', backgroundColor: '#000' }}
          >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', backgroundColor: '#000' }}>
              <TouchableOpacity activeOpacity={1}
                style={{ width: '100%', height: '100%', backgroundColor: '#000' }}
              >
                <ShowMedia
                  media={preview ? event.videos : BASE_URL + `${event.place_videos[0].video}`}
                  isVideo={true}
                  style={{ width: width, height: width * (9 / 16) }}
                />
              </TouchableOpacity>
            </View>
          </Modal>
          : ''
        }

        {preview ?
          <TouchableOpacity style={[styles.button, { backgroundColor: 'red', marginTop: width * 0.1, paddingVertical: width * 0.05 }]} onPress={() => {
            navigation.navigate("CreateEvent")
          }}>
            <Text style={styles.buttonText}>Back to edition</Text>
          </TouchableOpacity> : ''
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
    width: width * 0.82,
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

  // Styles for Participant Manager Modal
  participantManagerModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  participantManagerModalContent: {
    width: '96%',
    maxHeight: '90%',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  participantManagerModalTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    marginBottom: 10,
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

  // Styles for Client Requests Modal
  clientManagerModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  clientManagerModalContent: {
    width: '96%',
    maxHeight: '90%',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  clientManagerModalTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    marginBottom: 10,
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


  createEventButton: {
    height: width * 0.12,
    paddingHorizontal: width * 0.05,
    borderRadius: width * 0.06,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  userImagesContainer: {
    width: '100%',
    paddingVertical: width * 0.01,
    borderRadius: width * 0.02,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: width * 0.03,
  },
  userImagesItems: {
    width: width * 0.26,
    height: width * 0.26,
    margin: width * 0.02,
    position: 'relative',
  },
  EditInfoIcon: {
    position: 'absolute',
    right: 0,
    bottom: -width * 0.08,
    padding: width * 0.01,
    backgroundColor: '#DDD',
    borderWidth: 2,
    borderColor: '#FFF',
    borderRadius: width * 0.03,
    alignItems: 'center',
    opacity: 0.7,
  },
});

export default EventScreen;