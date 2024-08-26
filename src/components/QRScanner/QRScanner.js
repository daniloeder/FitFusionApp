import React, { useState, useEffect } from 'react';
import { Linking, View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Camera, CameraType } from 'expo-camera/legacy';  // Import Camera and CameraType from legacy
import Icons from '../../components/Icons/Icons.js';

const { width } = Dimensions.get('window');

const QRScanner = ({ setScannedUserData }) => {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [scannedData, setScannedData] = useState('');
    const [type, setType] = useState(CameraType.back);  // Set initial camera type to back

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const handleBarCodeScanned = ({ type, data }) => {
        // check if the scanned data is a valid JSON object and not a text
        if (data.includes('{') && data.includes('}')) {
            try {
                const parsedData = JSON.parse(data);
                if (parsedData.type === "fit_fusion_user") {
                    setScannedUserData(parsedData);
                    setScanned(true);
                }
            } catch (error) {
                console.error('Error parsing QR code data:', error);
            }
        }
    };

    const openSettings = () => {
        Linking.openSettings();
    };

    const requestPermission = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            alert('Camera permission is required to use this feature. Please enable it in the app settings.');
            openSettings();
        } else {
            setHasPermission(status === 'granted');
        }
    };

    if (hasPermission === null) {
        return <Text>Requesting for camera permission</Text>;
    }

    if (hasPermission === false) {
        return (
            <View style={styles.permissionContainer}>
                <TouchableOpacity
                    style={styles.permissionButton}
                    onPress={requestPermission}
                >
                    <Icons name="Camera" size={width * 0.08} />
                    <Text style={styles.permissionText}>Allow app to access camera.</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Camera
                style={styles.camera}
                type={type}  // Use the state `type` here
                onBarCodeScanned={scanned ? () => setScanned(false) : handleBarCodeScanned}
            />
            {scanned ? <Text style={styles.scannedText}>Scanned Data: {scannedData}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'flex-end',
    },
    camera: {
        flex: 1
    },
    scannedText: {
        fontSize: 18,
        margin: 10,
        color: 'white',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    permissionButton: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
    },
    permissionText: {
        marginTop: 10,
        fontSize: 16,
    },
});

export default QRScanner;
