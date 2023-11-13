import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Dimensions, Modal, Pressable, Image } from 'react-native';
import GradientBackground from './../../components/GradientBackground/GradientBackground';
import ShowMedia from '../../components/ShowMedia/ShowMedia';
import { ShowOnMap } from '../../components/GoogleMaps/GoogleMaps.js';
import Icons from '../../components/Icons/Icons';
import { SportsNames } from '../../utils/sports';

const width = Dimensions.get('window').width;

const PlaceScreen = ({ route, navigation }) => {
    const userToken = route.params.userToken;
    const [place, setPlace] = useState(null);
    const placeId = 20//route.params.placeId;

    const [isVideoModalVisible, setVideoModalVisible] = useState(false);

    useEffect(() => {
        if (placeId) {
            fetchPlace();
        } else {
            Alert.alert('Place error.');
        }
    }, [placeId]);

    const fetchPlace = async () => {
        try {
            const response = await fetch(`http://192.168.0.118:8000/api/places/${placeId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${userToken}`,
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPlace(data);
            } else {
                Alert.alert(response.status === 404 ? 'Place not Found.' : 'Unknown error on fetching place.');
            }
        } catch (error) {
            console.error('Error fetching place:', error);
        }
    };

    const toggleVideoModal = () => {
        setVideoModalVisible(!isVideoModalVisible);
    };

    if (!place || !place.coordinates) return <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />;
    const [longitude, latitude] = place.coordinates.match(/-?\d+\.\d+/g).map(Number);

    return (
        <View style={styles.gradientContainer}>
            <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />

            <ScrollView style={styles.container}>
                {/* Place details display */}
                <Text style={styles.title}>{place.name}</Text>

                {/* Location display */}
                <View style={styles.infoBlock}>
                    <Icons name="Map2" size={width * 0.07} style={styles.infoIcons} />
                    <Text style={styles.location}>{place.location}</Text>
                </View>
                {place.coordinates ? <ShowOnMap coordinates={{ 'latitude': latitude, 'longitude': longitude }} /> : null}

                {/* Sports types display */}
                <View style={styles.infoBlock}>
                    <Icons name="Sport" size={width * 0.055} style={[styles.infoIcons, { marginBottom: 'auto', paddingTop: width * 0.08 }]} />
                    <Text style={styles.sportType}>
                        {place.sport_types.length ? SportsNames(place.sport_types).join(', ') : ''}
                    </Text>
                </View>

                {/* Description display */}
                <View style={styles.infoBlock}>
                    <Icons name="Description" size={width * 0.055} style={[styles.infoIcons, { marginBottom: 'auto', paddingTop: width * 0.07 }]} />
                    <Text style={styles.description}>{place.description}</Text>
                </View>
                {/* Media display */}
                {place.photos && place.photos.length ?
                    <View style={styles.mediaSection}>
                        <Text style={styles.mediaTitle}>Images</Text>
                        <View style={styles.mediaContainer}>
                            {place.photos.map((photo, index) => (
                                <ShowMedia key={index} media={photo.photo} isVideo={false} />
                            ))}
                        </View>
                    </View>
                    : null
                }

                {place.videos && place.videos.length ?
                    <View style={styles.mediaSection}>
                        <Text style={styles.mediaTitle}>Videos</Text>
                        <Pressable onPress={toggleVideoModal} style={styles.videoThumbnail}>
                            {/* Placeholder for video thumbnail */}
                            <Icons name="PlayVideo" size={width * 0.3} />
                        </Pressable>
                    </View>
                    : null
                }

                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={isVideoModalVisible}
                    onRequestClose={toggleVideoModal}
                >
                    <View style={styles.modalView}>
                        {place.videos && place.videos.map((video, index) => (
                            <ShowMedia key={index} media={video.video} isVideo={true} />
                        ))}
                    </View>
                </Modal>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    gradientContainer: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: width * 0.04,
    },
    infoBlock: {
        width: width * 0.82,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: width * 0.05,
    },
    title: {
        fontSize: width * 0.06,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: width * 0.025,
    },
    location: {
        fontSize: width * 0.056,
        color: '#A0AEC0',
    },
    sportType: {
        fontSize: width * 0.045,
        color: '#3182CE',
    },
    description: {
        fontSize: width * 0.045,
        color: '#CCCCCC',
    },
    infoIcons: {
        marginRight: width * 0.025,
    },
    // Additional styles can be added as needed
});

export default PlaceScreen;