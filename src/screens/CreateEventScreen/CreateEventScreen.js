import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Dimensions, Pressable, Appearance, LogBox, Image } from 'react-native';
import moment from 'moment';
import GradientBackground from './../../components/GradientBackground/GradientBackground';
import Icons from '../../components/Icons/Icons';
import { GoogleAutocompletePicker, ShowOnMap } from '../../components/GoogleMaps/GoogleMaps.js';
import SportsPicker from '../../components/SportPicker/SportPicker';
import UploadPicker from '../../components/UploadPicker/UploadPicker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { API_AUTHORIZATION } from '@env';


const width = Dimensions.get('window').width;

LogBox.ignoreLogs(['VirtualizedLists should never be nested']);

const DatePicker = ({ date, setDate, setTime }) => {
    const [selectedDate, setSelectedDate] = useState(date);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    const handleConfirm = (date) => {
        setSelectedDate(date);
        setDatePickerVisibility(false);
    };

    useEffect(() => {
        setDate(moment(selectedDate).format("YYYY-MM-DD"));
        setTime(moment(selectedDate).format("HH:mm"));
    }, [selectedDate]);

    return (
        <Pressable onPress={() => setDatePickerVisibility(true)} style={[styles.dataPikerContainer, selectedDate ? { borderColor: '#21347B' } : {}]}>
            <Icons name="Calendar" size={width * 0.08} style={{ padding: width * 0.028, marginTop: width * 0.01 }} />
            <Text style={{ color: '#656565', fontSize: width * 0.04, marginLeft: width * 0.02 }}>
                {selectedDate ? moment(selectedDate).format("DD/MM/YYYY HH:mm") : "Click to select the date and time"}
            </Text>
            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="datetime"
                isDarkModeEnabled={Appearance.getColorScheme() === 'dark'}
                onConfirm={handleConfirm}
                onCancel={() => setDatePickerVisibility(false)}
            />
        </Pressable>
    );
};

const CreateEventScreen = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState('2023-10-01');
    const [time, setTime] = useState('15:00:00');
    const [sportsType, setsportsType] = useState([]);
    const [coordinates, setCoordinates] = useState('');

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

    const updateEvent = async (eventId) => {
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

            const response = await fetch(`http://192.168.0.118:8000/api/events/${eventId}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Token ${API_AUTHORIZATION}`,
                },
                body: formData
            });

            if (response.ok) {
                const responseData = await response.json();
                // Additional logic for successful response
            } else {
                const errorData = await response.json();
                console.error("Server error response:", errorData);
                // Additional logic for error response
            }
        } catch (error) {
            console.error('Error:', error);
            // Handle error appropriately, maybe show an alert or notification to the user
        }
    };


    const createEvent = async () => {
        if (!coordinates || coordinates === "") {
            Alert.alert("Error", "Coordinates are required!");
            return;
        }
        const eventFormData = new FormData();

        logAndAppend(eventFormData, 'title', title);
        logAndAppend(eventFormData, 'description', description);
        logAndAppend(eventFormData, 'location', location);
        logAndAppend(eventFormData, 'date', date);
        logAndAppend(eventFormData, 'time', time);
        logAndAppend(eventFormData, 'sport_type', sportsType.map(sport => sport.value).join(','));

        // Serialize the coordinates object to a JSON string
        const coordinatesString = JSON.stringify({
            type: "Point",
            coordinates: [coordinates.longitude, coordinates.latitude]
        });
        logAndAppend(eventFormData, 'coordinates', coordinatesString);
        try {
            const eventResponse = await fetch('http://192.168.0.118:8000/api/events/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${API_AUTHORIZATION}`,
                    'Content-Type': 'multipart/form-data' // adding the content type header
                },
                body: eventFormData
            });

            if (eventResponse.ok) {
                const eventData = await eventResponse.json();
                if (eventData.id) {
                    await updateEvent(eventData.id);
                }
            } else {
                // Log raw text response for better debugging.
                const rawText = await eventResponse.text();
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
            console.error('Event creation error:', error);
        }
    };


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
                <DatePicker date={date} setDate={setDate} setTime={setTime} />

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

                {/* Display selected images */}
                <View style={styles.selectedImagesContainer}>
                    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                    </ScrollView>
                </View>


                <Text style={styles.inputTitles}>Upload Video (Only 1)</Text>
                <UploadPicker type="video" limit={1} setFile={setSelectedVideo} index={0} />

                <TouchableOpacity style={[styles.button, { backgroundColor: '#777' }]} onPress={() => {
                    //navigation.navigate('EventScreen', { param1: 'Some data', param2: 'Some more data' });
                    console.log(location)
                    console.log(coordinates)
                }}>
                    <Text style={styles.buttonText}>Preview Event</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, { backgroundColor: 'green', marginBottom: width * 0.5 }]} onPress={createEvent}>
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


