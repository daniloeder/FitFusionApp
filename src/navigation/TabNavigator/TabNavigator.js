import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';

import HomeScreen from '../../screens/HomeScreen/HomeScreen';
import ProfileScreen from '../../screens/ProfileScreen/ProfileScreen';
import EventScreen from '../../screens/EventScreen/EventScreen';
import ChatScreen from '../../screens/ChatScreen/ChatScreen';
import NotificationScreen from '../../screens/NotificationScreen/NotificationScreen';
import SettingsScreen from '../../screens/SettingsScreen/SettingsScreen';
import SearchScreen from '../../screens/SearchScreen/SearchScreen';

import { colors } from '../../utils/colors';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.activeTintColor,
        tabBarInactiveTintColor: colors.inactiveTintColor,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          //... any other specific options for HomeScreen
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          //... any other specific options for ProfileScreen
        }}
      />
      <Tab.Screen
        name="Events"
        component={EventScreen}
        options={{
          tabBarLabel: 'Events',
          //... any other specific options for EventScreen
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarLabel: 'Chat',
          //... any other specific options for ChatScreen
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationScreen}
        options={{
          tabBarLabel: 'Notifications',
          //... any other specific options for NotificationScreen
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Search',
          //... any other specific options for SearchScreen
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          //... any other specific options for SettingsScreen
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
