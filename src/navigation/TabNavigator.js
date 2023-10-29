import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icons from '../components/Icons/Icons';
import HomeScreen from '../screens/HomeScreen/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen/SettingsScreen';
import Notifications from '../screens/NotificationScreen/NotificationScreen';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

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

const TabNavigator = () => (
<Tab.Navigator
    initialRouteName="HomeScreen" // changed to HomeScreen
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
      options={{
        tabBarIcon: () => <Icons name="Home" size={width * 0.085} />,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: () => <Icons name="Profile" size={width * 0.085} />,
      }}
    />
    <Tab.Screen
      name="Notifications"
      component={Notifications}
      options={{
        tabBarIcon: () => <Icons name="Notifications" size={width * 0.085} />,
      }}
    />
    <Tab.Screen
      name="Settings"
      component={SettingsScreen}
      options={{
        tabBarIcon: () => <Icons name="Settings" size={width * 0.085} />,
      }}
    />
  </Tab.Navigator>
);

export default TabNavigator;
