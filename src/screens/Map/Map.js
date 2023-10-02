import React, { useEffect, useState, useRef } from 'react';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { StyleSheet, TextInput, View, Button, Text, Alert } from 'react-native';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBEHyoRxuXwxFyccaKsw-CuTtvRv_dU1Ow';

const defaultPoints = [
  {
    id: 1,
    name: 'Brasília',
    coordinate: {
      latitude: -15.793889,
      longitude: -47.882778,
    },
  },
  {
    id: 2,
    name: 'Belo Horizonte',
    coordinate: {
      latitude: -19.916667,
      longitude: -43.933333,
    },
  },
  {
    id: 3,
    name: 'Indaiabira',
    coordinate: {
      latitude: -15.496956,
      longitude: -42.612137,
    },
  },
];

const Map = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationInput, setLocationInput] = useState('');
  const [error, setError] = useState('');
  const mapRef = useRef();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  const onGoPress = async () => {
    setError(''); // Reset error message
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${locationInput}&key=${GOOGLE_MAPS_API_KEY}`);
      const data = await response.json();

      if (data.status !== 'OK') {
        setError('Location not found');
        return;
      }

      const { lat, lng } = data.results[0].geometry.location;

      mapRef.current.animateToRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

    } catch (e) {
      console.error(e);
      setError('Error occurred while finding location');
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={userLocation}
      >
        {defaultPoints.map((point) => (
          <Marker key={point.id} coordinate={point.coordinate}>
            <Callout>
              <Text>{point.name}</Text>
            </Callout>
          </Marker>
        ))}
      </MapView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter Location"
          value={locationInput}
          onChangeText={setLocationInput}
        />
        <Button title="Go" onPress={onGoPress} />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

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
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});

export default Map;

