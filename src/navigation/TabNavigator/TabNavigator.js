import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icons from '../../components/Icons/Icons';

import HomeScreen from '../../screens/HomeScreen/HomeScreen';
import ProfileScreen from '../../screens/ProfileScreen/ProfileScreen';
import EventScreen from '../../screens/EventScreen/EventScreen';
import Map from '../../screens/Map/Map';
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
          tabBarIcon: () => (
            <Icons name="Home" size={30} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => (
            <Icons name="Profile" size={30} />
          ),
        }}
      />
      <Tab.Screen
        name="EventScreen"
        component={EventScreen}
        options={{
          tabBarLabel: 'Events',
          tabBarIcon: () => (
            <Icons name="Events" size={30} />
          ),
        }}
      />
      <Tab.Screen
        name="Map"
        component={Map}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: () => (
            <Icons name="Map" size={30} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarLabel: 'Chat',
          tabBarIcon: () => (
            <Icons name="Chat" size={30} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationScreen}
        options={{
          tabBarLabel: 'Notifications',
          tabBarIcon: () => (
            <Icons name="Notifications" size={30} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: () => (
            <Icons name="Search" size={30} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: () => (
            <Icons name="Settings" size={30} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
