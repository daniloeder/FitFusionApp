import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Modal, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { BASE_URL } from '@env';

const PayPalPayment = ({ userToken, amount, currency, item, setCompletedPaymentData, setUpdatePlanModal, setUsePayPal }) => {
    const [showWebView, setShowWebView] = useState(true);
    const [loading, setLoading] = useState(false);
    const [paymentId, setPaymentId] = useState(null);
    const [orderData, setOrderData] = useState({});
    const [pAmount, setPAmount] = useState(amount);
    const [pCurrency, setPCurrency] = useState(currency);

    const onClose = () => {
        setShowWebView(false);
    };

    const handleWebViewMessage = (event) => {
        const message = JSON.parse(event.nativeEvent.data);

        switch (message.type) {
            case 'SUCCESS':
                setCompletedPaymentData({ ...message.data, ...orderData, payment_method: 'paypal', payment_id: paymentId });
                setUsePayPal(false);
                Alert.alert('Payment Success', 'Transaction completed successfully.');
                setUpdatePlanModal(false);
                setShowWebView(false);
                break;
            case 'CANCEL':
                Alert.alert('Payment Cancelled', 'Transaction was cancelled.');
                setShowWebView(false);
                break;
            case 'ERROR':
                Alert.alert('Payment Error', 'An error occurred during the transaction.');
                setShowWebView(false);
                break;
            default:
                console.warn('Unknown message type:', message.type);
        }
    };

    const createPaymentIntent = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/payments/create_payment_intent/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    Authorization: `Token ${userToken}`,
                },
                body: JSON.stringify({ provider: 'paypal', amount, currency, item }),
            });
            const data = await response.json();
            if (response.ok) {
                setLoading(false);
                setPAmount(data.provider_payment_amount);
                setPCurrency(data.provider_payment_currency);
                setPaymentId(data.payment_id);
                setOrderData(data);
            } else {
                Alert.alert('Error', data.error);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        }
    };

    useEffect(() => {
        if (showWebView) {
            createPaymentIntent();
        }
    }, []);

    return (
        <View style={{ flex: 1, marginTop: 0 }}>
            {(loading || !paymentId) ? <ActivityIndicator size="large" color="#000" /> :
                <Modal visible={showWebView} animationType="slide" transparent onRequestClose={onClose}>
                    <View style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.3)', alignItems: 'center', justifyContent: 'center' }}>
                        <View style={{ width: '90%', minHeight: '90%', margin: '5%' }}>
                            <WebView
                                originWhitelist={['*']}
                                source={{ uri: `${BASE_URL}/api/payments/paypal-page/?currency=${pCurrency}&amount=${pAmount}&payment_id=${paymentId}` }}
                                style={{ marginTop: 20 }}
                                onError={(syntheticEvent) => {
                                    const { nativeEvent } = syntheticEvent;
                                    console.warn('WebView error: ', nativeEvent);
                                }}
                                onMessage={handleWebViewMessage}
                            />
                        </View>
                    </View>
                </Modal>}
        </View>
    );
};

export default PayPalPayment;
