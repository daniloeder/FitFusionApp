import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
} from 'react-native';

const SettingsScreen = () => {
  const [isNotificationEnabled, setNotificationEnabled] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  
  const handleLogout = () => {
    // Implement logout functionality here
    console.log('User Logged Out');
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.settingRow}>
        <Text style={styles.settingText}>Notifications</Text>
        <Switch
          value={isNotificationEnabled}
          onValueChange={setNotificationEnabled}
        />
      </View>
      
      <TouchableOpacity style={styles.settingRow} onPress={() => {/* Navigate to Language Selection Screen */}}>
        <Text style={styles.settingText}>Language</Text>
        <Text style={styles.valueText}>{selectedLanguage}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
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
