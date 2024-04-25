import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, Image } from 'react-native';
import Icons from '../Icons/Icons';
import { BASE_URL } from '@env';

const iconNamesByIndex = ["BodyBuilding", "Soccer", "Basketball", "Tennis", "Baseball", "AmericanFootball", "Golf", "Cricket", "Rugby", "Volleyball", "TableTennis", "Badminton", "IceHockey", "FieldHockey", "Swimming", "TrackAndField", "Boxing", "Gymnastics", "MartialArts", "Cycling", "Equestrian", "Fencing", "Bowling", "Archery", "Sailing", "CanoeingKayaking", "Wrestling", "Snowboarding", "Skiing", "Surfing", "Skateboarding", "RockClimbing", "MountainBiking", "RollerSkating", "Other"];

const width = Dimensions.get('window').width;

const UsersBall = ({ user, onPress, name='name', size = 1, nameColor = "#FFF" }) => {
    const [usersPictures, setUserPictures] = useState(null);

    const fetchUserProfileImages = async (participants) => {
        if (participants.length) {
            try {
                const response = await fetch(BASE_URL + `/api/users/get-user-profile-images/?user_ids=${participants.join()}`);
                const data = await response.json();
                if (response.ok) {
                    setUserPictures(data)
                }
            } catch (error) {
                console.error('Error fetching user profile images:', error);
            }
        }
    };
    useEffect(() => {
        //fetchUserProfileImages(user.map((user) => user.id));
    }, [user]);

    const styles = StyleSheet.create({
        userCard: {
            width: width * 0.2 * size,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: width * 0.03,
            margin: 2,
        },
        userCardInner: {
            width: width * 0.2 * size,
            height: width * 0.2 * size,
            borderRadius: width * 0.1 * size,
            backgroundColor: '#FFF',
            borderWidth: 2 * size,
            borderColor: '#DDD',
            alignItems: 'center',
            justifyContent: 'center',
        },
        userImage: {
            width: '100%',
            height: '100%',
            borderRadius: width * 0.1 * size,
        },
        userCardIcons: {
            position: 'absolute',
            width: '100%',
            bottom: 0,
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        favoriteSportIcon: {
            borderRadius: 20,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            padding: width * 0.005 * size,
        },
        favoriteSportIconSpecial: {
            position: 'absolute',
            right: 0,
            top: -width * 0.14 * size,
        },
        usernameText: {
            fontSize: width * 0.03 * size,
            color: nameColor,
            fontWeight: 'bold',
            marginBottom: 'auto',
        }
    });
    
    return (
        <View style={styles.userCard}>
            <TouchableOpacity
                onPress={() => onPress && onPress(user.id)}
                style={[styles.userCardInner, { borderColor: user.gender === 'M' ? '#0033FF' : user.gender === 'F' ? '#FF3399' : '#DDD' }]}
            >
                {user.profile_image ?
                    <Image
                        source={{ uri: `data:image/jpeg;base64,${user.profile_image}` }}
                        style={styles.userImage}
                        onError={(error) => console.error('Image Error:', error)}
                    />
                    :
                    <Icons name="Profile" size={width * 0.14 * size} fill={"#1C274C"} />
                }

                <View style={styles.userCardIcons}>
                    {user.favorite_sports.slice(0, 3).map((sport, index) => {
                        return (
                            <View key={sport} style={[styles.favoriteSportIcon, index === 1 ? styles.favoriteSportIconSpecial : {}]}>
                                <Icons name={iconNamesByIndex[(sport - 1)]} size={width * 0.05 * size} />
                            </View>
                        )
                    })}
                </View>
            </TouchableOpacity>
            <Text style={styles.usernameText}>{user[name]}</Text>
        </View>
    )

};

export default UsersBall;