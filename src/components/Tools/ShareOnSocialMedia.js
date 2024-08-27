import React, { useState } from 'react';
import { View, Text, Button, Linking, Platform, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import CustomModal from '../CustomComponents/CustomModal';
import { BASE_URL } from '@env';

const ShareOnSocialMedia = () => {
    const [showModal, setShowModal] = useState(false);
    const [copied, setCopied] = useState(false);

    const fetchImage = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/users/share-image-social/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const text = await response.text();
                console.error('Server error:', text);
                throw new Error('Failed to fetch the image from the server.');
            }

            const data = await response.json();
            if (data.success) {
                return data.image;
            } else {
                throw new Error('Error fetching image: ' + data.message);
            }
        } catch (error) {
            console.error('Error fetching image:', error);
            return null;
        }
    };

    const Share = async () => {
        const base64Image = await fetchImage();

        if (!copied){
            Alert.alert('Reminder', 'Please copy the @fitfusion.app tag, you need to tag us in your instagram story.');
            return;
        }

        const tag = '@fitfusion.app';

        if (!base64Image) {
            Alert.alert('Error', 'No image to share.');
            return;
        }

        const isTagCopied = await Clipboard.getStringAsync();

        // Check if the tag is already copied, if not alert the user to copy it
        if (isTagCopied !== tag) {
            Alert.alert('Reminder', 'Please copy the @fitfusion.app tag.', [
                { text: 'Copy Now', onPress: () => Clipboard.setStringAsync(tag) },
            ]);
            return;
        }

        const localUri = FileSystem.documentDirectory + 'temp-share-image.jpg';

        try {
            await FileSystem.writeAsStringAsync(localUri, base64Image, {
                encoding: FileSystem.EncodingType.Base64,
            });

            if (Platform.OS === 'ios') {
                const instagramUrl = `instagram-stories://share?source_application=com.myapp`;
                if (await Linking.canOpenURL(instagramUrl)) {
                    Linking.openURL(instagramUrl);
                } else {
                    Alert.alert('Error', 'Instagram is not installed on this device.');
                }
            } else {
                await Sharing.shareAsync(localUri);
            }
        } catch (error) {
            console.error('Error sharing image:', error);
            Alert.alert('Error', 'Failed to share the image.');
        }
    };

    const copyTagToClipboard = () => {
        Clipboard.setStringAsync('@fitfusion.app');
        setCopied(true);
        Alert.alert('Copied!', '@fitfusion.app tag has been copied to your clipboard.');
    };

    if (!showModal) return <TouchableOpacity style={[styles.copyButton, { backgroundColor: '#2196F3' }]} onPress={() => setShowModal(true)}>
        <Text style={styles.copyButtonText}>Unlock Features for Free</Text>
    </TouchableOpacity>;

return (
        <CustomModal
            title="Share on Instagram"
            titlecolor="#555"
            width={'90%'}
            height={'60%'}
            backgroundColor={'#FFF'}
            borderColor={'rgba(0,0,0,0.7)'}
            onClose={() => setShowModal(false)}
        >
            <View style={styles.container}>
                <Text style={styles.title}>
                    To win 1 month upgrade you only need to share the app in your Instagram stories.
                </Text>

                <Text style={styles.note}>* You need to tag @fitfusion.app in the story so we can verify it.</Text>
                <Text style={styles.note}>* Image and @tag need to be well visible.</Text>
                <Text style={styles.note}>* Deleting the story may result in losing the free upgrade.</Text>
                <Text style={styles.note}>* You can only unlock this feature once.</Text>

                <TouchableOpacity style={styles.copyButton} onPress={copyTagToClipboard}>
                    <Text style={styles.copyButtonText}>Copy @fitfusion.app Tag</Text>
                </TouchableOpacity>

                <Text style={styles.extraText}>
                    After sharing, in a few seconds you will have access to the features.
                </Text>

                <TouchableOpacity style={[styles.copyButton, { backgroundColor: '#2196F3' }]} onPress={Share}>
                    <Text style={styles.copyButtonText}>Share</Text>
                </TouchableOpacity>
            </View>
        </CustomModal>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
        color: '#333',
    },
    note: {
        fontSize: 14,
        color: '#555',
        marginBottom: 5,
    },
    extraText: {
        fontSize: 14,
        color: '#333',
        marginVertical: 15,
        textAlign: 'center',
    },
    copyButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 20,
    },
    copyButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ShareOnSocialMedia;
