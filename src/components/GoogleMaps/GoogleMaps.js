import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Button, Modal, Pressable, Text } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { Marker } from 'react-native-maps';
import { GOOGLE_PLACES_API_KEY } from '@env';
import Icons from '../../components/Icons/Icons';

const width = Dimensions.get('window').width;

const GoogleAutocompletePicker = ({ setLocation, setCoordinates, language = "en" }) => {
  const handleSelectPlace = (data, details = null) => {
    { setLocation && setLocation(details.formatted_address) }
    { setCoordinates && setCoordinates({ latitude: details.geometry.location.lat, longitude: details.geometry.location.lng }) }
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


const ShowOnMap = ({ coordinates }) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Pressable
        style={{
          paddingHorizontal: width * 0.03,
          height: width * 0.12,
          borderRadius: width * 0.05,
          backgroundColor: '#CCC',
          marginLeft: 'auto',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row'

        }}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ fontSize: width * 0.035, fontWeight: 'bold', color: '#000', marginRight: '2%' }}>Check on Maps</Text>
        <Icons name="Map" size={width * 0.04} />
      </Pressable>

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
              latitudeDelta: 0.002,
              longitudeDelta: 0.002,
            }}
            zoomEnabled={true}
            scrollEnabled={true}
          >
          </MapView>

          <Button
            title="Close Map"
            onPress={() => setModalVisible(false)}
          />
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

export { GoogleAutocompletePicker, ShowOnMap };