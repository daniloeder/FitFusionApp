import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native';
import { BASE_URL } from '@env';
import Icons from '../Icons/Icons';

const Complaint = ({ userToken, target_id, target_type, blocker_id=null, blocker_type=null, already_blocked=false }) => {
    const [status, setStatus] = useState(false);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const sendComplaint = async (type, data) => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/common/${type}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${userToken}`,
                },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                if (type === 'block') {
                    if(response.status === 201) {
                        Alert.alert('Blocked successfully');
                    } else {
                        Alert.alert('Already blocked');
                    }
                } else {
                    Alert.alert('Reported successfully');
                    setTitle('');
                    setDescription('');
                }
            } else {
                Alert.alert('Error sending complaint.');
            }
        } catch (error) {
            Alert.alert('An error occurred.');
        }
        setLoading(false);
    };
    if (!status) {
        return (
            <TouchableOpacity
                style={styles.exclamationButton}
                onPress={() => {
                    setStatus(true);
                }}
            >
                <Icons name="ExclamationButton" size={20} />
            </TouchableOpacity>
        );
    }
    item_name = target_type === 'user' ? 'User' : target_type === 'place' ? 'Place' : 'Event';

    return (
        <Modal
            visible={status}
            animationType="fade"
            onRequestClose={() => {
                setStatus(false);
            }}
            transparent
        >
            <View style={styles.modal}>
                <View style={styles.container}>

                    {loading ? <ActivityIndicator size="large" color="#000" />
                        : <>
                            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Block</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    sendComplaint('block', { blocker_type: blocker_type, blocker_id: blocker_id, blocked_type: target_type, blocked_id: target_id });
                                }}
                                style={[styles.button, { backgroundColor: already_blocked ? '#33BB33' : '#EE3333', width: '100%', marginTop: 2 }]}
                            >
                                <Text style={styles.buttonText}>{already_blocked ? `Unblock this ${item_name}` : `Block this ${item_name}`}</Text>
                            </TouchableOpacity>

                            <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 20 }}>Report Complaint</Text>
                            <View style={{ width: '100%' }}>
                                <Text>Title</Text>
                                <TextInput
                                    style={styles.textInput}
                                    onChangeText={(text) => setTitle(text)}
                                    value={title}
                                    placeholder="Enter a title for complaint"
                                />
                                <Text>Description</Text>
                                <TextInput
                                    style={[styles.textInput, { height: 100 }]}
                                    onChangeText={(text) => setDescription(text)}
                                    value={description}
                                    placeholder="Enter your complaint here"
                                    placeholderTextColor="gray"
                                />
                            </View>
                            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                                <TouchableOpacity
                                    onPress={() => {
                                        sendComplaint('complaint', { title: title, description: description, item_type: target_type, item_id: target_id });
                                        setStatus(false);
                                    }}
                                    style={[styles.button, { backgroundColor: '#0000B0', width: '45%' }]}
                                >
                                    <Text style={styles.buttonText}>Send Complaint</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setStatus(false)}
                                    style={[styles.button, { backgroundColor: '#888', width: '45%' }]}
                                >
                                    <Text style={styles.buttonText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </>}
                </View>
            </View>
        </Modal >
    )
}

const styles = StyleSheet.create({
    modal: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    container: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: '20%',
        marginBottom: 'auto',
    },
    exclamationButton: {
        backgroundColor: '#fff',
        padding: 5,
        borderRadius: 10,
        right: 20,
        position: 'absolute',
    },
    textInput: {
        width: '100%',
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        padding: 10,
        marginBottom: 20,
        borderRadius: 5,
    },
    button: {
        flexWrap: 'wrap',
        width: '100%',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        width: '100%',
    },
});

export default Complaint;
