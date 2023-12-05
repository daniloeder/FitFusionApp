import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Linking, Alert } from 'react-native';
import * as Location from 'expo-location';
import { storeData } from '../../store/store';
import { BASE_URL } from '@env';

const width = Dimensions.get('window').width;

async function updateCoordinates(userToken, location) {
    const apiUrl = BASE_URL + '/api/users/update-coordinates/';

    try {
        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${userToken}`,
            },
            body: JSON.stringify({
                lat: location.latitude,
                lng: location.longitude,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to update coordinates');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating coordinates:', error);
        throw error;
    }
}

function GetUserCoordinates({ userToken, userLocation, setUserLocation }) {

    const requestLocationPermission = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
            try {
                let location = await Location.getCurrentPositionAsync({});
                setUserLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });
                Alert.alert('Location Updated Based on Your Current Location!');
            } catch (error) {
                Alert.alert('Error fetching user location:', error);
            }
        } else if (status === 'denied') {
            Alert.alert('Permission to access location was denied');
            Linking.openSettings();
        }
    };
    useEffect(() => {
        if (userLocation) {
            storeData(userLocation, '@userLocation');
            updateCoordinates(userToken, userLocation);
        }
    }, [userLocation]);

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.button}
                onPress={requestLocationPermission}
            >
                <Text style={styles.buttonText}>{userLocation ? "Update My Location" : "Set My Location"}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#007bff',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
        marginTop: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default GetUserCoordinates;
