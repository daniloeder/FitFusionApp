import React, { useState, useEffect } from 'react';
import { StyleSheet, Dimensions, StatusBar } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

import Icons from '../../components/Icons/Icons';


import LoginScreen from '../../screens/Auth/LoginScreen';
import RegisterScreen from '../../screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '../../screens/Auth/ChangePasswordScreen';
import GoogleAuthScreen from '../../screens/Auth/GoogleAuthScreen';

import HomeScreen from '../../screens/HomeScreen/HomeScreen';
import ProfileScreen from '../../screens/ProfileScreen/ProfileScreen';
import EventScreen from '../../screens/EventScreen/EventScreen';
import CreateEventScreen from '../../screens/CreateEventScreen/CreateEventScreen';
import Map from '../../screens/Map/Map';
import ChatScreen from '../../screens/ChatScreen/ChatScreen';
import NotificationScreen from '../../screens/NotificationScreen/NotificationScreen';
import SettingsScreen from '../../screens/SettingsScreen/SettingsScreen';
import SearchScreen from '../../screens/SearchScreen/SearchScreen';

const width = Dimensions.get('window').width;

const Tab = createBottomTabNavigator();

const GradientHeader = () => (
  <Svg style={StyleSheet.absoluteFill}>
    <Defs>
      <LinearGradient id="verticalGrad" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0.3" stopColor="#1A202C" stopOpacity="1" />
        <Stop offset="0.8" stopColor="#991B1B" stopOpacity="1" />
        <Stop offset="0.9" stopColor="#1A202C" stopOpacity="1" />
      </LinearGradient>
      <LinearGradient id="horizontalGrad" x1="0" y1="0" x2="1" y2="0">
        <Stop offset="0.2" stopColor="transparent" stopOpacity="0.08" />
        <Stop offset="1" stopColor="#1A202C" stopOpacity="1" />
      </LinearGradient>
    </Defs>

    <Rect x="0" y="0" width="100%" height="100%" fill="url(#verticalGrad)" />
    <Rect x="0" y="0" width="100%" height="100%" fill="url(#horizontalGrad)" />
  </Svg>
);

const NavGradientBackground = () => {
  return (
    <Svg style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id="navGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#1A202C" stopOpacity="1" />
          <Stop offset="0.3" stopColor="#991B1B" stopOpacity="1" />
          <Stop offset="0.9" stopColor="#991B1B" stopOpacity="1" />
          <Stop offset="1" stopColor="#000" stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height={width * 0.18} fill="url(#navGrad)" />
    </Svg>
  );
};

const TabNavigator = () => {
  const [showGradient, setShowGradient] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (count < 15) {
      const timer = setTimeout(() => {
        setShowGradient(false);
        setShowGradient(true);
        setCount((prevCount) => prevCount + 1);
      }, 100);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [count, showGradient]);
  return (
    <>
      <StatusBar translucent={true} backgroundColor="transparent" barStyle="light-content" />
      <Tab.Navigator
        initialRouteName="GoogleAuthScreen"
        screenOptions={{
          headerStyle: {
            height: width * 0.2,
            backgroundColor: 'transparent',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: '#FFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackground: () => (showGradient ? <GradientHeader /> : null),
          tabBarBackground: () => <NavGradientBackground />,
          tabBarActiveTintColor: '#FFF',
          tabBarInactiveTintColor: '#000',
          tabBarLabelStyle: {
            marginBottom: 3,
          },
          tabBarStyle: [
            {
              paddingTop: width * 0.05,
              height: width * 0.15,
              borderTopWidth: 0,
              elevation: 0,
              shadowOpacity: 0,
            },
            null
          ]
        }}
      >
        <Tab.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{
            tabBarLabel: 'Login Screen',
            tabBarIcon: () => <Icons name="Home" size={width * 0.085} />,
          }}
        />
        <Tab.Screen
          name="RegisterScreen"
          component={RegisterScreen}
          options={{
            tabBarLabel: 'Register Screen',
            tabBarIcon: () => <Icons name="Home" size={width * 0.085} />,
          }}
        />
        <Tab.Screen
          name="ForgotPasswordScreen"
          component={ForgotPasswordScreen}
          options={{
            tabBarLabel: 'Forgot Password Screen',
            tabBarIcon: () => <Icons name="Home" size={width * 0.085} />,
          }}
        />
        <Tab.Screen
          name="GoogleAuthScreen"
          component={GoogleAuthScreen}
          options={{
            tabBarLabel: 'GoogleAuthScreen',
            tabBarIcon: () => <Icons name="Home" size={width * 0.085} />,
          }}
        />

        <Tab.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: () => <Icons name="Home" size={width * 0.085} />,
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: () => <Icons name="Profile" size={width * 0.085} />,
          }}
        />
        <Tab.Screen
          name="CreateEventScreen"
          component={CreateEventScreen}
          options={{
            tabBarLabel: 'Create Event Screen',
            tabBarIcon: () => <Icons name="Events" size={width * 0.085} />,
          }}
        />
        <Tab.Screen
          name="EventScreen"
          component={EventScreen}
          options={{
            tabBarLabel: 'Events',
            tabBarIcon: () => <Icons name="Events" size={width * 0.085} />,
          }}
        />
        <Tab.Screen
          name="Map"
          component={Map}
          options={{
            tabBarLabel: 'Map',
            tabBarIcon: () => <Icons name="Map" size={width * 0.085} />,
          }}
        />
        <Tab.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            tabBarLabel: 'Chat',
            tabBarIcon: () => <Icons name="Chat" size={width * 0.085} />,
          }}
        />
        <Tab.Screen
          name="Notifications"
          component={NotificationScreen}
          options={{
            tabBarLabel: 'Notifications',
            tabBarIcon: () => <Icons name="Notifications" size={width * 0.085} />,
          }}
        />
        <Tab.Screen
          name="Search"
          component={SearchScreen}
          options={{
            tabBarLabel: 'Search',
            tabBarIcon: () => <Icons name="Search" size={width * 0.085} />,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: 'Settings',
            tabBarIcon: () => <Icons name="Settings" size={width * 0.085} />,
          }}
        />
      </Tab.Navigator>
    </>
  );
};

export default TabNavigator;
