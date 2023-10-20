import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importing Screens
import LoginScreen from '../../screens/Auth/LoginScreen';
import RegisterScreen from '../../screens/Auth/RegisterScreen';
import ChangePasswordScreen from '../../screens/Auth/ChangePasswordScreen';

import HomeScreen from '../../screens/HomeScreen/HomeScreen';
import ChatScreen from '../../screens/ChatScreen/ChatScreen';
import EventScreen from '../../screens/EventScreen/EventScreen';
import Map from '../../screens/Map/Map';
import NotificationScreen from '../../screens/NotificationScreen/NotificationScreen';
import ProfileScreen from '../../screens/ProfileScreen/ProfileScreen';
import SearchScreen from '../../screens/SearchScreen/SearchScreen';
import SettingsScreen from '../../screens/SettingsScreen/SettingsScreen';
import GoogleAuthScreen from '../../screens/Auth/GoogleAuthScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="LoginScreen" component={LoginScreen}/>
        <Stack.Screen name="RegisterScreen" component={RegisterScreen}/>
        <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen}/>
        <Stack.Screen name="GoogleAuthScreen" component={GoogleAuthScreen}/>

        <Stack.Screen name="Home" component={HomeScreen}/>
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="EventScreen" component={EventScreen} />
        <Stack.Screen name="Map" component={Map} />
        <Stack.Screen name="Notifications" component={NotificationScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
