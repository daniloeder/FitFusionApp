import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importing Screens
import HomeScreen from '../../screens/HomeScreen/HomeScreen';
import ChatScreen from '../../screens/ChatScreen/ChatScreen';
import EventScreen from '../../screens/EventScreen/EventScreen';
import NotificationScreen from '../../screens/NotificationScreen/NotificationScreen';
import ProfileScreen from '../../screens/ProfileScreen/ProfileScreen';
import SearchScreen from '../../screens/SearchScreen/SearchScreen';
import SettingsScreen from '../../screens/SettingsScreen/SettingsScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f4511e', // You can set your preferred color here
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="EventScreen" component={EventScreen} />
        <Stack.Screen name="Notifications" component={NotificationScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
