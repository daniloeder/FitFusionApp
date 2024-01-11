import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native';

const width = Dimensions.get('window').width;

const PaymentCard = ({ paymentData, startVisible=false }) => {
    const [paymentModalVisible, setPaymentModalVisible] = useState(startVisible);
    if (!paymentData.latest) {
        return
    }
    return (
        <>
            <View
                style={[styles.paymentCard, { backgroundColor: paymentData.regular ? 'rgba(144, 238, 144, 0.5)' : 'rgba(250, 128, 114, 0.5)' }]}
            >
                {paymentData.days_until_next > 0 ? <Text style={{color:'#FFF', marginLeft:'auto'}}>Days Left to Next Payment: {paymentData.days_until_next}</Text> : !paymentData.regular ? <Text style={{color:'red', fontWeight:'bold', marginLeft:'auto'}}>Late payment by {-paymentData.days_until_next} days</Text> : '' }
                <Text style={styles.paymentTitle}>Last Due Payment:</Text>
                <Text style={styles.paymentInfoText}>Amount: ${paymentData.latest.amount}</Text>
                <Text style={styles.paymentInfoText}>Payment Status: {paymentData.latest.status}</Text>
                <TouchableOpacity
                    onPress={() => setPaymentModalVisible(true)}
                    style={styles.detailsButton}
                >
                    <Text>
                        See Payment Details
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
                        <Text style={styles.paymentsModalTextTitle}>Last Payment</Text>
                        <Text style={styles.paymentsModalText}>Amount: ${paymentData.latest.amount}</Text>
                        <Text style={styles.paymentsModalText}>Payment Status: {paymentData.latest.status}</Text>
                        <Text style={styles.paymentsModalText}>From: {paymentData.latest.date_from}</Text>
                        <Text style={styles.paymentsModalText}>To: {paymentData.latest.date_to}</Text>
                    </ScrollView>

                    {paymentData.latest.status !== 'Paid' && (
                        <TouchableOpacity onPress={() => { }} style={styles.payNowButton}>
                            <Text style={styles.buttonText}>Pay Now</Text>
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
        marginBottom: 20,
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
};

export default PaymentCard;