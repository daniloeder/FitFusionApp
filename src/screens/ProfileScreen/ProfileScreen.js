import React, { useState, useEffect } from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Image,
  ScrollView,
  Modal,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import GradientBackground from './../../components/GradientBackground/GradientBackground';
import DatePicker from '../../components/Forms/DatePicker';
import Icons from '../../components/Icons/Icons';
import CustomInput from '../../components/Forms/CustomInput';
import * as DocumentPicker from 'expo-document-picker';

const width = Dimensions.get('window').width;

const ProfileScreen = ({ route }) => {
  const { userToken } = route.params;

  const [profile, setProfile] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  const [selectedImages, setSelectedImages] = useState([]);
  const [currentImage, setCurrentImage] = useState(null);

  const [editProfile, setEditProfile] = useState(true); // Set to true to enable editing
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [sex, setSex] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [username, setUsername] = useState(''); // Add a state variable for editing username

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://192.168.0.118:8000/api/users/auth/profile/', {
        method: 'GET',
        headers: {
          Authorization: `Token ${userToken}`,
        },
      });
      const data = await response.json();
      setProfile(data);
      if (data.profile_image && data.profile_image.image) {
        setCurrentImage(data.profile_image.image);
      }
      setUsername(data.username); // Set the initial value for the username
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (selectedImages.length) {
      setCurrentImage(selectedImages[0].uri);
    }
  }, [selectedImages]);

  // Add a function to update the user's profile information
  const updateProfile = async () => {
    try {
      const response = await fetch(`http://192.168.0.118:8000/api/users/update/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + userToken
        },
        body: JSON.stringify({ date_of_birth: dateOfBirth })
      });

      const responseData = await response.json();
      console.log(responseData)
      if (response.ok) {
        Alert.alert('Success', 'Profile updated successfully!');
        ActivateAccount();
      } else {
        let errorMessage = '';
        for (const key in responseData) {
          // Adding each error message to the errorMessage string.
          errorMessage += responseData[key].join('\n') + '\n';
        }
        Alert.alert('Update Error', errorMessage.trim());
      }
    } catch (error) {
      console.error('There was an error:', error);
      Alert.alert('Error', 'There was an error with the update process. Please try again.');
    }
  };

  const updateSelectedImage = (file) => {
    setSelectedImages([file]);
  };

  const onSetProfileImage = async () => {
    if (selectedImages.length === 0) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', {
        uri: selectedImages[0].uri,
        type: 'image/jpeg',
        name: 'profile_image.jpg',
      });

      const uploadResponse = await fetch(
        'http://192.168.0.118:8000/api/users/upload-and-set-profile-image/',
        {
          method: 'POST',
          headers: {
            Authorization: `Token ${userToken}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        }
      );

      const data = await uploadResponse.json();

      if (uploadResponse.ok && data && data.profile_image) {
        setSelectedImages([]);
      } else {
        console.error('Error uploading image:', uploadResponse.status);
      }
    } catch (error) {
      console.error('Error setting profile image:', error);
    }
  };

  // Function to handle document picker
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        updateSelectedImage({
          uri: result.uri,
          name: result.name,
          mimeType: result.type,
        });
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  if (isLoading) return <ActivityIndicator size="large" color="#991B1B" />;

  return (
    <View style={styles.container}>
      <GradientBackground startColor="#991B1B" endColor="blue" />

      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        overScrollMode="never"
      >
        <View style={styles.profileHeader}>
          <Image
            style={styles.avatar}
            source={{ uri: currentImage || 'https://via.placeholder.com/150' }}
          />
          <TouchableOpacity style={styles.setProfileImageIcon} onPress={pickDocument}>
            <Icons name="Edit" />
          </TouchableOpacity>
          {selectedImages.length > 0 && (
            <TouchableOpacity style={styles.setProfileImageButton} onPress={onSetProfileImage}>
              <Text style={styles.setProfileImageButtonText}>Set Profile Image</Text>
            </TouchableOpacity>
          )}
          {editProfile ? (
            <>
              <DatePicker setDate={setDateOfBirth} mode="date" dateType="DD/MM/YYYY" customStyle={styles.timePicker} />

              <Pressable onPress={() => setModalVisible(true)} style={styles.pickerTrigger}>
                <Text style={styles.pickerTriggerText}>
                  {sex
                    ? `Selected: ${sex == 'M' ? 'Male' : sex == 'F' ? 'Female' : 'Other'}`
                    : 'Select Sex'}
                </Text>
              </Pressable>
              <Modal
                transparent={true}
                animationType="slide"
                visible={isModalVisible}
                onRequestClose={() => setModalVisible(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Pressable
                      style={styles.option}
                      onPress={() => {
                        setSex('M');
                        setModalVisible(false);
                      }}
                    >
                      <Text style={styles.optionText}>Male</Text>
                    </Pressable>

                    <Pressable
                      style={styles.option}
                      onPress={() => {
                        setSex('F');
                        setModalVisible(false);
                      }}
                    >
                      <Text style={styles.optionText}>Female</Text>
                    </Pressable>

                    <Pressable
                      style={styles.option}
                      onPress={() => {
                        setSex('O');
                        setModalVisible(false);
                      }}
                    >
                      <Text style={styles.optionText}>Other</Text>
                    </Pressable>
                  </View>
                </View>
              </Modal>
              <Text style={styles.sectionTitle}>Edit Username</Text>
              <CustomInput
                placeholder="Username"
                placeholderTextColor="#656565"
                onChangeText={setUsername}
                value={username}
              />
              <Text style={styles.sectionTitle}>Change Password</Text>
              <CustomInput
                placeholder="New Password"
                placeholderTextColor="#656565"
                onChangeText={setPassword}
                value={password}
                secureTextEntry={true}
              />
              <CustomInput
                placeholder="Confirm Password"
                placeholderTextColor="#656565"
                onChangeText={setPassword2}
                value={password2}
                secureTextEntry={true}
              />
            </>
          ) : (
            <>
              <Text style={styles.username}>{profile.username}</Text>
              <Text style={styles.email}>{profile.email}</Text>

              <View style={styles.profileInfo}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoTitle}>Date of Birth</Text>
                  <Text style={styles.infoData}>{profile.date_of_birth}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.infoTitle}>Sex</Text>
                  <Text style={styles.infoData}>{profile.sex}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.infoTitle}>Favorite Sports</Text>
                  <View style={styles.favoriteSports}>
                    {/* Replace the below line with the actual data */}
                    {true &&
                      ['Soccer', 'Volleyball'].map((sport, index) => (
                        <Text key={index} style={styles.sportItem}>
                          {sport}
                        </Text>
                      ))}
                  </View>
                </View>
              </View>
              {profile.bio ? (
                <>
                  <Text style={styles.sectionTitle}>Bio</Text>
                  <Text style={styles.bio}>{profile.bio}</Text>
                </>
              ) : (
                ''
              )}
            </>
          )}
        </View>

        <TouchableOpacity style={styles.editButton} onPress={editProfile ? updateProfile : () => setEditProfile(true)}>
          <Text style={styles.editButtonText}>{editProfile ? 'Save Profile' : 'Edit Profile'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: width * 0.04,
  },
  avatar: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    marginBottom: width * 0.08,
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
  profileInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: width * 0.04,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: width * 0.04,
    color: '#E2E8F0',
  },
  infoData: {
    fontSize: width * 0.04,
    fontWeight: 'bold',
    color: '#B83030',
  },
  sectionTitle: {
    fontSize: width * 0.05,
    fontWeight: '600',
    marginBottom: width * 0.025,
    color: '#E2E8F0',
  },
  favoriteSports: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: width * 0.04,
  },
  sportItem: {
    padding: width * 0.012,
    backgroundColor: '#888',
    borderRadius: width * 0.05,
    fontSize: width * 0.03,
    margin: width * 0.005,
    color: '#E2E8F0',
  },
  bio: {
    fontSize: width * 0.04,
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
  setProfileImageIcon: {
    margin: width * 0.02,
    padding: width * 0.02,
    backgroundColor: '#DDD',
    borderWidth: 2,
    borderColor: '#FFF',
    borderRadius: width * 0.03,
    alignItems: 'center',
    position: 'absolute',
    right: width * 0.3,
    top: width * 0.35,
    opacity: 0.7,
  },
  setProfileImageButton: {
    margin: width * 0.02,
    padding: width * 0.02,
    backgroundColor: '#B83030',
    borderRadius: width * 0.0125,
    alignItems: 'center',
  },
  setProfileImageButtonText: {
    color: '#E2E8F0',
    fontSize: width * 0.035,
  },

  timePicker: {
    width: '100%',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: '#FFF',
    alignItems: 'center'
  },

  // sex modal picker
  pickerTrigger: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'gray',
    paddingHorizontal: width * 0.025,
    paddingVertical: width * 0.035,
    borderRadius: width * 0.0125,
    backgroundColor: '#AAA',
    marginBottom: width * 0.04,
    backgroundColor: '#FFF'
  },
  pickerTriggerText: {
    color: '#777',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    height: 200,
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    justifyContent: 'space-between',
  },
  option: {
    marginBottom: 10,
  },
  optionText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'left',
  },
});

export default ProfileScreen;
