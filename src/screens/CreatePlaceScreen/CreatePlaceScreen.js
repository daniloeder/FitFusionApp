import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Dimensions, Alert
} from 'react-native';
import GradientBackground from './../../components/GradientBackground/GradientBackground';
import { GoogleAutocompletePicker, ShowOnMap } from '../../components/GoogleMaps/GoogleMaps.js';
import SportsPicker from '../../components/SportPicker/SportPicker';
import UploadPicker from '../../components/UploadPicker/UploadPicker';
import { SportsNames } from '../../utils/sports';
import OpenTimes from '../../components/Forms/OpenTimes.js';

const width = Dimensions.get('window').width;

const CreatePlaceScreen = ({ route, navigation }) => {
    const { userToken } = route.params;
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [sportsType, setSportsType] = useState([]);
    const [coordinates, setCoordinates] = useState('');

    const [selectedImages, setSelectedImages] = useState([null, null, null, null, null]);
    const [selectedVideo, setSelectedVideo] = useState(null);

    const [dates, setDates] = useState({ "sun": null, "mon": { "openTime": 8, "closeTime": 17, "open": true }, "tue": { "openTime": 8, "closeTime": 17, "open": true }, "wed": { "openTime": 8, "closeTime": 17, "open": true }, "thu": { "openTime": 8, "closeTime": 17, "open": true }, "fri": { "openTime": 8, "closeTime": 17, "open": true }, "sat": { "openTime": 8, "closeTime": 17, "open": true } });

    const updateSelectedImage = (file, index) => {
        let tempImages = [...selectedImages];
        tempImages[index] = file;
        setSelectedImages(tempImages);
    }

    const logAndAppend = (formData, key, value) => {
        formData.append(key, value);
    };

    const createPlace = async () => {
        if (!name || !description || !location || !coordinates || sportsType.length === 0) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        const placeFormData = new FormData();
        logAndAppend(placeFormData, 'name', name);
        logAndAppend(placeFormData, 'description', description);
        logAndAppend(placeFormData, 'location', location);
        sportsType.forEach(sport => {
            logAndAppend(placeFormData, 'sport_types', String(sport.id || sport));
        });

        const coordinatesString = JSON.stringify({
            type: "Point",
            coordinates: [coordinates.longitude, coordinates.latitude]
        });
        logAndAppend(placeFormData, 'coordinates', coordinatesString);

        // Handle Media Uploads
        selectedImages.filter(item => item !== null).forEach((img, index) => {
            const imageType = img.mimeType.split("/")[1];
            const imgData = {
                uri: img.uri,
                type: img.mimeType,
                name: `photo_${index}.${imageType}`,
            };
            formData.append('photos[]', imgData);
        });

        if (selectedVideo) {
            const videoType = selectedVideo.mimeType.split("/")[1];
            const videoData = {
                uri: selectedVideo.uri,
                type: selectedVideo.mimeType,
                name: `video.${videoType}`,
            };
            formData.append('videos[]', videoData);
        }

        try {
            const response = await fetch('http://192.168.0.118:8000/api/places/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${userToken}`,
                    'Content-Type': 'multipart/form-data'
                },
                body: placeFormData
            });

            if (response.ok) {
                const responseData = await response.json();
                navigation.navigate('PlaceDetails', { placeId: responseData.id });
            } else {
                const errorData = await response.json();
                Alert.alert('Error', `Creation failed: ${errorData.detail}`);
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'An unexpected error occurred.');
        }
    };

    return (
        <View style={styles.gradientContainer}>
            <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false} overScrollMode="never" keyboardShouldPersistTaps='always'>
                {/* Fields and Uploaders */}
                <Text style={styles.inputTitles}>Name</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Name" />

                <Text style={styles.inputTitles}>Description</Text>
                <TextInput style={[styles.input, { height: width * 0.3 }]} value={description} onChangeText={setDescription} placeholder="Description" multiline />

                <Text style={styles.inputTitles}>Sports Type</Text>
                <SportsPicker sports={SportsNames(sportsType.map(sport => sport.id || sport), true)} setSports={setSportsType} />

                <Text style={styles.inputTitles}>Location</Text>
                <GoogleAutocompletePicker setLocation={setLocation} setCoordinates={setCoordinates} />
                {coordinates ? <ShowOnMap coordinates={coordinates} /> : null}

                <Text style={styles.inputTitles}>Upload Images (Up to 5)</Text>
                <View style={{ flexDirection: 'row' }}>
                    {selectedImages.map((image, index) =>
                        <UploadPicker key={index} type="image" limit={1} setFile={file => updateSelectedImage(file, index)} index={index} />
                    )}
                </View>

                <Text style={styles.inputTitles}>Upload Video (Only 1)</Text>
                <UploadPicker type="video" limit={1} setFile={setSelectedVideo} index={0} />

                <Text style={[styles.inputTitles, {marginTop: width*0.05, marginBottom: -width*0.03}]}>Select The Hours This Place is Opened</Text>
                <OpenTimes dates={dates} setDates={setDates} />

                <TouchableOpacity style={[styles.button, { backgroundColor: 'green', marginBottom: width * 0.5 }]} onPress={createPlace}>
                    <Text style={styles.buttonText}>Create Place</Text>
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
        padding: width * 0.05,
    },
    inputTitles: {
        color: '#FFF',
        marginBottom: width * 0.01,
    },
    input: {
        borderWidth: 1,
        borderColor: 'gray',
        padding: width * 0.02,
        borderRadius: width * 0.01,
        marginBottom: width * 0.03,
        backgroundColor: '#FFF',
    },
    button: {
        padding: width * 0.03,
        borderRadius: width * 0.01,
        alignItems: 'center',
        marginTop: width * 0.05,
        marginBottom: width * 0.1,
    },
    buttonText: {
        color: '#FFF',
        fontSize: width * 0.04,
    },
});

export default CreatePlaceScreen;
