import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import GradientBackground from '../../components/GradientBackground/GradientBackground';
import Icons from '../../components/Icons/Icons';

const width = Dimensions.get('window').width;

const TrainingDay = ({ day, setSelectedDay, isSelected }) => {
    const styles = StyleSheet.create({
        dayContainer: {
            backgroundColor: isSelected ? '#DDD' : '#FFF',
            padding: width * 0.02,
            marginVertical: width * 0.01,
            borderRadius: width * 0.02,
            shadowColor: '#000',
            shadowOffset: {
                width: width * 0.03,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: width * 0.01,
            elevation: 5,
        },
        dayText: {
            color: '#1C274C',
            fontSize: width * 0.035,
            fontWeight: 'bold',
        },
    });

    return (
        <TouchableOpacity onPress={() => setSelectedDay(day)}>
            <View style={styles.dayContainer}>
                <Text style={styles.dayText}>{day.name}</Text>
            </View>
        </TouchableOpacity>
    );
};

const TrainingMember = ({ dayName, muscleGroup, exercises, removeExercise }) => {
    return (
        <View key={muscleGroup} style={styles.trainingMemberGroup}>
            <View style={styles.muscleGroupHeader}>
                <Text style={styles.muscleGroupText}>{muscleGroup}</Text>
            </View>
            {exercises.map((exercise, index) => (
                <TouchableOpacity key={index} style={styles.planDetailsContainer} onPress={() => removeExercise(dayName, muscleGroup, index)}>
                    <Text style={styles.exercise}>{exercise}</Text>
                    <Icons name="CloseX" size={width * 0.04} style={{ marginLeft: width * 0.01 }} />
                </TouchableOpacity>
            ))}
        </View>
    )
}

const MyPlansScreen = () => {
    const [days, setDays] = useState({
        Sun: {
            neck: [
                'How to Neck Flexion Stretch',
                'How to Neck Extension Stretch',
                'How to Side Neck Stretch'
            ],
            trapezius: [
                'Barbell Overhead Shrug',
                'Gittleson Shrug Overview',
                '45 Degree Incline Row'
            ],
            shoulders: [
                'Medicine Ball Overhead Throw – Benefits',
                'Dumbbell Push Press',
                'Standing Dumbbell Shoulder Press'
            ]
        },
        Mon: {
            chest: [
                'Medicine Ball Overhead Throw – Benefits',
                'Standing Medicine Ball Chest Pass',
                'Arm Scissors'
            ],
            back: [
                'How to: Rowing Machine / Rowing Ergometer / Indoor Rowing',
                'How to Lever Front Pulldown',
                'How to Pull-Up'
            ],
            erectorSpinae: [
                'Dumbbell Good Morning',
                'Dumbbell Deadlift',
                'Dumbbell Sumo Deadlift'
            ]
        },
        Tue: {
            biceps: [
                'Seated Zottman Curl',
                'Standing Barbell Concentration Curl',
                'Waiter Curl'
            ],
            triceps: [
                'Medicine Ball Overhead Throw – Benefits',
                'One Arm Triceps Pushdown',
                'Dumbbell Kickback'
            ],
            forearm: [
                'Seated Zottman Curl',
                'Wrist Roller',
                'How to Dumbbell Seated Neutral Wrist Curl'
            ]
        },
        Wed: {
            abs: [
                'Medicine Ball Rotational Throw',
                'Dragon Flag',
                'How to: Ab Coaster Machine'
            ],
            leg: [
                'How to do:',
                '5 Dot Drills',
                'High Knee Lunge on Bosu Ball / Bosu Ball Reverse Lunge'
            ],
            calf: [
                'How to Standing Calf Raise',
                'How to Calf Raise',
                'Calf Raise with Resistance Band'
            ]
        },
        Thu: {
            hip: [
                'How to do:',
                '5 Dot Drills',
                'High Knee Lunge on Bosu Ball / Bosu Ball Reverse Lunge'
            ],
            cardio: [
                '5 Dot Drills',
                'Navy Seal Burpee',
                'Depth Jump to Hurdle Hop'
            ],
            fullBody: [
                'Navy Seal Burpee',
                'Dumbbell Walking Lunge',
                'Dumbbell Push Press'
            ]
        },
        Fri: {
            neck: [
                'How to Diagonal Neck Stretch',
                'How to do Neck Rotation Stretch',
                'How to Side Push Neck Stretch'
            ],
            trapezius: [
                'Dumbbell Shrug',
                'Cable Shrug',
                'How to Barbell Shrug'
            ],
            shoulders: [
                'Arm Scissors',
                'Side Arm Raise',
                'Arm Circles'
            ]
        },
        Sat: {
            chest: [
                'Incline Chest Fly Machine',
                'Bench Press',
                'Pec Deck Fly'
            ],
            back: [
                'Cable Rear Pulldown / Behind The Neck Pulldown',
                'Lat Pulldown',
                'Seated Cable Row'
            ],
            erectorSpinae: [
                'How to Seated Back Extension',
                'Barbell Bent Over Row',
                'How to do Bent Over Dumbbell Row'
            ]
        }
    });

    const [selectedDay, setSelectedDay] = useState(null);

    const removeExercise = (dayName, muscleGroup, exerciseIndex) => {
        if (!days[dayName] || !days[dayName][muscleGroup]) {
            console.error(`Day or muscle group: ${dayName} - ${muscleGroup} not found.`);
            return;
        }
        const newExercises = days[dayName][muscleGroup].filter((_, index) => index !== exerciseIndex);
        setDays(prevDays => ({
            ...prevDays,
            [dayName]: {
                ...prevDays[dayName],
                [muscleGroup]: newExercises
            }
        }));
    };

    return (
        <View style={styles.container}>
            <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />

            <ScrollView
                style={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                overScrollMode="never"
            >
                {/* Training Plan Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Training Plan</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'space-between' }}>
                        {Object.entries(days).map(([dayName, dayDetails]) =>
                            <TrainingDay
                                key={dayName}
                                day={{ name: dayName.slice(0, 3), ...dayDetails }}
                                setSelectedDay={() => setSelectedDay({ name: dayName.slice(0, 3), ...dayDetails })}
                                isSelected={selectedDay && selectedDay.name === dayName.slice(0, 3)}
                            />
                        )}
                    </View>
                    <View>
                        {selectedDay && Object.entries(days).map(([dayName, dayDetails]) =>
                            selectedDay.name === dayName.slice(0, 3) && (
                                <View key={dayName}>
                                    {Object.entries(dayDetails).map(([muscleGroup, exercises]) =>
                                        <TrainingMember key={muscleGroup} dayName={dayName} muscleGroup={muscleGroup} exercises={exercises} removeExercise={removeExercise} />
                                    )}
                                </View>
                            )
                        )}
                    </View>
                </View>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    sectionContainer: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#FFFFFF',
    },
    trainingMemberGroup: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: width * 0.02,
        borderRadius: width * 0.02,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        flexWrap: 'wrap',
        marginVertical: width * 0.01,
    },
    muscleGroupHeader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(55, 55, 55, 0.5)',
        paddingVertical: width * 0.02,
        paddingHorizontal: width * 0.06,
        borderBottomEndRadius: width * 0.02,
        borderTopLeftRadius: width * 0.02,
        marginLeft: -width * 0.02,
        marginTop: -width * 0.02,
        marginRight: 'auto',
        marginBottom: width * 0.015,
    },
    muscleGroupText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    exercise: {
        fontSize: width * 0.04,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    planDetailsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: width * 0.02,
        paddingVertical: width * 0.008,
        borderRadius: width * 0.02,
        margin: width * 0.01,
        backgroundColor: '#aaa',
    },
    removeButton: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF0000',
    },
});

export default MyPlansScreen;