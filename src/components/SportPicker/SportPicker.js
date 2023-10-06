import React, { useState } from 'react';
import { View, Pressable, Text, StyleSheet, Dimensions, ScrollView, TouchableWithoutFeedback, Modal } from 'react-native';
import Checkbox from 'expo-checkbox';

const width = Dimensions.get('window').width;

// Internalized sports options list
const sportsOptions = [
    { value: 'soccer', label: 'Soccer' },
    { value: 'basketball', label: 'Basketball' },
    { value: 'tennis', label: 'Tennis' },
    { value: 'baseball', label: 'Baseball' },
    { value: 'football', label: 'American Football' },
    { value: 'golf', label: 'Golf' },
    { value: 'cricket', label: 'Cricket' },
    { value: 'rugby', label: 'Rugby' },
    { value: 'volleyball', label: 'Volleyball' },
    { value: 'table_tennis', label: 'Table Tennis' },
    { value: 'badminton', label: 'Badminton' },
    { value: 'ice_hockey', label: 'Ice Hockey' },
    { value: 'field_hockey', label: 'Field Hockey' },
    { value: 'swimming', label: 'Swimming' },
    { value: 'track_and_field', label: 'Track and Field' },
    { value: 'boxing', label: 'Boxing' },
    { value: 'gymnastics', label: 'Gymnastics' },
    { value: 'martial_arts', label: 'Martial Arts' },
    { value: 'cycling', label: 'Cycling' },
    { value: 'equestrian', label: 'Equestrian' },
    { value: 'fencing', label: 'Fencing' },
    { value: 'bowling', label: 'Bowling' },
    { value: 'archery', label: 'Archery' },
    { value: 'sailing', label: 'Sailing' },
    { value: 'canoeing', label: 'Canoeing/Kayaking' },
    { value: 'wrestling', label: 'Wrestling' },
    { value: 'snowboarding', label: 'Snowboarding' },
    { value: 'skiing', label: 'Skiing' },
    { value: 'surfing', label: 'Surfing' },
    { value: 'skateboarding', label: 'Skateboarding' },
    { value: 'rock_climbing', label: 'Rock Climbing' },
    { value: 'mountain_biking', label: 'Mountain Biking' },
    { value: 'roller_skating', label: 'Roller Skating' }
    // You can continue to add more sports as needed
];

const SportsPicker = ({ sports, setSports }) => {
    const [visibleInputArea, setVisibleInputArea] = useState(false);

    function addRemoveItem(selectedOption) {
        const sportExists = sports.some(sport => sport.value === selectedOption.value);
        
        if (sportExists) {
            const newSports = sports.filter(sport => sport.value !== selectedOption.value);
            setSports(newSports);
        } else if (sports.length < 3) {
            setSports([...sports, selectedOption]);
        }
    }

    return (
        <View style={styles.container}>
            <Pressable onPress={() => setVisibleInputArea(!visibleInputArea)} style={styles.searchInputBox}>
                <Text style={{color:'#999'}}>{sports.length ? sports.map(sport => sport.label).join(", ") : "Select Sports"}</Text>
            </Pressable>

            {visibleInputArea && (
                <Modal transparent={true} animationType="none" visible={visibleInputArea}>
                    <TouchableWithoutFeedback onPress={() => setVisibleInputArea(false)}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.selectContainer}>
                                <ScrollView style={styles.selectBox}>
                                    {
                                        sportsOptions.map(option => (
                                            <Pressable
                                                key={option.value}
                                                style={styles.selectItem}
                                                onPress={() => addRemoveItem(option)}
                                            >
                                                <Text style={styles.itemText}>{option.label}</Text>
                                                <Checkbox
                                                    style={styles.selectItemCheckBox}
                                                    value={sports.some(sport => sport.value === option.value)}
                                                    onValueChange={() => addRemoveItem(option)}
                                                />
                                            </Pressable>
                                        ))
                                    }
                                </ScrollView>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            )}
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: width*0.05,
        zIndex: 1,
    },
    searchInputBox: {
        height: width*0.13,
        flexDirection: 'row',
        padding: width * 0.02,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: width * 0.01,
        backgroundColor: '#F8F8F8',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    selectContainer: {
        width: '90%',
        maxHeight: '70%',
        backgroundColor: 'white',
        borderRadius: 10,
        overflow: 'hidden'
    },
    selectBox: {
        width: '100%',
        backgroundColor: '#FFF',
    },
    selectItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: width * 0.02,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
        justifyContent: 'space-between',
    },
    itemText: {
        fontSize: width * 0.03,
    },
    selectItemCheckBox: {
        width: width * 0.032,
        height: width * 0.032,
    }
});

export default SportsPicker;
