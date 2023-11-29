import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Dimensions, Alert } from 'react-native';
import GradientBackground from './../../components/GradientBackground/GradientBackground';
import { GoogleAutocompletePicker, ShowOnMap } from '../../components/GoogleMaps/GoogleMaps.js';
import UploadPicker from '../../components/UploadPicker/UploadPicker';
import CustomPicker from '../../components/CustomPicker/CustomPicker.js';
import CustomInput from '../../components/Forms/CustomInput.js';
import OpenTimes from '../../components/Forms/OpenTimes.js';
import { SportsNames, SportsTypes } from '../../utils/sports';

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
    const { preview } = route.params;
    const [name, setName] = useState(preview && preview.name || '');
    const [description, setDescription] = useState(preview && preview.description || '');
    const [location, setLocation] = useState(preview && preview.location || '');
    const [sportsType, setSportsType] = useState(preview && preview.sportType || []);
    const [coordinates, setCoordinates] = useState(preview && preview.coordinates || '');

    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState([]);
    const [setOpenCloseTime, setSetOpenCloseTime] = useState(false);

    const [dates, setDates] = useState([{ "close_time": "18:00", "date": "Sunday", "open": false, "open_time": "07:00" }, { "close_time": "18:00", "date": "Monday", "open": true, "open_time": "07:00" }, { "close_time": "18:00", "date": "Tuesday", "open": true, "open_time": "07:00" }, { "close_time": "18:00", "date": "Wednesday", "open": true, "open_time": "07:00" }, { "close_time": "18:00", "date": "Thursday", "open": true, "open_time": "07:00" }, { "close_time": "18:00", "date": "Friday", "open": true, "open_time": "07:00" }, { "close_time": "18:00", "date": "Saturday", "open": true, "open_time": "07:00" }]);

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
        console.log(privated)
        if(privated[0].id === 1){
            logAndAppend(placeFormData, 'is_privated', true);
        }
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
                name: `image_${index}.${imageType}`,
            };
            placeFormData.append('images[]', imgData);
        });

        if (selectedVideo.length) {
            const videoType = selectedVideo[0].mimeType.split("/")[1];
            const videoData = {
                uri: selectedVideo[0].uri,
                type: selectedVideo[0].mimeType,
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
            const response = await fetch(`http://192.168.0.118:8000/api/places/${preview ? preview.placeId + '/' : ''}`, {
                method: preview ? 'PATCH' : 'POST',
                headers: {
                    'Authorization': `Token ${userToken}`,
                },
                body: placeFormData,
            });

            if (response.ok) {
                const responseData = await response.json();
                navigation.navigate(preview ? 'Manage Place' : 'Place', { placeId: responseData.id });
            } else {
                const errorData = await response.json();
                Alert.alert('Error', `Creation failed: ${errorData.detail}`);
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'An unexpected error occurred.');
        }
    };
    const [privated, setPrivated] = useState([{id: 1, name: "Private"}]);

    return (
        <View style={styles.gradientContainer}>
            <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false} overScrollMode="never" keyboardShouldPersistTaps='always'>
                {/* Fields and Uploaders */}
                <Text style={styles.inputTitles}>Name</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Name" />

                <Text style={styles.inputTitles}>Description</Text>
                <TextInput style={[styles.input, { height: width * 0.3 }]} value={description} onChangeText={setDescription} placeholder="Description" multiline />

                <Text style={styles.inputTitles}>Sports Type (max 5)</Text>
                <CustomPicker options={Object.values(SportsTypes('en'))} selectedOptions={SportsNames(numbers = sportsType.map(sport => sport.id || sport), index = true)} setSelectedOptions={setSportsType} max={5} />

                <Text style={styles.inputTitles}>Is Private</Text>
                <CustomPicker options={[{id: 1, name: "Private"}, {id: 2, name: "Public"}]} selectedOptions={privated} setSelectedOptions={setPrivated} max={1} />

                <Text style={styles.inputTitles}>Location</Text>
                <GoogleAutocompletePicker setLocation={setLocation} setCoordinates={setCoordinates} placeholder={location} />
                {coordinates ? <ShowOnMap coordinates={coordinates} /> : null}

                {!preview ?
                    <>
                        <Text style={styles.inputTitles}>Upload Images (Up to 5)</Text>
                        <View style={{ flexDirection: 'row' }}>
                            <UploadPicker
                                selectedImages={selectedImages}
                                setSelectedImages={setSelectedImages}
                                max={5}
                            />
                        </View>

                        <Text style={styles.inputTitles}>Upload Video (Only 1)</Text>
                        <UploadPicker
                            selectedImages={selectedVideo}
                            setSelectedImages={setSelectedVideo}
                            type="video"
                            max={1}
                        />

                        {setOpenCloseTime ?
                            <OpenTimes dates={dates} setDates={setDates} setSetOpenCloseTime={setSetOpenCloseTime} cancel />
                            :
                            <TouchableOpacity style={styles.AddWorkingTimeButton} onPress={() => setSetOpenCloseTime(true)}>
                                <Text style={{ color: '#FFFFFF', fontSize: 16, }}>
                                    Add Working Time
                                </Text>
                            </TouchableOpacity>
                        }

                        <TouchableOpacity style={[styles.button, { backgroundColor: 'green', marginBottom: width * 0.5 }]} onPress={() => { !setOpenCloseTime || validateOpenTimes(dates) ? createPlace() : {} }}>
                            <Text style={styles.buttonText}>Create Place</Text>
                        </TouchableOpacity>
                    </>
                    :
                    <TouchableOpacity style={[styles.button, { backgroundColor: 'green', marginBottom: width * 0.5 }]} onPress={() => { !setOpenCloseTime || validateOpenTimes(dates) ? createPlace() : {} }}>
                        <Text style={styles.buttonText}>Update Place</Text>
                    </TouchableOpacity>
                }
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
