import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import GradientBackground from './../../components/GradientBackground/GradientBackground';
import { BASE_URL } from '@env';
import Icons from '../../components/Icons/Icons';

const width = Dimensions.get('window').width;

const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ events: [], places: [], users: [] });
  const [searched, setSearched] = useState(false);

  const onSearch = async () => {
    try {
      const url = BASE_URL + `/api/common/search/?q=${encodeURIComponent(query)}`;
      const response = await fetch(url);
      const data = await response.json();
      console.log(data)
      setResults(data);
    } catch (error) {
      console.error('Error during the search:', error);
    }
  };

  const truncateText = (text, limit) => text.length > limit ? text.substring(0, limit) + '...' : text;

  return (
    <View style={styles.gradientContainer}>
      <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />

      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={query}
          onChangeText={setQuery}
        />
        <TouchableOpacity style={styles.searchButton} onPress={() => {
          onSearch();
          setSearched(true);
        }}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        overScrollMode="never"
      >
        {results.users.length > 0 && (
          <Text style={styles.resultCategory}>Users</Text>
        )}
        {results.users.map(user => 
            <View key={user.id.toString()} style={[styles.resultItem, styles.row]}>
              {user.profile_image ?
                <Image
                  style={styles.profileImage}
                  source={{ uri: BASE_URL + user.profile_image }}
                />
                :
                <View style={{ width: width * 0.12, height: width * 0.12, alignItems: 'center', justifyContent: 'center' }}>
                  <Icons name="Profile" size={width * 0.1} fill={'#1C274C'} />
                </View>
              }
              <View style={styles.textContainer}>
                <Text style={styles.resultTitle}>{user.username}</Text>
                <Text style={styles.resultDescription}>{truncateText(user.bio, 100)}</Text>
              </View>
            </View>
        )}
        {results.events.length > 0 && (
          <Text style={styles.resultCategory}>Events</Text>
        )}
        {results.events.map(event => (
          <View key={event.id.toString()} style={styles.resultItem}>
            <Text style={styles.resultTitle}>{event.title}</Text>
            <Text style={styles.resultDescription}>{truncateText(event.description, 100)}</Text>
          </View>
        ))}
        {results.places.length > 0 && (
          <Text style={styles.resultCategory}>Places</Text>
        )}
        {results.places.map(place => (
          <View key={place.id.toString()} style={styles.resultItem}>
            <Text style={styles.resultTitle}>{place.name}</Text>
            <Text style={styles.resultDescription}>{truncateText(place.description, 100)}</Text>
          </View>
        ))}
        {results.users.length === 0 && searched && (
          <Text style={styles.notFound}>No users found</Text>
        )}
        {results.events.length === 0 && searched && (
          <Text style={styles.notFound}>No events found</Text>
        )}
        {results.places.length === 0 && searched && (
          <Text style={styles.notFound}>No places found</Text>
        )}
      </ScrollView>
    </View>
  );
};

styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  searchBarContainer: {
    flexDirection: 'row',
    marginBottom: width * 0.02,
    marginHorizontal: width * 0.02,
    marginTop: width * 0.05,
  },
  searchInput: {
    flex: 1,
    padding: width * 0.025,
    backgroundColor: 'white',
    opacity: 0.9,
    borderRadius: 5,
    fontSize: width * 0.04,
  },
  searchButton: {
    marginLeft: width * 0.02,
    paddingVertical: width * 0.025,
    paddingHorizontal: width * 0.03,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    borderRadius: 5,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
    marginHorizontal: width * 0.02,
  },
  resultItem: {
    padding: width * 0.03,
    backgroundColor: 'white',
    opacity: 0.95,
    borderRadius: 10,
    marginBottom: width * 0.02,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
  },
  profileImage: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: width * 0.1,
    marginRight: width * 0.05,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  resultCategory: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: width * 0.04,
    marginBottom: width * 0.025,
    paddingHorizontal: width * 0.02,
  },
  resultTitle: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: width * 0.0125,
  },
  resultDescription: {
    fontSize: width * 0.035,
    color: '#555',
    lineHeight: width * 0.05,
  },
  notFound: {
    fontSize: width * 0.04,
    color: '#AAA',
    textAlign: 'center',
    marginTop: width * 0.1,
  },
});

export default SearchScreen;
