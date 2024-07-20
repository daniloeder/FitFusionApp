import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

const CustomModal = ({ children, title, width = undefined, height = undefined, backgroundColor = undefined, borderColor = "rgba(0,0,0,0.7)", closeButton, onUpdate = undefined, onClose = undefined }) => {
    const [modalVisible, setModalVisible] = useState(true);

    const handleClose = () => {
        setModalVisible(false);
        if (onClose) {
            onClose();
        }
    };

    useEffect(() => {
        if (onUpdate !== undefined) {
            setModalVisible(true);
        }
    }, [onUpdate]);


    const styles = StyleSheet.create({
        modalContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: borderColor,
        },
        modalContent: {
            width: width,
            height: height,
            maxHeight: '90%',
            padding: 8,
            borderRadius: 5,
            backgroundColor: backgroundColor,
            borderWidth: 0.2,
            borderColor: '#555',
        },
        title: {
            color: '#FFF',
            fontSize: 16,
            fontWeight: 'bold',
            textAlign: 'center',
        },
        closeButton: {
            paddingHorizontal: 20,
            paddingVertical: 5,
            position: 'absolute',
            bottom: -40,
            right: 0,
            backgroundColor: '#DDD',
            borderRadius: 5,
        }
    });

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={handleClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <ScrollView>
                        <Text style={styles.title}>{title}</Text>
                        {children}
                        {closeButton && (
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={handleClose}
                            >
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#000' }}>Close</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

export default CustomModal;