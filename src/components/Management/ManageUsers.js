import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import DatePicker from '../Forms/DatePicker';
import Icons from '../Icons/Icons';
import { BASE_URL } from '@env';

const width = Dimensions.get('window').width;

const Payment = ({ paymentData, userToken, handleDelete }) => {
    const [payment, setPayment] = useState(paymentData);
    const [edit, setEdit] = useState(false);
    const [dateFrom, setDateFrom] = useState(paymentData.date_from);
    const [dateTo, setDateTo] = useState(paymentData.date_to);
    const [amount, setAmount] = useState(paymentData.amount);
    const [subscription, setSubscription] = useState(paymentData.payment_type);
    const [status, setStatus] = useState(paymentData.status);

    const handleSave = () => {
        const updatedPaymentData = {
            amount: parseFloat(amount),
            date_from: dateFrom,
            date_to: dateTo,
            payment_type: subscription,
            status: status,
        };

        fetch(BASE_URL + `/api/payments/${payment.id}/`, {
            method: 'PATCH',
            headers: {
                Authorization: `Token ${userToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedPaymentData),
        })
            .then((response) => response.json())
            .then(() => {
                setEdit(false);
            })
            .catch((error) => console.error('Error:', error));
    };

    const handleSetPaid = () => {
        setStatus(status === "Paid" ? "Pending" : "Paid")

    };

    return (
        <View style={styles.paymentContainer}>
            <Text style={styles.sectionTitle}>Payment</Text>
            <View style={styles.row}>
                <Text style={styles.label}>Amount: {!edit && amount}</Text>
                {edit && (
                    <TextInput
                        style={styles.input}
                        placeholder="Amount"
                        value={amount}
                        onChangeText={(text) => setAmount(text)}
                        keyboardType="decimal-pad"
                    />
                )}
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>From: {dateFrom}</Text>
                {edit && (
                    <DatePicker
                        setDate={setDateFrom}
                        mode="date"
                        dateType="DD/MM/YYYY"
                        date={dateFrom}
                        showText={false}
                    />
                )}
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>To: {dateTo}</Text>
                {edit && (
                    <DatePicker
                        setDate={setDateTo}
                        mode="date"
                        dateType="DD/MM/YYYY"
                        date={dateTo}
                        showText={false}
                    />
                )}
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Subscription: {subscription}</Text>
            </View>
            <View style={styles.row}>
                <Text style={[styles.label, { color: status === "Paid" ? 'green' : 'red' }]}>Status: {status}</Text>
            </View>

            {edit && <TouchableOpacity style={[styles.saveButton, { backgroundColor: payment.status === "Paid" ? "red" : "green", width: '100%' }]} onPress={handleSetPaid}>
                <Text style={styles.buttonText}>{status === "Paid" ? "Set Pending" : "Set Paid"}</Text>
            </TouchableOpacity>}

            <View style={styles.editDeleteButtons}>
                {edit ? (
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => setEdit(true)}
                    >
                        <Text style={styles.buttonText}>Edit</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={()=>{
                        handleDelete(payment.id);
                    }}
                >
                    <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const UserPayments = ({ userToken, payments }) => {
    const [showPayment, setShowPayment] = useState(false);
    const [paymetsList, setPaymentsList] = useState(payments);

    const onDelete = (id) => {
        const updatedPayments = paymetsList.filter(payment => payment.id !== id);
        setPaymentsList(updatedPayments);
    }
    const handleDelete = (id) => {
        onDelete(id);
        fetch(BASE_URL + `/api/payments/${id}/`, {
            method: 'DELETE',
            headers: {
                Authorization: `Token ${userToken}`,
            },
        })
            .catch((error) => console.error('Error:', error));
    };

    return (
        <View style={styles.userPaymentsContainer}>
            {showPayment && paymetsList.map((payment) => {
                return <View key={payment.id}>
                    <Payment key={payment.id} userToken={userToken} paymentData={payment} handleDelete={handleDelete} />
                </View>
            })
            }

            {paymetsList && paymetsList.length ?
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setShowPayment(!showPayment)}
                >
                    <Text style={styles.buttonText}>{showPayment ? "Close Payment Details" : "See Payment Details"}</Text>
                </TouchableOpacity>
                :
                <Text>No Payment Details</Text>
            }

        </View>
    );
};

const ManageUsers = ({ userToken, userIds, placeId, setUserPayments }) => {
    const [payments, setPayments] = useState([]);
    const [usersImages, setUserImages] = useState([]);

    useEffect(() => {
        const fetchUserProfileImages = async (participants) => {
            try {
                const response = await fetch(BASE_URL + `/api/users/get-user-profile-images/?user_ids=${participants.join()}`);
                const data = await response.json();
                setUserImages(data);
            } catch (error) {
                console.error('Error fetching user profile images:', error);
            }
        };
        const fetchPayments = async (participants) => {
            const fetchedPayments = [];
            try {
                const response = await fetch(
                    BASE_URL + `/api/payments/by_users/?place_id=${placeId}&user_ids=${participants.join()}`,
                    {
                        method: 'GET',
                        headers: {
                            Authorization: `Token ${userToken}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                const data = await response.json();
                fetchedPayments.push(...data);
            } catch (error) {
                console.error('Error:', error);
            }

            if(setUserPayments && payments.length === 0 && fetchedPayments.length){
                setUserPayments(fetchedPayments[0]);
            }
            setPayments(fetchedPayments);
        };

        if (userIds.length) {
            fetchUserProfileImages(userIds);
            fetchPayments(userIds.slice(0, 10));
        }
    }, [userIds]);

    return (
        <View style={styles.container}>
            {payments.map((payment, index) => {
                if (payments.length != usersImages.length || usersImages[index].user_id != payment.user_id) {
                    return
                }
                return (
                    <TouchableOpacity
                        key={index}
                        style={[styles.paymentItem, { backgroundColor: payment.regular ? 'lightgreen' : '#FA8072' }]}
                        onPress={() => { }}
                    >
                        <View style={styles.row}>

                            {usersImages.length > index && usersImages[index].success ?
                            <Image style={{ width: 35, height: 35, marginRight: 5, borderRadius: 20 }}
                                source={{ uri: `data:image/jpeg;base64,${usersImages[index].profile_image}` }}
                                onError={(error) => console.error('Image Error:', error)}
                            />
                            :
                            <View>
                                <Icons name="Profile" size={40} fill={'#1C274C'} />
                            </View>
                        }
                            <Text style={styles.label}>{usersImages[index].name}</Text>
                            <TouchableOpacity
                                onPress={() => {}}
                                style={styles.removeButton}
                            >
                                <Text style={styles.buttonText}>Remove User</Text>
                            </TouchableOpacity>
                        </View>
                        <UserPayments userToken={userToken} payments={payment.payments} />
                    </TouchableOpacity>
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
