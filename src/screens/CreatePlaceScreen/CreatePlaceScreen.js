import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Dimensions, Alert
} from 'react-native';
import GradientBackground from './../../components/GradientBackground/GradientBackground';
import Icons from '../../components/Icons/Icons';
import { GoogleAutocompletePicker, ShowOnMap } from '../../components/GoogleMaps/GoogleMaps.js';
import SportsPicker from '../../components/SportPicker/SportPicker';
import UploadPicker from '../../components/UploadPicker/UploadPicker';
import { API_AUTHORIZATION } from '@env';

const width = Dimensions.get('window').width;

const CreatePlaceScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [sportsType, setsportsType] = useState([]);
    const [coordinates, setCoordinates] = useState('');
    const [creator, setCreator] = useState(1);

    const [selectedImages, setSelectedImages] = useState([null, null, null, null, null]);
    const [selectedVideo, setSelectedVideo] = useState(null);

    const updateSelectedImage = (file, index) => {
        let tempImages = [...selectedImages];
        tempImages[index] = file;
        setSelectedImages(tempImages);
    }

    const logAndAppend = (formData, key, value) => {
        formData.append(key, value);
    };

    const updatePlace = async (placeId) => {
        try {
            const formData = new FormData();

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

            const response = await fetch(`http://192.168.0.118:8000/api/places/${placeId}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Token ${API_AUTHORIZATION}`,
                },
                body: formData
            });

            if (response.ok) {
                const responseData = await response.json();
                // Additional logic for successful response, perhaps a success alert or navigating back
            } else {
                const errorData = await response.json();
                console.error("Server error response:", errorData);
                // Additional logic for error response, maybe showing an error alert
            }
        } catch (error) {
            console.error('Error:', error);
            // Handle error appropriately, maybe show an alert or notification to the user
        }
    };

    const createPlace = async () => {
        if (!coordinates || coordinates === "") {
            Alert.alert("Error", "Coordinates are required!");
            return;
        }

        const placeFormData = new FormData();

        logAndAppend(placeFormData, 'name', name);
        logAndAppend(placeFormData, 'description', description);
        logAndAppend(placeFormData, 'location', location);
        logAndAppend(placeFormData, 'sport_types', sportsType.map(sport => sport.value).join(','));
        if (selectedVideo) {
            const videoType = selectedVideo.mimeType.split("/")[1];
            const videoData = {
                uri: selectedVideo.uri,
                type: selectedVideo.mimeType,
                name: `video.${videoType}`,
            };
            placeFormData.append('videos[]', videoData);
        }

        // Serialize the coordinates object to a JSON string
        const coordinatesString = JSON.stringify({
            type: "Point",
            coordinates: [coordinates.longitude, coordinates.latitude]
        });
        logAndAppend(placeFormData, 'coordinates', coordinatesString);


        try {
            const placeResponse = await fetch('http://192.168.0.118:8000/api/places/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${API_AUTHORIZATION}`,
                    'Content-Type': 'multipart/form-data'
                },
                body: placeFormData
            });

            if (placeResponse.ok) {
                const placeData = await placeResponse.json();
                console.log("Place created successfully:", placeData);
                // You can navigate or inform the user here that the place was created
            } else {
                // Log raw text response for better debugging.
                const rawText = await placeResponse.text();
                console.error("Raw server response:", rawText);

                // Try parsing the response as JSON.
                try {
                    const data = JSON.parse(rawText);
                    console.error("Parsed server response:", data);
                } catch (e) {
                    console.error("Failed to parse the server response as JSON");
                }
            }

        } catch (error) {
            console.error('Place creation error:', error);
            // Handle error appropriately, maybe show an alert or notification to the user
        }
    };

    return (
        <View style={styles.gradientContainer}>
            <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} overScrollMode="never" keyboardShouldPersistTaps='always'>

                <Text style={styles.inputTitles}>Title</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Title"
                />

                <Text style={styles.inputTitles}>Description</Text>
                <TextInput
                    style={[styles.input, { height: width * 0.3 }]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Description"
                />

                <Text style={styles.inputTitles}>Sports Type</Text>
                <SportsPicker
                    sports={sportsType} setSports={setsportsType}
                />

                <Text style={styles.inputTitles}>Location</Text>
                <GoogleAutocompletePicker setLocation={setLocation} setCoordinates={setCoordinates} />
                {coordinates? <ShowOnMap coordinates={coordinates} /> : ''}

                <Text style={styles.inputTitles}>Upload Images (Up to 5)</Text>
                <View style={{ flexDirection: 'row' }}>
                    {selectedImages.map((image, index) =>
                        <UploadPicker key={index} type="image" limit={1} setFile={updateSelectedImage} index={index} />
                    )}
                </View>

                <Text style={styles.inputTitles}>Upload Video (Only 1)</Text>
                <UploadPicker type="video" limit={1} setFile={setSelectedVideo} index={0} />

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

export default CreatePlaceScreen;