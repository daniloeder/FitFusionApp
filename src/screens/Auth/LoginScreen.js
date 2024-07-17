import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert, Dimensions, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import GradientBackground from './../../components/GradientBackground/GradientBackground';
import { useNavigation } from '@react-navigation/native';
import CustomInput from '../../components/Forms/CustomInput';
import SocialAuthButton from '../../components/AuthButtons/AuthButtons';
import { storeAuthToken, fetchAuthToken, fetchData, storeData } from '../../store/store';
import { BASE_URL } from '@env';

const { width, height } = Dimensions.get('window');

function LoginScreen() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [socialToken, setSocialToken] = useState(null);
    const [loading, setLoading] = useState(false);

    function GoToHome(token) {
        navigation.navigate('Tabs', {
            screen: 'Home',
            params: { userToken: token }
        });
    }

    const handleLogin = async () => {
        setLoading(true);
        try {
            // Check if fields are not empty
            if (!socialToken && (!email || !password)) {
                Alert.alert('Input Error', 'Please enter both email and password.');
                return;
            }

            const response = await fetch(BASE_URL + '/api/users/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: socialToken })
            });

            const responseData = await response.json();

            if (response.ok) {
                const token = responseData.token || responseData.user_data.token;
                const userId = responseData.user_id || responseData.user_data.user_id;
                storeData(userId, 'user_id');
                storeAuthToken(token)
                    .then(() => {
                        if (responseData.new) {
                            navigation.navigate('RegisterScreen', {
                                userToken: token,
                                new_: true
                            });
                            Alert.alert('Success', 'New account created!');
                            return;
                        }
                        GoToHome(token);
                        Alert.alert('Success', 'Logged in successfully!');
                    })
                    .catch((error) => {
                        console.error('Error storing token:', error);
                    });

            } else {
                let errorMessage = responseData.error || responseData.detail || 'Login failed!';
                Alert.alert('Login failed', errorMessage);
            }
        } catch (error) {
            console.error("There was an error:", error);
            Alert.alert('Error', 'There was an error with the login process. Please try again.');
        }
        setLoading(false);
    };

    useEffect(() => {
        if (socialToken) {
            handleLogin();
        }
    }, [socialToken])

    useEffect(() => {
        fetchData('user_id')
            .then((id) => {
                fetchAuthToken()
                    .then((token) => {
                        if (id && token) {
                            GoToHome(token);
                        }
                    })
                    .catch((error) => {
                        console.error('Error fetching user token:', error);
                    });
            })
            .catch((error) => {
                console.error('Error fetching user token:', error);
            });
    }, [])


    return (
        <ScrollView style={styles.gradientContainer}>
            <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />
            <View style={styles.container}>
                <Text style={styles.title}>Login</Text>

                {loading && <ActivityIndicator size="large" color="#fff" style />}

                <SocialAuthButton strategy={"oauth_google"} title="Log In with Google" setLoading={setLoading} setSocialToken={setSocialToken} />
                <SocialAuthButton strategy={"oauth_facebook"} title="Log In with Facebook" setLoading={setLoading} setSocialToken={setSocialToken} />
                <SocialAuthButton strategy={"oauth_tiktok"} title="Log In with TikTok" setLoading={setLoading} setSocialToken={setSocialToken} />

                <View style={{marginTop: 30}}>
                    <CustomInput
                        placeholder="Email or Username"
                        placeholderTextColor="#656565"
                        onChangeText={setEmail}
                        value={email}
                    />

                    <CustomInput
                        secret
                        placeholder="Password"
                        placeholderTextColor="#656565"
                        onChangeText={setPassword}
                        value={password}
                    />

                    <TouchableOpacity style={styles.button} onPress={handleLogin}>
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>

                </View>

                <Text style={styles.forgotPassword} onPress={() => { navigation.navigate("ForgotPasswordScreen") }}>
                    Forgot Password?
                </Text>

                <View style={styles.registerContainer}>
                    <Text style={styles.registerText}>Does not have an account?</Text>
                    <Pressable style={({ pressed }) => [
                        styles.registerButton,
                        pressed ? styles.buttonPressed : null
                    ]} onPress={() => {
                        navigation.navigate('RegisterScreen');
                    }}>
                        <Text style={styles.registerButtonText}>Register</Text>
                    </Pressable>
                </View>
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
        justifyContent: 'center',
    },
    title: {
        textAlign: 'center',
        fontSize: width * 0.07,
        marginBottom: 20,
        fontWeight: 'bold',
        color: '#FFF',
    },
    input: {
        borderWidth: 1,
        borderColor: 'gray',
        padding: width * 0.025,
        borderRadius: width * 0.0125,
        marginBottom: width * 0.08,
        backgroundColor: '#FFF',
        color: '#333',
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
    forgotPassword: {
        marginTop: width * 0.075,
        color: '#fff',
        textDecorationLine: 'underline',
        alignSelf: 'center',
    },
    registerContainer: {
        marginTop: width * 0.0625,
        alignItems: 'center',
    },
    registerText: {
        color: '#FFD700',
        marginBottom: width * 0.0125,
        fontSize: width * 0.0375
    },
    registerButton: {
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
    registerButtonText: {
        color: '#FFF',
        fontSize: width * 0.0375,
    },
});

export default LoginScreen;
