import React, { useState, useEffect } from 'react';
import { Linking, View, Text, StyleSheet, Button, TouchableOpacity, Dimensions } from 'react-native';
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import Icons from '../../components/Icons/Icons.js';

const { width } = Dimensions.get('window');

const QRScanner = ({ setScannedUserData }) => {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [scannedData, setScannedData] = useState('');

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const handleBarCodeScanned = ({ type, data }) => {
        try {
            const parsedData = JSON.parse(data);
            if (parsedData.type === "fit_fusion_user") {
                setScannedUserData(parsedData);
                setScanned(true);
            }
        } catch (error) {
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
                type={Camera.Constants.Type.back}
                barCodeScannerSettings={{
                    barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
                }}
                onBarCodeScanned={scanned ? () => {
                    setScanned(null);
                } : handleBarCodeScanned}>
            </Camera>
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
        flex: 1,
    },
    buttonContainer: {
        flex: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 20,
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