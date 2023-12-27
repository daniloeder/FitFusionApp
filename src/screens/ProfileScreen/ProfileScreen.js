import React, { useState, useEffect } from 'react';
import { Alert, View, Text, StyleSheet, TouchableOpacity, Pressable, Image, ScrollView, Modal, ActivityIndicator, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import GradientBackground from './../../components/GradientBackground/GradientBackground';
import DatePicker from '../../components/Forms/DatePicker';
import ShowMedia from '../../components/ShowMedia/ShowMedia';
import UploadPicker from '../../components/UploadPicker/UploadPicker';
import SportsItems from '../../components/SportsItems/SportsItems';
import Icons from '../../components/Icons/Icons';
import CustomInput from '../../components/Forms/CustomInput';
import CustomPicker from '../../components/CustomPicker/CustomPicker';
import * as DocumentPicker from 'expo-document-picker';
import QRGenerator from '../../components/QRScanner/QRGenerator';
import { SportsNames, SportsTypes } from '../../utils/sports';
import { BASE_URL } from '@env';

const width = Dimensions.get('window').width;

const ProfileScreen = ({ route }) => {
  const { userToken } = route.params;

  const [profile, setProfile] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  const [selectedProfileImage, setSelectedProfileImage] = useState([]);
  const [currentImage, setCurrentImage] = useState(null);

  const [editProfile, setEditProfile] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [username, setUsername] = useState('');

  const [bio, setBio] = useState('');
  const [favoriteSports, setFavoriteSports] = useState([]);

  const [selectedImages, setSelectedImages] = useState([]);
  const [editImages, setEditImages] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await fetch(BASE_URL + '/api/users/profile/', {
        method: 'GET',
        headers: {
          Authorization: `Token ${userToken}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setProfile(data);
        setUsername(data.username);
        setGender(data.gender);
        setBio(data.bio || '');
        setDateOfBirth(data.date_of_birth);
        setFavoriteSports(data.favorite_sports);
        if (data.user_images) {
          setSelectedImages(data.user_images);
        }
      }
      if (data.profile_image && data.profile_image.image) {
        setCurrentImage(BASE_URL + data.profile_image.image);
      }
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
    if (selectedProfileImage.length) {
      setCurrentImage(selectedProfileImage[0].uri);
    }
  }, [selectedProfileImage]);

  const updateExistingImages = async () => {
    const existingImagesData = selectedImages.map((img, index) => ({
      id: img.id,
      image_id: index + 1
    }));

    const response = await fetch(BASE_URL + '/api/users/update-existing-images/', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ images: existingImagesData })
    });

    if (response.ok) {
      setEditImages(false);
      uploadImages();
    }
  };

  const uploadImages = async () => {
    setEditImages(false);
    try {
      // Filter out already uploaded images and only keep new ones
      const newImages = selectedImages.filter(img => !img.image);

      for (let i = 0; i < newImages.length; i++) {
        const img = newImages[i];
        const imageId = selectedImages.indexOf(img) + 1;

        const formData = new FormData();
        formData.append('image_id', imageId);
        formData.append('image', {
          uri: img.uri,
          type: img.mimeType,
          name: img.name,
        });

        const response = await fetch(BASE_URL + '/api/users/upload-image/', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${userToken}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData
        });

        if (response.ok) {
          //setEditImages(false);
        } else {
          const errorData = await response.json();
          console.error("Server error response:", errorData);
          break;
        }

      }
    } catch (error) {
      console.error('Error:', error);
    }
    fetchProfile();
  };

  const updateProfile = async () => {
    const requestBody = {};
    if (dateOfBirth) {
      requestBody.date_of_birth = dateOfBirth;
    }
    if (gender) {
      requestBody.gender = gender;
    }
    if (password) {
      requestBody.password = password;
    }
    if (username != profile.username) {
      requestBody.username = username;
    }
    if (bio) {
      requestBody.bio = bio;
    }
    if (favoriteSports.length > 0) {
      requestBody.favorite_sports = favoriteSports.map(sport => sport.id || sport);
    }
    try {
      const response = await fetch(BASE_URL + '/api/users/update/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${userToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Profile updated successfully!');
        fetchProfile();
        setEditProfile(false);
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

  const updateSelectedProfileImage = (file) => {
    setSelectedProfileImage([file]);
  };

  const onSetProfileImage = async () => {
    if (selectedProfileImage.length === 0) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', {
        uri: selectedProfileImage[0].uri,
        type: 'image/jpeg',
        name: 'profile_image.jpg',
      });

      const uploadResponse = await fetch(
        BASE_URL + '/api/users/upload-and-set-profile-image/',
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
        setSelectedProfileImage([]);
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
        updateSelectedProfileImage({
          uri: result.uri,
          name: result.name,
          mimeType: result.type,
        });
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  return (
    <View style={styles.container}>
      <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />
      {isLoading ? <ActivityIndicator size="large" color="#FFF" />
        :
        <ScrollView
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          overScrollMode="never"
        >
          <Modal
            animationType="fade"
            transparent={true}
            visible={showQRCode}
            onRequestClose={() => setShowQRCode(false)}
          >
            <View style={styles.QRCodeModalContainer}>
              <View style={styles.QRCodeModalContent}>
                <Text style={styles.QRCodeModalTitle}>@{profile.username} QR Code</Text>

                <QRGenerator object={{ type: 'fit_fusion_user', id: profile.id }} />

                <TouchableOpacity
                  style={{ backgroundColor: '#CCC', marginTop: width * 0.1, width: width * 0.5, height: width * 0.1, alignItems: 'center', justifyContent: 'center' }}
                  onPress={() => {
                    setShowQRCode(false);
                  }}
                >
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Pressable
            onPress={() => navigation.navigate('Settings')}
            style={styles.settingsButton}
          >
            <Icons name="Settings" size={width * 0.1} />
          </Pressable>

          <View style={styles.profileHeader}>
            <View style={{ width: '100%', alignItems: 'center' }}>
              {currentImage ?
                <Image
                  style={styles.avatar}
                  source={{ uri: currentImage }}
                />
                :
                <View style={{ padding: width * 0.04, borderRadius: width * 0.3, backgroundColor: 'rgba(255,255,255,0.4)' }}>
                  <Icons name="Profile" size={width * 0.4} fill={"#1C274C"} />
                </View>

              }
              {!editProfile &&
                <TouchableOpacity
                  style={styles.QRButton}
                  onPress={() => {
                    setShowQRCode(true);
                  }}
                >
                  <Icons name="QRCode" size={width * 0.15} />
                </TouchableOpacity>}
            </View>
            {editProfile ? (
              <>
                <TouchableOpacity style={styles.setProfileImageIcon} onPress={pickDocument}>
                  <Icons name="Edit" />
                </TouchableOpacity>
                {selectedProfileImage.length > 0 && (
                  <TouchableOpacity style={styles.setProfileImageButton} onPress={onSetProfileImage}>
                    <Text style={styles.setProfileImageButtonText}>Set Profile Image</Text>
                  </TouchableOpacity>
                )}

                <Text style={styles.inputTitles}>Date of birth</Text>
                <DatePicker date={dateOfBirth} setDate={setDateOfBirth} mode="date" dateType="DD/MM/YYYY" customStyle={styles.timePicker} />

                <Text style={styles.inputTitles}>Gender</Text>
                <Pressable onPress={() => setModalVisible(true)} style={styles.pickerTrigger}>
                  <Text style={styles.pickerTriggerText}>
                    {gender
                      ? `Selected: ${gender == 'M' ? 'Male' : gender == 'F' ? 'Female' : 'Other'}`
                      : 'Select Gender'}
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
                          setGender('M');
                          setModalVisible(false);
                        }}
                      >
                        <Text style={styles.optionText}>Male</Text>
                      </Pressable>

                      <Pressable
                        style={styles.option}
                        onPress={() => {
                          setGender('F');
                          setModalVisible(false);
                        }}
                      >
                        <Text style={styles.optionText}>Female</Text>
                      </Pressable>

                      <Pressable
                        style={styles.option}
                        onPress={() => {
                          setGender('O');
                          setModalVisible(false);
                        }}
                      >
                        <Text style={styles.optionText}>Other</Text>
                      </Pressable>
                    </View>
                  </View>
                </Modal>

                <Text style={styles.inputTitles}>Username</Text>
                <CustomInput
                  placeholder="Username"
                  placeholderTextColor="#656565"
                  onChangeText={setUsername}
                  value={username}
                />

                <Text style={styles.sectionTitle}>Bio</Text>
                <Text style={styles.inputTitles}>Bio Description</Text>
                <CustomInput
                  placeholder="Bio"
                  placeholderTextColor="#656565"
                  onChangeText={setBio}
                  value={bio}
                />

                <Text style={styles.inputTitles}>Favorite Sports</Text>
                <CustomPicker options={Object.values(SportsTypes('en'))} selectedOptions={SportsNames(numbers = favoriteSports.map(sport => sport.id || sport), index = true)} setSelectedOptions={setFavoriteSports} max={5} />

                {!profile.social ?
                  <>
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
                  </> : ''
                }

              </>
            ) : (
              <>
                <Text style={styles.username}>@{profile.username}</Text>
                <Text style={styles.name}>{profile.name}</Text>

                <View style={styles.profileInfo}>

                  <View style={styles.infoItem}>
                    <Text style={styles.infoTitle}>Age</Text>
                    <Text style={styles.infoData}>{profile.age}</Text>
                  </View>

                  <View style={styles.infoItem}>
                    <Text style={styles.infoTitle}>Date of Birth</Text>
                    <Text style={styles.infoData}>{profile.date_of_birth}</Text>
                  </View>

                  <View style={styles.infoItem}>
                    <Text style={styles.infoTitle}>Gender</Text>
                    <Text style={styles.infoData}>{profile.gender == 'M' ? "Male" : profile.gender == 'F' ? "Female" : "Other"}</Text>
                  </View>

                </View>

                {profile.favorite_sports && profile.favorite_sports.length ?
                  <View style={styles.infoItem}>
                    <Text style={styles.infoTitle}>Favorite Sports</Text>
                    <SportsItems favoriteSports={profile.favorite_sports} />
                  </View> : ''
                }

                {profile.bio ?
                  <View style={styles.infoItem}>
                    <Text style={styles.infoTitle}>Bio</Text>
                    <Text style={styles.bio}>{profile.bio}</Text>
                  </View>
                  : ''}
              </>
            )}
          </View>

          {editProfile ?
            <>
              <TouchableOpacity style={styles.editButton} onPress={updateProfile}>
                <Text style={styles.editButtonText}>Save Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.editButton, { marginBottom: width * 0.1 }]} onPress={() => setEditProfile(false)}>
                <Text style={styles.editButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
            :
            <>
              <TouchableOpacity style={styles.editButton} onPress={() => setEditProfile(true)}>
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.editButton, { marginBottom: width * 0.1 }]} onPress={() => navigation.navigate('Settings')}>
                <Text style={styles.editButtonText}>Settings</Text>
              </TouchableOpacity>
            </>
          }

          {editImages ?
            <UploadPicker
              selectedImages={selectedImages}
              setSelectedImages={setSelectedImages}
              max={5}
              upload={updateExistingImages}
              setEditImages={setEditImages}
              cancel
            />
            :
            <>
              {profile.user_images && profile.user_images.length ?
                <View
                  style={styles.userImagesContainer}
                >
                  {profile.user_images.map((image, index) => {
                    return (
                      <View key={index}
                        style={styles.userImagesItems}
                      >
                        <ShowMedia media={BASE_URL + `${image.image}`} size={width * 0.26} />
                      </View>
                    )
                  })}
                </View>
                : ''
              }
              <TouchableOpacity style={[styles.editButton, { marginBottom: width * 0.1 }]} onPress={() => {
                setEditImages(true);
              }}>
                <Text style={styles.editButtonText}>{profile.user_images && profile.user_images.length ? "Edit Images" : "Add Images"}</Text>
              </TouchableOpacity>
            </>
          }

        </ScrollView>
      }
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
  QRButton: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: 4,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    bottom: width * 0.08,
  },
  name: {
    fontSize: width * 0.06,
    fontWeight: '800',
    color: '#E2E8F0',
  },
  username: {
    fontSize: width * 0.05,
    color: '#E2E8F0',
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
  inputTitles: {
    color: '#FFF',
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
  userImagesContainer: {
    width: '90%',
    paddingVertical: width * 0.01,
    marginLeft: '5%',
    borderRadius: width * 0.02,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  userImagesItems: {
    width: width * 0.26,
    height: width * 0.26,
    margin: width * 0.01,
    position: 'relative',
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
  settingsButton: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: width * 0.06,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    position: 'absolute',
    right: '3%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // gender modal picker
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

  //QR Modal
  QRCodeModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  QRCodeModalContent: {
    width: '80%',
    maxHeight: '90%',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  QRCodeModalTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default ProfileScreen;
