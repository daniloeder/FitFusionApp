import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_PLACES_API_KEY } from './../../../config';

const GoogleAutocompletePicker = ({ setLocation, setCoordinates, language = "en" }) => {
  const handleSelectPlace = (data, details = null) => {
    setLocation(details.formatted_address);
    setCoordinates(`${details.geometry.location.lat},${details.geometry.location.lng}`);

  };

  return (
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        placeholder='Search for a place...'
        onPress={handleSelectPlace}
        fetchDetails={true}
        query={{
          key: GOOGLE_PLACES_API_KEY,
          language: language,
        }}
        styles={{
          textInputContainer: styles.textInputContainer,
          textInput: styles.textInput,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textInputContainer: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0)',
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  textInput: {
    marginLeft: 0,
    marginRight: 0,
    height: 50,
    color: '#5d5d5d',
    fontSize: 16,
  },
});

export default GoogleAutocompletePicker;