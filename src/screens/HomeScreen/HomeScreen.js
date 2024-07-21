import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Modal } from 'react-native';
import GradientBackground from './../../components/GradientBackground/GradientBackground';
import { deleteAuthToken } from '../../store/store';
import { useGlobalContext } from './../../services/GlobalContext';
import GetUserCoordinates from '../../components/GetUserCoordinates/GetUserCoordinates.js';
import SportsItems from '../../components/SportsItems/SportsItems.js';
import UsersBall from '../../components/UsersBall/UsersBall.js';
import Icons from '../../components/Icons/Icons.js';
import { BASE_URL } from '@env';

const width = Dimensions.get('window').width;

const PlaceList = ({ places, navigation, checkConnectionError }) =>
  places.map((place) => (
    <View key={place.id.toString()} style={styles.placeItem}>
      <Text style={styles.placeTitle}>{place.name}</Text>
      {place.events.length ? <Text style={{ marginLeft: width * 0.075, color: '#FFF' }}>Events in this place:</Text> : ''}
      {place.events.map((event) => (
        <View key={event.id}>
          <TouchableOpacity
            style={styles.eventButton}
            onPress={() => {
              if (checkConnectionError()) return;
              navigation.navigate('Event', { eventId: event.id });
            }}
          >
            <Text style={styles.buttonText}>{event.title}</Text>
            <Text style={styles.eventDate}>Date: {event.date}</Text>
            <Text style={styles.eventDate}>Time: {event.time}</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity
        style={styles.viewPlaceButton}
        onPress={() => {
          if (checkConnectionError()) return;
          navigation.navigate('Place', { placeId: place.id });
        }}
      >
        <Text style={styles.buttonText}>View Place</Text>
      </TouchableOpacity>
    </View>
  ))

const EventList = ({ events, navigation, checkConnectionError }) =>
  events.map((event) => (
    <View key={event.id.toString()} style={styles.placeItem}>
      <Text style={styles.placeTitle}>{event.title}</Text>
      <Text style={styles.eventDate}>Date: {event.date}</Text>
      <Text style={styles.eventDate}>Time: {event.time}</Text>
      <Text style={styles.eventDate}>Location: {event.location}</Text>
      <SportsItems
        favoriteSports={event.sport_types}
      />
      <TouchableOpacity
        style={styles.viewPlaceButton}
        onPress={() => {
          if (checkConnectionError()) return;
          navigation.navigate('Event', { eventId: event.id });
        }}
      >
        <Text style={styles.buttonText}>View Event</Text>
      </TouchableOpacity>
    </View>
  ));


const HomeScreen = ({ navigation }) => {
  const { active, userId, userToken, checkConnectionError } = useGlobalContext();
  const [places, setPlaces] = useState([]);
  const [events, setEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [joinedPlaces, setJoinedPlaces] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [closerUsers, setCloserUsers] = useState([]);
  const [closerPlaces, setCloserPlaces] = useState(null);
  const [closerEvents, setCloserEvents] = useState(null);

  const [placeModalVisible, setPlaceModalVisible] = useState(false);

  const [clickedUser, setClickedUser] = useState(null);

  const fetchNearbyUsers = async (userToken, location) => {
    try {
      const extendSearch = true;
      const distance = 1000 * 2;
      const max_users = 8;
      const response = await fetch(BASE_URL + `/api/users/nearby-users/?lat=${location.latitude}&lng=${location.longitude}&distance=${distance}&extend=${extendSearch}&max_users=${max_users}`, {
        method: 'GET',
        headers: {
          Authorization: `Token ${userToken}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setCloserUsers(data);
      }
    } catch (error) {
      console.error('Error fetching nearby users:', error);
    }
    return null;
  };
  const fetchUserProfileImages = async (participants) => {
    if (participants.length) {
      try {
        const response = await fetch(BASE_URL + `/api/users/get-user-profile-images/?user_ids=${participants.join()}`);
        const data = await response.json();
        if (response.ok) {
          setCloserUsers(prevCloserUsers => {
            const updatedCloserUsers = [...prevCloserUsers];
            for (const member of data) {
              const index = updatedCloserUsers.map(user => user.id).indexOf(parseInt(member.user_id));
              if (updatedCloserUsers[index]) updatedCloserUsers[index].profile_image = member.profile_image;
            }
            return updatedCloserUsers;
          });
        }
      } catch (error) {
        console.error('Error fetching user profile images:', error);
      }
    }
  };

  const fetchNearbyPlaces = async (userToken, location) => {
    try {
      const distance = 1000 * 2;
      const response = await fetch(BASE_URL + `/api/places/nearby-places/?lat=${location.latitude}&lng=${location.longitude}&distance=${distance}&notMine=true`, {
        method: 'GET',
        headers: {
          Authorization: `Token ${userToken}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setCloserPlaces(data);
      }
    } catch (error) {
      console.error('Error fetching nearby users:', error);
    }
    return null;
  };

  const fetchNearbyEvents = async (userToken, location) => {
    try {
      const distance = 1000 * 2;
      const response = await fetch(BASE_URL + `/api/events/nearby-events/?lat=${location.latitude}&lng=${location.longitude}&distance=${distance}&notMine=true`, {
        method: 'GET',
        headers: {
          Authorization: `Token ${userToken}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setCloserEvents(data);
      }
    } catch (error) {
      console.error('Error fetching nearby users:', error);
    }
    return null;
  };

  const fetchHome = async () => {
    try {
      const response = await fetch(BASE_URL + '/api/users/home/', {
        method: 'GET',
        headers: {
          Authorization: `Token ${userToken}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setPlaces(data.places);
        setEvents(data.events);
        setJoinedEvents(data.joined_events);
        setJoinedPlaces(data.joined_places);
      } else if (data && data.detail === "Invalid token.") {
        deleteAuthToken();
        navigation.navigate('Auth', { screen: 'LoginScreen' });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {

    }
  };

  useEffect(() => {
    if (userToken) {
      fetchHome();
    }
  }, [userToken]);


  useEffect(() => {
    if (closerUsers.length > 0) {
      const closerUsers_without_image = closerUsers.filter(member => {
        return member.profile_image === undefined
      }).map(member => {
        return member.id
      })
      if (closerUsers_without_image.length > 0) {
        fetchUserProfileImages(closerUsers_without_image);
      }
    }
  }, [closerUsers]);

  useEffect(() => {
    if (userLocation && userToken) {
      fetchNearbyUsers(userToken, userLocation);
      fetchNearbyPlaces(userToken, userLocation);
      fetchNearbyEvents(userToken, userLocation);
    }
  }, [userLocation, userToken]);

  useEffect(() => {
    if (clickedUser) {
      if (checkConnectionError()) return;
      navigation.navigate('User Profile', { id: clickedUser });
    }
    setClickedUser(null);
  }, [clickedUser]);

  return (
    <View style={styles.gradientContainer}>
      <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />

      <ScrollView style={styles.container}>
        <Text style={styles.title}>Welcome to Fit Fusion</Text>

        {userLocation ?
          <>
            <Text style={styles.updatesMessageText}>
              You Can Now See The Updates Around You:
            </Text>
            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => navigation.navigate('Map')}
            >
              <Text style={styles.mapButtonText}>Check on Map</Text>
              <Icons name="Map" size={width * 0.06} />
            </TouchableOpacity>
          </>
          :
          <Text style={styles.initialMessageText}>
            Let's start looking for sports places, events and partners near you:
          </Text>
        }
        {userId && userToken && <GetUserCoordinates active={active} userId={userId} userToken={userToken} userLocation={userLocation} setUserLocation={setUserLocation} />}

        {closerUsers ?
          <>
            {places.length ? <Text style={styles.subtitle}>Nearby Users:</Text> : ''}
            <View style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {closerUsers.slice(0, 8).map(user => {
                return <UsersBall key={user.id} user={user} onPress={setClickedUser} size={0.9} />
              })}
            </View>

          </>
          : ''
        }

        {(places.length || joinedEvents.length) ?
          <>
            {places.length ? <Text style={styles.subtitle}>My Places:</Text> : ''}
            <PlaceList places={places.slice(0, 3)} navigation={navigation} checkConnectionError={checkConnectionError} />
            {places.length > 3 ?
              <TouchableOpacity
                style={{ flex: 1, padding: width * 0.03, borderRadius: 5, alignItems: 'center', backgroundColor: 'rgba(255,0,0,0.7)' }}
                onPress={() => { setPlaceModalVisible(true); }}>
                <Text style={styles.buttonText}>All My Places</Text>
              </TouchableOpacity> : ''}

            <Modal
              animationType="slide"
              visible={placeModalVisible}
              transparent={true}
              onRequestClose={() => setPlaceModalVisible(false)}
            >
              <View style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <ScrollView style={{ padding: 10, width: width * 0.9, borderRadius: 20, marginLeft: width * 0.05, marginTop: 50, marginBottom: 50, borderRadius: 20, backgroundColor: '#991B1B', borderWidth: 5, borderColor: '#111' }}>
                  <PlaceList places={places} navigation={navigation} />
                </ScrollView>
              </View>
            </Modal>

            {joinedEvents.length ? <Text style={styles.subtitle}>Events I've Joined:</Text> : ''}
            {joinedEvents.map((event) => {
              return (
                <View key={event.id} style={styles.joinedEventItem}>
                  <TouchableOpacity
                    style={styles.joinedEventButton}
                    onPress={() => {
                      if (checkConnectionError()) return;
                      navigation.navigate('Event', { eventId: event.id });
                    }}
                  >
                    <Text style={styles.joinedEventTitle}>{event.title}</Text>
                    <Text style={styles.eventDate}>Date: {event.date}</Text>
                    <Text style={styles.eventDate}>Time: {event.time}</Text>
                    {event.sport_types && event.sport_types.length ?
                      <View>
                        <SportsItems size={width * 0.8}
                          favoriteSports={event.sport_types}
                        />
                      </View> : ''}
                    <Text style={[styles.eventDate, { fontSize: width * 0.03 }]}>Location: {event.location}</Text>
                    {event.payments && event.payments.length && !event.payments.regular ? <Text style={[styles.eventDate, { fontWeight: 'bold', color: 'red' }]}>Late payment by {-event.payments.days_until_next} days</Text> : ''}
                  </TouchableOpacity>
                </View>
              )
            }
            )}

            {joinedPlaces.length ? <Text style={styles.subtitle}>Places I've Joined:</Text> : ''}
            {joinedPlaces.map((place) => {
              return (
                <View key={place.id} style={styles.joinedEventItem}>
                  <TouchableOpacity
                    style={styles.joinedPlaceButton}
                    onPress={() => {
                      if (checkConnectionError()) return;
                      navigation.navigate('Place', { placeId: place.id });
                    }}
                  >
                    <Text style={styles.joinedEventTitle}>{place.name}</Text>

                    {place.sport_types && place.sport_types.length ?
                      <View>
                        <SportsItems size={width * 0.8}
                          favoriteSports={place.sport_types}
                        />
                      </View> : ''}

                    <Text style={[styles.eventDate, { fontSize: width * 0.03 }]}>Location: {place.location}</Text>
                    {place.payments && place.payments.length && !place.payments.regular && place.payments.days_until_next > -1 ? <Text style={[styles.eventDate, { fontWeight: 'bold', color: 'red' }]}>Late payment by ${-place.payments.days_until_next} days</Text> : ''}
                  </TouchableOpacity>
                </View>
              )
            })}
          </> : ''
        }
        {(events.length || places.length) ? <>
          {events.length ? <>
            <Text style={styles.subtitle}>My Events:</Text>
            <EventList events={events.slice(0, 3)} navigation={navigation} checkConnectionError={checkConnectionError} />
          </> : ''}
        </> : ''

        }

        {closerPlaces && closerPlaces.length ?
          <>
            <Text style={styles.subtitle}>Nearby Places:</Text>
            <View style={styles.nearPlacesContainer}>
              {closerPlaces.slice(0, 4).map((place, index) => {
                return (
                  <TouchableOpacity key={index}
                    onPress={() => { if (checkConnectionError()) return; navigation.navigate('Place', { placeId: place.id }) }}
                    style={styles.nearPlacesItem}
                  >
                    <Text style={styles.nearPlacesNameText}>
                      {place.name}
                    </Text>
                    <Text style={styles.nearPlacesDescriptionText}>
                      {place.description}
                    </Text>
                    <Text style={styles.nearPlacesLocationText}>
                      Location: {place.location}
                    </Text>
                    {place.sport_types && place.sport_types.length ? (
                      <View>
                        <Text style={styles.nearPlacesSportTypesText}>
                          Favorite Sports:
                        </Text>
                        <SportsItems
                          favoriteSports={place.sport_types}
                        />
                      </View>
                    ) : (
                      ''
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
          : ''}

        {closerEvents && closerEvents.length ?
          <>
            <Text style={styles.subtitle}>Nearby Events:</Text>
            <View style={styles.nearPlacesContainer}>
              {closerEvents.slice(0, 4).map((event, index) => {
                return (
                  <View key={event.id}>
                    <TouchableOpacity
                      style={styles.eventButton}
                      onPress={() => {
                        if (checkConnectionError()) return;
                        navigation.navigate('Event', { eventId: event.id });
                      }}
                    >
                      <Text style={[styles.buttonText, { alignSelf: 'center', maxWidth: width * 0.7 }]}>{event.title}</Text>
                      <Text style={styles.eventDate}>Date: {event.date}</Text>
                      <Text style={styles.eventDate}>Time: {event.time}</Text>
                      <Text style={styles.eventDate}>Location: {event.location}</Text>

                      <View>
                        <Text style={[styles.nearPlacesSportTypesText, { marginRight: 10 }]}>
                          Sports:
                        </Text>
                        <SportsItems
                          favoriteSports={event.sport_types}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </>
          : ''}

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => {
            if (checkConnectionError()) return;
            navigation.navigate('Create Event');
          }}
        >
          <Text style={styles.createButtonText}>Create Event</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => {
            if (checkConnectionError()) return;
            navigation.navigate('Create Place');
          }}
        >
          <Text style={styles.createButtonText}>Create Place</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.viewProfileButton}
          onPress={() => {
            navigation.navigate('Profile');
          }}
        >
          <Text style={styles.viewProfileButtonText}>View Profile</Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={{
            width: '90%',
            marginLeft: '5%',
            justifyContent: 'center',
            backgroundColor: '#2196F3',
            padding: 10,
            borderRadius: 5,
            alignItems: 'center',
            marginTop: 10,
            marginBottom: 100
          }}
          onPress={() => {
            if (checkConnectionError()) return;
            navigation.navigate('Profile', { upgrade: true });
          }}
        >
          <Text style={{
            color: '#fff',
            fontSize: 16,
            fontWeight: 'bold',
          }}>
            Upgrade to Premium
          </Text>
        </TouchableOpacity>
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
    color: 'rgba(255, 255, 255, 0.8)',
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
    padding: width * 0.02,
    minHeight: width * 0.05,
    borderRadius: width * 0.03,
    marginBottom: '4%',
    marginLeft: '8%',
    backgroundColor: 'rgba(200, 200, 0, 0.2)',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: width * 0.04,
  },
  eventDate: {
    fontSize: width * 0.04,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  viewPlaceButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.5)',
    paddingVertical: width * 0.025,
    paddingHorizontal: width * 0.0375,
    borderRadius: width * 0.0125,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: 'rgba(200, 200, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinedPlaceButton: {
    width: '100%',
    minHeight: width * 0.05,
    borderRadius: width * 0.03,
    marginVertical: '2%',
    marginLeft: '-8%',
    backgroundColor: 'rgba(50, 50, 50, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
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
  // Refactored styles from inline styles
  initialMessageText: {
    fontSize: width * 0.05,
    color: '#FFF',
  },
  updatesMessageText: {
    fontSize: width * 0.045,
    color: '#FFF',
  },
  mapButton: {
    paddingHorizontal: width * 0.03,
    height: width * 0.12,
    borderRadius: width * 0.03,
    backgroundColor: '#EEE',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: width * 0.05,
  },
  mapButtonText: {
    fontSize: width * 0.04,
    fontWeight: 'bold',
    color: '#000',
    marginRight: '5%',
  },

  nearPlacesContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: width * 0.02,
    paddingBottom: 0,
    borderRadius: width * 0.02,
  },
  nearPlacesItem: {
    width: '100%',
    marginBottom: width * 0.025,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: width * 0.02,
    padding: width * 0.02,
  },
  nearPlacesNameText: {
    color: 'white',
    fontSize: width * 0.04,
    fontWeight: 'bold',
  },
  nearPlacesDescriptionText: {
    color: 'white',
    fontSize: width * 0.03,
    marginTop: 2,
  },
  nearPlacesLocationText: {
    color: 'white',
    fontSize: width * 0.03,
    marginTop: 8,
  },
  nearPlacesSportTypesText: {
    color: 'white',
    fontSize: width * 0.03,
    marginTop: 8,
  },
});

export default HomeScreen;
