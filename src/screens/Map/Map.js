import React, { useEffect, useState, useRef } from 'react';
import MapView, { Marker, Callout, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, View, Text, Dimensions, Switch, Pressable } from 'react-native';

import Icons from '../../components/Icons/Icons';
import { GoogleAutocompletePicker } from '../../components/GoogleMaps/GoogleMaps.js';

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
    <View
      onPress={() => { }}
      style={{
        width: width * 0.22,
        height: width * 0.1,
        backgroundColor: '#EEE',
        borderRadius: width * 0.04,
        marginBottom: width * 0.01,
        flexDirection: 'row',
        alignItems: 'center'
      }}
    >
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
  const mapRef = useRef();

  const [isPlacesEnabled, setIsPlacesEnabled] = useState(true);
  const [isEventEnabled, setIsEventEnabled] = useState(true);

  const [currentPosition, setCurrentPosition] = useState(null);
  const [coodinatesList, setCoordinatesList] = useState([{ lat: 0, lng: 0 }]);

  const [pickerCoordinates, setPickerCoordinates] = useState(null);

  const updatePlaces = async () => {
    try {
      const placesResponse = await fetch(`http://192.168.0.118:8000/api/places/nearby-places/?lat=${currentPosition.latitude}&lng=${currentPosition.longitude}&distance=${MAX_DISTANCE_METERS * 2}`, {
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
      const eventsResponse = await fetch(`http://192.168.0.118:8000/api/events/nearby-events/?lat=${currentPosition.latitude}&lng=${currentPosition.longitude}&distance=${MAX_DISTANCE_METERS * 200}`, {
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

  if (!userLocation || !currentPosition) {
    return null;
  }

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
        <Marker coordinate={{ latitude: userLocation.latitude, longitude: userLocation.longitude }}></Marker>
        {isPlacesEnabled && places.map((place) => {

          const coordinatesArray = place.coordinates.match(/-?\d+\.\d+/g); // Extract numeric values from the string
          const [longitude, latitude] = coordinatesArray.map(Number); // Convert to numbers
          return (
            <Marker key={place.id} coordinate={{ latitude, longitude }}>
              <Icons name="Gym" size={width * 0.08} />
              <Callout tooltip={true} style={styles.calloutContainer}>
                <View style={styles.calloutView}>
                  <Text style={styles.calloutTitle}>{place.name}</Text>
                  <Text style={styles.calloutSubtitle}>Location: {place.location}</Text>
                  {/* Add any other details you want to show for a place */}
                </View>
              </Callout>
            </Marker>
          );
        })}
        {isEventEnabled && events.map((event) => {
          const coordinatesArray = event.coordinates.match(/-?\d+\.\d+/g); // Extract numeric values from the string
          const [longitude, latitude] = coordinatesArray.map(Number); // Convert to numbers
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
      <View
        style={{
          width: width * 0.25,
          padding: 5,
          paddingBottom: 2,
          borderRadius: width * 0.01,
          backgroundColor: '#CCC',
          opacity: 0.9,
          position: 'absolute',
          right: width * 0.02,
          bottom: width * 0.05,
        }}
      >
        <OnOffButton icon="Gym" isLocalEnabled={isPlacesEnabled} setIsLocalEnabled={setIsPlacesEnabled} />
        <OnOffButton icon="Events" isLocalEnabled={isEventEnabled} setIsLocalEnabled={setIsEventEnabled} />
      </View>
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
    top: 10,
    left: 10,
    right: 10,
    borderRadius: 10,
    flexDirection: 'row',
  },
  input: {
    flex: 1,
    padding: 10,
    right: 5,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  inputGo: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    backgroundColor: '#0c8ce9'
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  calloutContainer: {
    flexDirection: 'column',
    alignSelf: 'flex-start',
  },
  calloutView: {
    width: 200,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'white',
    borderColor: '#ccc',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 2, // for Android
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
});

export default Map;
