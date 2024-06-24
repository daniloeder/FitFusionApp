import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native';

const width = Dimensions.get('window').width;

const PaymentCard = ({ subscriptionData, setSubscriptionPlansModalVisible, startVisible = false, backgroundColor }) => {
    const [paymentModalVisible, setPaymentModalVisible] = useState(startVisible);

    STATUS_CHOICES = { 'active': 'Active', 'inactive': 'Inactive', 'cancelled': 'Cancelled', 'pending': 'Pending', 'expired': 'Expired', 'suspended': 'Suspended', 'deleted': 'Deleted' }
    PLANS_PERIODS = { 'dayly': 'Dayly', 'weekly': 'Weekly', 'monthly': 'Monthly', 'quarterly': 'Quarterly', 'semesterly': 'Semesterly', 'yearly': 'Yearly' };

    return (
        <>
            <View
                style={[styles.paymentCard, {
                    backgroundColor: backgroundColor || (subscriptionData.status === 'active' ?
                        !subscriptionData.recurring || subscriptionData.days_payment_deadline > 3 ? 'rgba(144, 238, 144, 0.5)' : 'rgba(255, 215, 0, 0.5)'
                        : 'rgba(250, 128, 114, 0.5)'
                    )
                }]}
            >
                <Text style={styles.paymentTitle}>Subscription Status:</Text>
                <Text style={styles.paymentInfoText}>Subscription Plan: {subscriptionData.plan_name}</Text>
                <Text style={styles.paymentInfoText}>Payment Amount: ${subscriptionData.amount} {subscriptionData.currency}</Text>
                <Text style={styles.paymentInfoText}>Payment Status: {STATUS_CHOICES[subscriptionData.status]}</Text>
                {subscriptionData.recurring && subscriptionData.amount > 0 && <Text style={[styles.paymentInfoText, { color: subscriptionData.days_payment_deadline < 4 ? '#ff8888' : '#000' }]}>Days until next payment: {subscriptionData.days_payment_deadline}</Text>}
                <TouchableOpacity
                    onPress={() => setPaymentModalVisible(true)}
                    style={styles.detailsButton}
                >
                    <Text style={{ fontWeight: '500', color: '#555' }}>
                        See Subscription Details
                    </Text>
                </TouchableOpacity>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={paymentModalVisible}
                onRequestClose={() => setPaymentModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <ScrollView style={styles.scrollView}>
                        <Text style={styles.paymentsModalTextTitle}>Subscription Data</Text>
                        <Text style={styles.paymentsModalText}>Subscription Plan: {subscriptionData.plan_name}</Text>
                        <Text style={styles.paymentsModalText}>Payment Amount: ${subscriptionData.amount} {subscriptionData.currency}</Text>
                        <Text style={styles.paymentsModalText}>Payment Status: {STATUS_CHOICES[subscriptionData.status]}</Text>
                        <Text style={styles.paymentsModalText}>Period: {PLANS_PERIODS[subscriptionData.period]}</Text>
                        <Text style={styles.paymentsModalText}>From: {subscriptionData.date_start}</Text>
                        <Text style={styles.paymentsModalText}>To: {subscriptionData.date_end}</Text>
                        <Text style={styles.paymentsModalText}>Payment Due Date: {subscriptionData.due_date}</Text>
                    </ScrollView>

                    {setSubscriptionPlansModalVisible && (subscriptionData.status !== 'active' || subscriptionData.days_payment_deadline < 4 || parseFloat(subscriptionData.amount) === 0) && (
                        <TouchableOpacity onPress={() => {
                            setPaymentModalVisible(false);
                            setSubscriptionPlansModalVisible(true);
                        }} style={styles.payNowButton}>
                            <Text style={styles.buttonText}>Update Subscription</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity onPress={() => setPaymentModalVisible(false)} style={styles.closeButton}>
                        <Text style={styles.buttonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </>
    );
};

const styles = {
    paymentCard: {
        width: width * 0.7,
        minHeight: width * 0.3,
        padding: 10,
        borderTopLeftRadius: width * 0.07,
        borderBottomLeftRadius: width * 0.07,
        borderTopRightRadius: width * 0.01,
        borderBottomRightRadius: width * 0.01,
        marginLeft: 'auto',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 5,
    },
    paymentTitle: {
        fontSize: width * 0.04,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#DDD',
    },
    paymentInfoText: {
        fontSize: width * 0.03,
        marginBottom: 2,
        fontWeight: 'bold',
        color: '#DDD',
    },
    detailsButton: {
        padding: width * 0.02,
        borderRadius: width * 0.015,
        backgroundColor: 'lightblue',
        alignItems: 'center',
        marginHorizontal: width * 0.1,
        marginTop: width * 0.02,
    },
    modalContainer: {
        width: '90%',
        minHeight: '70%',
        padding: 20,
        backgroundColor: '#FFF',
        marginLeft: '5%',
        marginTop: '20%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    scrollView: {
        width: '100%',
    },
    paymentsModalTextTitle: {
        fontSize: width * 0.055,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#3498db',
    },
    paymentsModalText: {
        fontSize: width * 0.04,
        marginBottom: 10,
        color: '#555',
    },
    payNowButton: {
        backgroundColor: '#27ae60',
        minWidth: width * 0.5,
        padding: 10,
        borderRadius: 8,
        marginTop: 15,
        alignItems: 'center',
    },
    closeButton: {
        backgroundColor: '#e74c3c',
        minWidth: width * 0.5,
        padding: 10,
        borderRadius: 8,
        marginTop: 15,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: width * 0.04,
    }
};

export default PaymentCard;