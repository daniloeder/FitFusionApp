import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, Image, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import GradientBackground from '../../components/GradientBackground/GradientBackground';
import Icons from '../../components/Icons/Icons';
import { BASE_URL } from '@env';

const width = Dimensions.get('window').width;



const TrainingDay = ({ day, setSelectedDay, isSelected, index }) => {
    const styles = StyleSheet.create({
        dayContainer: {
            backgroundColor: isSelected ? '#FFF' : '#DDD',
            padding: width * 0.01,
            borderTopLeftRadius: width * 0.01,
            borderTopEndRadius: width * 0.045,
            borderBottomLeftRadius: index == 0 ? width * 0.02 : 0,
            borderBottomEndRadius: index == 6 ? width * 0.008 : 0,
            borderBottomWidth: width * 0.05,
            borderBottomColor: '#FFF',
        },
        dayText: {
            color: '#1C274C',
            fontSize: width * 0.035,
            fontWeight: 'bold',
        },
    });

    return (
        <TouchableOpacity onPress={() => setSelectedDay(day)} style={{ width: width * 0.128 }} activeOpacity={1}>
            <View style={styles.dayContainer}>
                <Text style={styles.dayText}>{day.name}</Text>
            </View>
        </TouchableOpacity>
    );

};

const TrainDetails = ({ exercise, showExerciseDetails, setShowExerciseDetails }) => {
    const onClose = () => {
        setShowExerciseDetails(false);
    };
    const styles = StyleSheet.create({
        container: {
            width: '90%',
            height: '90%',
            backgroundColor: '#FFF',
            padding: width * 0.02,
            borderRadius: width * 0.02,
            marginLeft: '5%',
            marginTop: '5%',
        },
        exerciseScroll: {
            padding: width * 0.02,
        },
        title: {
            fontWeight: '600',
            fontSize: 20,
            textAlign: 'center',
            color: '#333',
        },
        image: {
            height: width * 0.9,
            resizeMode: 'contain',
            marginVertical: 10,
        },
        sectionTitle: {
            fontWeight: '600',
            fontSize: 22,
            color: '#333',
        },
        exerciseInfo: {
            marginTop: 10,
            fontSize: 16,
            color: '#333',
        },
        listItem: {
            marginTop: 10,
            fontSize: 16,
            color: '#333',
        },
        closeButton: {
            paddingHorizontal: width * 0.05,
            paddingVertical: width * 0.025,
            borderRadius: width * 0.01,
            bottom: 10,
            right: 15,
            position: 'absolute',
            backgroundColor: '#CCC',
        }
    });

    return (
        <Modal
            visible={showExerciseDetails}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <ScrollView style={styles.exerciseScroll}>
                    <Text style={styles.title}>{exercise.title}</Text>
                    <Image
                        source={{ uri: exercise.execution_images[0].image_url }}
                        style={styles.image}
                    />
                    <Text>{exercise.description}</Text>
                    {exercise.how_to_do && exercise.how_to_do.length ? <View style={styles.exerciseInfo}>
                        <Text style={styles.sectionTitle}>How to do:</Text>
                        {exercise.how_to_do.map((step, index) => (
                            <Text key={index}>{index + 1}. {step}</Text>
                        ))}
                    </View> : ''}
                    {exercise.equipment && exercise.equipment.length ? <View style={styles.exerciseInfo}>
                        <Text style={styles.sectionTitle}>Equipment:</Text>
                        {exercise.equipment.map((item, index) => (
                            <Text key={index}>- {item}</Text>
                        ))}
                    </View> : ''}
                    {exercise.muscle_groups && exercise.muscle_groups.length ? <View style={[styles.exerciseInfo, { marginBottom: width * 0.05 }]}>
                        <Text style={styles.sectionTitle}>Muscle Groups:</Text>
                        {exercise.muscle_groups.map((group, index) => (
                            <Text key={index}>- {group.name}</Text>
                        ))}
                    </View> : ''}
                </ScrollView>
                <TouchableOpacity style={styles.closeButton} onPress={() => setShowExerciseDetails(false)}>
                    <Text>Close</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
}

const TrainingMember = ({ dayName, muscleGroup, exercises, allExercises, updateModalExercise, addExercise, removeExercise, removeMuscleGroup }) => {
    const [edit, setEdit] = useState(false);
    const [add, setAdd] = useState(false);

    return (
        <View key={muscleGroup} style={styles.trainingMemberGroup}>
            <View style={styles.muscleGroupHeader}>
                <Text style={styles.muscleGroupText}>{muscleGroup}</Text>
            </View>
            {exercises.length > 0 ? exercises.map((exercise, index) => {
                return (
                    <TouchableOpacity key={index} style={styles.planDetailsContainer} onPress={() => {
                        if (edit) {
                            removeExercise(dayName, muscleGroup, exercise.exercise_id);
                        } else {
                            updateModalExercise(exercise.exercise_id);
                        }
                    }}>
                        <Text style={styles.exercise}>{exercise.name || exercise.exercise_id}</Text>
                        {edit ?
                            <Icons name="CloseX" size={width * 0.04} style={{ position: 'absolute', right: -2, top: -2 }} />
                            : <View style={[StyleSheet.absoluteFill, { justifyContent: 'flex-end', alignItems: 'flex-end', right: width * -0.02, bottom: -width * 0.018 }]}>
                                <View style={styles.exerciseItemInfo}>
                                    <Text style={styles.exerciseItemInfoText}>{exercise.sets}x{exercise.reps}</Text>
                                </View>
                            </View>}
                    </TouchableOpacity>
                )
            }) : ''}

            <View style={{ alignItems: 'center', flexDirection: 'row', marginLeft: 'auto', marginTop: width * 0.01 }}>
                {(edit || exercises.length === 0) && !add && <TouchableOpacity
                    onPress={() => setAdd(!add)}
                    style={styles.addExercisesButton}>
                    <Icons name="Add" size={width * 0.06} style={{}} />
                </TouchableOpacity>}
                <TouchableOpacity
                    onPress={() => {
                        setEdit(!edit);
                        setAdd(false);
                    }}
                    style={styles.editExercisesButton}>
                    <Icons name={edit || add ? "OkV" : "Edit"} size={width * 0.05} style={{}} />
                </TouchableOpacity>
            </View>

            {edit && <TouchableOpacity
                onPress={() => removeMuscleGroup(dayName, muscleGroup)}
                style={styles.removeMuscleGroupButton}>
                <Icons name="CloseX" size={width * 0.04} style={{}} />
            </TouchableOpacity>}

            {add && <AddExerciseList
                dayName={dayName}
                muscleGroup={muscleGroup}
                exercises={allExercises.filter(exercise => !exercises.map(exercise => exercise.exercise_id).includes(exercise.exercise_id))}
                addExercise={addExercise}
            />}

        </View>
    )
}

const AddMuscleGroupList = ({ muscleGroups, dayName, addMuscleGroup }) => {

    return (
        <View style={[styles.trainingMemberGroup, { marginBottom: 20 }]}>
            {muscleGroups.length > 0 ? muscleGroups.map((muscle, index) => {
                return (
                    <TouchableOpacity key={index} style={styles.planDetailsContainer} onPress={() => addMuscleGroup(dayName, muscle.id)}>
                        <Text style={styles.exercise}>{muscle.name}</Text>
                    </TouchableOpacity>
                )
            }) : ''}
        </View>
    )
}

const AddExerciseList = ({ dayName, muscleGroup, exercises, addExercise }) => {

    return (
        <View style={{ width: '100%' }}>
            <ScrollView
                style={styles.addExercisesListScrollView}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
            >
                <View style={styles.addExercisesListContainer}>
                    {exercises.length > 0 ? exercises.map((exercise) => {
                        return (
                            <TouchableOpacity key={exercise.exercise_id} style={styles.planDetailsContainer} onPress={() => addExercise(dayName, muscleGroup, exercise.exercise_id)}>
                                <Text style={styles.exercise}>{exercise.title}</Text>
                            </TouchableOpacity>
                        )
                    }) : ''}
                </View>
            </ScrollView>
        </View>
    )
}

const MyPlansScreen = () => {

    const [days, setDays] = useState({
        Sun: {
            neck: {
                'lying-weighted-lateral-neck-flexion': { sets: 4, reps: 10 },
                'weighted-lying-neck-extension': { sets: 4, reps: 10 },
                'weighted-lying-neck-flexion': { sets: 4, reps: 10 },
            },
            trapezius: {
                'overhead-shrug': { sets: 4, reps: 10 },
                'gittleson-shrug': { sets: 4, reps: 10 },
                '45-degree-incline-row': { sets: 4, reps: 10 },
            },
            shoulders: {
                'medicine-ball-overhead-throw': { sets: 4, reps: 10 },
                'standing-dumbbell-shoulder-press': { sets: 4, reps: 10 },
            }
        },
        Mon: {
            chest: {
                'standing-medicine-ball-chest-pass': { sets: 4, reps: 10 },
                'arm-scissors': { sets: 4, reps: 10 },
            },
            back: {
                'rowing-machine': { sets: 4, reps: 10 },
                'lever-front-pulldown': { sets: 4, reps: 10 },
                'pull-up': { sets: 4, reps: 10 },
            },
            erectorSpinae: {
                'dumbbell-good-morning': { sets: 4, reps: 10 },
                'dumbbell-deadlift': { sets: 4, reps: 10 },
                'dumbbell-sumo-deadlift': { sets: 4, reps: 10 },
            }
        },
        Tue: {
            biceps: {
                'seated-zottman-curl': { sets: 4, reps: 10 },
                'standing-barbell-concentration-curl': { sets: 4, reps: 10 },
                'waiter-curl': { sets: 4, reps: 10 },
            },
            triceps: {
                'one-arm-triceps-pushdown': { sets: 4, reps: 10 },
                'dumbbell-kickback': { sets: 4, reps: 10 },
            },
            forearm: {
                'wrist-roller': { sets: 4, reps: 10 },
                'dumbbell-seated-neutral-wrist-curl': { sets: 4, reps: 10 },
            }
        },
        Wed: {
            abs: {
                'medicine-ball-rotational-throw': { sets: 4, reps: 10 },
                'dragon-flag': { sets: 4, reps: 10 },
                'ab-coaster-machine': { sets: 4, reps: 10 },
            },
            leg: {
                'curtsy-lunge': { sets: 4, reps: 10 },
                '5-dot-drills': { sets: 4, reps: 10 },
            },
            calf: {
                'standing-calf-raise': { sets: 4, reps: 10 },
                'calf-raise': { sets: 4, reps: 10 },
                'calf-raise-with-resistance-band': { sets: 4, reps: 10 },
            }
        },
        Thu: {
            hip: {
                'high-knee-lunge-on-bosu-ball': { sets: 4, reps: 10 },
            },
            cardio: {
                'navy-seal-burpee': { sets: 4, reps: 10 },
                'depth-jump-to-hurdle-hop': { sets: 4, reps: 10 },
            },
            fullBody: {
                'dumbbell-walking-lunge': { sets: 4, reps: 10 },
                'dumbbell-push-press': { sets: 4, reps: 10 },
            }
        },
        Fri: {
            neck: {
                'diagonal-neck-stretch': { sets: 4, reps: 10 },
                'neck-rotation-stretch': { sets: 4, reps: 10 },
                'neck-flexion-stretch': { sets: 4, reps: 10 },
            },
            trapezius: {
                'dumbbell-shrug': { sets: 4, reps: 10 },
                'cable-shrug': { sets: 4, reps: 10 },
                'barbell-shrug': { sets: 4, reps: 10 },
            },
            shoulders: {
                'side-arm-raises': { sets: 4, reps: 10 },
            },
        },
        Sat: {
            chest: {
                'incline-chest-fly-machine': { sets: 4, reps: 10 },
                'bench-press': { sets: 4, reps: 10 },
                'pec-deck-fly': { sets: 4, reps: 10 }
            },
            back: {
                'cable-rear-pulldown': { sets: 4, reps: 10 },
                'lat-pulldown': { sets: 4, reps: 10 },
                'seated-cable-row': { sets: 4, reps: 10 }
            },
            erectorSpinae: {
                'seated-back-extension': { sets: 4, reps: 10 },
                'barbell-bent-over-row': { sets: 4, reps: 10 },
                'bent-over-dumbbell-row': { sets: 4, reps: 10 }
            }
        },

    });

    const muscle_groups = {
        chest: { id: 'chest', name: 'Chest' },
        back: { id: 'back', name: 'Back' },
        neck: { id: 'neck', name: 'Neck' },
        trapezius: { id: 'trapezius', name: 'Trapezius' },
        shoulders: { id: 'shoulders', name: 'Shoulders' },
        biceps: { id: 'biceps', name: 'Biceps' },
        triceps: { id: 'triceps', name: 'Triceps' },
        forearm: { id: 'forearm', name: 'Forearm' },
        abs: { id: 'abs', name: 'Abs' },
        leg: { id: 'leg', name: 'Leg' },
        hip: { id: 'hip', name: 'Hip' },
        cardio: { id: 'cardio', name: 'Cardio' },
        fullBody: { id: 'fullBody', name: 'Full Body' },
        calf: { id: 'calf', name: 'Calf' }
    };

    const [exercises_list, setExercisesList] = useState([]);

    useEffect(() => {
        setExercisesList(Object.values(days).flatMap(day => Object.values(day).flatMap(part => Object.keys(part))))
    }, [days]);

    const [selectedDay, setSelectedDay] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [showExerciseDetails, setShowExerciseDetails] = useState(false);
    const [exercise, setExercise] = useState(null);
    const [allExercises, setAllExercises] = useState(null);

    const fetchExercises = async () => {
        const response = await fetch(BASE_URL + `/api/exercises/exercise/?ids=${exercises_list}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token a23f29aed70ef958acbbd34a131736f0ddc4d361`,
            },
        });
        const data = await response.json();
        setExercises(data);
    }
    const fetchAllExercises = async () => {
        const response = await fetch(BASE_URL + `/api/exercises/all-exercises/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token a23f29aed70ef958acbbd34a131736f0ddc4d361`,
            },
        });
        const data = await response.json();

        setAllExercises(data);
    }

    useEffect(() => {
        if (!exercises.length) {
            fetchExercises();
            fetchAllExercises();
        }
    }, []);
    const updateModalExercise = (exercise) => {
        const newExercise = exercises[exercise] || allExercises[exercise];
        if (newExercise) {
            setExercise(newExercise);
            setShowExerciseDetails(true);
        }
    }
    const addExercise = (dayName, muscleGroup, exerciseId) => {
        const newExercises = {
            ...days[dayName][muscleGroup],
            [exerciseId]: { "reps": 10, "sets": 4 }
        };

        setDays(prevDays => ({
            ...prevDays,
            [dayName]: {
                ...prevDays[dayName],
                [muscleGroup]: newExercises
            }
        }));

    };
    const removeExercise = (dayName, muscleGroup, exerciseIndex) => {
        if (!days[dayName] || !days[dayName][muscleGroup]) {
            console.error(`Day or muscle group: ${dayName} - ${muscleGroup} not found.`);
            return;
        }
        const newExercises = Object.entries(days[dayName][muscleGroup])
            .filter(([exerciseName, _]) => exerciseName !== exerciseIndex)
            .reduce((acc, [exerciseName, exerciseDetails]) => {
                acc[exerciseName] = exerciseDetails;
                return acc;
            }, {});
        setDays(prevDays => ({
            ...prevDays,
            [dayName]: {
                ...prevDays[dayName],
                [muscleGroup]: newExercises
            }
        }));

    };
    const removeMuscleGroup = (dayName, muscleGroup) => {
        if (!days[dayName]) {
            console.error(`Day: ${dayName} not found.`);
            return;
        }
        const { [muscleGroup]: removedGroup, ...remainingGroups } = days[dayName];
        setDays(prevDays => ({
            ...prevDays,
            [dayName]: remainingGroups
        }));
    };
    const addMuscleGroup = (dayName, muscleGroup) => {
        if (!days[dayName]) {
            console.error(`Day: ${dayName} not found.`);
            return;
        }
        setDays(prevDays => ({
            ...prevDays,
            [dayName]: {
                ...prevDays[dayName],
                [muscleGroup]: {}
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
                {selectedDay && exercise && <TrainDetails
                    showExerciseDetails={showExerciseDetails}
                    setShowExerciseDetails={setShowExerciseDetails}
                    exercise={
                        exercise
                    } />}

                {/* Training Plan Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Training Plan</Text>
                    <View style={styles.headerSectionContent}>
                        {Object.entries(days).map(([dayName, dayDetails], index) =>
                            <TrainingDay
                                key={dayName}
                                day={{ name: dayName.slice(0, 3), ...dayDetails }}
                                setSelectedDay={() => setSelectedDay({ name: dayName.slice(0, 3), ...dayDetails })}
                                isSelected={selectedDay && selectedDay.name === dayName.slice(0, 3)}
                                index={index}
                            />
                        )}

                    </View>
                    <View>
                        {selectedDay && allExercises && Object.entries(days).map(([dayName, dayDetails]) => {
                            if (selectedDay.name === dayName.slice(0, 3)) {
                                return (
                                    <View key={dayName}>
                                        {Object.entries(dayDetails).map(([muscleGroup, exercises_list]) => {
                                            return <TrainingMember key={muscleGroup} dayName={dayName} muscleGroup={muscleGroup} exercises={
                                                Object.entries(exercises_list).map(([exerciseId, exerciseDetails]) => ({ ...exerciseDetails, exercise_id: exerciseId, name: allExercises[exerciseId].title })).filter(Boolean)
                                            }
                                                allExercises={allExercises ?
                                                    Object.values(allExercises)
                                                        .filter(exercise => exercise.muscle_groups.some(group => group.muscle_group_id === muscleGroup))
                                                    //.map(exercise => {exercise.exercise_id})
                                                    : []
                                                }
                                                updateModalExercise={updateModalExercise} addExercise={addExercise} removeExercise={removeExercise} removeMuscleGroup={removeMuscleGroup} />
                                        })}
                                    </View>
                                )
                            }
                        })}
                    </View>
                    <View style={styles.addMuscleGroupButton}>
                        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Add Muscle Group</Text>
                    </View>
                    {selectedDay && <AddMuscleGroupList muscleGroups={
                        Object.values(muscle_groups).filter(group => !Object.keys(days[selectedDay.name]).includes(group.id)).map(group => ({ id: group.id, name: group.name }))
                    } dayName={selectedDay.name} addMuscleGroup={addMuscleGroup} />}

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
    headerSectionContent: {
        flexDirection: 'row',
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
    exerciseItemInfo: {
        width: width * 0.07,
        borderRadius: width * 0.025,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 100, 0, 0.7)',
    },
    exerciseItemInfoText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: width * 0.025
    },
    addExercisesButton: {
        width: width * 0.07,
        height: width * 0.07,
        backgroundColor: '#AAA',
        borderRadius: width * 0.02,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editExercisesButton: {
        width: width * 0.07,
        height: width * 0.07,
        backgroundColor: '#AAA',
        borderRadius: width * 0.02,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    removeMuscleGroupButton: {
        width: width * 0.08,
        height: width * 0.08,
        backgroundColor: 'red',
        borderRadius: width * 0.04,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 100,
    },
    addExercisesListScrollView: {
        width: '105%',
        padding: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderTopLeftRadius: width * 0.02,
        borderBottomLeftRadius: width * 0.02,
        marginVertical: width * 0.01,
    },
    addExercisesListContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: width * 3,
    },
    addMuscleGroupButton:{
        width: '80%',
        height: width * 0.08,
        backgroundColor: '#6495ED',
        borderRadius: width * 0.04,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        marginLeft: '10%',
        top: 10,
        zIndex: 1,
    },


    removeButton: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF0000',
    },
});

export default MyPlansScreen;