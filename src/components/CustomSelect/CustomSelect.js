import React, { useState } from 'react';
import { View, Pressable, Text, StyleSheet, Dimensions, ScrollView, Modal } from 'react-native';

const width = Dimensions.get('window').width;

const CustomSelect = ({ options, selectedOption, setSelectedOption }) => {
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <View style={styles.container}>
            <Pressable style={styles.box} onPress={() => setModalVisible(true)}>
                <Text style={styles.boxText}>
                    {selectedOption && selectedOption.name ? selectedOption.name : "Select an option"}
                </Text>
            </Pressable>

            <Modal
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
                animationType="fade"
            >
                <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
                    <View style={styles.modalContent}>
                        <ScrollView>
                            {options.map((option) => (
                                <Pressable
                                    key={option.id}
                                    style={styles.option}
                                    onPress={() => {
                                        setSelectedOption(option);
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.optionText}>{option.name}</Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
    },
    box: {
        width: width * 0.9,
        height: width * 0.12,
        paddingLeft: '3%',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#ddd',
        borderRadius: width * 0.02,
        backgroundColor: '#f8f8f8',
        marginBottom: width * 0.02,
    },
    boxText: {
        color: '#999',
        fontSize: width * 0.04,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    modalContent: {
        width: width * 0.8,
        maxHeight: width * 0.8,
        backgroundColor: 'white',
        borderRadius: width * 0.02,
        padding: width * 0.04,
    },
    option: {
        paddingVertical: width * 0.03,
        paddingHorizontal: width * 0.04,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    optionText: {
        fontSize: width * 0.04,
    },
});

export default CustomSelect;
