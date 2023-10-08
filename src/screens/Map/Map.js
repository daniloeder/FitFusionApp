import React, { useEffect, useState, useRef } from 'react';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { StyleSheet, View, Text, Dimensions, Switch } from 'react-native';

import Icons from '../../components/Icons/Icons';
import { GoogleAutocompletePicker } from '../../components/GoogleMaps/GoogleMaps.js';
import { API_AUTHORIZATION } from '@env';

const width = Dimensions.get('window').width;

const OnOffButton = ({ icon, isLocalEnabled, setIsLocalEnabled }) => {
    return (
        <View
            onPress={() => {

            }}
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
            <Icons name={icon} size={width * 0.08} style={{marginLeft: 4}} />
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

const Map = ({ MAX_ZOOM_LATITUDE_DELTA = 0.045 * 1000, PATTERN_ZOOM_LATITUDE_DELTA = 0.01, SCROLL_ENABLED = true, ZOOM_ENABLED = true }) => {

    const [userLocation, setUserLocation] = useState(null);
    const [places, setPlaces] = useState([]);
    const [events, setEvents] = useState([]);
    const mapRef = useRef();

    const [isLocalEnabled, setIsLocalEnabled] = useState(true);
    const [isEventEnabled, setIsEventEnabled] = useState(true);

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
        console.log("Current Coordinates:", newRegion.latitude, newRegion.longitude);

        if (newRegion.latitudeDelta > MAX_ZOOM_LATITUDE_DELTA) {
            mapRef.current.animateToRegion({
                ...newRegion,
                latitudeDelta: MAX_ZOOM_LATITUDE_DELTA,
                longitudeDelta: MAX_ZOOM_LATITUDE_DELTA * (newRegion.longitudeDelta / newRegion.latitudeDelta),
            });
        }
    };


    console.log(userLocation)
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
                scrollEnabled={SCROLL_ENABLED}
                zoomEnabled={ZOOM_ENABLED}
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
                                </View>
                            </Callout>
                        </Marker>
                    );
                })}
            </MapView>
            <View style={styles.inputContainer}>
                <GoogleAutocompletePicker />
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
                <OnOffButton icon="Gym" isLocalEnabled={isLocalEnabled} setIsLocalEnabled={setIsLocalEnabled} />
                <OnOffButton icon="Run" isLocalEnabled={isEventEnabled} setIsLocalEnabled={setIsEventEnabled} />
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
