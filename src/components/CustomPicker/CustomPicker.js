import React, { useState } from 'react';
import { View, Pressable, Text, StyleSheet, Dimensions, ScrollView, TouchableWithoutFeedback, Modal, Alert } from 'react-native';
import Checkbox from 'expo-checkbox';

const width = Dimensions.get('window').width;

const CustomPicker = ({ options, selectedOptions, setSelectedOptions, max }) => {
    const [visibleInputArea, setVisibleInputArea] = useState(false);

    function addRemoveItem(selectedOption) {
        const optionExists = selectedOptions.some(option => option.id === selectedOption.id);

        if (optionExists) {
            const newSelectedOptions = selectedOptions.filter(option => option.id !== selectedOption.id);
            setSelectedOptions(newSelectedOptions);
        } else if (selectedOptions.length < max) { // Check against the max limit
            setSelectedOptions([...selectedOptions, selectedOption]);
        } else {
            Alert.alert('Maximum Selection Reached', `You can select up to ${max} options.`);
        }
    }

    return (
        <View style={styles.container}>
            <Pressable onPress={() => setVisibleInputArea(!visibleInputArea)} style={styles.searchInputBox}>
                <Text style={{ color: '#999' }}>
                    {selectedOptions.length ? selectedOptions.map(option => option.name).join(", ") : "Select Options"}
                </Text>
            </Pressable>

            {visibleInputArea && (
                <Modal transparent={true} animationType="none" visible={visibleInputArea}>
                    <TouchableWithoutFeedback onPress={() => setVisibleInputArea(false)}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.selectContainer}>
                                <ScrollView style={styles.selectBox}>
                                    {
                                        options.map(option => (
                                            <Pressable
                                                key={option.id}
                                                style={styles.selectItem}
                                                onPress={() => addRemoveItem(option)}
                                            >
                                                <Text style={styles.itemText}>{option.name}</Text>
                                                <Checkbox
                                                    style={styles.selectItemCheckBox}
                                                    value={selectedOptions.some(o => o.id === option.id)}
                                                    onValueChange={() => addRemoveItem(option)}
                                                />
                                            </Pressable>
                                        ))
                                    }
                                </ScrollView>
                            </View>
                            <Pressable
                                onPress={() => setVisibleInputArea(false)}
                                style={styles.closeButton}
                            >
                                <Text style={styles.closeButtonText}>Close</Text>
                            </Pressable>
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
        marginBottom: width * 0.05,
        zIndex: 1,
    },
    searchInputBox: {
        height: width * 0.13,
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
        height: width*0.12,
        flexDirection: 'row',
        alignItems: 'center',
        padding: width * 0.02,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
        justifyContent: 'space-between',
    },
    itemText: {
        fontSize: width * 0.035,
    },
    selectItemCheckBox: {
        width: width * 0.042,
        height: width * 0.042,
    },
    closeButton: {
        marginTop: width * 0.0,
        backgroundColor: '#FFF',
        paddingHorizontal: width * 0.3,
        paddingVertical: width * 0.03,
        borderBottomLeftRadius: width * 0.1,
        borderBottomRightRadius: width * 0.1,
        alignSelf: 'center',
    },
    closeButtonText: {
        color: 'gray',
        fontSize: width * 0.04,
    },
});

export default CustomPicker;