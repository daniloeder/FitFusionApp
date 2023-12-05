import React, { useEffect, useState, useRef } from 'react';
import MapView, { Marker, Callout, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, View, Text, Dimensions, Switch, Pressable, Image } from 'react-native';
import { SportsNames } from '../../utils/sports';
import Icons from '../../components/Icons/Icons';
import { GoogleAutocompletePicker } from '../../components/GoogleMaps/GoogleMaps.js';
import { BASE_URL } from '@env';

const width = Dimensions.get('window').width;

function calculateDistance(coord1, coord2) {
  const R = 6371;
  const lat1 = deg2rad(coord1.lat);
  const lat2 = deg2rad(coord2.lat);
  const lon1 = deg2rad(coord1.lng);
  const lon2 = deg2rad(coord2.lng);

  const dlat = lat2 - lat1;
  const dlon = lon2 - lon1;

  const a =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = (R * c) * 1000; // Distance in meters

  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

const OnOffButton = ({ icon, isLocalEnabled, setIsLocalEnabled }) => {
  return (
    <View onPress={() => { }} style={styles.onOffButtonStyle}>
      <Icons name={icon} size={width * 0.08} style={{ marginLeft: 4 }} />
      <Switch
        value={isLocalEnabled}
        onValueChange={() => setIsLocalEnabled(!isLocalEnabled)}
        thumbColor={isLocalEnabled ? "#007bff" : "#ccc"}
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
      />
    </View>
  )
}

const CircleOverlay = ({ centerCoordinates, radius }) => {
  return (
    <Circle
      center={centerCoordinates}
      radius={radius}
      fillColor="rgba(0, 0, 255, 0.1)" // You can customize the circle color and opacity here
      strokeColor="rgba(0, 0, 255, 1)" // You can customize the circle border color and opacity here
    />
  );
};

const DoubleCircleOverlay = ({ centerCoordinates, radius }) => {
  return (
    <>
      <CircleOverlay
        centerCoordinates={centerCoordinates}
        radius={radius}
      />
      <CircleOverlay
        centerCoordinates={centerCoordinates}
        radius={radius * 2}
      />
    </>
  );
};

function Map({ route, MAX_ZOOM_LATITUDE_DELTA = 0.025, PATTERN_ZOOM_LATITUDE_DELTA = 0.008, SCROLL_ENABLED = true, ZOOM_ENABLED = true }) {
  const { userToken } = route.params;
  const navigation = useNavigation();
  const MAX_DISTANCE_METERS = 500;

  const [userLocation, setUserLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const mapRef = useRef();

  const [isPlacesEnabled, setIsPlacesEnabled] = useState(true);
  const [isEventEnabled, setIsEventEnabled] = useState(true);
  const [isUserEnabled, setIsUserEnabled] = useState(true);

  const [currentPosition, setCurrentPosition] = useState(null);
  const [coodinatesList, setCoordinatesList] = useState([{ lat: 0, lng: 0 }]);

  const [pickerCoordinates, setPickerCoordinates] = useState(null);

  const iconNamesByIndex = ["BodyBuilding", "Soccer", "Basketball", "Tennis", "Baseball", "AmericanFootball", "Golf", "Cricket", "Rugby", "Volleyball", "TableTennis", "Badminton", "IceHockey", "FieldHockey", "Swimming", "TrackAndField", "Boxing", "Gymnastics", "MartialArts", "Cycling", "Equestrian", "Fencing", "Bowling", "Archery", "Sailing", "CanoeingKayaking", "Wrestling", "Snowboarding", "Skiing", "Surfing", "Skateboarding", "RockClimbing", "MountainBiking", "RollerSkating", "Other"];

  const updatePlaces = async () => {
    try {
      const placesResponse = await fetch(BASE_URL + `/api/places/nearby-places/?lat=${currentPosition.latitude}&lng=${currentPosition.longitude}&distance=${MAX_DISTANCE_METERS * 2}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${userToken}`
        }
      });

      if (!placesResponse.ok) {
        throw new Error('Network response was not ok' + placesResponse.statusText);
      }
      const placesData = await placesResponse.json();
      if (placesData.length === 0) {
        return
      }

      // Update places by ensuring that each place has a unique key
      setPlaces((prevPlaces) => {
        const newPlaces = [...prevPlaces];
        placesData.forEach((place) => {
          if (!newPlaces.some((existingPlace) => existingPlace.id === place.id)) {
            newPlaces.push(place);
          }
        });
        return newPlaces;
      });
    } catch (error) {
      console.error('There was a problem with fetching places: ', error);
    }
  };

  const updateEvents = async () => {
    try {
      const eventsResponse = await fetch(BASE_URL + `/api/events/nearby-events/?lat=${currentPosition.latitude}&lng=${currentPosition.longitude}&distance=${MAX_DISTANCE_METERS * 200}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${userToken}`
        }
      });

      if (!eventsResponse.ok) {
        throw new Error('Network response was not ok' + eventsResponse.statusText);
      }
      const eventsData = await eventsResponse.json();
      if (eventsData.length === 0) {
        return
      }

      // Update events by ensuring that each event has a unique key
      setEvents((prevEvents) => {
        const newEvents = [...prevEvents];
        eventsData.forEach((event) => {
          if (!newEvents.some((existingEvent) => existingEvent.id === event.id)) {
            newEvents.push(event);
          }
        });
        return newEvents;
      });
    } catch (error) {
      console.error('There was a problem with fetching events: ', error);
    }
  };
  const fetchUserProfileImages = async (participants) => {
    if (participants.length) {
      try {
        const response = await fetch(BASE_URL + `/api/users/get-user-profile-images/?user_ids=${participants.join()}`);
        const data = await response.json();
        if (response.ok) {
          // Create a map of user IDs to their profile image data
          const profileImageMap = {};
          data.forEach((user) => {
            profileImageMap[user.user_id] = user.profile_image;
          });

          // Update each user in the state with their profile image data
          setUsers((prevUsers) => {
            return prevUsers.map((user) => {
              if (profileImageMap.hasOwnProperty(user.id)) {
                return { ...user, profile_image: profileImageMap[user.id] };
              }
              return user;
            });
          });
        }
      } catch (error) {
        console.error('Error fetching user profile images:', error);
      }
    }
  };
  const updateUsers = async () => {
    try {
      const usersResponse = await fetch(BASE_URL + `/api/users/nearby-users/?lat=${currentPosition.latitude}&lng=${currentPosition.longitude}&distance=${MAX_DISTANCE_METERS * 200}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${userToken}`
        }
      });

      const usersData = await usersResponse.json();
      if (usersData.length === 0) {
        return
      }
      if (usersResponse.ok) {
        fetchUserProfileImages(usersData.map((user) => user.id));
      } else {
        throw new Error('Network response was not ok' + usersResponse.statusText);
      }

      setUsers((prevUsers) => {
        const newUsers = [...prevUsers];
        usersData.forEach((user) => {
          if (!newUsers.some((existingUser) => existingUser.id === user.id)) {
            newUsers.push(user);
          }
        });
        return newUsers;
      });
    } catch (error) {
      console.error('There was a problem with fetching users: ', error);
    }
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: PATTERN_ZOOM_LATITUDE_DELTA,
        longitudeDelta: PATTERN_ZOOM_LATITUDE_DELTA,
      });
      setCoordinatesList([{ lat: location.coords.latitude, lng: location.coords.longitude }]);

      setCurrentPosition({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: PATTERN_ZOOM_LATITUDE_DELTA,
        longitudeDelta: PATTERN_ZOOM_LATITUDE_DELTA,
      });

    })();
  }, []);

  useEffect(() => {
    if (currentPosition) {
      updatePlaces();
      updateEvents();
      updateUsers();
    }
  }, [currentPosition]);

  useEffect(() => {
    if (pickerCoordinates) {
      const newRegion = {
        "latitude": pickerCoordinates.latitude,
        "latitudeDelta": PATTERN_ZOOM_LATITUDE_DELTA,
        "longitude": pickerCoordinates.longitude,
        "longitudeDelta": PATTERN_ZOOM_LATITUDE_DELTA,
      }
      mapRef.current.animateToRegion({
        ...newRegion,
        latitudeDelta: MAX_ZOOM_LATITUDE_DELTA,
        longitudeDelta: MAX_ZOOM_LATITUDE_DELTA * (newRegion.longitudeDelta / newRegion.latitudeDelta),
      });
    }
  }, [pickerCoordinates]);

  const handleRegionChange = (newRegion) => {
    setCurrentPosition(newRegion)
    //pickerCoordinates = null;

    // Check if there's any existing coordinate that is closer than MAX_DISTANCE_METERS
    const isTooClose = coodinatesList.some((coordinate) => {
      const distance = calculateDistance(
        coordinate,
        { lat: newRegion.latitude, lng: newRegion.longitude }
      );
      return distance < MAX_DISTANCE_METERS;
    });

    if (!isTooClose || coodinatesList.length === 0) {
      setCoordinatesList([...coodinatesList, { lat: newRegion.latitude, lng: newRegion.longitude }]);
    }

    if (newRegion.latitudeDelta > MAX_ZOOM_LATITUDE_DELTA) {
      mapRef.current.animateToRegion({
        ...newRegion,
        latitudeDelta: MAX_ZOOM_LATITUDE_DELTA,
        longitudeDelta: MAX_ZOOM_LATITUDE_DELTA * (newRegion.longitudeDelta / newRegion.latitudeDelta),
      });
    }
    if (newRegion.latitudeDelta > MAX_ZOOM_LATITUDE_DELTA) {
      mapRef.current.animateToRegion({
        ...newRegion,
        latitudeDelta: MAX_ZOOM_LATITUDE_DELTA,
        longitudeDelta: MAX_ZOOM_LATITUDE_DELTA * (newRegion.longitudeDelta / newRegion.latitudeDelta),
      });
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={userLocation}
        onRegionChangeComplete={handleRegionChange}
        scrollEnabled={SCROLL_ENABLED}
        zoomEnabled={ZOOM_ENABLED}
      >
        {isPlacesEnabled && places.map((place) => {

          const coordinatesArray = place.coordinates.match(/-?\d+\.\d+/g);
          const [longitude, latitude] = coordinatesArray.map(Number);
          return (
            <Marker key={place.id} coordinate={{ latitude, longitude }}>
              <Icons name="Gym" size={width * 0.08} />
              <Callout tooltip={true} style={styles.calloutContainer} onPress={() => {
                navigation.navigate('Place', { placeId: place.id })
              }}>
                <View style={styles.calloutView}>
                  <Text style={styles.calloutTitle}>{place.name}</Text>
                  <Text style={styles.calloutSubtitle}>Location: {place.location}</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
        {isEventEnabled && events.map((event) => {
          const coordinatesArray = event.coordinates.match(/-?\d+\.\d+/g);
          const [longitude, latitude] = coordinatesArray.map(Number);
          return (
            <Marker key={event.id} coordinate={{ latitude, longitude }}>
              <Icons name="Events" size={width * 0.08} />
              <Callout tooltip={true} style={styles.calloutContainer} onPress={() => {
                navigation.navigate('Event', { eventId: event.id })
              }}>
                <View style={styles.calloutView}>
                  <Text style={styles.calloutTitle}>{event.title}</Text>
                  <Text style={styles.calloutSubtitle}>Location: {event.location}</Text>
                  <Text style={styles.calloutSubtitle}>Date & Time: {event.date_time}</Text>
                  <Text style={styles.calloutSubtitle}>Sport Type: {event.sport_type}</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
        {isUserEnabled && users.map((user, index) => {
          const coordinatesArray = user.coordinates.match(/-?\d+\.\d+/g);
          const [longitude, latitude] = coordinatesArray.map(Number);
          return (
            <Marker key={user.id} coordinate={{ latitude, longitude }}>

              <View style={[styles.userBall, { borderColor: user.sex === 'M' ? '#0033FF' : user.sex === 'F' ? '#FF3399' : '#DDD' }]}>

                {user && user.profile_image ?
                  <Image style={styles.userBallImageProfile}
                    source={{ uri: `data:image/jpeg;base64,${user.profile_image}` }}
                    onError={(error) => console.error('Image Error:', error)}
                  />
                  :
                  <Icons name="Profile" size={width * 0.08} />
                }
              </View>
              <View
                style={styles.userSportsIconsContainer}
              >
                {user.favorite_sports.slice(0, 3).map((sport, index) => {
                  return (
                    <View key={sport}
                      style={[{ borderRadius: 10, backgroundColor: 'rgba(255, 255, 255, 0.7)' }, index == 1 ? { position: 'absolute', right: 0, top: -width * 0.052 } : {}]}
                    >
                      <Icons name={iconNamesByIndex[(sport - 1)]} size={width * 0.03} />
                    </View>
                  )
                }
                )}
              </View>

              <Callout tooltip={true} style={styles.calloutContainer} onPress={() => {
                navigation.navigate('User Profile', { id: user.id })
              }}>
                <View style={styles.calloutView}>
                  <Text style={styles.calloutSubtitle}>User: {user.username}</Text>
                  <Text style={styles.calloutSubtitle}>Age: {user.age}</Text>
                  {user.favorite_sports.length ? <Text style={styles.calloutSubtitle}>Sports:</Text> : ''}
                  {user.favorite_sports.slice(0, 3).map((sport, index) =>
                    <View key={sport} style={styles.userSportsList}>
                      <Icons name={iconNamesByIndex[(sport - 1)]} size={width * 0.05} />
                      <Text style={[styles.calloutSubtitle, { marginLeft: '5%' }]}>
                        {SportsNames([sport])}
                      </Text>
                    </View>
                  )}
                </View>
              </Callout>
            </Marker>
          );
        })}

        {false && coodinatesList.map((coordinates, index) =>
          <DoubleCircleOverlay key={index}
            centerCoordinates={{ latitude: coordinates.lat, longitude: coordinates.lng }}
            radius={MAX_DISTANCE_METERS}
          />
        )}
      </MapView>
      <View style={styles.inputContainer}>
        <GoogleAutocompletePicker setCoordinates={setPickerCoordinates} />
      </View>
      <View style={styles.toggleButtonContainer}>
        <OnOffButton icon="Gym" isLocalEnabled={isPlacesEnabled} setIsLocalEnabled={setIsPlacesEnabled} />
        <OnOffButton icon="Events" isLocalEnabled={isEventEnabled} setIsLocalEnabled={setIsEventEnabled} />
        <OnOffButton icon="Profile" isLocalEnabled={isUserEnabled} setIsLocalEnabled={setIsUserEnabled} />
      </View>

      <Pressable onPress={() => {
        navigation.navigate('Tabs', { screen: 'Home', params: { userToken: userToken } });
      }}
        style={styles.homeButtonStyle}
      >
        <Icons name="Home" size={width * 0.08} fill='#1C274C' />
        <Text style={styles.homeButtonText}>Home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  inputContainer: {
    position: 'absolute',
    top: width * 0.1,
    left: 10,
    right: 10,
    borderRadius: 10,
    flexDirection: 'row',
  },
  calloutContainer: {
    flexDirection: 'column',
    alignSelf: 'flex-start',
  },
  calloutView: {
    width: width * 0.5,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'white',
    borderColor: '#ccc',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 2,
  },
  calloutTitle: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  calloutSubtitle: {
    color: '#666',
    fontSize: 14,
  },
  onOffButtonStyle: {
    width: width * 0.22,
    height: width * 0.1,
    backgroundColor: '#EEE',
    borderRadius: width * 0.04,
    marginBottom: width * 0.01,
    flexDirection: 'row',
    alignItems: 'center'
  },
  userBall: {
    borderRadius: width * 0.05,
    borderWidth: 2,
    width: width * 0.08,
    height: width * 0.08,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userBallImageProfile: {
    width: '100%',
    height: '100%',
    borderRadius: width * 0.05
  },
  userImageStyle: {
    width: width * 0.08,
    height: width * 0.08,
    borderRadius: width * 0.05,
    borderWidth: 3,
    borderColor: '#DDD',
  },
  userSportsIconsContainer: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userSportsList: {
    flexDirection: 'row',
    marginLeft: '10%',
    alignItems: 'center'
  },
  toggleButtonContainer: {
    width: width * 0.25,
    padding: 5,
    paddingBottom: 2,
    borderRadius: width * 0.01,
    backgroundColor: '#CCC',
    opacity: 0.9,
    position: 'absolute',
    right: width * 0.02,
    bottom: width * 0.05,
  },
  homeButtonStyle: {
    width: width * 0.14,
    height: width * 0.14,
    borderRadius: width * 0.04,
    position: 'absolute',
    left: width * 0.05,
    bottom: width * 0.2,
    backgroundColor: 'rgba(153, 27, 27, 0.8)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  homeButtonText: {
    color: '#FFF',
    fontSize: width * 0.03,
    fontWeight: 'bold',
  },
});

export default Map;