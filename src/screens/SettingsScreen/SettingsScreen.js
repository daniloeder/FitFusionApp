import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import GradientBackground from './../../components/GradientBackground/GradientBackground';
import { useGlobalContext } from './../../services/GlobalContext';
import { BASE_URL } from '@env';

const SettingsScreen = ({ route, navigation }) => {
  const { userToken } = route.params;
  const [isNotificationEnabled, setNotificationEnabled] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const { handleLogout } = useGlobalContext();

  const createPersonalTrainerAccount = async () => {
    try {
      const response = await fetch(BASE_URL + '/api/exercises/personal-trainer/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${userToken}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        navigation.navigate('FitnessScreen', { personalTrainer: true })
      } else if (response.status === 400) {
        Alert.alert('Error creating personal trainer account', data.error);
      }
    } catch (error) {
      Alert.alert('Error creating personal trainer account', error);
    }
  };

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
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Notifications</Text>
          <Switch
            value={isNotificationEnabled}
            onValueChange={setNotificationEnabled}
            thumbColor={isNotificationEnabled ? "#007bff" : "#ccc"}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
          />
        </View>

        <TouchableOpacity style={styles.settingRow} onPress={() => {/* Navigate to Language Selection Screen */ }}>
          <Text style={styles.settingText}>Language</Text>
          <Text style={styles.valueText}>{selectedLanguage}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{
          justifyContent: 'center',
          backgroundColor: '#2196F3',
          padding: 10,
          borderRadius: 5,
          alignItems: 'center',
          marginTop: 10,
        }}
          onPress={() => {
            Alert.alert('Create Personal Trainer Account', 'Are you a professional personal trainer?', [
              {
                text: 'Yes',
                onPress: () => createPersonalTrainerAccount(),
              },
              {
                text: 'No',
              },
            ]);
          }}
        >
          <Text style={{
            color: '#fff',
            fontSize: 16,
            fontWeight: 'bold',
          }}>
            Create Personal Trainer Account
          </Text>
        </TouchableOpacity>


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
