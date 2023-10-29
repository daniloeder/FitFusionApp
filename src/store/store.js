import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Store data securely in Expo SecureStore
export async function storeAuthToken(token, serviceName = 'userToken') {
  try {
    await SecureStore.setItemAsync(serviceName, token);
    console.log('stored token', serviceName, token)
    return true;
  } catch (error) {
    console.error('Error storing token:', error);
    return false;
  }
}

// Fetch data securely from Expo SecureStore
export async function fetchAuthToken(serviceName = 'userToken') {
  try {
    const token = await SecureStore.getItemAsync(serviceName);
    return token;
  } catch (error) {
    console.error('Error fetching token:', error);
    return null;
  }
}

// Store data using @react-native-async-storage/async-storage
export async function storeData(data, key) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error storing data:', error);
    return false;
  }
}

// Fetch data using @react-native-async-storage/async-storage
export async function fetchData(key) {
  try {
    const dataString = await AsyncStorage.getItem(key);
    if (dataString) {
      const data = JSON.parse(dataString);
      return data;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}