import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Icons from '../../components/Icons/Icons';

const CustomInput = ({ secret, onChangeText, value, ...props }) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(!secret);

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                onChangeText={onChangeText}
                value={value}
                secureTextEntry={secret && !isPasswordVisible}
                {...props}
            />
            {secret && (
                <TouchableOpacity
                    style={styles.iconContainer}
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                    {isPasswordVisible ? (
                        <Icons name="EyeSlash" size={16} />
                    ) : (
                        <Icons name="Eye" size={16} />
                    )}
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: 'gray',
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
        backgroundColor: '#FFF',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        color: '#333',
    },
    iconContainer: {
        padding: 5,
    },
});

export default CustomInput;