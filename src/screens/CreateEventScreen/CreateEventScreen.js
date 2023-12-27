import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Dimensions, LogBox, Alert } from 'react-native';
import GradientBackground from './../../components/GradientBackground/GradientBackground';
import { GoogleAutocompletePicker, ShowOnMap } from '../../components/GoogleMaps/GoogleMaps.js';
import CustomPicker from '../../components/CustomPicker/CustomPicker.js';
import UploadPicker from '../../components/UploadPicker/UploadPicker';
import DatePicker from '../../components/Forms/DatePicker';
import { SportsNames, SportsTypes } from '../../utils/sports';
import { BASE_URL } from '@env';

const width = Dimensions.get('window').width;

LogBox.ignoreLogs(['VirtualizedLists should never be nested']);

const CreateEventScreen = ({ route, navigation }) => {
    const { userToken } = route.params;
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [favoriteSports, setFavoriteSports] = useState([]);
    const [coordinates, setCoordinates] = useState('');

    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState([]);

    const [places, setPlaces] = useState([]);
    const[eventPlace, setEventPlace] = useState([]);

    const eventPreview = {
        title: title,
        description: description,
        location: location,
        date: date,
        time: time,
        coordinates: coordinates,
        sport_types: favoriteSports.map(sport => sport.id || sport),
        photos: selectedImages.filter(item => item !== null).map(item => ({ photo: item.uri })),
        videos: selectedVideo.length ? selectedVideo[0].uri : null,
    }

    const fetchPlaces = async () => {
        try {
            const response = await fetch(BASE_URL + '/api/places/', {
              method: 'GET',
              headers: {
                Authorization: `Token ${userToken}`,
              },
            });
            const data = await response.json();
            if (response.ok) {
                setPlaces(data.map(place=>({id:place.id, name: place.name})));
            }
        } catch (error) {
            console.error('Error fetching places:', error);
        }
    };

    const checkFieldsAndAlert = () => {
        if (!title) {
            Alert.alert('Error', 'Please fill in the Title field.');
            return false;
        }
        if (!description) {
            Alert.alert('Error', 'Please fill in the Description field.');
            return false;
        }
        if (!location) {
            Alert.alert('Error', 'Please fill in the Location field.');
            return false;
        }
        if (!date) {
            Alert.alert('Error', 'Please fill in the Date field.');
            return false;
        }
        if (!time) {
            Alert.alert('Error', 'Please fill in the Time field.');
            return false;
        }
        if (favoriteSports.length === 0) {
            Alert.alert('Error', 'Please select at least one Favorite Sport.');
            return false;
        }
        if (!coordinates) {
            Alert.alert('Error', 'Please fill in the Location field.');
            return false;
        }
        return true;
    };

    const logAndAppend = (formData, key, value) => {
        formData.append(key, value);
    };

    const createEvent = async () => {
        const eventFormData = new FormData();
        logAndAppend(eventFormData, 'title', title);
        logAndAppend(eventFormData, 'description', description);
        logAndAppend(eventFormData, 'location', location);
        logAndAppend(eventFormData, 'date', date);
        logAndAppend(eventFormData, 'time', time);
        favoriteSports.map(sport => sport.id || sport).forEach(sportId => {
            logAndAppend(eventFormData, 'sport_types', String(sportId));
        });
        logAndAppend(eventFormData, 'place', eventPlace[0].id);

        const coordinatesString = JSON.stringify({
            type: "Point",
            coordinates: [coordinates.longitude, coordinates.latitude]
        });
        logAndAppend(eventFormData, 'coordinates', coordinatesString);

        selectedImages.filter(item => item !== null).forEach((img, index) => {
            const imageType = img.mimeType.split("/")[1];
            const imgData = {
                uri: img.uri,
                type: img.mimeType,
                name: `image_${index}.${imageType}`,
            };
            eventFormData.append('images[]', imgData);
        });

        if (selectedVideo.length) {
            const videoType = selectedVideo[0].mimeType.split("/")[1];
            const videoData = {
                uri: selectedVideo[0].uri,
                type: selectedVideo[0].mimeType,
                name: `video.${videoType}`,
            };
            eventFormData.append('videos[]', videoData);
        }

        try {
            const eventResponse = await fetch(BASE_URL + '/api/events/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${userToken}`,
                    'Content-Type': 'multipart/form-data'
                },
                body: eventFormData
            });
            
            if (eventResponse.ok) {
                const eventData = await eventResponse.json();
                navigation.navigate('Event', { eventId: eventData.id })
            } else {
                const rawText = await eventResponse.text();
                console.error("Raw server response:", rawText);
                try {
                    const data = JSON.parse(rawText);
                    console.error("Parsed server response:", data);
                } catch (e) {
                    console.error("Failed to parse the server response as JSON");
                }
            }

        } catch (error) {
            console.error('Event creation error:', error);
        }
    };

    useEffect(() => {
        fetchPlaces();
        setEventPlace(route.params.placeId);
    }, []);

    return (
        <View style={styles.gradientContainer}>
            <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} overScrollMode="never" keyboardShouldPersistTaps='always'>

                <Text style={styles.inputTitles}>Title</Text>
                <TextInput
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Title"
                />

                <Text style={styles.inputTitles}>Description</Text>
                <TextInput
                    style={[styles.input, { height: width * 0.3 }]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Description"
                />

                <Text style={styles.inputTitles}>Date and Time of Event</Text>
                <DatePicker date={date} setDate={setDate} setTime={setTime} dateType="YYYY/MM/DD" customStyle={styles.dataPikerContainer} />

                <Text style={styles.inputTitles}>Sports Type (max 5)</Text>
                <CustomPicker options={Object.values(SportsTypes('en'))} selectedOptions={SportsNames(numbers = favoriteSports.map(sport => sport.id || sport), index = true)} setSelectedOptions={setFavoriteSports} max={5} />

                <Text style={styles.inputTitles}>Event Place</Text>
                <CustomPicker options={places} selectedOptions={eventPlace || []} setSelectedOptions={setEventPlace} max={1} />

                <Text style={styles.inputTitles}>Location</Text>
                <GoogleAutocompletePicker setLocation={setLocation} setCoordinates={setCoordinates} />
                {coordinates ? <ShowOnMap coordinates={coordinates} /> : ''}

                <Text style={styles.inputTitles}>Upload Images (Up to 5)</Text>
                <View style={{ flexDirection: 'row' }}>
                    <UploadPicker
                        selectedImages={selectedImages}
                        setSelectedImages={setSelectedImages}
                        max={5}
                    />
                </View>

                <View style={styles.selectedImagesContainer}>
                    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                    </ScrollView>
                </View>

                <Text style={styles.inputTitles}>Upload Video (Only 1)</Text>
                <UploadPicker
                    selectedImages={selectedVideo}
                    setSelectedImages={setSelectedVideo}
                    type="video"
                    max={1}
                />

                <TouchableOpacity style={[styles.button, { backgroundColor: '#777' }]} onPress={() => { checkFieldsAndAlert() ? navigation.navigate('Event', { eventPreview: eventPreview }) : {} }}>
                    <Text style={styles.buttonText}>Preview Event</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, { backgroundColor: 'green', marginBottom: width * 0.5 }]} onPress={() => { checkFieldsAndAlert() ? createEvent() : {} }}>
                    <Text style={styles.buttonText}>Create Event</Text>
                </TouchableOpacity>
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
        padding: 20,
    },
    inputTitles: {
        color: '#FFF',
    },
    input: {
        borderWidth: 1,
        borderColor: 'gray',
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
        backgroundColor: '#FFF'
    },
    button: {
        padding: width * 0.03,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: width * 0.05,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16
    },

    // Data Piker
    dataPikerContainer: {
        padding: width * 0.03,
        marginBottom: width * 0.04,
        borderRadius: width * 0.012,
        borderWidth: 1,
        borderColor: '#EFEFEF',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
    },


    // Media picker

    selectedImagesContainer: {
        flexDirection: 'row',
        marginTop: 10,
    },
    imageWrapper: {
        marginRight: 10,
    },
});

export default CreateEventScreen;


