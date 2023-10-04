import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

const GradientBackground = () => (
    <Svg style={StyleSheet.absoluteFill}>
        <Defs>
            <LinearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#1A202C" stopOpacity="1" />
                <Stop offset="0.5" stopColor="#991B1B" stopOpacity="1" />
                <Stop offset="1" stopColor="#1A202C" stopOpacity="1" />
            </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#bgGrad)" />
    </Svg>
);


const styles = StyleSheet.create({
    gradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
    },
});

export default GradientBackground;