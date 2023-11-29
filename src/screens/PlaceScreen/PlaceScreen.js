import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Dimensions, Modal, Pressable, TouchableOpacity } from 'react-native';
import GradientBackground from './../../components/GradientBackground/GradientBackground';
import ShowMedia from '../../components/ShowMedia/ShowMedia';
import OpenTimesTable from '../../components/OpenTimesTable/OpenTimesTable.js';
import SportsItems from '../../components/SportsItems/SportsItems.js';
import { ShowOnMap } from '../../components/GoogleMaps/GoogleMaps.js';
import Icons from '../../components/Icons/Icons';

const width = Dimensions.get('window').width;

const PlaceScreen = ({ route, navigation }) => {
    const { userId, userToken } = route.params;
    const [place, setPlace] = useState(null);
    const placeId = route.params.placeId;
    const [joined, setJoined] = useState('none');
    const [participants, setParticipants] = useState([]);
    const [participantsModalVisible, setParticipantsModalVisible] = useState(false);
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
                if (data.joined) {
                    setJoined('joined');
                }
                setParticipants(data.participants);

            } else {
                Alert.alert(response.status === 404 ? 'Place not Found.' : 'Unknown error on fetching place.');
            }
        } catch (error) {
            console.error('Error fetching place:', error);
        }
    };
    const onJoinLeaveEvent = async () => {
        if (false) {
            setJoined(!joined)
            return
        }
        try {
            const response = await fetch(`http://192.168.0.118:8000/api/places/${placeId}/${joined === "joined" || joined === "requested" ? 'leave' : 'join'}/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${userToken}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();

            if (response.status === 200) {
                if (data.status === "joined") {
                    setJoined("joined");
                } else if (data.status === "requested") {
                    setJoined("requested");
                } else if (data.status === "removed_request" || data.status === "removed") {
                    setJoined("none");
                }
            } else if (response.status === 400) {
                setJoined("none");
            } else {
                console.error('Failed to join the event.');
            }
        } catch (error) {
            console.error('An error occurred:', error);
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

                {place.created_by == userId ?
                    <Pressable
                        onPress={() => navigation.navigate('Manage Place', { placeId: placeId })}
                        style={styles.createEventButton}
                    >
                        <Icons name="Settings" size={width * 0.08} />
                        <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: width * 0.035, marginLeft: '3%' }}>Manage Place</Text>
                    </Pressable> : ''
                }

                <Text style={styles.title}>{place.name}</Text>

                <View style={styles.infoBlock}>
                    <Icons name="Map2" size={width * 0.07} style={styles.infoIcons} />
                    <Text style={styles.location}>{place.location}</Text>
                </View>
                {place.coordinates ? <ShowOnMap coordinates={{ 'latitude': latitude, 'longitude': longitude }} /> : null}

                <View style={[styles.infoBlock, { marginTop: width * 0.05 }]}>
                    <Icons name="Sport" size={width * 0.055} style={[styles.infoIcons, { marginBottom: 'auto', paddingTop: width * 0.08 }]} />
                    <SportsItems favoriteSports={place.sport_types_keys} />
                </View>

                {place.created_by != userId ?
                    joined === "joined" ?
                        <>
                            <TouchableOpacity style={[styles.button, { backgroundColor: 'red' }]} onPress={onJoinLeaveEvent}>
                                <Text style={styles.buttonText}>Leave Event</Text>
                            </TouchableOpacity>
                            <View>
                                <Text style={[styles.joinText, { color: '#22AA00' }]}>
                                    You joined this event.
                                </Text>
                            </View>
                        </>
                        : joined === "none" ?
                            <>
                                <TouchableOpacity style={[styles.button, { backgroundColor: 'green' }]} onPress={onJoinLeaveEvent}>
                                    <Text style={styles.buttonText}>{place.is_privated ? "Request to Join Event" : "Join Event"}</Text>
                                </TouchableOpacity>
                                <View>
                                    <Text style={[styles.joinText, { color: '#AAA' }]}>
                                        You are not at this event.{place.is_privated ? " (Privated)" : ""}
                                    </Text>
                                </View>
                            </>
                            : joined === "requested" ?
                                <>
                                    <TouchableOpacity style={[styles.button, { backgroundColor: '#CCC' }]} onPress={onJoinLeaveEvent}>
                                        <Text style={styles.buttonText}>Remove Request</Text>
                                    </TouchableOpacity>
                                    <View>
                                        <Text style={[styles.joinText, { color: '#AAA' }]}>
                                            You requested to join this event.
                                        </Text>
                                    </View>
                                </>
                                : ''
                    : ''
                }

                <View style={styles.infoBlock}>
                    <Icons name="Watch" size={width * 0.055} style={[styles.infoIcons, { marginBottom: 'auto', paddingTop: width * 0.08 }]} />
                    <OpenTimesTable openTimes={place.open_times} />
                </View>

                <View style={styles.infoBlock}>
                    <Icons name="Description" size={width * 0.055} style={[styles.infoIcons, { marginBottom: 'auto', paddingTop: width * 0.07 }]} />
                    <Text style={styles.description}>{place.description}</Text>
                </View>

                {place.place_images && place.place_images.length ?
                    <View
                        style={styles.userImagesContainer}
                    >
                        <View style={styles.infoBlock}>
                            <Icons name="Images" size={width * 0.07} style={styles.infoIcons} />
                        </View>
                        {place.place_images.map((image, index) => {
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
                {place.place_videos && place.place_videos.length ?
                    <View
                        style={styles.userImagesContainer}
                    >
                        <View style={[styles.infoBlock, { justifyContent: 'center' }]}>
                            <Icons name="Images" size={width * 0.07} style={[styles.infoIcons, { position: 'absolute', left: 0, top: 0 }]} />
                            <Pressable onPress={toggleVideoModal} >
                                <Icons name="PlayVideo" size={width * 0.25} style={{ backgroundColor: '#DDD' }} />
                            </Pressable>
                        </View>
                    </View>
                    : ''
                }

                {place.place_videos && place.place_videos.length ?
                    <Modal
                        animationType="slide"
                        transparent={false}
                        visible={isVideoModalVisible}
                        onRequestClose={toggleVideoModal}
                        style={{ width: '100%', backgroundColor: '#000' }}
                    >
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', backgroundColor: '#000' }}>
                            <TouchableOpacity activeOpacity={1}
                                style={{ width: '100%', height: '100%', backgroundColor: '#000' }}
                            >
                                <ShowMedia
                                    media={`http://192.168.0.118:8000/${place.place_videos[0].video}`}
                                    isVideo={true}
                                    style={{ width: width, height: width * (9 / 16) }}
                                />
                            </TouchableOpacity>
                        </View>
                    </Modal>
                    : ''
                }

                <View style={{ marginBottom: 100 }}></View>
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
    createEventButton: {
        height: width * 0.12,
        paddingHorizontal: width * 0.05,
        borderRadius: width * 0.06,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        marginLeft: 'auto',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
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
    button: {
        opacity: 0.8,
        paddingVertical: width * 0.025,
        paddingHorizontal: width * 0.038,
        borderRadius: width * 0.0125,
        marginTop: width * 0.025,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    joinText: {
        marginTop: width * 0.01,
        marginBottom: width * 0.04,
        fontSize: width * 0.045,
        fontWeight: 'bold',
    },
    buttonText: {
        color: '#FFF',
        fontSize: width * 0.04,
        textAlign: 'center',
    },
    description: {
        fontSize: width * 0.045,
        color: '#CCCCCC',
    },
    infoIcons: {
        marginRight: width * 0.025,
    },

    userImagesContainer: {
        width: '100%',
        paddingVertical: width * 0.01,
        borderRadius: width * 0.02,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        marginVertical: width * 0.03,
    },
    userImagesItems: {
        width: width * 0.26,
        height: width * 0.26,
        margin: width * 0.02,
        position: 'relative',
    },
});

export default PlaceScreen;