import React, { useEffect, useState } from 'react';
import { Button, View, Text, ActivityIndicator, Modal, Alert } from 'react-native';
import { StripeProvider, useStripe, useConfirmPayment } from '@stripe/stripe-react-native';
import { BASE_URL } from '@env';

const PUBLISHABLE_KEY = 'pk_test_51P6fmMP5bCDI1xDhaESHnplrFIAxbAdpZjirO31Cc18qBj3em1Qpgx6VSHwI8SIf3djkZHrQThPGOeuCBS68qgOc00jbWRKKaw';

const StripePayment = ({ userToken, amount, currency, item, setCompletedPaymentData }) => {
    const [clientSecret, setClientSecret] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [intentData, setIntentData] = useState(null);


    const createPaymentIntent = async () => {

        setIsLoading(true);
        try {
            if (!clientSecret) {
                const response = await fetch(BASE_URL + '/api/payments/create_payment_intent/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        Authorization: `Token ${userToken}`,
                    },
                    body: JSON.stringify({ amount, currency, item }),
                });

                const data = await response.json();

                if (data?.error) {
                    console.error('Error creating payment intent:', data.error);
                    Alert.alert('Error', 'There was an error creating the payment. Please try again.');
                    return;
                }

                setIntentData(data);
                setClientSecret(data.client_secret);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (clientSecret) {
            onCheckout();
        }
    }, [clientSecret]);

    const onCheckout = async () => {
        if (!clientSecret) {
            Alert.alert('Please Wait', 'Creating payment intent...');
            return;
        }

        try {
            const initResponse = await initPaymentSheet({
                merchantDisplayName: 'My App Name',
                paymentIntentClientSecret: clientSecret,
            });

            if (initResponse.error) {
                Alert.alert('Error', 'There was an error with the payment process. Please try again.');
                return;
            }

            await presentPaymentSheet();

            setCompletedPaymentData(intentData);

        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        createPaymentIntent();
    }, []);

    return (
        <StripeProvider publishableKey={PUBLISHABLE_KEY}>
            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                {isLoading ?
                    <Modal visible={true} animationType="fade" transparent={true} >
                        <View style={{ padding: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFF' }}>Loading...</Text>
                            <ActivityIndicator size="large" color="#fff" />
                        </View>
                    </Modal>
                    : ''
                }
            </View>
        </StripeProvider>
    );
};

export default StripePayment;