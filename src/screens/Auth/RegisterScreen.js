import React, { useEffect, useState } from 'react';
import { View, Alert, StyleSheet, Pressable, Text, Dimensions, Modal, ScrollView } from 'react-native';
import GradientBackground from './../../components/GradientBackground/GradientBackground';
import CustomInput from '../../components/Forms/CustomInput';
import DatePicker from '../../components/Forms/DatePicker';
import GoogleLogin from '../../components/GoogleLogin/GoogleAuthScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

function RegisterScreen({ navigation }) {

    const [accessToken, setAccessToken] = useState(null);
    const [socialToken, setSocialToken] = useState(null);
    const [socialData, setSocialData] = useState(null);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [sex, setSex] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState(null);
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');

    const [isModalVisible, setModalVisible] = useState(false);
    const [successRegistration, setSuccessRegistration] = useState(false);

    const storeAuthToken = async (token) => {
        try {
            await AsyncStorage.setItem('@userToken', token);
            console.log('Token stored successfully!');
        } catch (e) {
            console.error("Error fetching userToken:", e);
        }
    }

    const ActivateAccount = async () => {
        try {
            const response = await fetch(`http://192.168.0.118:8000/api/users/activate/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Token ' + accessToken
                },
                body: JSON.stringify({ date_of_birth: dateOfBirth, sex })
            });

            if (response.ok) {
                storeAuthToken(accessToken);
                navigation.navigate("HomeScreen", { userToken: accessToken });
            } else {
                let errorMessage = '';
                for (const key in responseData) {
                    // Adding each error message to the errorMessage string.
                    errorMessage += responseData[key].join('\n') + '\n';
                }
                Alert.alert('Activate account Error', errorMessage.trim());
            }

        } catch (error) {
            console.error("There was an error:", error);
            Alert.alert('Error', 'There was an error with the activation account process. Please try again.');
        }
    };

    const handleUpdateProfile = async () => {
        try {
            if (!dateOfBirth || !sex) {
                Alert.alert('Input Error', 'Please fill out all fields.');
                return;
            }

            const response = await fetch(`http://192.168.0.118:8000/api/users/update/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Token ' + accessToken
                },
                body: JSON.stringify({ date_of_birth: dateOfBirth, sex })
            });

            const responseData = await response.json();
            if (response.ok) {
                Alert.alert('Success', 'Profile updated successfully!');
                ActivateAccount();
            } else {
                let errorMessage = '';
                for (const key in responseData) {
                    // Adding each error message to the errorMessage string.
                    errorMessage += responseData[key].join('\n') + '\n';
                }
                Alert.alert('Update Error', errorMessage.trim());
            }

        } catch (error) {
            console.error("There was an error:", error);
            Alert.alert('Error', 'There was an error with the update process. Please try again.');
        }
    };


    const handleRegister = async () => {
        try {
            if (!socialData && (!email || (!password && !socialToken) || !username)) {
                Alert.alert('Input Error', 'Please fill out all fields.');
                return;
            }

            const response = await fetch('http://192.168.0.118:8000/api/users/auth/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(socialToken ? {
                    social: true, token: socialToken, email: socialData.email, username: socialData.name
                } : {
                    social: false, email, password: !socialToken ? password : "", username, date_of_birth: dateOfBirth, sex
                })
            });

            const responseData = await response.json();
            if (response.ok) {
                setAccessToken(responseData.token);
                setSuccessRegistration(true);
                Alert.alert('Success', 'Registered successfully!\nYou can Log In now.');
            } else {
                let errorMessage = '';
                for (const key in responseData) {
                    // Adding each error message to the errorMessage string.
                    errorMessage += responseData[key].join('\n') + '\n';
                }
                Alert.alert('Registration Error', errorMessage.trim());
            }

        } catch (error) {
            console.error("There was an error:", error);
            Alert.alert('Error', 'There was an error with the registration process. Please try again.');
        }
    };

    useEffect(() => {
        if (socialToken) {
            handleRegister();
        }
    }, [socialToken])

    return (
        <ScrollView style={styles.gradientContainer}>
            <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />
            <View style={styles.container}>
                <Text style={styles.title}>Register</Text>
                {!socialToken || !accessToken ? <>
                    <GoogleLogin title="Register with Google" setGoogleToken={setSocialToken} setGoogleData={setSocialData} registration />
                    <CustomInput
                        placeholder="Email"
                        placeholderTextColor="#656565"
                        onChangeText={setEmail}
                        value={email}
                    />

                    <CustomInput
                        placeholder="Username"
                        placeholderTextColor="#656565"
                        onChangeText={setUsername}
                        value={username}
                    /></> : successRegistration ? <Text style={{ textAlign: 'center', margin: width * 0.05, fontWeight: 'bold', color: '#FFF', fontSize: width * 0.04 }}>{"Registered successfully!\nNow you need just complete these info!"}</Text> : ''}

                <DatePicker setDate={setDateOfBirth} mode="date" dateType='DD/MM/YYYY' customStyle={styles.timePicker} />

                <Pressable onPress={() => setModalVisible(true)} style={styles.pickerTrigger}>
                    <Text style={styles.pickerTriggerText}>
                        {sex ? `Selected: ${sex == "M" ? "Male" : sex == "F" ? "Female" : "Other"}` : 'Select Sex'}
                    </Text>
                </Pressable>
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={isModalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Pressable
                                style={styles.option}
                                onPress={() => {
                                    setSex('M');
                                    setModalVisible(false);
                                }}
                            >
                                <Text style={styles.optionText}>Male</Text>
                            </Pressable>

                            <Pressable
                                style={styles.option}
                                onPress={() => {
                                    setSex('F');
                                    setModalVisible(false);
                                }}
                            >
                                <Text style={styles.optionText}>Female</Text>
                            </Pressable>

                            <Pressable
                                style={styles.option}
                                onPress={() => {
                                    setSex('O');
                                    setModalVisible(false);
                                }}
                            >
                                <Text style={styles.optionText}>Other</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>
                {!socialToken || !accessToken ? <>
                    <CustomInput
                        secret
                        placeholder="Password"
                        placeholderTextColor="#656565"
                        onChangeText={setPassword}
                        value={password}
                    />

                    <CustomInput
                        secret
                        placeholder="Confirm Password"
                        placeholderTextColor="#656565"
                        onChangeText={setPassword2}
                        value={password2}
                    /></> : ''}
                <Pressable style={({ pressed }) => [
                    styles.registerButton,
                    pressed ? styles.buttonPressed : null
                ]} onPress={() => {
                    if (!socialToken || !accessToken) {
                        handleRegister();
                    } else {
                        handleUpdateProfile();
                    }
                }}>
                    <Text style={styles.registerButtonText}>{!socialToken || !accessToken ? "Register" : "Complete Registration"}</Text>
                </Pressable>

                {!socialToken || !accessToken ? <>
                    <View style={styles.loginContainer}>
                        <Text style={styles.registerText}>Already have an account?</Text>
                        <Pressable style={({ pressed }) => [
                            styles.loginButton,
                            pressed ? styles.buttonPressed : null
                        ]} onPress={() => {
                            navigation.navigate('LoginScreen');
                        }}>
                            <Text style={styles.loginButtonText}>Log in!</Text>
                        </Pressable>
                    </View></> : ''}

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
    timePicker: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: 'gray',
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
        backgroundColor: '#FFF',
        alignItems: 'center'
    },
    registerButtonText: {
        color: '#FFF',
        fontSize: width * 0.0375,
    },
    registerButton: {
        padding: width * 0.025,
        borderRadius: width * 0.0125,
        backgroundColor: '#6A5ACD',
        elevation: 3,
        shadowOffset: { width: 0, height: width * 0.005 },
        shadowColor: 'black',
        shadowOpacity: 0.25,
        shadowRadius: width * 0.00875,
        alignItems: 'center',
        marginTop: width * 0.05,
    },
    loginContainer: {
        marginTop: width * 0.05,
        alignItems: 'center',
    },
    registerText: {
        color: '#FFD700',
        marginBottom: width * 0.0125,
    },
    loginButton: {
        paddingVertical: width * 0.02,
        paddingHorizontal: width * 0.05,
        borderRadius: width * 0.0125,
        backgroundColor: 'green',
        elevation: 3,
        shadowOffset: { width: 0, height: width * 0.005 },
        shadowColor: 'black',
        shadowOpacity: 0.25,
        shadowRadius: width * 0.00875,
    },
    buttonPressed: {
        backgroundColor: '#1A1A1A',  // Darker shade for a pressed effect
    },
    loginButtonText: {
        color: '#FFF',
        fontSize: width * 0.0375,
    },

    // sex modal picker

    pickerTrigger: {
        borderWidth: 1,
        borderColor: 'gray',
        paddingHorizontal: width * 0.025,
        paddingVertical: width * 0.035,
        borderRadius: width * 0.0125,
        backgroundColor: '#AAA',
        marginBottom: width * 0.04,
        backgroundColor: '#FFF'
    },
    pickerTriggerText: {
        color: '#777',
    },

    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '80%',
        height: 200,
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 15,
        justifyContent: 'space-between',
    },
    option: {
        marginBottom: 10,
    },
    optionText: {
        fontSize: 16,
        color: '#000',
        textAlign: 'left',
    },
});

export default RegisterScreen;
