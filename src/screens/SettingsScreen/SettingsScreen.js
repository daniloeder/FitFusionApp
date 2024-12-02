import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import GradientBackground from './../../components/GradientBackground/GradientBackground';
import { useGlobalContext } from './../../services/GlobalContext';
import { BASE_URL } from '@env';

const SettingsScreen = ({ route, navigation }) => {
  const { userToken, show_online, show_notifications } = route.params;
  const { sendMessage, handleLogout, showNotifications, setShowNotifications, showOnline, setShowOnline, checkConnectionError } = useGlobalContext();

  useEffect(() => {
    if (show_notifications && show_notifications.notifications !== showNotifications) {
      setShowNotifications(show_notifications.notifications);
    }
  }, [show_notifications]);

  useEffect(() => {
    if (show_online && show_online.online !== showOnline) {
      setShowOnline(show_online.online);
    }
  }, [show_online]);

  return (
    <View style={styles.gradientContainer}>
      <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />

      <View style={styles.header}>
        <Text style={styles.headerText}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        overScrollMode="never"
      >
        <TouchableOpacity style={styles.logoutButton} onPress={() => {
          handleLogout();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Auth' }],
          });
          navigation.navigate('Auth', { screen: 'LoginScreen' });
        }}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  scrollContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    opacity: 0.8,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  settingText: {
    fontSize: 16,
  },
  valueText: {
    fontSize: 16,
    color: '#888',
  },
  logoutButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#e53935',
    borderRadius: 5,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default SettingsScreen;
