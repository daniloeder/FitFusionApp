import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const [profile, setProfile] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // Assume user_id is 1, replace it as needed
      const response = await fetch(`http://localhost:8000/api/users/1/`);
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onEditProfile = () => {
    // Navigate to Edit Profile Screen
    // navigation.navigate('EditProfile', { userId: profile.id });
  };

  if (isLoading) return <ActivityIndicator size="large" color="#0000ff" />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <Image
          style={styles.avatar}
          source={{ uri: profile.avatarUrl || 'https://via.placeholder.com/150' }}
        />
        <Text style={styles.username}>{profile.username}</Text>
        <Text style={styles.email}>{profile.email}</Text>
      </View>
      <View style={styles.profileBody}>
        <Text style={styles.sectionTitle}>Favorite Sports</Text>
        {/* List user’s favorite sports here */}
        {/* Replace with actual data */}
        <Text style={styles.sportItem}>Soccer</Text>
        <Text style={styles.sportItem}>Basketball</Text>

        <Text style={styles.sectionTitle}>Events Participated</Text>
        {/* List events participated by the user here */}
        {/* Replace with actual data */}
        <Text style={styles.eventItem}>Community Soccer Match</Text>
        <Text style={styles.eventItem}>Local Basketball Tournament</Text>
      </View>
      <TouchableOpacity style={styles.editButton} onPress={onEditProfile}>
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
  },
  email: {
    fontSize: 16,
    color: 'grey',
    marginTop: 5,
  },
  profileBody: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  sportItem: {
    fontSize: 15,
    marginBottom: 5,
  },
  eventItem: {
    fontSize: 15,
    marginBottom: 5,
  },
  editButton: {
    margin: 20,
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  editButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default ProfileScreen;
