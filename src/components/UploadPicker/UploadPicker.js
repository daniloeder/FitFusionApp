import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions, Pressable } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import Icons from '../../components/Icons/Icons'; // Assuming this path is correct

const width = Dimensions.get('window').width;

const UploadPicker = ({ type = "any", limit = 1, setFile, index }) => {
    const [selectedFile, setSelectedFile] = useState(null);

    const getFileType = (type) => {
        switch (type) {
            case 'image':
                return 'image/*';
            case 'video':
                return 'video/*';
            default:
                return '*/*';
        }
    };

    async function selectFiles() {
        try {
            const options = {
                type: getFileType(type),
                multiple: limit > 1,
            };

            const docResult = await DocumentPicker.getDocumentAsync(options);

            if (docResult.type === 'success') {
                setSelectedFile(docResult);
                setFile(docResult, index);
            }
        } catch (err) {
            console.warn(err);
        }
    }

    return (
        <>
            <View style={styles.container}>
                <TouchableOpacity style={styles.button} onPress={selectFiles}>
                    {selectedFile && selectedFile.uri ? (
                        <Image source={{ uri: selectedFile.uri }} style={styles.thumbnail} />
                    ) :
                        type === "image" ? <Icons name="AddImage" size={width * 0.12} style={styles.centerIcon} /> :
                            type === "video" ? <Icons name="AddVideo" size={width * 0.12} style={styles.centerIcon} /> : ''
                    }
                </TouchableOpacity>

                {selectedFile && selectedFile.uri && (
                    <Pressable style={styles.closeIcon} onPress={() => {
                        setSelectedFile(null);
                        setFile(null, index);
                    }}>
                        <Icons name="CloseX" size={width * 0.08} />
                    </Pressable>
                )}
            </View>

        </>
    );
};

const styles = StyleSheet.create({
    container: {
        maxWidth: width * 0.2,
        marginTop: width * 0.02,
        flexDirection: 'row',
        alignItems: 'center',
    },
    button: {
        padding: width * 0.008,
        width: width * 0.15,
        height: width * 0.15,
        marginRight: width * 0.03,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
        position: 'relative',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    closeIcon: {
        position: 'absolute',
        top: -width * 0.035,
        right: width * 0.015,
    },
    centerIcon: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -width * 0.05 }, { translateY: -width * 0.05 }],
    },
});

export default UploadPicker;
