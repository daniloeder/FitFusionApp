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
import { Dimensions } from 'react-native';
import GradientBackground from './../../components/GradientBackground/GradientBackground';

const width = Dimensions.get('window').width;

const ProfileScreen = ({ route }) => {
  const { userToken } = route.params;

  const [profile, setProfile] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`http://192.168.0.118:8000/api/users/1/`);
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

  if (isLoading) return <ActivityIndicator size="large" color="#991B1B" />;

  return (
    <View style={styles.gradientContainer}>

      <GradientBackground startColor="#991B1B" endColor="#1A202C" />

      <ScrollView style={styles.container}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        overScrollMode="never"
      >
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
          <Text style={styles.sportItem}>Soccer</Text>
          <Text style={styles.sportItem}>Basketball</Text>
          <Text style={styles.sectionTitle}>Events Participated</Text>
          <Text style={styles.eventItem}>Community Soccer Match</Text>
          <Text style={styles.eventItem}>Local Basketball Tournament</Text>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={onEditProfile}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </ScrollView>

    </View>
  );
};


const styles = StyleSheet.create({

  gradientContainer: {
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: width * 0.04,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: width * 0.025,
  },
  username: {
    fontSize: width * 0.06,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  email: {
    fontSize: width * 0.045,
    color: '#CBD5E0',
    marginBottom: width * 0.04,
  },
  profileBody: {
    padding: width * 0.04,
  },
  sectionTitle: {
    fontSize: width * 0.05,
    fontWeight: '600',
    marginBottom: width * 0.025,
    color: '#E2E8F0',
  },
  sportItem: {
    fontSize: width * 0.04,
    marginBottom: width * 0.02,
    color: '#E2E8F0',
  },
  eventItem: {
    fontSize: width * 0.04,
    marginBottom: width * 0.02,
    color: '#E2E8F0',
  },
  editButton: {
    margin: width * 0.04,
    padding: width * 0.03,
    backgroundColor: '#B83030',
    borderRadius: width * 0.0125,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#E2E8F0',
    fontSize: width * 0.045,
  },
});

export default ProfileScreen;