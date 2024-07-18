import React, { useCallback, useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, Dimensions, Switch, Pressable, Image } from 'react-native';
import MapView, { Marker, Callout, Circle } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { useGlobalContext } from './../../services/GlobalContext';
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
      fillColor="rgba(0, 0, 255, 0.06)" // You can customize the circle color and opacity here
      strokeColor="rgba(0, 0, 255, 0.1)" // You can customize the circle border color and opacity here
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

function Map({ route, MAX_ZOOM_LATITUDE_DELTA = 0.01, PATTERN_ZOOM_LATITUDE_DELTA = 0.01, SCROLL_ENABLED = true, ZOOM_ENABLED = true }) {
  const { userToken, checkConnectionError, active } = useGlobalContext();
  const navigation = useNavigation();
  
  const MAX_DISTANCE_METERS = 500;

  const [userLocation, setUserLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState({});
  const mapRef = useRef();

  const [isPlacesEnabled, setIsPlacesEnabled] = useState(true);
  const [isEventEnabled, setIsEventEnabled] = useState(true);
  const [isUserEnabled, setIsUserEnabled] = useState(true);

  const [currentPosition, setCurrentPosition] = useState(null);
  const [coodinatesList, setCoordinatesList] = useState([{ lat: 0, lng: 0 }]);

  const [pickerCoordinates, setPickerCoordinates] = useState(null);

  const iconNamesByIndex = ["BodyBuilding", "Soccer", "Basketball", "Tennis", "Baseball", "AmericanFootball", "Golf", "Cricket", "Rugby", "Volleyball", "TableTennis", "Badminton", "IceHockey", "FieldHockey", "Swimming", "TrackAndField", "Boxing", "Gymnastics", "MartialArts", "Cycling", "Equestrian", "Fencing", "Bowling", "Archery", "Sailing", "CanoeingKayaking", "Wrestling", "Snowboarding", "Skiing", "Surfing", "Skateboarding", "RockClimbing", "MountainBiking", "RollerSkating", "Other"];

  useFocusEffect(
    useCallback(() => {
      checkConnectionError();
    }, [])
  );

  const fetchUserProfileImages = async (userIds) => {
    if (!active) return null;
    const batchSize = 5;

    for (let i = 0; i < userIds.length; i += batchSize) {
      const batchUserIds = userIds.slice(i, i + batchSize);

      try {
        const response = await fetch(BASE_URL + `/api/users/get-user-profile-images/?user_ids=${batchUserIds.join(',')}&low=true`);
        const data = await response.json();
        if (response.ok) {
          setUsers(prevUsers => {
            const updatedUsers = { ...prevUsers };
            data.forEach((userData) => {
              if (updatedUsers[userData.user_id]) {
                updatedUsers[userData.user_id].profile_image = userData.profile_image;
              }
            });
            return updatedUsers;
          });
        } else {
          throw new Error('Failed to fetch user profile images');
        }
      } catch (error) {
        console.error('Error fetching user profile images:', error);
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  function parseCoordinates(pointString) {
    const match = pointString.match(/\(([^)]+)\)/);
    if (match) {
      const [longitude, latitude] = match[1].split(' ').map(Number);
      return { lat: latitude, lng: longitude };
    }
    return null;
  }
  const fetchUsersEventsPlaces = async () => {
    try {
      if (!active) return null;
      const usersResponse = await fetch(BASE_URL + `/api/users/nearby-all/?lat=${currentPosition.latitude}&lng=${currentPosition.longitude}&distance=${MAX_DISTANCE_METERS * 2}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${userToken}`
        }
      });

      if (!usersResponse.ok) {
        throw new Error('Network response was not ok' + usersResponse.statusText);
      }

      const allData = await usersResponse.json();
      // allData = {"users":[{"id":79,"username":"miabrown","name":"Mia Brown","gender":"F","favorite_sports":[9],"coordinates":"SRID=4326;POINT (13.406927756403112 52.51206149838055)","age":34},{"id":64,"username":"charlottetaylor","name":"Charlotte Taylor","gender":"F","favorite_sports":[18,19],"coordinates":"SRID=4326;POINT (13.409384114785983 52.50695755560761)","age":34},{"id":61,"username":"sophiadavis","name":"Sophia Davis","gender":"F","favorite_sports":[9],"coordinates":"SRID=4326;POINT (13.402184783211293 52.511894657269494)","age":34},{"id":62,"username":"isabelladavis","name":"Isabella Davis","gender":"F","favorite_sports":[2,18,29],"coordinates":"SRID=4326;POINT (13.414875148838998 52.51706465187279)","age":34}],"events":[{"id":1,"title":"Grand Slam Gala","location":"Potsdamer Platz, 10785 Berlin, Germany","sport_types":[2],"date":"2024-06-24","time":"14:44:00","subscription":{"id":184,"amount":"0.00","currency":"USD","date_start":"2024-06-24","date_end":"2024-07-24","due_date":"2024-06-27","status":"active","generated_at":"2024-06-24","recurring":true,"notes":"","days_payment_deadline":29,"plan_name":"Plan Name","period":null}}],"places":[]}

      // filter users not in users
      usersData = allData.users.filter(user => !users[user.id]).map(user => {
        const userCoords = parseCoordinates(user.coordinates);
        const adjustedCurrentPosition = {
          lat: currentPosition.latitude,
          lng: currentPosition.longitude
        };
        const distance = calculateDistance(adjustedCurrentPosition, userCoords);

        return {
          ...user,
          distance: distance
        };
      }).sort((a, b) => a.distance - b.distance);

      // Update users state with sorted data
      const newUsers = { ...users };
      usersData.forEach((user) => {
        newUsers[user.id] = { ...(newUsers[user.id] || {}), ...user };
      });
      setUsers(newUsers);

      setEvents((prevEvents) => {
        const newEvents = [...prevEvents];
        allData.events.forEach((event) => {
          if (!newEvents.some((existingEvent) => existingEvent.id === event.id)) {
            newEvents.push(event);
          }
        });
        return newEvents;
      });

      setPlaces((prevPlaces) => {
        const newPlaces = [...prevPlaces];
        allData.places.forEach((place) => {
          if (!newPlaces.some((existingPlace) => existingPlace.id === place.id)) {
            newPlaces.push(place);
          }
        });
        return newPlaces;
      });

      // Fetch profile images for users without images
      const usersNeedingImages = usersData.filter(user => !newUsers[user.id] || !newUsers[user.id].profile_image).map(user => user.id);
      if (usersNeedingImages.length > 0) {
        await fetchUserProfileImages(usersNeedingImages);
      }

    } catch (error) {
      console.error('There was a problem with fetching users: ', error);
    }
  };

  useEffect(() => {
    const fetchAndSetUserLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      //let location = await Location.getCurrentPositionAsync({});

      const locationData = {
        latitude: 52.5200,//location.coords.latitude,
        longitude: 13.4050,//location.coords.longitude,
        latitudeDelta: 0.01,//PATTERN_ZOOM_LATITUDE_DELTA,
        longitudeDelta: 0.01//PATTERN_ZOOM_LATITUDE_DELTA,
      };
      setUserLocation(locationData);

      setCoordinatesList([{ lat: 52.5200, lng: 13.4050 }]);
    };

    fetchAndSetUserLocation();
  }, []);


  useEffect(() => {
    if (currentPosition && currentPosition.latitudeDelta < MAX_ZOOM_LATITUDE_DELTA * 1.5) {
      fetchUsersEventsPlaces();
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
    if (newRegion.latitudeDelta > MAX_ZOOM_LATITUDE_DELTA) {
      mapRef.current.animateToRegion({
        ...newRegion,
        latitudeDelta: MAX_ZOOM_LATITUDE_DELTA,
        longitudeDelta: MAX_ZOOM_LATITUDE_DELTA * (newRegion.longitudeDelta / newRegion.latitudeDelta),
      });
    }

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
  };

  const mapStyle = [
    {
      featureType: "poi.business",
      elementType: "labels",
      stylers: [
        {
          visibility: "off"
        }
      ]
    },
    {
      featureType: "poi.attraction",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "poi.medical",
      stylers: [{ visibility: "off" }]
    },
  ];

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={userLocation}
        onRegionChangeComplete={handleRegionChange}
        scrollEnabled={SCROLL_ENABLED}
        zoomEnabled={ZOOM_ENABLED}
        customMapStyle={mapStyle}
      >
        {isPlacesEnabled && places.map((place) => {

          const coordinatesArray = place.coordinates.match(/-?\d+\.\d+/g);
          const [longitude, latitude] = coordinatesArray.map(Number);
          return (
            <Marker key={place.id} coordinate={{ latitude, longitude }} style={{ width: width * 0.1, height: width * 0.08, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{
                alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
                flexWrap: 'wrap',
              }}>
                <Icons name="GradientCircle" size={width * 0.08} style={{ position: 'absolute' }} fill="#1C274C" />
                {place.sport_types.slice(0, 3).map((sport) =>
                  <Icons key={sport} name={iconNamesByIndex[(sport - 1)]} size={width * (0.035 + (place.sport_types.length > 2 ? 0 : place.sport_types.length > 1 ? 0.006 : 0.02))} style={{ margin: '2%' }} />
                )}
              </View>
              <Callout tooltip={true} style={styles.calloutContainer} onPress={() => {
                navigation.navigate('Place', { placeId: place.id })
              }}>
                <View style={styles.calloutView}>
                  <Text style={styles.calloutTitle}>{place.name}</Text>
                  <Text style={styles.calloutSubtitle}>Location: {place.location}</Text>
                  <Text style={styles.calloutSubtitle}>Sports:</Text>
                  {place.sport_types.slice(0, 3).map((sport, index) =>
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
        {isEventEnabled && events.map((event) => {
          const coordinatesArray = event.coordinates.match(/-?\d+\.\d+/g);
          const [longitude, latitude] = coordinatesArray.map(Number);
          return (
            <Marker key={event.id} coordinate={{ latitude, longitude }} style={{ width: width * 0.08, height: width * 0.08, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{
                alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
                flexWrap: 'wrap',
              }}>
                <Icons name="GradientCircle" size={width * 0.08} style={{ position: 'absolute' }} fill="#991B1B" />
                {event.sport_types.slice(0, 3).map((sport) =>
                  <Icons key={sport} name={iconNamesByIndex[(sport - 1)]} size={width * (0.035 + (event.sport_types.length > 2 ? 0 : event.sport_types.length > 1 ? 0.006 : 0.02))} style={{ margin: '2%' }} />
                )}
              </View>
              <Callout tooltip={true} style={styles.calloutContainer} onPress={() => {
                navigation.navigate('Event', { eventId: event.id })
              }}>
                <View style={styles.calloutView}>
                  <Text style={styles.calloutTitle}>{event.title}</Text>
                  <Text style={styles.calloutSubtitle}>Location: {event.location}</Text>
                  <Text style={styles.calloutSubtitle}>Date & Time: {event.date} {event.time}</Text>
                  <Text style={styles.calloutSubtitle}>Sports:</Text>
                  {event.sport_types.slice(0, 3).map((sport, index) =>
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
        {isUserEnabled && Object.values(users).map((user, index) => {
          const coordinatesArray = user.coordinates.match(/-?\d+\.\d+/g);
          const [longitude, latitude] = coordinatesArray.map(Number);
          return (
            <Marker key={user.id} coordinate={{ latitude, longitude }}>

              <View style={[styles.userBall, { borderColor: user.gender === 'M' ? '#0033FF' : user.gender === 'F' ? '#FF3399' : '#DDD' }]}>

                {user && user.profile_image ?
                  <Image style={styles.userBallImageProfile}
                    source={{ uri: `data:image/jpeg;base64,${user.profile_image}` }}
                    onError={(error) => console.error('Image Error:', error)}
                  />
                  :
                  <Icons name="Profile" size={width * 0.07} fill={'#1C274C'} />
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
      {/*}
      <View style={styles.toggleButtonContainer}>
        <OnOffButton icon="Gym" isLocalEnabled={isPlacesEnabled} setIsLocalEnabled={setIsPlacesEnabled} />
        <OnOffButton icon="Events" isLocalEnabled={isEventEnabled} setIsLocalEnabled={setIsEventEnabled} />
        <OnOffButton icon="Profile" isLocalEnabled={isUserEnabled} setIsLocalEnabled={setIsUserEnabled} />
      </View>
        {*/}

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
    bottom: width * 0.1,
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