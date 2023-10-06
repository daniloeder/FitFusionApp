import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Dimensions, Pressable, Appearance, LogBox } from 'react-native';
import moment from 'moment';
import GradientBackground from './../../components/GradientBackground/GradientBackground';
import Icons from '../../components/Icons/Icons';
import GoogleAutocompletePicker from './../../components/GoogleAutocompletePicker/GoogleAutocompletePicker';

LogBox.ignoreLogs(['VirtualizedLists should never be nested']);

import DateTimePickerModal from 'react-native-modal-datetime-picker';

const width = Dimensions.get('window').width;

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
        <Pressable
            onPress={() => setDatePickerVisibility(true)}
            style={[styles.dataPikerContainer, selectedDate ? { borderColor: '#21347B' } : {}]}
        >
            <Icons name="Calendar" size={width * 0.08} style={{ padding: width * 0.028, marginTop: width * 0.01 }} />
            <Text style={{ color: '#656565', fontSize: width * 0.04, marginLeft: width * 0.02 }}>
                {selectedDate ? moment(selectedDate).format("DD/MM/YYYY HH:mm") : "Click to select the date and time"}
            </Text>

            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="datetime"
                isDarkModeEnabled={Appearance.getColorScheme() === 'dark'}
                onConfirm={handleConfirm}
                onCancel={() => {
                    setDatePickerVisibility(false);
                }}
            />

        </Pressable>
    );
};

const CreateEventScreen = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState('2023-10-01');
    const [time, setTime] = useState('15:00:00');
    const [sportType, setSportType] = useState('');
    const [coordinates, setCoordinates] = useState('');
    const [creator, setCreator] = useState(1);

    // Other fields can be added in a similar fashion

    const createEvent = async () => {
        try {
            const response = await fetch('http://192.168.0.118:8000/api/events/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add your authorization token here
                    'Authorization': 'Bearer '
                },
                body: JSON.stringify({
                    title,
                    description,
                    location,
                    date,
                    time,
                    sport_type: sportType,
                    coordinates,
                    creator: creator
                    // You can add more fields as needed
                })

            });

            if (!response.ok) {
                const data = await response.json();
                console.error('Error creating event:', data);
                return;
            }

            // Successfully created event
            console.log('Event created successfully!');

        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <View style={styles.gradientContainer}>
            <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />
            <ScrollView style={styles.container}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                overScrollMode="never"
                keyboardShouldPersistTaps='always'
            >

                <Text style={styles.inputTitles}>Title</Text>
                <TextInput
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Title"
                />

                <Text style={styles.inputTitles}>Description</Text>
                <TextInput
                    style={[styles.input, {height: width*0.3}]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Description"
                />

                <Text style={styles.inputTitles}>Date and Time of Event</Text>
                <DatePicker date={date} setDate={setDate} setTime={setTime} />

                <Text style={styles.inputTitles}>Sport Type</Text>
                <TextInput
                    style={styles.input}
                    value={sportType}
                    onChangeText={setSportType}
                    placeholder="Sport Type"
                />

                <Text style={styles.inputTitles}>Location</Text>
                <GoogleAutocompletePicker setLocation={setLocation} setCoordinates={setCoordinates} />

                <TouchableOpacity style={[styles.button, { backgroundColor: '#777' }]} onPress={() => { }}>
                    <Text style={styles.buttonText}>Preview Event</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, { backgroundColor: 'green' }]} onPress={() => { }}>
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
});

export default CreateEventScreen;
