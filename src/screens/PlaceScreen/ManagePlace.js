import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Dimensions, Modal, Pressable, TouchableOpacity, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import GradientBackground from '../../components/GradientBackground/GradientBackground.js';
import UploadPicker from '../../components/UploadPicker/UploadPicker.js';
import ShowMedia from '../../components/ShowMedia/ShowMedia.js';
import OpenTimes from '../../components/Forms/OpenTimes.js';
import OpenTimesTable from '../../components/OpenTimesTable/OpenTimesTable.js';
import SportsItems from '../../components/SportsItems/SportsItems.js';
import SubscriptionPlansModal from '../../components/Payment/SubscriptionPlansModal';
import { ShowOnMap } from '../../components/GoogleMaps/GoogleMaps.js';
import ManageUsers from '../../components/Management/ManageUsers.js';
import QRScanner from '../../components/QRScanner/QRScanner.js';
import Icons from '../../components/Icons/Icons.js';
import { BASE_URL } from '@env';

const width = Dimensions.get('window').width;

const PlaceScreen = ({ route, navigation }) => {
    const { placeId, userId, userToken } = route.params;
    const [place, setPlace] = useState(null);
    const [clientStatus, setClientStatus] = useState('none');

    const [isVideoModalVisible, setVideoModalVisible] = useState(false);

    const [isClientRequestsModalVisible, setClientRequestsModalVisible] = useState(false);
    const [isClientManagerModalVisible, setClientManagerModalVisible] = useState(false);
    const [subscriptionPlansModalVisible, setSubscriptionPlansModalVisible] = useState(false);
    const [scannedUserModalVisible, setScannedUserModalVisible] = useState(false);
    const [clientRequests, setClientRequests] = useState([]);
    const [scannedUserData, setScannedUserData] = useState(null);

    const [setOpenCloseTime, setSetOpenCloseTime] = useState(false);
    const [dates, setDates] = useState([]);

    const [selectedImages, setSelectedImages] = useState([]);
    const [editImages, setEditImages] = useState(false);

    const [userPayments, setUserPayments] = useState(false);

    useFocusEffect(
        useCallback(() => {
            if (placeId) {
                fetchPlace();
            } else {
                Alert.alert('Place error.');
                return;
            }
        }, [])
    );
    useFocusEffect(
        useCallback(() => {
            if (route.params.isParticipantRequestModalVisible) {
                setClientRequestsModalVisible(true);
                fetchClientRequests();
            }
        }, [route.params.isParticipantRequestModalVisible])
    );

    useEffect(() => {
        if (isClientRequestsModalVisible) {
            setClientRequestsModalVisible(true);
            fetchClientRequests();
        }
    }, [isClientRequestsModalVisible]);

    useEffect(() => {
        if (place && place.client_status) {
            setClientStatus(place.client_status);
        }
    }, [place]);

    const fetchPlace = async () => {
        try {
            const response = await fetch(BASE_URL + `/api/places/${placeId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${userToken}`,
                }
            });
            if (response.ok) {
                const data = await response.json();
                setPlace(data);
                setDates(data.opening_times);
                setSelectedImages(data.place_images)
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
    const fetchUserProfileImages = async (clientsIds) => {
        if (clientsIds.length) {
            try {
                const response = await fetch(BASE_URL + `/api/users/get-user-profile-images/?user_ids=${clientsIds.join()}`);
                if (response.ok) {
                    const data = await response.json();
                    const profileImageMap = {};
                    data.forEach((user) => {
                        profileImageMap[user.user_id] = user.profile_image;
                    });
                    setClientRequests((prevUsers) => {
                        return prevUsers.map((user) => {
                            if (profileImageMap.hasOwnProperty(user.user.id)) {
                                return {
                                    ...user,
                                    user: {
                                        ...user.user,
                                        profile_image: profileImageMap[user.user.id],
                                    },
                                };
                            }
                            return user;
                        });
                    });
                } else {
                    console.error('Error fetching user profile images:', response.statusText);
                }
            } catch (error) {
                console.error('Error parsing user profile images response:', error);
            }
        }
    };
    const fetchClientRequests = async () => {
        try {
            const response = await fetch(BASE_URL + `/api/places/${placeId}/owner-requests/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${userToken}`,
                }
            });

            if (response.ok) {
                const data = await response.json();
                setClientRequests(data);
                fetchUserProfileImages(data.map(request => request.user.id));
            } else {
                Alert.alert('Error', 'Failed to fetch client requests.');
            }
        } catch (error) {
            console.error('Error fetching client requests:', error);
        }
    };
    const updateOpeningTimes = async () => {
        const placeFormData = new FormData();

        const openingTimes = {
            sun: dates[0] && dates[0].open_time && dates[0].close_time ? dates[0] : null,
            mon: dates[1] && dates[1].open_time && dates[1].close_time ? dates[1] : null,
            tue: dates[2] && dates[2].open_time && dates[2].close_time ? dates[2] : null,
            wed: dates[3] && dates[3].open_time && dates[3].close_time ? dates[3] : null,
            thu: dates[4] && dates[4].open_time && dates[4].close_time ? dates[4] : null,
            fri: dates[5] && dates[5].open_time && dates[5].close_time ? dates[5] : null,
            sat: dates[6] && dates[6].open_time && dates[6].close_time ? dates[6] : null,
            custom: dates.slice(7).filter(d => (d.date && ((d.open_time && d.close_time && d.open) || !d.open))).map(d => ({
                date: d.date,
                open_time: d.open_time,
                close_time: d.close_time,
                open: d.open
            }))
        };
        placeFormData.append('opening_times', JSON.stringify(openingTimes));
        try {
            const response = await fetch(BASE_URL + `/api/places/${placeId}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Token ${userToken}`,
                },
                body: placeFormData,
            });

            if (response.ok) {
                fetchPlace();
            } else {
                const errorData = await response.json();
                Alert.alert('Error', `Update failed: ${errorData.detail}`);
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'An unexpected error occurred.');
        }
    };
    const onJoinLeaveEvent = async () => {
        if (preview) {
            setJoined(!joined)
            return
        }
        try {
            const response = await fetch(BASE_URL + `/api/events/${eventId}/${joined ? 'leave' : 'join'}/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${userToken}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();

            if (response.status === 200) {
                setJoined(!joined);
            } else if (response.status === 400) {
                setJoined(!joined);
            } else {
                console.error('Failed to join the event.');
            }
        } catch (error) {
            console.error('An error occurred:', error);
        }
    };
    async function handleRequest(approve, userRequestId, index) {
        const apiUrl = BASE_URL + `/api/places/${placeId}/approve-request/${userRequestId}/?approve=${approve ? 'approve' : 'deny'}`;
        const requestOptions = {
            method: 'POST',
            headers: {
                'Authorization': `Token ${userToken}`,
                'Content-Type': 'application/json',
            },
        };

        try {
            const response = await fetch(apiUrl, requestOptions);
            const data = await response.json();

            if (response.ok) {
                setClientRequests(prevRequests => prevRequests.slice(0, index).concat(prevRequests.slice(index + 1)));
            } else {
                console.error('Request failed:', data);
            }
        } catch (error) {
            console.error('An error occurred:', error);
        }
    }
    const ClientRequestsModal = () => {
        return (
            <Modal
                transparent={true}
                visible={isClientRequestsModalVisible}
                onRequestClose={() => setClientRequestsModalVisible(false)}
            >
                <View style={styles.clientRequestsModalContainer}>
                    <View style={styles.clientRequestsModalContent}>
                        <Text style={styles.clientRequestsModalTitle}>Clients Requests</Text>
                        <ScrollView>
                            {clientRequests.map((request, index) => {
                                return (
                                    <View key={index} style={styles.clientRequestItem}>
                                        <View style={[styles.userBall, { borderColor: request.user.gender === 'M' ? '#0033FF' : request.user.gender === 'F' ? '#FF3399' : '#DDD' }]}>
                                            {request.user.profile_image ?
                                                <Image style={styles.userBallImageProfile}
                                                    source={{ uri: `data:image/jpeg;base64,${request.user.profile_image}` }}
                                                    onError={(error) => console.error('Image Error:', error)}
                                                />
                                                :
                                                <Icons name="Profile" size={width * 0.08} />
                                            }
                                        </View>
                                        <View style={{ marginLeft: '5%' }}>
                                            <Text style={styles.requestUsername}>{request.user.name}</Text>
                                            <View style={styles.clientclientclientclientRequestButtons}>
                                                <TouchableOpacity
                                                    style={[styles.clientRequestButton, styles.approveButton]}
                                                    onPress={() => handleRequest(true, request.user.id, index)}
                                                >
                                                    <Text style={styles.buttonText}>Approve</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[styles.clientRequestButton, styles.denyButton]}
                                                    onPress={() => handleRequest(false, request.user.id, index)}
                                                >
                                                    <Text style={styles.buttonText}>Deny</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                )
                            })}
                        </ScrollView>
                        <TouchableOpacity
                            style={[styles.clientRequestButton, { backgroundColor: '#CCC', marginTop: width * 0.1, width: width * 0.5, height: width * 0.1, alignItems: 'center', justifyContent: 'center' }]}
                            onPress={() => setClientRequestsModalVisible(false)}
                        >
                            <Text style={styles.buttonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };
    const ClientManagerModal = () => {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={isClientManagerModalVisible}
                onRequestClose={() => setClientManagerModalVisible(false)}
            >
                <View style={styles.clientManagerModalContainer}>
                    <View style={styles.clientManagerModalContent}>
                        <Text style={styles.clientManagerModalTitle}>Clients Management</Text>

                        <ScrollView style={{ width: '100%' }}>
                            <ManageUsers userToken={userToken} userIds={place.clients} placeId={placeId} />
                        </ScrollView>

                        <TouchableOpacity
                            style={[styles.clientRequestButton, { backgroundColor: '#CCC', marginTop: width * 0.1, width: width * 0.5, height: width * 0.1, alignItems: 'center', justifyContent: 'center' }]}
                            onPress={() => setClientManagerModalVisible(false)}
                        >
                            <Text style={styles.buttonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };

    const ScannedUserModal = () => {
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={scannedUserModalVisible}
                onRequestClose={() => {
                    setScannedUserModalVisible(false);
                    setScannedUserData(null);
                    setUserPayments(null);
                }}
            >
                <View style={styles.clientManagerModalContainer}>
                    <View style={[styles.clientManagerModalContent, { backgroundColor: userPayments && userPayments.payments ? userPayments.regular ? '#98FB98' : '#B22222' : "#FFF" }]}>
                        <Text style={styles.clientManagerModalTitle}>Client Data</Text>

                        <View style={{ width: '100%', minHeight: width }}>
                            {scannedUserData ?
                                <ScrollView style={{ width: '100%' }}>

                                    {!userPayments || userPayments.client || (userPayments.payments) ?
                                        <ManageUsers userToken={userToken} userIds={[scannedUserData.id]} placeId={placeId} setUserPayments={!userPayments ? setUserPayments : undefined} />
                                        :
                                        <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 30 }}>This user is not a client of this Place.</Text>
                                    }

                                </ScrollView>
                                :
                                <QRScanner setScannedUserData={setScannedUserData} />
                            }
                        </View>

                        <TouchableOpacity
                            style={[styles.clientRequestButton, { backgroundColor: '#CCC', marginTop: width * 0.1, width: width * 0.5, height: width * 0.1, alignItems: 'center', justifyContent: 'center' }]}
                            onPress={() => {
                                setScannedUserModalVisible(false);
                                setScannedUserData(null);
                                setUserPayments(null);
                            }}
                        >
                            <Text style={styles.buttonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };

    const ManagerSubscriptionPlansModal = () => {
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={subscriptionPlansModalVisible}
                onRequestClose={() => { setSubscriptionPlansModalVisible(false); fetchPlace(); }}
            >
                <View style={styles.clientManagerModalContainer}>
                    <View style={[styles.clientManagerModalContent, {padding: 3}]}>
                        <Text style={styles.clientManagerModalTitle}>Subscription Plans</Text>
                        <View style={{ width: '100%', minHeight: width, backgroundColor: '#FFF' }}>
                            <SubscriptionPlansModal
                                userToken={userToken}
                                subscriptionTexts={{ button_text: "Testing..." }}
                                object={{
                                    get_key: 'plans_ids',
                                    get_id: place.subscription_plans.map(plan => plan.id),
                                    obj_key: 'place_id',
                                    obj_id: place.id,
                                    plans_in: place.subscription_plans,
                                    extra: {
                                        type: 'join_place',
                                        place_id: place.id,
                                    }
                                }}
                                patternMode='manager'
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    const updateExistingImages = async () => {
        setEditImages(false);
        const existingImagesData = selectedImages.map((img, index) => ({
            id: img.id,
            image_id: index + 1
        }));

        const response = await fetch(BASE_URL + `/api/places/${placeId}/update-images/`, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${userToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ images: existingImagesData })
        });

        if (response.ok) {
            uploadImages();
        }
    };
    const uploadImages = async () => {
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

                const response = await fetch(BASE_URL + `/api/places/${placeId}/upload-image/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Token ${userToken}`,
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formData
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("Server error response:", errorData);
                    break;
                }

            }
        } catch (error) {
            console.error('Error:', error);
        }
        fetchPlace();
    };

    if (!place || !place.coordinates) return <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />;
    const [longitude, latitude] = place.coordinates.match(/-?\d+\.\d+/g).map(Number);

    return (
        <View style={styles.gradientContainer}>
            <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />

            <ScrollView style={styles.container}>
                <View style={{ flexDirection: 'row' }}>
                    {place.created_by == userId ?
                        <Pressable
                            onPress={() => {
                                setScannedUserModalVisible(true);
                            }}
                            style={[styles.createEventButton, { height: 'auto', width: width * 0.3, position: 'absolute', maxWidth: width * 0.3, flexDirection: 'column', padding: width * 0.05 }]}
                        >
                            <Icons name="Camera" size={width * 0.08} />
                            <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: width * 0.035, marginLeft: '3%' }}>Scan User</Text>
                        </Pressable>
                        : ''
                    }
                    {place.created_by == userId ?
                        <Pressable
                            onPress={() => setClientManagerModalVisible(true)}
                            style={[styles.createEventButton, { minWidth: width * 0.6 }]}
                        >
                            <Icons name="ParticipantEdit" size={width * 0.08} />
                            <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: width * 0.035, marginLeft: '3%' }}>Clients Manager</Text>
                        </Pressable>
                        : ''
                    }
                </View>
                {place.created_by == userId && (clientStatus === 'requested' || clientStatus === 'owner') ?
                    <Pressable
                        onPress={() => setClientRequestsModalVisible(true)}
                        style={[styles.createEventButton, { marginTop: width * 0.03, minWidth: width * 0.6 }]}
                    >
                        <Icons name="ParticipantRequest" size={width * 0.08} />
                        <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: width * 0.035, marginLeft: '3%' }}>Clients Requests</Text>
                    </Pressable>
                    : ''
                }

                <Pressable
                    onPress={() => setSubscriptionPlansModalVisible(true)}
                    style={[styles.createEventButton, { marginTop: width * 0.03, minWidth: width * 0.6 }]}
                >
                    <Icons name="Subscription" size={width * 0.08} />
                    <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: width * 0.035, marginLeft: '3%' }}>Subscription Plans</Text>
                </Pressable>

                {place.created_by == userId ?
                    <Pressable
                        onPress={() => {
                            navigation.navigate('Create Place', {
                                preview: {
                                    placeId: placeId,
                                    name: place.name,
                                    description: place.description,
                                    location: place.location,
                                    sportType: place.sport_types_keys,
                                    coordinates: { "latitude": latitude, "longitude": longitude },
                                }
                            })
                        }}
                        style={[styles.createEventButton, { marginTop: width * 0.03, minWidth: width * 0.6 }]}
                    >
                        <Icons name="Edit" size={width * 0.07} />
                        <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: width * 0.035, marginLeft: '3%' }}>Edit Place</Text>
                    </Pressable>
                    : ''
                }
                {place.created_by == userId ?
                    <Pressable
                        onPress={() => navigation.navigate('Create Event', { placeId: [{ id: place.id, name: place.name }] })}
                        style={[styles.createEventButton, { minWidth: width * 0.6, marginTop: width * 0.03 }]}
                    >
                        <Icons name="Events" size={width * 0.08} />
                        <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: width * 0.035, marginLeft: '3%' }}>Create Event</Text>
                    </Pressable>
                    : ''
                }
                <ScannedUserModal />
                <ClientManagerModal />
                <ClientRequestsModal />
                <ManagerSubscriptionPlansModal />

                <Text style={styles.title}>{place.name}</Text>

                <View style={styles.infoBlock}>
                    <Icons name="Map2" size={width * 0.07} style={styles.infoIcons} fill={"#FFF"} />
                    <Text style={styles.location}>{place.location}</Text>
                </View>
                {place.coordinates ? <ShowOnMap coordinates={{ 'latitude': latitude, 'longitude': longitude }} /> : null}

                <View style={[styles.infoBlock, { marginTop: width * 0.05 }]}>
                    <Icons name="Sport" size={width * 0.055} style={[styles.infoIcons, { marginBottom: 'auto', paddingTop: width * 0.08 }]} />
                    <SportsItems favoriteSports={place.sport_types_keys} />
                </View>

                <View style={[styles.infoBlock, setOpenCloseTime ? { width: width * 0.96, marginLeft: -width * 0.06 } : {}]}>
                    <Icons name="Watch" size={width * 0.055} style={[styles.infoIcons, { marginBottom: 'auto', paddingTop: width * 0.08 }]} />
                    {setOpenCloseTime ?
                        <OpenTimes dates={dates} setDates={setDates} setSetOpenCloseTime={setSetOpenCloseTime} update={() => updateOpeningTimes(placeId)} cancel add />
                        :
                        <>
                            <OpenTimesTable openTimes={place.open_times} />
                            <TouchableOpacity style={styles.EditInfoIcon} onPress={() => setSetOpenCloseTime(!setOpenCloseTime)}>
                                <Icons name="Edit" size={width * 0.1} />
                            </TouchableOpacity>
                        </>
                    }
                </View>

                <View style={styles.infoBlock}>
                    <Icons name="Description" size={width * 0.055} style={[styles.infoIcons, { marginBottom: 'auto', paddingTop: width * 0.07 }]} />
                    <Text style={styles.description}>{place.description}</Text>
                </View>

                {!editImages && place.place_images && place.place_images.length ?
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
                                    <ShowMedia media={BASE_URL + `${image.image}`} size={width * 0.26} />
                                </View>
                            )
                        })}
                        <TouchableOpacity style={styles.EditInfoIcon} onPress={() => setEditImages(true)}>
                            <Icons name="Edit" size={width * 0.1} />
                        </TouchableOpacity>
                    </View>
                    :
                    <UploadPicker
                        selectedImages={selectedImages}
                        setSelectedImages={setSelectedImages}
                        max={5}
                        upload={updateExistingImages}
                        setEditImages={setEditImages}
                    />
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
                        <TouchableOpacity style={styles.EditInfoIcon} onPress={{}}>
                            <Icons name="Edit" size={width * 0.1} />
                        </TouchableOpacity>
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
                                    media={BASE_URL + `${place.place_videos[0].video}`}
                                    isVideo={true}
                                    style={{ width: width, height: width * (9 / 16) }}
                                />
                            </TouchableOpacity>
                        </View>
                    </Modal>
                    : ''
                }

                {/* Add Join/Leave/Requested button based on clientStatus */}
                {clientStatus === 'owner' ? '' : (
                    true ?
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
                        :
                        <>
                            <TouchableOpacity style={[styles.button, { backgroundColor: 'green' }]} onPress={onJoinLeaveEvent}>
                                <Text style={styles.buttonText}>Join Event</Text>
                            </TouchableOpacity>
                            <View>
                                <Text style={[styles.joinText, { color: '#AAA' }]}>
                                    You are not at this event.
                                </Text>
                            </View>
                        </>
                )}

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
    clientRequestButton: {
        paddingVertical: 5,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginHorizontal: 5,
    },


    // Styles for Client Requests Modal
    clientRequestsModalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    clientRequestsModalContent: {
        width: '80%',
        maxHeight: '90%',
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    clientRequestsModalTitle: {
        fontSize: width * 0.05,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    clientRequestItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    clientManagerButton: {
        paddingVertical: 5,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginHorizontal: 5,
    },

    // Styles for Client Manager Modal
    clientManagerModalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    clientManagerModalContent: {
        width: '96%',
        maxHeight: '90%',
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    clientManagerModalTitle: {
        fontSize: width * 0.05,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    clientManagerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },

    requestUsername: {
        fontSize: width * 0.03,
        marginLeft: '3%',
    },
    userBall: {
        borderRadius: width * 0.06,
        borderWidth: 2,
        width: width * 0.12,
        height: width * 0.12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: width * 0.02,
    },
    userBallImageProfile: {
        width: '100%',
        height: '100%',
        borderRadius: width * 0.05
    },
    clientclientclientclientRequestButtons: {
        flexDirection: 'row',
    },
    approveButton: {
        backgroundColor: '#4CAF50',
    },
    denyButton: {
        backgroundColor: '#F44336',
    },
    buttonText: {
        color: '#FFF',
    },



    EditInfoIcon: {
        position: 'absolute',
        right: 0,
        bottom: -width * 0.08,
        padding: width * 0.01,
        backgroundColor: '#DDD',
        borderWidth: 2,
        borderColor: '#FFF',
        borderRadius: width * 0.03,
        alignItems: 'center',
        opacity: 0.7,
    },
});

export default PlaceScreen;