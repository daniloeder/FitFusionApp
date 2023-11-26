import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const width = Dimensions.get('window').width;

const OpenTimesTable = ({openTimes}) => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const formatTime = (time) => {
        return time ? time.substring(0, 5) : null;
    };

    const renderCustomTime = (custom) => {
        return (
            <View key={custom.date} style={styles.customTimeContainer}>
                <Text style={styles.customDate}>{custom.date}</Text>
                <Text style={[styles.customTimeText, { color: custom.open ? '#2e7d32' : '#d32f2f' }]}>
                    {custom.open ? `${formatTime(custom.open_time)} - ${formatTime(custom.close_time)}` : 'Closed'}
                </Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {daysOfWeek.map((day, index) => (
                <View key={day} style={styles.day}>
                    <Text style={styles.dayLabel}>{day}</Text>
                    {openTimes[day.toLowerCase()] && openTimes[day.toLowerCase()].open ? (
                        <>
                            <Text style={styles.time}>
                                {formatTime(openTimes[day.toLowerCase()].open_time)}
                            </Text>
                            <Text style={styles.time}>
                                -
                            </Text>
                            <Text style={styles.time}>
                                {formatTime(openTimes[day.toLowerCase()].close_time)}
                            </Text>
                        </>
                    ) : (
                        <Text style={styles.closed}>Closed</Text>
                    )}
                </View>
            ))}
            <View
                style={{
                    width: '100%',
                    padding: 10,
                    justifyContent: 'center',
                }}
            >
                {openTimes.custom.map((custom) => {
                    return renderCustomTime(custom);
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        flexWrap: 'wrap',
        padding: 5,
        borderRadius: width * 0.05,
        borderTopLeftRadius: width * 0.01,
        backgroundColor: 'rgba(242, 242, 242, 0.3)',
    },
    day: {
        minWidth: width * 0.16,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 2,
        margin: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 2,
    },
    dayLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    time: {
        color: '#2e7d32',
        fontSize: width * 0.03,
    },
    closed: {
        color: '#d32f2f',
        fontWeight: 'bold',
        fontSize: 12,
    },

    customTimeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#ccc',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        margin: 5,
    },
    customDate: {
        fontWeight: 'bold',
        fontSize: 12,
    },
    customTimeText: {
        fontSize: 12,
    },
});

export default OpenTimesTable;