import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, Dimensions, } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import GradientBackground from './../../components/GradientBackground/GradientBackground';
import ShowMedia from '../../components/ShowMedia/ShowMedia';
import Icons from '../../components/Icons/Icons';
import { SportsNames } from '../../utils/sports';

const width = Dimensions.get('window').width;

const ProfileScreen = ({ route }) => {
    let { userToken, id } = route.params;

    const [profile, setProfile] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const navigation = useNavigation();

    const iconNamesByIndex = ["BodyBuilding", "Soccer", "Basketball", "Tennis", "Baseball", "AmericanFootball", "Golf", "Cricket", "Rugby", "Volleyball", "TableTennis", "Badminton", "IceHockey", "FieldHockey", "Swimming", "TrackAndField", "Boxing", "Gymnastics", "MartialArts", "Cycling", "Equestrian", "Fencing", "Bowling", "Archery", "Sailing", "CanoeingKayaking", "Wrestling", "Snowboarding", "Skiing", "Surfing", "Skateboarding", "RockClimbing", "MountainBiking", "RollerSkating", "Other"];

    const fetchProfile = async (id) => {
        try {
            const response = await fetch(`http://192.168.0.118:8000/api/users/user/${id}/`, {
                method: 'GET',
                headers: {
                    Authorization: `Token ${userToken}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                setProfile(data);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile(id);
    }, [id]);

    if (isLoading) return <ActivityIndicator size="large" color="#991B1B" />;

    return (
        <View style={styles.container}>
            <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />

            <ScrollView
                style={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                overScrollMode="never"
            >
                {profile.id == id ?
                    <>
                        <View style={styles.profileHeader}>
                            <Image
                                style={styles.avatar}
                                source={{ uri: profile.profile_image ? 'http://192.168.0.118:8000/' + profile.profile_image.image : 'https://via.placeholder.com/150' }}
                            />
                            <Text style={styles.username}>@{profile.username}</Text>
                            <Text style={styles.name}>{profile.name}</Text>

                            <View style={styles.profileInfo}>

                                <View style={styles.infoItem}>
                                    <Text style={styles.infoTitle}>Age</Text>
                                    <Text style={styles.infoData}>{profile.age}</Text>
                                </View>

                                <View style={styles.infoItem}>
                                    <Text style={styles.infoTitle}>Sex</Text>
                                    <Text style={styles.infoData}>{profile.sex == 'M' ? "Male" : profile.sex == 'F' ? "Female" : "Other"}</Text>
                                </View>

                            </View>

                            {profile.favorite_sports && profile.favorite_sports.length ?
                                <View style={styles.infoItem}>
                                    <Text style={styles.infoTitle}>Favorite Sports</Text>
                                    <View style={styles.favoriteSports}>
                                        {profile.favorite_sports.slice(0, 3).map((sport, index) =>
                                            <View key={sport} style={styles.sportItem}>
                                                <Text style={{ color: '#FFF', fontSize: width * 0.03 }}>
                                                    {SportsNames([sport])}
                                                </Text>
                                                <Icons name={iconNamesByIndex[(sport - 1)]} size={width * 0.05} style={{ marginLeft: 5 }} />
                                            </View>
                                        )}
                                    </View>
                                </View> : ''
                            }

                            {profile.bio ?
                                <View style={styles.infoItem}>
                                    <Text style={styles.infoTitle}>Bio</Text>
                                    <Text style={styles.bio}>{profile.bio}</Text>
                                </View>
                                : ''}
                        </View>
                        {profile.user_images && profile.user_images.length ?

                            <View
                                style={styles.userImagesContainer}
                            >
                                {profile.user_images.map((image, index) => {
                                    return (
                                        <View key={index}
                                            style={styles.userImagesItems}
                                        >
                                            <ShowMedia media={`http://192.168.0.118:8000/${image.image}`} size={width * 0.26} />
                                        </View>
                                    )
                                })}
                            </View>
                            : ''
                        }
                    </>
                    : ''
                }


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
    favoriteSports: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: width * 0.04,
    },
    sportItem: {
        padding: width * 0.012,
        backgroundColor: '#888',
        borderRadius: width * 0.05,
        margin: width * 0.005,
        flexDirection: 'row',
        alignItems: 'center',
    },
    bio: {
        fontSize: width * 0.04,
        color: '#E2E8F0',
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
});


export default ProfileScreen;
