import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

const width = Dimensions.get('window').width;

const SelectBox = ({ title, max, allOptions, allOptionsNames, selectedOptions, setSelectedItem, obligatory = false }) => {
    const onSelectItem = (item) => {
        if (selectedOptions.includes(item)) {
            setSelectedItem(selectedOptions.filter(selected => selected !== item));
        } else {
            setSelectedItem([...selectedOptions, item]);
        }
    }
    const onRemoveItem = (item) => {
        setSelectedItem(selectedOptions.filter(selected => selected !== item));
    }
    const alertMaxItems = (title) => {
        alert(`You can only select ${max} "${title}" per training day. Please remove an item first.`);
    }

    const styles = StyleSheet.create({
        selectBox: {
            width: '90%',
            marginLeft: '5%',
            borderRadius: 5,
            justifyContent: 'space-between',
            marginBottom: 10,
            padding: 3,
            borderRadius: 8,
            backgroundColor: '#eee'
        },
        itemsList: {
            width: '100%',
            padding: 10,
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            flexWrap: 'wrap',
        },
        selectedItems: {
            borderTopRightRadius: 5,
            backgroundColor: '#F0F0F0',
            justifyContent: 'center',
            flexWrap: 'wrap',
        },
        unselectedItems: {
            borderRadius: 5,
            borderTopLeftRadius: 0,
            borderTopEndRadius: 0,
            backgroundColor: '#CCCCCC',
        },
        selectBoxItem: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: width * 0.02,
            paddingVertical: width * 0.008,
            borderRadius: width * 0.01,
            margin: width * 0.01,
            backgroundColor: '#DDD',
        },
        selectBoxItemText: {
            color: '#000',
            fontWeight: 'bold',
            fontSize: width * 0.03
        },

    });

    return (
        <View style={styles.selectBox}>
            <View style={styles.textContainer}>
                <Text style={{ fontWeight: 'bold', fontSize: width * 0.03, color: '#000' }}>{title}</Text>
            </View>
            <View style={[styles.itemsList, styles.selectedItems]}>
                {
                    selectedOptions.length ? selectedOptions.map((option, index) => {
                        return (
                            <TouchableOpacity key={index} style={styles.selectBoxItem} onPress={() => onRemoveItem(option)}>
                                <Text style={styles.selectBoxItemText}>{allOptionsNames[option]}</Text>
                            </TouchableOpacity>
                        )
                    }) :
                        <Text style={{ color: '#888', fontSize: width * 0.025 }}>Select an option to add.{obligatory && " Obligatory!"}</Text>
                }
            </View>
            <View style={[styles.itemsList, styles.unselectedItems]}>
                {
                    allOptions.filter(option => !selectedOptions.includes(option)).map((option, index) => {
                        return (
                            <TouchableOpacity key={index} style={styles.selectBoxItem} onPress={() => !max || selectedOptions.length < max ? onSelectItem(option) : alertMaxItems(title)}>
                                <Text style={[styles.selectBoxItemText, { color: '#888' }]}>{allOptionsNames[option]}</Text>
                            </TouchableOpacity>
                        )
                    })
                }
                {max && <Text style={{ position: 'absolute', bottom: 0, right: 3, color: '#888', fontSize: width * 0.03 }}>Max: {max}</Text>}
            </View>
        </View>
    )
}

export default SelectBox;