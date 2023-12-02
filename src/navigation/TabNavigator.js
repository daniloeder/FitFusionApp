import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icons from '../components/Icons/Icons';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { fetchAuthToken, fetchData, storeAuthToken, storeData } from '../store/store';
import { useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/HomeScreen/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen/ProfileScreen';
import OtherUserProfileScreen from '../screens/ProfileScreen/OtherUserProfileScreen';
import PlaceScreen from '../screens/PlaceScreen/PlaceScreen';
import ManagePlace from '../screens/PlaceScreen/ManagePlace'
import CreatePlaceScreen from '../screens/CreatePlaceScreen/CreatePlaceScreen';
import EventScreen from '../screens/EventScreen/EventScreen';
import ManageEvent from '../screens/EventScreen/ManageEvent';
import CreateEventScreen from '../screens/CreateEventScreen/CreateEventScreen';
import Map from '../screens/Map/Map';
import ChatListScreen from '../screens/ChatScreen/ChatListScreen';
import ChatScreen from '../screens/ChatScreen/ChatScreen';
import Notifications from '../screens/NotificationScreen/NotificationScreen';
import SettingsScreen from '../screens/SettingsScreen/SettingsScreen';
import SearchScreen from '../screens/SearchScreen/SearchScreen';
import { saveToLibraryAsync } from 'expo-media-library';

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
const HeaderIcon = ({ icon, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}
      style={{
        width: width * 0.12,
        height: width * 0.08,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: width * 0.05,
        marginLeft: width * 0.02,
        backgroundColor: 'rgba(50, 0, 0, 0.2)',
      }}
    >
      <Icons name={icon} size={width * 0.07} fill="#CCC" />
    </TouchableOpacity>
  );
};

const TabNavigator = () => {
  const navigation = useNavigation();
  const [userId, setUserId] = useState(null);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    fetchData('user_id')
      .then((id) => {
        setUserId(id);
        fetchAuthToken()
          .then((token) => {
            setUserToken(token);
          })
          .catch((error) => {
            console.error('Error fetching user token:', error);
          });
      })
      .catch((error) => {
        console.error('Error fetching user token:', error);
      });
  }, [userToken, navigation]);

  if (!userToken) {
    return null; // Return null or loading indicator if userToken is not available yet
  }

  return (
    <Tab.Navigator
      initialRouteName="Home"
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
        initialParams={{ userId, userToken }}
        options={({ navigation, route }) => ({
          tabBarIcon: ({ focused }) => <Icons name="Home" size={width * 0.085} fill={focused ? '#CCC' : '#1C274C'} />,
          headerLeft: () => {
            return route.state?.index > 0 ? (
              <HeaderIcon icon="Back" onPress={() => navigation.goBack()} />
            ) : null;
          },
        })}
      />
      <Tab.Screen
        name="Place"
        component={PlaceScreen}
        initialParams={{ userId, userToken }}
        options={{
          //tabBarButton: () => null,
          headerLeft: () => <HeaderIcon icon="Back" onPress={() => navigation.goBack()} />
        }}
      />
      <Tab.Screen
        name="Manage Place"
        component={ManagePlace}
        initialParams={{ userId, userToken }}
        options={{
          tabBarButton: () => null,
          headerLeft: () => <HeaderIcon icon="Back" onPress={() => navigation.goBack()} />
        }}
      />
      <Tab.Screen
        name="Create Place"
        component={CreatePlaceScreen}
        initialParams={{ userId, userToken }}
        options={{
          tabBarButton: () => null,
          headerLeft: () => <HeaderIcon icon="Back" onPress={() => navigation.goBack()} />
        }}
      />
      <Tab.Screen
        name="Event"
        component={EventScreen}
        initialParams={{ userId, userToken }}
        options={{
          tabBarButton: () => null,
          headerLeft: () => <HeaderIcon icon="Back" onPress={() => navigation.goBack()} />
        }}
      />
      <Tab.Screen
        name="Manage Event"
        component={ManageEvent}
        initialParams={{ userId, userToken }}
        options={{
          tabBarButton: () => null,
          headerLeft: () => <HeaderIcon icon="Back" onPress={() => navigation.goBack()} />
        }}
      />
      <Tab.Screen
        name="Create Event"
        component={CreateEventScreen}
        initialParams={{ userId, userToken }}
        options={{
          tabBarButton: () => null,
          headerLeft: () => <HeaderIcon icon="Back" onPress={() => navigation.goBack()} />
        }}
      />
      <Tab.Screen
        name="Chat List"
        component={ChatListScreen}
        initialParams={{ userId, userToken }}
        options={{
          tabBarIcon: ({ focused }) => <Icons name="Chat" size={width * 0.085} fill={focused ? '#CCC' : '#1C274C'} />,
          headerLeft: () => <HeaderIcon icon="Back" onPress={() => navigation.goBack()} />
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        initialParams={{ userId, userToken }}
        options={{
          tabBarButton: () => null,
          tabBarIcon: ({ focused }) => <Icons name="Chat" size={width * 0.085} fill={focused ? '#CCC' : '#1C274C'} />,
          headerLeft: () => <HeaderIcon icon="Back" onPress={() => navigation.navigate('Chat List')} />,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tab.Screen
        name="Map"
        component={Map}
        initialParams={{ userId, userToken }}
        options={{
          tabBarIcon: () => <Icons name="Map" size={width * 0.085} fill="#CCC" />,
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        initialParams={{ userId, userToken }}
        options={{
          tabBarIcon: ({ focused }) => <Icons name="Search" size={width * 0.085} fill={focused ? '#CCC' : '#1C274C'} />,
          headerLeft: () => <HeaderIcon icon="Back" onPress={() => navigation.goBack()} />
        }}
      />
      <Tab.Screen
        name="Notifications"
        initialParams={{ userId, userToken }}
        component={Notifications}
        options={{
          tabBarIcon: ({ focused }) => <Icons name="Notifications" size={width * 0.085} fill={focused ? '#CCC' : '#1C274C'} />,
          headerLeft: () => <HeaderIcon icon="Back" onPress={() => navigation.goBack()} />
        }}
      />
      <Tab.Screen
        name="Settings"
        initialParams={{ userId, userToken }}
        component={SettingsScreen}
        options={{
          tabBarButton: () => null,
          headerLeft: () => <HeaderIcon icon="Back" onPress={() => navigation.goBack()} />
        }}
      />
      <Tab.Screen
        name="Profile"
        initialParams={{ userToken, id: false }}
        component={ProfileScreen}
        options={({ navigation }) => ({
          tabBarIcon: ({ focused }) => <Icons name="Profile" size={width * 0.085} fill={focused ? '#CCC' : '#1C274C'} />,
          headerLeft: () => <HeaderIcon icon="Back" onPress={() => navigation.goBack()} />
        })
        }
      />
      <Tab.Screen
        name="User Profile"
        initialParams={{ userId, userToken }}
        component={OtherUserProfileScreen}
        options={{
          tabBarButton: () => null,
          headerLeft: () => <HeaderIcon icon="Back" onPress={() => navigation.goBack()} />
        }}
      />
    </Tab.Navigator>
  )
};

export default TabNavigator;
