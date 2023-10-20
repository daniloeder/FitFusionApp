import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert, Dimensions, ScrollView, Pressable } from 'react-native';
import GradientBackground from './../../components/GradientBackground/GradientBackground';
import { useNavigation } from '@react-navigation/native';
import CustomInput from '../../components/Forms/CustomInput';

const { width, height } = Dimensions.get('window');

function ForgotPasswordScreen() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');

    const handleForgotPassword = async () => {
        try {
            const response = await fetch('http://192.168.0.118:8000/api/auth/password/reset/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email })
            });

            const responseData = await response.json();

            if (responseData.detail && responseData.detail === "Password reset e-mail has been sent.") {
                Alert.alert('Success', 'Password reset email has been sent. Check your inbox!');
            } else {
                Alert.alert('Error', 'Failed to send reset email!');
            }
        } catch (error) {
            console.error("There was an error:", error);
            Alert.alert('Error', 'There was an error sending the reset email. Please try again.');
        }
    };

    return (
        <ScrollView style={styles.gradientContainer}>
            <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />
            <View style={styles.container}>
                <Text style={styles.title}>Change Password</Text>
                <CustomInput
                    placeholder="Email"
                    placeholderTextColor="#656565"
                    onChangeText={setEmail}
                    value={email}
                />
                <TouchableOpacity style={styles.button} onPress={handleForgotPassword}>
                    <Text style={styles.buttonText}>Reset Password</Text>
                </TouchableOpacity>

                <Pressable style={({ pressed }) => [
                    styles.navigationButton,
                    pressed ? styles.buttonPressed : null
                ]} onPress={() => navigation.navigate('LoginScreen')}>
                    <Text style={styles.navigationButtonText}>Go to Login</Text>
                </Pressable>

                <Pressable style={({ pressed }) => [
                    styles.navigationButton,
                    pressed ? styles.buttonPressed : null
                ]} onPress={() => navigation.navigate('RegisterScreen')}>
                    <Text style={styles.navigationButtonText}>Go to Register</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    gradientContainer: {
        flex: 1,
    },
    container: {
        flex: 1,
        minHeight: height,
        padding: width * 0.05,
        justifyContent: 'center'
    },
    title: {
        textAlign: 'center',
        fontSize: width * 0.07,
        marginBottom: width * 0.1,
        fontWeight: 'bold',
        color: '#FFF',
    },
    button: {
        padding: width * 0.03,
        borderRadius: width * 0.0125,
        alignItems: 'center',
        backgroundColor: 'green',
        marginTop: width * 0.05,
    },
    buttonText: {
        color: '#FFF',
        fontSize: width * 0.04
    },
    navigationButton: {
        width: '50%',
        marginLeft: '25%',
        marginTop: width * 0.05,
        paddingVertical: width * 0.02,
        paddingHorizontal: width * 0.0375,
        borderRadius: width * 0.0125,
        backgroundColor: '#6A5ACD',
        elevation: 3,
        shadowOffset: { width: 0, height: width * 0.005 },
        shadowColor: 'black',
        shadowOpacity: 0.25,
        shadowRadius: width * 0.00875,
    },
    buttonPressed: {
        backgroundColor: '#483D8B',
    },
    navigationButtonText: {
        color: '#FFF',
        fontSize: width * 0.0375,
        textAlign: 'center'
    }
});

export default ForgotPasswordScreen;
