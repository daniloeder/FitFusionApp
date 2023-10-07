import React, { useState, useRef, useEffect } from 'react';
import {
    View, Image, Modal, Dimensions, TouchableOpacity, Pressable, StyleSheet, Text
} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { Video } from 'expo-av';
import Constants from 'expo-constants';
import Icons from '../../components/Icons/Icons';

const { width } = Dimensions.get('window');

const ShowImage = ({ media }) => {
    const [modalVisible, setModalVisible] = useState(false);

    const images = [
        {
            url: media.photo,
        },
    ];

    return (
        <View style={{ flex: 1 }}>
            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={{
                    width: width * 0.4,
                    height: width * 0.4,
                    marginRight: width * 0.05,
                    marginBottom: width * 0.05,
                    borderWidth: 1,
                    borderColor: 'black',
                }}
            >
                <Image source={{ uri: media.photo }} style={{ flex: 1 }} resizeMode="cover" />
            </TouchableOpacity>

            {modalVisible && (
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        activeOpacity={1}
                        onPressOut={() => setModalVisible(false)}
                    >
                        <ImageViewer imageUrls={images} enableSwipeDown={true} onSwipeDown={() => setModalVisible(false)} />

                        <Pressable
                            onPress={() => setModalVisible(false)}
                            style={{
                                padding: '2%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 1000,
                                opacity: 0.8,
                                position: 'absolute',
                                left: '5%',
                                top: '2%',
                                backgroundColor: '#991B1B',
                            }}
                        >
                            <Icons name="LeftArrow" size={30} />
                        </Pressable>
                    </TouchableOpacity>
                </Modal>
            )}
        </View>
    );
};

function ShowVideo({ media }) {
    const [rectTop, setRectTop] = useState(0);
    const [rectBottom, setRectBottom] = useState(0);
    const [rectWidth, setRectWidth] = useState(0);
    const [isInViewport, setIsInViewport] = useState(true);

    const videoRef = useRef(null);
    let myViewRef;

    useEffect(() => {
        const interval = setInterval(() => {
            if (!myViewRef) {
                return;
            }
            myViewRef.measure((x, y, width, height, pageX, pageY) => {
                setRectTop(pageY);
                setRectBottom(pageY + height);
                setRectWidth(pageX + width);
            });
            isInViewPort();
        }, 100);

        return () => {
            clearInterval(interval);
        };
    }, []);

    const isInViewPort = () => {
        const window = Dimensions.get('window');
        const isVisible =
            rectBottom !== 0 &&
            rectTop >= 0 &&
            rectBottom <= window.height &&
            rectWidth > 0 &&
            rectWidth <= window.width;

        setIsInViewport(isVisible);
    };

    return (
        <View style={styles.container}>
            <View
                collapsable={false}
                ref={(component) => {
                    myViewRef = component;
                }}
            >
                <Video
                    ref={videoRef}
                    source={{
                        uri: media,
                    }}
                    rate={1.0}
                    volume={1.0}
                    isMuted={false}
                    resizeMode="contain"
                    shouldPlay
                    useNativeControls
                    onPlaybackStatusUpdate={(status) => {
                        if (!status.isPlaying && isInViewport) {
                            videoRef.current.replayAsync();
                        }
                    }}
                    style={{ width: '100%', height: '100%' }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingTop: Constants.statusBarHeight,
        backgroundColor: '#ecf0f1',
        padding: 8,
    },
});

const ShowMedia = ({ media, isVideo }) => {
    return (
        isVideo ? <ShowVideo media={media} /> : <ShowImage media={media} />
    )
};

export default ShowMedia;
