// UploadPicker.js
import React from 'react';
import { View, Pressable, Image, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import Icons from '../Icons/Icons';

const width = Dimensions.get('window').width;

const UploadPicker = ({ selectedImages, setSelectedImages, upload, setEditImages, type = "image", size = 100, max = 1, move = true, cancel }) => {

    const onImageSelect = (uri) => {
        setSelectedImages([...selectedImages, uri]);
    };
    const onDeleteImage = (index) => {
        const newImages = selectedImages.filter((_, i) => i !== index);
        setSelectedImages(newImages);
    };
    const onEditImage = (newUri, index) => {
        const updatedImages = [...selectedImages];
        updatedImages[index] = newUri;
        setSelectedImages(updatedImages);
    };
    const onSwapLeft = (index) => {
        if (index === 0) return;
        const newImages = [...selectedImages];
        [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
        setSelectedImages(newImages);
    };
    const onSwapRight = (index) => {
        if (index === selectedImages.length - 1) return;
        const newImages = [...selectedImages];
        [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
        setSelectedImages(newImages);
    };


    const pickImage = async () => {
        let result = await DocumentPicker.getDocumentAsync({ type: `${type}/*` });
        if (result.type === 'success') {
            onImageSelect(result);
        }
    };
    const editImage = async (index) => {
        let result = await DocumentPicker.getDocumentAsync({ type: `${type}/*` });
        if (result.type === 'success') {
            onEditImage(result, index);
        }
    };
    const swapLeft = (index) => {
        if (index > 0) {
            onSwapLeft(index);
        }
    };

    const swapRight = (index) => {
        if (index < selectedImages.length - 1) {
            onSwapRight(index);
        }
    };
    if (type != "image" && type != "video") return;

    return (
        <View style={styles.container}>
            {selectedImages && selectedImages.map((media, index) => (
                <View key={index} style={[styles.imageContainer, { width: size, height: size }]}>
                    <Image source={{ uri: media.image_id ? `http://192.168.0.118:8000/${media.image}` : media.uri }} style={styles.image} />
                    <Pressable
                        style={[styles.closeIcon, styles.icons]}
                        onPress={() => onDeleteImage(index)}
                    >
                        <Icons name="CloseX" size={width * 0.05} />
                    </Pressable>
                    <Pressable
                        style={[styles.editIcon, styles.icons]}
                        onPress={() => editImage(index)}
                    >
                        <Icons name="Edit" size={width * 0.05} />
                    </Pressable>
                    {move && index > 0 ?
                        <Pressable
                            style={[styles.leftArrow, styles.icons]}
                            onPress={() => swapLeft(index)}
                        >
                            <Icons name="LeftArrow" size={width * 0.05} />
                        </Pressable> : ''
                    }
                    {move && index < selectedImages.length - 1 ?
                        <Pressable
                            style={[styles.rightArrow, styles.icons]}
                            onPress={() => swapRight(index)}
                        >
                            <Icons name="RightArrow" size={width * 0.05} />
                        </Pressable> : ''
                    }
                </View>
            ))}
            {selectedImages && selectedImages.length < max ?
                <Pressable onPress={pickImage} style={[styles.addButton, { width: size, height: size }]}>
                    <Icons name={type === 'image' ? "AddImage" : "AddVideo"} size={width * 0.12} style={styles.centerIcon} />
                </Pressable> : ''
            }
            {upload ?
                <TouchableOpacity
                    style={{ width: '100%', alignItems: 'center', padding: width * 0.04, borderRadius: width * 0.02, backgroundColor: 'rgba(255,255,255,0.3)', }}
                    onPress={() => upload()}
                >
                    <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: width * 0.04 }}>Upload</Text>
                </TouchableOpacity>
                : ''
            }
            {cancel && setEditImages ?
                <TouchableOpacity
                    style={{ width: '50%', alignItems: 'center', padding: width * 0.04, borderRadius: width * 0.02, backgroundColor: 'rgba(255,255,255,0.3)', marginLeft: 'auto', marginTop: 10 }}
                    onPress={() => setEditImages(false)}
                >
                    <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: width * 0.04 }}>Cancel</Text>
                </TouchableOpacity>
                : ''
            }
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingVertical: width * 0.05,
        marginTop: width * 0.02,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageContainer: {
        margin: width * 0.03,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    closeIcon: {
        top: -width * 0.03,
        right: -width * 0.03,
    },
    editIcon: {
        bottom: '-10%',
        left: '35%',
    },
    leftArrow: {
        top: '35%',
        left: '-10%',
        opacity: 0.5,
    },
    rightArrow: {
        top: '35%',
        right: '-10%',
        opacity: 0.5,
    },
    icons: {
        position: 'absolute',
        padding: width * 0.02,
        borderRadius: width * 0.05,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    addButton: {
        padding: width * 0.008,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
        margin: width * 0.03,
        position: 'relative',
    },
});

export default UploadPicker;