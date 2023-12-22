import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const width = Dimensions.get('window').width;

const QRGenerator = ({ object }) => {
  const jsonString = JSON.stringify(object);

  return (
    <View style={styles.container}>
      <QRCode 
        value={jsonString} 
        size={width*0.6}
        backgroundColor="white"
        color="#1A202C"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  }
});

export default QRGenerator;