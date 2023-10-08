import React, { useEffect, useState, useRef } from 'react';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { StyleSheet, View, Image, Text, TextInput, Button, Pressable } from 'react-native';

import Icons from '../../components/Icons/Icons';
import GoogleAutocompletePicker from './../../components/GoogleAutocompletePicker/GoogleAutocompletePicker';
import { API_AUTHORIZATION } from '@env';


const MAX_ZOOM_LATITUDE_DELTA = 0.045;
const PATTERN_ZOOM_LATITUDE_DELTA = 0.01;

const Map = () => {
    const [userLocation, setUserLocation] = useState(null);
    const [places, setPlaces] = useState([]);
    const [events, setEvents] = useState([]);
    const [locationInput, setLocationInput] = useState('');
    const [error, setError] = useState('');
    const mapRef = useRef();

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

            try {
                const placesResponse = await fetch('http://192.168.0.118:8000/api/places/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Token ${API_AUTHORIZATION}`
                    }
                });
                if (!placesResponse.ok) {
                    throw new Error('Network response was not ok' + placesResponse.statusText);
                }
                const placesData = await placesResponse.json();
                setPlaces(placesData);

                const eventsResponse = await fetch('http://192.168.0.118:8000/api/events/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Token ${API_AUTHORIZATION}`
                    }
                });

                if (!eventsResponse.ok) {
                    throw new Error('Network response was not ok' + eventsResponse.statusText);
                }
                const eventsData = await eventsResponse.json();
                setEvents(eventsData);
            } catch (error) {
                console.error('There was a problem with the fetch operation: ', error);
            }
        })();
    }, []);

    const handleRegionChange = (newRegion) => {
        if (newRegion.latitudeDelta > MAX_ZOOM_LATITUDE_DELTA) {
            mapRef.current.animateToRegion({
                ...newRegion,
                latitudeDelta: MAX_ZOOM_LATITUDE_DELTA,
                longitudeDelta: MAX_ZOOM_LATITUDE_DELTA * (newRegion.longitudeDelta / newRegion.latitudeDelta),
            });
        }
    };

    const onGoPress = async () => {
        setError('');
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
                latitudeDelta: PATTERN_ZOOM_LATITUDE_DELTA,
                longitudeDelta: PATTERN_ZOOM_LATITUDE_DELTA,
            });

        } catch (e) {
            console.error(e);
            setError('Error occurred while finding location');
        }
    };

    if (!userLocation) {
        return null;
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={userLocation}
                onRegionChangeComplete={handleRegionChange}
            >
                {places.map((place) => {
                    const [latitude, longitude] = place.coordinates.split(',').map(Number);
                    return (
                        <Marker key={place.id} coordinate={{ latitude, longitude }}>
                            <Icons name="Gym" size={40} />
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
                {events.map((event) => {
                    const [latitude, longitude] = event.coordinates.split(',').map(Number);
                    return (
                        <Marker key={event.id} coordinate={{ latitude, longitude }}>
                            <Icons name="Run" size={40} />
                            <Callout tooltip={true} style={styles.calloutContainer}>
                                <View style={styles.calloutView}>
                                    <Text style={styles.calloutTitle}>{event.title}</Text>
                                    <Text style={styles.calloutSubtitle}>Location: {event.location}</Text>
                                    <Text style={styles.calloutSubtitle}>Date & Time: {event.date_time}</Text>
                                    <Text style={styles.calloutSubtitle}>Sport Type: {event.sport_type}</Text>
                                    {/* Add any other details you want to show for an event */}
                                </View>
                            </Callout>
                        </Marker>
                    );
                })}
            </MapView>
            <View style={styles.inputContainer}>
                {/*}
                <TextInput
                    style={styles.input}
                    placeholder="Type a location"
                    onChangeText={setLocationInput}
                    value={locationInput}
                />
                <Pressable style={styles.inputGo} onPress={onGoPress}>
                    <Text style={{color:'#FFF'}}>Go</Text>
                </Pressable>
            {*/}
                <GoogleAutocompletePicker />

                {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
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
