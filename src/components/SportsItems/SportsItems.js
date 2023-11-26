import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Icons from '../Icons/Icons';
import { SportsNames } from '../../utils/sports';

const width = Dimensions.get('window').width;

const iconNamesByIndex = ["BodyBuilding", "Soccer", "Basketball", "Tennis", "Baseball", "AmericanFootball", "Golf", "Cricket", "Rugby", "Volleyball", "TableTennis", "Badminton", "IceHockey", "FieldHockey", "Swimming", "TrackAndField", "Boxing", "Gymnastics", "MartialArts", "Cycling", "Equestrian", "Fencing", "Bowling", "Archery", "Sailing", "CanoeingKayaking", "Wrestling", "Snowboarding", "Skiing", "Surfing", "Skateboarding", "RockClimbing", "MountainBiking", "RollerSkating", "Other"];

const SportsItems = ({ favoriteSports }) =>
    <View style={styles.favoriteSports}>
        {favoriteSports.slice(0, 10).map((sport) =>
            <View key={sport} style={styles.sportItem}>
                <Text style={{ color: '#FFF', fontSize: width * 0.03 }}>
                    {SportsNames([sport])}
                </Text>
                <Icons name={iconNamesByIndex[(sport - 1)]} size={width * 0.05} style={{ marginLeft: 5 }} />
            </View>
        )}
    </View>

const styles = StyleSheet.create({
    favoriteSports: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        marginBottom: width * 0.04,
    },
    sportItem: {
        padding: width * 0.012,
        backgroundColor: '#888',
        borderRadius: width * 0.05,
        fontSize: width * 0.03,
        margin: width * 0.005,
        color: '#E2E8F0',
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default SportsItems;