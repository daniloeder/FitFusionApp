import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StatusBar } from 'react-native';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import { SafeAreaView } from 'react-native-safe-area-context';

const AuthStack = createStackNavigator();

const AuthNavigator = () => (
    <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
            <StatusBar translucent={true} backgroundColor="#1A202C" barStyle="light-content" />
            <AuthStack.Navigator
                initialRouteName="LoginScreen"
                screenOptions={{
                    headerShown: false,
                }}
            >
                <AuthStack.Screen name="LoginScreen" component={LoginScreen} />
                <AuthStack.Screen name="RegisterScreen" component={RegisterScreen} />
                <AuthStack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
            </AuthStack.Navigator>
        </View>
    </SafeAreaView>
);


export default AuthNavigator;