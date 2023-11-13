import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icons from '../components/Icons/Icons';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { fetchAuthToken } from '../store/store';
import { useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/HomeScreen/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen/ProfileScreen';
import PlaceScreen from '../screens/PlaceScreen/PlaceScreen';
import CreatePlaceScreen from '../screens/CreatePlaceScreen/CreatePlaceScreen';
import EventScreen from '../screens/EventScreen/EventScreen';
import CreateEventScreen from '../screens/CreateEventScreen/CreateEventScreen';
import Map from '../screens/Map/Map';
import ChatScreen from '../screens/ChatScreen/ChatScreen';
import Notifications from '../screens/NotificationScreen/NotificationScreen';
import SettingsScreen from '../screens/SettingsScreen/SettingsScreen';
import SearchScreen from '../screens/SearchScreen/SearchScreen';

const width = Dimensions.get('window').width;

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
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
  const navigation = useNavigation();
  const [userToken, setUserToken] = useState(null);
  
  useEffect(() => {
    fetchAuthToken()
      .then((token) => {
        setUserToken(token);
      })
      .catch((error) => {
        console.error('Error fetching user token:', error);
      });
  }, [userToken, navigation]);

  if (!userToken) {
    return;
  }

  return (
    <Tab.Navigator
      initialRouteName="CreateEvent"
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
        headerBackground: () => <GradientHeader />,
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
        name="Home"
        component={HomeScreen}
        initialParams={{ userToken }}
        options={{
          tabBarIcon: () => <Icons name="Home" size={width * 0.085} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        initialParams={{ userToken }}
        component={ProfileScreen}
        options={{
          tabBarIcon: () => <Icons name="Profile" size={width * 0.085} />,
        }}
      />
      <Tab.Screen
        name="Place"
        component={PlaceScreen}
        initialParams={{ userToken }}
        options={{
          tabBarIcon: () => <Icons name="Events" size={width * 0.085} />,
        }}
      />

      <Tab.Screen
        name="CreatePlace"
        component={CreatePlaceScreen}
        initialParams={{ userToken }}
        options={{
          tabBarIcon: () => <Icons name="Events" size={width * 0.085} />,
        }}
      />
      <Tab.Screen
        name="Event"
        component={EventScreen}
        initialParams={{ userToken }}
        options={{
          tabBarIcon: () => <Icons name="Events" size={width * 0.085} />,
        }}
      />

      <Tab.Screen
        name="CreateEvent"
        component={CreateEventScreen}
        initialParams={{ userToken }}
        options={{
          tabBarIcon: () => <Icons name="Events" size={width * 0.085} />,
        }}
      />
      <Tab.Screen
        name="Map"
        component={Map}
        initialParams={{ userToken }}
        options={{
          tabBarIcon: () => <Icons name="Map" size={width * 0.085} />,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        initialParams={{ userToken }}
        options={{
          tabBarIcon: () => <Icons name="Chat" size={width * 0.085} />,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        initialParams={{ userToken }}
        options={{
          tabBarIcon: () => <Icons name="Search" size={width * 0.085} />,
        }}
      />
      <Tab.Screen
        name="Notifications"
        initialParams={{ userToken }}
        component={Notifications}
        options={{
          tabBarIcon: () => <Icons name="Notifications" size={width * 0.085} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        initialParams={{ userToken }}
        component={SettingsScreen}
        options={{
          tabBarIcon: () => <Icons name="Settings" size={width * 0.085} />,
        }}
      />
    </Tab.Navigator>
  )
};

export default TabNavigator;
