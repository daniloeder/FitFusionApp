import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import GradientBackground from './../../components/GradientBackground/GradientBackground';

const Notifications = () => {
  return (
    <View style={styles.gradientContainer}>
      <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />

      <View style={styles.header}>
        <Text style={styles.headerText}>Notifications</Text>
        <Icon name="notifications" size={30} color="#000" />
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        overScrollMode="never"
      >
        {/* Sample notification */}
        <View style={styles.notificationCard}>
          <Text style={styles.notificationText}>
            This is a sample notification. Check it out!
          </Text>
          <Text style={styles.notificationDate}>5 minutes ago</Text>
        </View>

        {/* You can duplicate the above View component for more sample notifications */}
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  notificationCard: {
    backgroundColor: 'white',
    opacity: 0.8,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  notificationText: {
    fontSize: 16,
  },
  notificationDate: {
    fontSize: 12,
    color: 'gray',
    marginTop: 5,
  },
});

export default Notifications;
