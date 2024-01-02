import React, { useEffect, useState } from 'react';
import { View, Alert, StyleSheet, Pressable, Text, Dimensions, Modal, ScrollView } from 'react-native';
import GradientBackground from './../../components/GradientBackground/GradientBackground';
import CustomInput from '../../components/Forms/CustomInput';
import DatePicker from '../../components/Forms/DatePicker';
import GoogleLogin from '../../components/GoogleLogin/GoogleAuthScreen';
import FacebookLogin from '../../components/FacebookLogin/FacebookLogin';
import { storeAuthToken, storeData } from '../../store/store';
import { BASE_URL } from '@env';

const { width, height } = Dimensions.get('window');

function RegisterScreen({ navigation }) {

    const [accessToken, setAccessToken] = useState(null);
    const [socialToken, setSocialToken] = useState(null);
    const [socialData, setSocialData] = useState(null);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [gender, setGender] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState(null);
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');

    const [validusername, setValidUsername] = useState(false);

    const [isModalVisible, setModalVisible] = useState(false);
    const [successRegistration, setSuccessRegistration] = useState(false);

    const ActivateAccount = async () => {
        try {
            const response = await fetch(BASE_URL + `/api/users/activate/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Token ' + accessToken
                },
                body: JSON.stringify({ date_of_birth: dateOfBirth, gender })
            });

            if (response.ok) {
                storeAuthToken(accessToken)
                    .then(() => {
                        navigation.navigate('Tabs', {
                            screen: 'Home',
                            params: { userToken: accessToken }
                        });
                    })
                    .catch((error) => {
                        console.error('Error storing token:', error);
                    });
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
            if (!dateOfBirth || !gender) {
                Alert.alert('Input Error', 'Please fill out all fields.');
                return;
            }

            const response = await fetch(BASE_URL + `/api/users/update/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Token ' + accessToken
                },
                body: JSON.stringify({ date_of_birth: dateOfBirth, gender })
            });

            const responseData = await response.json();
            if (response.ok) {
                Alert.alert('Success', 'Profile updated successfully!');
                ActivateAccount();
                storeData(responseData.user_id, 'user_id');
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

            const response = await fetch(BASE_URL + '/api/users/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },

                body: JSON.stringify(socialToken ? {
                    social: true, token: socialToken, email: socialData.email, username: socialData.email.split('@')[0], name: socialData.name
                } : {
                    social: false, email, password: !socialToken ? password : "", username, name, date_of_birth: dateOfBirth, gender
                })
            });

            const responseData = await response.json();
            if (response.ok) {
                setAccessToken(responseData.token);
                setSuccessRegistration(true);
                Alert.alert('Success', 'Registered successfully!');
            } else {
                let errorMessage = '';

                for (const key in responseData) {
                    if (Array.isArray(responseData[key])) {
                        errorMessage += responseData[key].join('\n') + '\n';
                    } else {
                        // Handle non-array values
                        errorMessage += responseData[key] + '\n';
                    }
                }

                Alert.alert('Registration Error', errorMessage.trim());
            }

        } catch (error) {
            console.error("There was an error:", error);
            Alert.alert('Error', 'There was an error with the registration process. Please try again.');
        }
    };
    const checkUsername = async () => {
        try {
            const url = BASE_URL + `/api/users/check-username/?username=${encodeURIComponent(username)}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();
            if (response.ok) {
                setValidUsername(data.available);
            } else {
                console.error("Error response:", data);
                Alert.alert('Error', 'There was an error with the username check process. Please try again.');
            }
        } catch (error) {
            console.error("There was an error:", error);
            Alert.alert('Error', 'There was an error with the registration process. Please try again.');
        }
    };

    useEffect(() => {
        if (username.length > 4) {
            checkUsername();
        }
    }, [username])

    useEffect(() => {
        setUsername(name.trim().split(/\s+/).join('').toLowerCase().replace(/[^a-z0-9_-]/g, ''));
    }, [name])

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
                    <FacebookLogin title="Register with Facebook" />
                    <CustomInput
                        placeholder="Email"
                        placeholderTextColor="#656565"
                        onChangeText={setEmail}
                        value={email}
                    />
                    <CustomInput
                        placeholder="Your Name"
                        placeholderTextColor="#656565"
                        onChangeText={setName}
                        value={name}
                    />
                    {username.length ?
                        validusername ?
                            <Text style={{ color: 'green', fontWeight: 'bold' }}>This is a valid username</Text>
                            :
                            <Text style={{ color: 'red' }}>This username is invalid</Text>
                        : ''
                    }
                    <CustomInput
                        placeholder="@ Username"
                        placeholderTextColor="#656565"
                        onChangeText={(text) => setUsername(text.trim().split(/\s+/).join('').toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                        value={username}
                    />
                </> : successRegistration ? <Text style={styles.successRegistrationText}>{"Registered successfully!\nNow you need just complete these info!"}</Text> : ''}

                <DatePicker setDate={setDateOfBirth} mode="date" dateType='DD/MM/YYYY' customStyle={styles.timePicker} />

                <Pressable onPress={() => setModalVisible(true)} style={styles.pickerTrigger}>
                    <Text style={styles.pickerTriggerText}>
                        {gender ? `Selected: ${gender == "M" ? "Male" : gender == "F" ? "Female" : "Other"}` : 'Select Gender'}
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
                                    setGender('M');
                                    setModalVisible(false);
                                }}
                            >
                                <Text style={styles.optionText}>Male</Text>
                            </Pressable>

                            <Pressable
                                style={styles.option}
                                onPress={() => {
                                    setGender('F');
                                    setModalVisible(false);
                                }}
                            >
                                <Text style={styles.optionText}>Female</Text>
                            </Pressable>

                            <Pressable
                                style={styles.option}
                                onPress={() => {
                                    setGender('O');
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

    // gender modal picker

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
    successRegistrationText: {
        textAlign: 'center',
        margin: width * 0.05,
        fontWeight: 'bold',
        color: '#FFF',
        fontSize: width * 0.04
    }
});

export default RegisterScreen;
