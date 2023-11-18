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

function validateOpenTimes(data) {
    const convertTimeToMinutes = (timeString) => {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    };

    for (let day of ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']) {
        const dayData = data[day];
        if (dayData && dayData.open) {
            if (dayData.open_time === undefined || dayData.close_time === undefined) {
                Alert.alert("Validation Error", `Missing open or close time for ${day}.`);
                return false;
            }
            if (convertTimeToMinutes(dayData.close_time) < convertTimeToMinutes(dayData.open_time)) {
                Alert.alert("Validation Error", `Close time is earlier than open time for ${day}.`);
                return false;
            }
        }
    }

    // Validate custom dates
    for (let custom of data) {
        if (custom.open) {
            if (custom.open_time === undefined || custom.close_time === undefined) {
                Alert.alert("Validation Error", `Missing open or close time for custom date: ${custom.date}.`);
                return false;
            }
            if (convertTimeToMinutes(custom.close_time) < convertTimeToMinutes(custom.open_time)) {
                Alert.alert("Validation Error", `Close time is earlier than open time for custom date: ${custom.date}.`);
                return false;
            }
        }
    }

    return true;
}

const CreatePlaceScreen = ({ route, navigation }) => {
    const { userToken } = route.params;
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [sportsType, setSportsType] = useState([]);
    const [coordinates, setCoordinates] = useState('');

    const [selectedImages, setSelectedImages] = useState([null, null, null, null, null]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [setOpenCloseTime, setSetOpenCloseTime] = useState(false);

    const [dates, setDates] = useState({ "sun": null, "mon": { "open_time": 8, "close_time": 17, "open": true }, "tue": { "open_time": 8, "close_time": 17, "open": true }, "wed": { "open_time": 8, "close_time": 17, "open": true }, "thu": { "open_time": 8, "close_time": 17, "open": true }, "fri": { "open_time": 8, "close_time": 17, "open": true }, "sat": { "open_time": 8, "close_time": 17, "open": true } });

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
            placeFormData.append('photos[]', imgData);
        });

        if (selectedVideo) {
            const videoType = selectedVideo.mimeType.split("/")[1];
            const videoData = {
                uri: selectedVideo.uri,
                type: selectedVideo.mimeType,
                name: `video.${videoType}`,
            };
            placeFormData.append('videos[]', videoData);
        }

        if (setOpenCloseTime) {
            const openingTimes = {
                sun: dates[0] && dates[0].open_time && dates[0].close_time ? dates[0] : null,
                mon: dates[1] && dates[1].open_time && dates[1].close_time ? dates[1] : null,
                tue: dates[2] && dates[2].open_time && dates[2].close_time ? dates[2] : null,
                wed: dates[3] && dates[3].open_time && dates[3].close_time ? dates[3] : null,
                thu: dates[4] && dates[4].open_time && dates[4].close_time ? dates[4] : null,
                fri: dates[5] && dates[5].open_time && dates[5].close_time ? dates[5] : null,
                sat: dates[6] && dates[6].open_time && dates[6].close_time ? dates[6] : null,
            };
            placeFormData.append('opening_times', JSON.stringify(openingTimes));
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
                navigation.navigate('Place', { placeId: responseData.id });
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

                {setOpenCloseTime ?
                    <OpenTimes dates={dates} setDates={setDates} setSetOpenCloseTime={setSetOpenCloseTime} cancel />
                    :
                    <TouchableOpacity style={styles.AddWorkingTimeButton} onPress={() => setSetOpenCloseTime(true)}>
                        <Text style={{ color: '#FFFFFF', fontSize: 16, }}>
                            Add Working Time
                        </Text>
                    </TouchableOpacity>
                }

                <TouchableOpacity style={[styles.button, { backgroundColor: 'green', marginBottom: width * 0.5 }]} onPress={() => { validateOpenTimes(dates) ? createPlace() : {} }}>
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
    AddWorkingTimeButton: {
        marginTop: 10,
        backgroundColor: '#2980B9',
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 5,
        alignSelf: 'flex-start',
        paddingHorizontal: width * 0.1,
        marginTop: width * 0.04,
    }
});

export default CreatePlaceScreen;
