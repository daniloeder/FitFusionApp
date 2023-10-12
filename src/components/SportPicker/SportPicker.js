import React, { useState } from 'react';
import { View, Pressable, Text, StyleSheet, Dimensions, ScrollView, TouchableWithoutFeedback, Modal } from 'react-native';
import Checkbox from 'expo-checkbox';
import { SportsTypes } from '../../utils/sports';

const width = Dimensions.get('window').width;
const SportsPicker = ({ sports, setSports, lang='en' }) => {
    const [visibleInputArea, setVisibleInputArea] = useState(false);
    const sportsOptions = SportsTypes(lang);

    function addRemoveItem(selectedOption) {
        const sportExists = sports.some(sport => sport.id === selectedOption.id);
        
        if (sportExists) {
            const newSports = sports.filter(sport => sport.id !== selectedOption.id);
            setSports(newSports);
        } else if (sports.length < 3) {
            setSports([...sports, selectedOption]);
        }
    }

    return (
        <View style={styles.container}>
            <Pressable onPress={() => setVisibleInputArea(!visibleInputArea)} style={styles.searchInputBox}>
                <Text style={{color:'#999'}}>
                    {sports.length ? sports.map(sport => sport.name).join(", ") : "Select Sports"}
                </Text>
            </Pressable>

            {visibleInputArea && (
                <Modal transparent={true} animationType="none" visible={visibleInputArea}>
                    <TouchableWithoutFeedback onPress={() => setVisibleInputArea(false)}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.selectContainer}>
                                <ScrollView style={styles.selectBox}>
                                    {
                                        Object.values(sportsOptions).map(sport => (
                                            <Pressable
                                                key={sport.id}
                                                style={styles.selectItem}
                                                onPress={() => addRemoveItem(sport)}
                                            >
                                                <Text style={styles.itemText}>{sport.name}</Text>
                                                <Checkbox
                                                    style={styles.selectItemCheckBox}
                                                    value={sports.some(s => s.id === sport.id)}
                                                    onValueChange={() => addRemoveItem(sport)}
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
