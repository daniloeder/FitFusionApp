import React, { useEffect, useState, useCallback } from 'react';
import { Alert, View, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icons from '../components/Icons/Icons';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { fetchAuthToken, fetchData } from '../store/store';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { BASE_URL } from '@env';

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
import NotificationsScreen from '../screens/NotificationScreen/NotificationScreen';
import SettingsScreen from '../screens/SettingsScreen/SettingsScreen';
import SearchScreen from '../screens/SearchScreen/SearchScreen';

import { GlobalProvider } from '../services/GlobalContext';
import { useChat } from '../utils/chats';

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

async function registerForPushNotificationsAsync(userToken) {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert('Permissions to show notifications were not granted!');
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  try {
    const response = await fetch(BASE_URL + '/api/users/update/', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${userToken}`,
      },
      body: JSON.stringify({ push_token: token }),
    });

    if (response.ok) {
      //console.log('Success, push token updated successfully!');
    } else {
      //console.log('Error on update push token.');
    }
  } catch (error) {
    console.error('There was an error:', error);
    Alert.alert('Error', 'There was an error with the update process. Please try again.');
  }

  return token;
}

const TabNavigator = () => {
  const navigation = useNavigation();
  const [userId, setUserId] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [currentChat, setCurrentChat] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const [userSubscriptionPlan, setUserSubscriptionPlan] = useState({
    type: 'free',
    name: 'Free Plan',
    features: {
      workout: {
        max: [true, 2],
        max_items_per_group: 4,
        max_groups_per_day: 2,
        max_days: 5,
        max_saves: [true, 0, 5],
        change_indicators: false,
        use_ai: 1,
        items_alternatives: [true, 0, 5],
      },
      diet: {
        max: [true, 1],
        max_items_per_group: 4,
        max_groups_per_day: 4,
        max_days: 1,
        max_saves: [true, 0, 5],
        change_indicators: false,
      },
      add_max_feed_images: 2,
    }
  });

  const fetchSubscriptionPlans = async (token) => {
    try {
      const response = await fetch(BASE_URL + '/api/users/get-subscrisption-data/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
      });
      const data = await response.json();
      setUserSubscriptionPlan(data);
    } catch (error) {
      console.error('There was an error:', error);
    }
  };
  const updateUserSubscriptionPlan = async () => {
    try {
      const response = await fetch(BASE_URL + '/api/payments/update-subscription-data/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${userToken}`,
        },
        body: JSON.stringify({ subscription_data: {...userSubscriptionPlan, update: false } }),
      });
    } catch (error) {
      console.error('There was an error:', error);
    }
  };
  useEffect(() => {
    if(userSubscriptionPlan.update){
      updateUserSubscriptionPlan();
    }
  }, [userSubscriptionPlan]);

  const addNotification = (notification) => {
    setNotifications(currentNotifications => [...currentNotifications, notification]);
  };
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => {
      return { ...notification, is_read: true };
    });
    setNotifications(updatedNotifications);
  };

  const { chats } = useChat();

  useFocusEffect(
    useCallback(() => {
      fetchData('user_id')
        .then((id) => {
          setUserId(id);
          fetchAuthToken()
            .then((token) => {
              if (id && token) {
                setUserToken(token);
                registerForPushNotificationsAsync(token);
                fetchSubscriptionPlans(token);
              } else {
                navigation.navigate('Auth', { screen: 'LoginScreen' });
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
  );

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        const chat_id = notification.request.content.data.chat_id;
        const shouldShow = notification.request.content.data.shouldShow && chat_id != currentChat;

        return {
          shouldShowAlert: shouldShow,
          shouldPlaySound: shouldShow,
          shouldSetBadge: shouldShow,
        };
      },
    });

    // This listener is fired whenever a notification is received while the app is foregrounded
    Notifications.addNotificationReceivedListener(notification => {

    });

    // This listener is fired whenever a user taps on or interacts with a notification
    Notifications.addNotificationResponseReceivedListener(notification => {
      const data = notification.notification.request.content.data

      if (data.type === 'chat_message') {
        navigation.navigate('Tabs', { screen: 'Chat', params: { chatId: data.chat_id, chatName: data.name, chatImage: data.profile_image } });
      }
    });

  }, [currentChat]);

  useEffect(() => {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });

    return () => {
      Notifications.removeNotificationSubscription();
    };
  }, []);

  if (!userToken) {
    return null;
  }

  const unreadMessagesNumber = Object.values(chats).reduce((acc, chat) => acc + chat.unread, 0);
  const unreadNotificationsNumber = notifications.filter(notification => !notification.is_read).length;

  return (
    <GlobalProvider userToken={userToken} userSubscriptionPlan={userSubscriptionPlan} setUserSubscriptionPlan={setUserSubscriptionPlan} addNotification={addNotification} markAllAsRead={markAllAsRead} setCurrentChat={setCurrentChat}>
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
            tabBarButton: () => null,
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
            tabBarIcon: ({ focused }) =>
              <>
                <Icons name="Chat" size={width * 0.085} fill={focused ? '#CCC' : '#1C274C'} />
                {unreadMessagesNumber > 0 && <View style={{ paddingHorizontal: 2, borderRadius: 4, backgroundColor: 'red', position: 'absolute', top: -4, right: 8 }}>
                  <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>{unreadMessagesNumber}</Text>
                </View>}
              </>,
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
          component={NotificationsScreen}
          options={{
            tabBarIcon: ({ focused }) =>
              <>
                <Icons name="Notifications" size={width * 0.085} fill={focused ? '#CCC' : '#1C274C'} />
                {unreadNotificationsNumber > 0 && <View style={{ paddingHorizontal: 2, borderRadius: 4, backgroundColor: 'red', position: 'absolute', top: -4, right: 8 }}>
                  <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>{unreadNotificationsNumber}</Text>
                </View>}
              </>,
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
    </GlobalProvider>
  )
};

export default TabNavigator;
