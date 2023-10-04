import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import GradientBackground from './../../components/GradientBackground/GradientBackground';

const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const onSearch = async () => {
    // Perform API call to search
    try {
      // Here use the endpoint that corresponds to your search functionality
      const response = await fetch(`http://localhost:8000/api/search/?query=${query}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error during the search:', error);
    }
  };

  return (
    <View style={styles.gradientContainer}>
      <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />

      <View style={styles.header}>
        <Text style={styles.headerText}>Search</Text>
      </View>

      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={onSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={onSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        overScrollMode="never"
      >
        {
          results.map(item => (
            <View key={item.id.toString()} style={styles.resultItem}>
              <Text style={styles.resultText}>{item.name}</Text>
              {/* Render other item properties as needed */}
            </View>
          ))
        }
      </ScrollView>
    </View>
  );
};
styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  searchBarContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    marginHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    backgroundColor: 'white',
    opacity: 0.8,
    borderRadius: 5,
  },
  searchButton: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  searchButtonText: {
    color: '#fff',
  },
  scrollContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  resultItem: {
    padding: 10,
    backgroundColor: 'white',
    opacity: 0.8,
    borderRadius: 10,
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
  resultText: {
    fontSize: 16,
  },
});

export default SearchScreen;
