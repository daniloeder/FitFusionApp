import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';

const AdvertisementModal = ({ advertisement, setAdvertisementAnswer }) => {
    const [modalVisible, setModalVisible] = useState(true);

    const onClose = () => {
        setModalVisible(false);
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.closeButtonContainer}>
                        <TouchableOpacity onPress={onClose} style={{ width: '100%', height: '100%', alignItems:'center', justifyContent: 'center', borderRadius: 30, backgroundColor: 'rgba(255,0,0,0.3)' }}>
                            <Text style={styles.closeButtonText}>X</Text>
                        </TouchableOpacity>
                    </View>
                    <WebView
                        originWhitelist={['*']}
                        source={{ uri: advertisement.url }}
                        style={{ flex: 1 }}
                        onLoad={() => {
                            setModalVisible(true);
                        }}
                        onError={() => {
                            setModalVisible(false);
                            console.error('Error loading advertisement');
                        }}
                        onMessage={(event) => {
                            const data = JSON.parse(event.nativeEvent.data);
                            setAdvertisementAnswer(data);
                        }}
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        width: '90%',
        height: '70%',
    },
    closeButtonContainer: {
        width: 30,
        height: 30,
        position: 'absolute',
        top: -3,
        right: -3,
        alignItems: 'flex-end',
        zIndex: 1
    },
    closeButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    advertisementWebView: {
        width: '100%',
        height: '100%',
    },
});
export default AdvertisementModal;