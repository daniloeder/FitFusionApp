import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, Alert } from 'react-native';
import PaymentCard from '../Management/PaimentCard';
import Icons from '../Icons/Icons';
import { BASE_URL } from '@env';

const width = Dimensions.get('window').width;

const UserPayments = ({ subscription }) => {
    const [showPayment, setShowPayment] = useState(false);

    return (
        <View style={styles.userPaymentsContainer}>
            {showPayment && <PaymentCard subscriptionData={subscription.subscription} backgroundColor="#444" />}

            {subscription.subscription ?
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setShowPayment(!showPayment)}
                >
                    <Text style={styles.buttonText}>{showPayment ? "Close Subscription Details" : "See Subscription Details"}</Text>
                </TouchableOpacity>
                :
                <Text style={{ fontWeight: 'bold', color: '#555' }}>No Subscription Details</Text>
            }

        </View>
    );
};

const ManageUsers = ({ userToken, item, itemId }) => {
    const [subscriptionsData, setSubscriptionsData] = useState([]);
    const [usersImages, setUserImages] = useState([]);

    const fetchUserProfileImages = async (participants) => {
        try {
            const response = await fetch(BASE_URL + `/api/users/get-user-profile-images/?user_ids=${participants.join()}`);
            const data = await response.json();
            setUserImages(data);
        } catch (error) {
            console.error('Error fetching user profile images:', error);
        }
    };

    const fetchPayments = async () => {
        try {
            const response = await fetch(
                BASE_URL + `/api/payments/by_users/?${item === 'place' ? 'place_id' : 'event_id'}=${itemId}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Token ${userToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            const data = await response.json();
            setSubscriptionsData(data);
            if (data.length > 0) {
                fetchUserProfileImages(data.map((subscription) => subscription.user.id).flat());
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const manageUsers = async (action, subscriptionId) => {
        try {
            const response = await fetch(BASE_URL + `/api/${item === 'place' ? 'places' : 'events'}/${itemId}/manage-user/${subscriptionId}/?action=${action}`, {
                method: 'POST',
                headers: {
                    Authorization: `Token ${userToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                Alert.alert('Success', 'Action Completed.');
                fetchPayments();
            } else {
                Alert.alert('Error', 'Error removing user. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'Error removing user. Please try again.');
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    return (
        <View style={styles.container}>
            {subscriptionsData.map((subscription, index) => {
                return (
                    <View
                        key={index}
                        style={[styles.paymentItem, { backgroundColor: subscription.subscription && subscription.subscription.status === 'active' ? 'lightgreen' : '#FA8072' }]}
                    >
                        <View style={styles.row}>

                            {usersImages.length > index && usersImages[index].success ?
                                <Image style={{ width: 35, height: 35, marginRight: 5, borderRadius: 20, borderColor: '#888', borderWidth: 1 }}
                                    source={{ uri: `data:image/jpeg;base64,${usersImages[index].profile_image}` }}
                                    onError={(error) => console.error('Image Error:', error)}
                                />
                                :
                                <View>
                                    <Icons name="Profile" size={40} fill={'#1C274C'} />
                                </View>
                            }
                            <Text style={styles.label}>{subscription.user.name}</Text>
                            <TouchableOpacity
                                onPress={() => Alert.alert('Remove User', 'Are you sure you want to remove this user?', [
                                    {
                                        text: 'Cancel',
                                        style: 'cancel',
                                    },
                                    {
                                        text: 'Remove',
                                        onPress: () => { manageUsers('remove', subscription.user.id) },
                                    },
                                    {
                                        text: 'Block User',
                                        onPress: () => { manageUsers('block', subscription.user.id) }
                                    }
                                ])}
                                style={styles.removeButton}
                            >
                                <Text style={styles.buttonText}>Remove User</Text>
                            </TouchableOpacity>
                        </View>
                        {<UserPayments subscription={subscription} />}
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 10,
    },
    paymentItem: {
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        marginBottom: 10,
        padding: 10,
    },
    paymentContainer: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
        elevation: 2,
        marginBottom: 10,
    },
    userPaymentsContainer: {
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    label: {
        fontWeight: 'bold',
        marginRight: 5,
    },
    input: {
        flex: 1,
        borderColor: 'gray',
        borderWidth: 1,
        padding: 5,
        borderRadius: 5,
    },
    editButton: {
        flex: 1,
        backgroundColor: 'lightblue',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    saveButton: {
        minHeight: width * 0.1,
        flex: 1,
        backgroundColor: 'lightgreen',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    deleteButton: {
        flex: 1,
        backgroundColor: 'salmon',
        padding: 10,
        borderRadius: 10,
        marginLeft: 5,
        alignItems: 'center',
    },
    removeButton: {
        marginLeft: 'auto',
        padding: 5,
        backgroundColor: '#B22222',
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    editDeleteButtons: {
        flexDirection: 'row',
        marginTop: 10,
        marginBottom: 20,
    },
});

export default ManageUsers;
