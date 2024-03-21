import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, Image, StyleSheet, TouchableOpacity, Modal, Dimensions, Pressable } from 'react-native';
import GradientBackground from '../../components/GradientBackground/GradientBackground';
import { useGlobalContext } from './../../services/GlobalContext';
import Icons from '../../components/Icons/Icons';
import { BASE_URL } from '@env';
import { TextInput } from 'react-native-gesture-handler';

const width = Dimensions.get('window').width;

const UserPlans = ({ }) => {
    return (
        <TouchableOpacity onPress={setSelectedDay} style={{ width: width * 0.128 }} activeOpacity={1}>
            <View style={styles.dayContainer}>
                <Text style={styles.dayText}>{dayName}</Text>
            </View>
        </TouchableOpacity>
    );
}

const Tabs = ({ name, setSelectedTab, isSelected, index, size = 1 }) => {
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
        <TouchableOpacity onPress={setSelectedTab} style={{ width: width * 0.128 * size }} activeOpacity={1}>
            <View style={styles.dayContainer}>
                <Text style={styles.dayText}>{name}</Text>
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

const ExerciseSetsIndicator = ({ edit, dayName, muscleGroup, exercise, updateExerciseSetsDone, showSetsEditModal, setShowSetsEditModal }) => {
    const [setsToDo, setSetsToDo] = useState(exercise.sets[1]);
    const [reps, setReps] = useState('10');

    const stylesSetsIndicator = StyleSheet.create({
        modalBackground: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
        },
        modalView: {
            width: '40%',
            height: '20%',
            padding: width * 0.01,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderRadius: 5,
            borderWidth: 1,
            borderColor: '#FFF',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 1,
            },
            shadowOpacity: 0.25,
            shadowRadius: 1.92,
            elevation: 2.5,
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 5
        },
        textInput: {
            height: 20,
            borderColor: 'gray',
            borderWidth: 0.5,
            borderRadius: 2.5,
            paddingHorizontal: 5,
            color: '#FFF',
            fontWeight: 'bold'
        },
        okButton: {
            backgroundColor: '#FFF',
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 2.5,
            marginTop: 5,
        },
        okButtonText: {
            color: '#000',
            fontWeight: 'bold'
        },
        touchableOpacity: {
            padding: width * 0.016,
            bottom: -width * 0.016,
            position: 'absolute'
        },
    });

    return (
        showSetsEditModal ?
            <Modal
                visible={true}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowSetsEditModal(false)}
            >
                <View style={stylesSetsIndicator.modalBackground}>
                    <View style={stylesSetsIndicator.modalView}>
                        <View style={stylesSetsIndicator.row}>
                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Sets: </Text>
                            <TextInput
                                style={stylesSetsIndicator.textInput}
                                keyboardType='numeric'
                                onChangeText={text => { setSetsToDo(parseInt(text.slice(-3)) || 0) }}
                                defaultValue={String(setsToDo)}
                            />
                        </View>
                        <View style={stylesSetsIndicator.row}>
                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Reps: </Text>
                            <TextInput
                                style={stylesSetsIndicator.textInput}
                                keyboardType='numeric'
                                onChangeText={text => { setReps(text.slice(-3)) }}
                                defaultValue={reps}
                            />
                        </View>
                        <TouchableOpacity style={stylesSetsIndicator.okButton}
                            onPress={() => {
                                setShowSetsEditModal(false);
                                updateExerciseSetsDone(dayName, muscleGroup, exercise.exercise_id, [0, setsToDo], reps);
                            }}
                        >
                            <Text style={stylesSetsIndicator.okButtonText}>Ok</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            :
            <TouchableOpacity style={stylesSetsIndicator.touchableOpacity}
                onLongPress={() => setShowSetsEditModal(true)}
                onPress={() => {
                    if (!exercise.done) {
                        updateExerciseSetsDone(dayName, muscleGroup, exercise.exercise_id,
                            [(exercise.sets[0] + 1) % (exercise.sets[1] + 1), exercise.sets[1]], reps
                        )
                    }
                    if (edit) {
                        setShowSetsEditModal(true);
                    }
                }}
            >
                <View style={[styles.exerciseItemInfo, edit ? { padding: 2, borderRadius: 4, flexDirection: 'row' } : {}]}>
                    <Text style={styles.exerciseItemInfoText}>{exercise.sets[0] > 0 && `${exercise.sets[0]} of `}{exercise.sets[1]}x{exercise.reps}</Text>
                    {edit && <Icons name="Edit" size={15} style={{ marginLeft: 5 }} />}
                </View>
            </TouchableOpacity>
    )
}

const BallonDetails = ({ dayName, muscleGroup, setShowBallon, updateModalExercise, removeExercise, exerciseId, done, updateExerciseDone, updateUnvailableExercises }) => {
    return (
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>

            <View style={{ alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: 5, borderRadius: 5 }}>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>

                    <TouchableOpacity style={{ padding: 10, backgroundColor: done ? '#aaa' : '#4CAF50', borderRadius: 10 }} onPress={() => {
                        updateExerciseDone(dayName, muscleGroup, exerciseId, !done);
                        setShowBallon(false);
                    }}>
                        <Text style={{ color: '#FFF' }}>
                            {done ? 'Undone' : 'Done'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{ padding: 10, backgroundColor: '#2196F3', borderRadius: 10, marginLeft: 10 }} onPress={() => {
                        updateModalExercise(exerciseId);
                        setShowBallon(false);
                    }}>
                        <Text style={{ color: '#FFF' }}>
                            See
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{ padding: 10, backgroundColor: '#555', borderRadius: 10, marginLeft: 10 }} onPress={() => setShowBallon(false)}>
                        <Text style={{ color: '#FFF' }}>
                            Close
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: width * 0.02 }}>
                    <TouchableOpacity style={{ padding: 10, backgroundColor: '#FFC107', borderRadius: 10, marginLeft: 10 }} onPress={() => {
                        setShowBallon(false);
                        updateUnvailableExercises(exerciseId, true);
                        removeExercise(dayName, muscleGroup, exerciseId);
                    }}>
                        <Text style={{ color: '#FFF' }}>
                            Unavailable
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{ padding: 10, backgroundColor: '#00BCD4', borderRadius: 10, marginLeft: 10 }} onPress={() => setShowBallon(false)}>
                        <Text style={{ color: '#FFF' }}>
                            Alternative
                        </Text>
                    </TouchableOpacity>
                </View>

            </View>
        </View>
    )
}

const ExerciseItem = ({ dayName, muscleGroup, exercise, edit, removeExercise, updateModalExercise, updateExerciseDone, updateExerciseSetsDone, updateUnvailableExercises }) => {
    const [showBallon, setShowBallon] = useState(false);
    const [showSetsEditModal, setShowSetsEditModal] = useState(false);

    return (
        <View>
            <Pressable style={[styles.planDetailsContainer, { backgroundColor: exercise.done ? '#4CAF50' : '#aaa' }]}
                onLongPress={() => {
                    if (showBallon) {
                        setShowBallon(false);
                    } else if (edit) {
                        removeExercise(dayName, muscleGroup, exercise.exercise_id);
                    } else {
                        updateModalExercise(exercise.exercise_id);
                    }
                }}
                delayLongPress={200}
                onPress={() => {
                    if (edit) {
                        removeExercise(dayName, muscleGroup, exercise.exercise_id);
                    } else {
                        setShowBallon(!showBallon);
                    }
                }}>
                <Text style={styles.exerciseItemText}>{exercise.name || exercise.exercise_id}</Text>
                {(edit || showBallon) &&
                    <TouchableOpacity style={styles.exerciseItemRemoveBox}
                        onPress={() => {
                            setShowBallon(false);
                            removeExercise(dayName, muscleGroup, exercise.exercise_id);
                        }}
                    >
                        <View style={styles.exerciseItemRemove}>
                            <Icons name="CloseX" size={width * 0.03} />
                        </View>
                    </TouchableOpacity>
                }
                <View style={[StyleSheet.absoluteFill, { justifyContent: 'flex-end', alignItems: 'flex-end', right: width * -0.02, bottom: -width * 0.018 }]}>
                    <ExerciseSetsIndicator
                        edit={edit}
                        dayName={dayName}
                        muscleGroup={muscleGroup}
                        exercise={exercise}
                        updateExerciseSetsDone={updateExerciseSetsDone}
                        showSetsEditModal={showSetsEditModal}
                        setShowSetsEditModal={setShowSetsEditModal}
                    />

                </View>

            </Pressable>

            {showBallon && (
                <BallonDetails
                    setShowBallon={setShowBallon}
                    dayName={dayName}
                    muscleGroup={muscleGroup}
                    exerciseId={exercise.exercise_id}
                    removeExercise={removeExercise}
                    updateModalExercise={updateModalExercise}
                    done={exercise.done}
                    updateExerciseDone={updateExerciseDone}
                    updateUnvailableExercises={updateUnvailableExercises}
                />
            )}

        </View>
    )
}

const TrainingMember = ({ dayName, muscleGroup, muscleGroupName, exercises, allExercises, updateModalExercise, addExercise, removeExercise, removeMuscleGroup, updateExerciseDone, updateExerciseSetsDone, unvailableExercises, updateUnvailableExercises }) => {
    const [edit, setEdit] = useState(false);
    const [add, setAdd] = useState(false);

    const doneExercises = exercises.filter(exercise => exercise.done);
    const undoneExercises = exercises.filter(exercise => !exercise.done);

    return (
        <View key={muscleGroup} style={styles.trainingMemberGroup}>
            <View style={styles.muscleGroupHeader}>
                <Text style={styles.muscleGroupText}>{muscleGroupName}</Text>
            </View>
            {exercises.length > 0 ? doneExercises.concat(undoneExercises).map((exercise, index) =>
                <ExerciseItem
                    key={index}
                    dayName={dayName}
                    muscleGroup={muscleGroup}
                    exercise={exercise}
                    edit={edit}
                    removeExercise={removeExercise}
                    updateModalExercise={updateModalExercise}
                    updateExerciseDone={updateExerciseDone}
                    updateExerciseSetsDone={updateExerciseSetsDone}
                    updateUnvailableExercises={updateUnvailableExercises}
                />

            ) : ''}

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
                exercises={allExercises.filter(exercise => !exercises.map(exercise => exercise.exercise_id).includes(exercise.exercise_id) && !unvailableExercises.includes(exercise.exercise_id))}
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
                        <Text style={styles.exerciseItemText}>{muscle.name}</Text>
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
                                <Text style={styles.exerciseItemText}>{exercise.title}</Text>
                            </TouchableOpacity>
                        )
                    }) : ''}
                </View>
            </ScrollView>
        </View>
    )
}

const MyPlansScreen = ({ }) => {
    const { userToken } = useGlobalContext();

    const [plan, setPlan] = useState('training');
    const [daysExercises, setDaysExercises] = useState({
        Sun: {
            neck: {
                'lying-weighted-lateral-neck-flexion': { sets: [0, 4], reps: 10, done: false, edit: false },
                'weighted-lying-neck-extension': { sets: [0, 4], reps: 10, done: false, edit: false },
                'weighted-lying-neck-flexion': { sets: [0, 4], reps: 10, done: false, edit: false },
            },
            trapezius: {
                'overhead-shrug': { sets: [0, 4], reps: 10, done: false, edit: false },
                'gittleson-shrug': { sets: [0, 4], reps: 10, done: false, edit: false },
                '45-degree-incline-row': { sets: [0, 4], reps: 10, done: false, edit: false },
            },
            shoulders: {
                'medicine-ball-overhead-throw': { sets: [0, 4], reps: 10, done: false, edit: false },
                'standing-dumbbell-shoulder-press': { sets: [0, 4], reps: 10, done: false, edit: false },
            }
        },
        Mon: {
            chest: {
                'standing-medicine-ball-chest-pass': { sets: [0, 4], reps: 10, done: false, edit: false },
                'arm-scissors': { sets: [0, 4], reps: 10, done: false, edit: false },
            },
            back: {
                'rowing-machine': { sets: [0, 4], reps: 10, done: false, edit: false },
                'lever-front-pulldown': { sets: [0, 4], reps: 10, done: false, edit: false },
                'pull-up': { sets: [0, 4], reps: 10, done: false, edit: false },
            },
            erector_spinae: {
                'dumbbell-good-morning': { sets: [0, 4], reps: 10, done: false, edit: false },
                'dumbbell-deadlift': { sets: [0, 4], reps: 10, done: false, edit: false },
                'dumbbell-sumo-deadlift': { sets: [0, 4], reps: 10, done: false, edit: false },
            }
        },
        Tue: {
            biceps: {
                'seated-zottman-curl': { sets: [0, 4], reps: 10, done: false, edit: false },
                'standing-barbell-concentration-curl': { sets: [0, 4], reps: 10, done: false, edit: false },
                'waiter-curl': { sets: [0, 4], reps: 10, done: false, edit: false },
            },
            triceps: {
                'one-arm-triceps-pushdown': { sets: [0, 4], reps: 10, done: false, edit: false },
                'dumbbell-kickback': { sets: [0, 4], reps: 10, done: false, edit: false },
            },
            forearm: {
                'wrist-roller': { sets: [0, 4], reps: 10, done: false, edit: false },
                'dumbbell-seated-neutral-wrist-curl': { sets: [0, 4], reps: 10, done: false, edit: false },
            }
        },
        Wed: {
            abs: {
                'medicine-ball-rotational-throw': { sets: [0, 4], reps: 10, done: false, edit: false },
                'dragon-flag': { sets: [0, 4], reps: 10, done: false, edit: false },
                'ab-coaster-machine': { sets: [0, 4], reps: 10, done: false, edit: false },
            },
            leg: {
                'curtsy-lunge': { sets: [0, 4], reps: 10, done: false, edit: false },
                '5-dot-drills': { sets: [0, 4], reps: 10, done: false, edit: false },
            },
            calf: {
                'standing-calf-raise': { sets: [0, 4], reps: 10, done: false, edit: false },
                'calf-raise': { sets: [0, 4], reps: 10, done: false, edit: false },
                'calf-raise-with-resistance-band': { sets: [0, 4], reps: 10, done: false, edit: false },
            }
        },

        Thu: {
            hip: {
                'high-knee-lunge-on-bosu-ball': { sets: [0, 4], reps: 10, done: false, edit: false },
            },
            cardio: {
                'navy-seal-burpee': { sets: [0, 4], reps: 10, done: false, edit: false },
                'depth-jump-to-hurdle-hop': { sets: [0, 4], reps: 10, done: false, edit: false },
            },
            fullBody: {
                'dumbbell-walking-lunge': { sets: [0, 4], reps: 10, done: false, edit: false },
                'dumbbell-push-press': { sets: [0, 4], reps: 10, done: false, edit: false },
            }
        },
        Fri: {
            neck: {
                'diagonal-neck-stretch': { sets: [0, 4], reps: 10, done: false, edit: false },
                'neck-rotation-stretch': { sets: [0, 4], reps: 10, done: false, edit: false },
                'neck-flexion-stretch': { sets: [0, 4], reps: 10, done: false, edit: false },
            },
            trapezius: {
                'dumbbell-shrug': { sets: [0, 4], reps: 10, done: false, edit: false },
                'cable-shrug': { sets: [0, 4], reps: 10, done: false, edit: false },
                'barbell-shrug': { sets: [0, 4], reps: 10, done: false, edit: false },
            },
            shoulders: {
                'side-arm-raises': { sets: [0, 4], reps: 10, done: false, edit: false },
            },
        },
        Sat: {
            chest: {
                'incline-chest-fly-machine': { sets: [0, 4], reps: 10, done: false, edit: false },
                'bench-press': { sets: [0, 4], reps: 10, done: false, edit: false },
                'pec-deck-fly': { sets: [0, 4], reps: 10, done: false, edit: false }
            },
            back: {
                'cable-rear-pulldown': { sets: [0, 4], reps: 10, done: false, edit: false },
                'lat-pulldown': { sets: [0, 4], reps: 10, done: false, edit: false },
                'seated-cable-row': { sets: [0, 4], reps: 10, done: false, edit: false }
            },
            erector_spinae: {
                'seated-back-extension': { sets: [0, 4], reps: 10, done: false, edit: false },
                'barbell-bent-over-row': { sets: [0, 4], reps: 10, done: false, edit: false },
                'bent-over-dumbbell-row': { sets: [0, 4], reps: 10, done: false, edit: false }
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
        calf: { id: 'calf', name: 'Calf' },
        erector_spinae: { id: 'erector_spinae', name: 'Erector Spinae' },
    };
    const [unvailableExercises, setUnvailableExercises] = useState([]);
    const [exercises_list, setExercisesList] = useState([]);

    useEffect(() => {
        setExercisesList(Object.values(daysExercises).flatMap(day => Object.values(day).flatMap(part => Object.keys(part))))
    }, [daysExercises]);

    const [selectedDay, setSelectedDay] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [showExerciseDetails, setShowExerciseDetails] = useState(false);
    const [exercise, setExercise] = useState(null);
    const [allExercises, setAllExercises] = useState(null);

    const [addNewMuscleGroup, setAddNewMuscleGroup] = useState(false);

    const fetchExercises = async () => {
        const response = await fetch(BASE_URL + `/api/exercises/exercise/?ids=${exercises_list}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${userToken}`,
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
                'Authorization': `Token ${userToken}`,
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

    const updateExerciseDone = (dayName, muscleGroup, exerciseIndex, done) => {
        const newExercises = {
            ...daysExercises[dayName][muscleGroup],
            [exerciseIndex]: { ...daysExercises[dayName][muscleGroup][exerciseIndex], done: done }
        };

        setDaysExercises(
            prevDays => ({
                ...prevDays,
                [dayName]: {
                    ...prevDays[dayName],
                    [muscleGroup]: {
                        ...prevDays[dayName][muscleGroup],
                        ...newExercises
                    }
                }
            })
        )

    }
    const updateAllExercisesDone = (dayName, done) => {
        const newDays = { ...daysExercises };
        Object.keys(newDays[dayName]).forEach(muscleGroup => {
            newDays[dayName][muscleGroup] = Object.fromEntries(
                Object.entries(newDays[dayName][muscleGroup]).map(([exerciseName, exerciseDetails]) => [
                    exerciseName,
                    { ...exerciseDetails, done: done }
                ])
            );

        });

        setDaysExercises(newDays);
    };
    const verifyAllExercisesDone = (dayName) => {
        return Object.values(daysExercises[dayName]).every(muscleGroup =>
            Object.values(muscleGroup).every(exercise => exercise.done)
        );
    };
    const updateExerciseSetsDone = (dayName, muscleGroup, exerciseIndex, setsDone, repsToDo) => {
        const newExercises = {
            ...daysExercises[dayName][muscleGroup],
            [exerciseIndex]: {
                ...daysExercises[dayName][muscleGroup][exerciseIndex],
                reps: repsToDo || 10,
                sets: setsDone
            }
        };

        setDaysExercises(
            prevDays => ({
                ...prevDays,
                [dayName]: {
                    ...prevDays[dayName],
                    [muscleGroup]: {
                        ...prevDays[dayName][muscleGroup],
                        ...newExercises
                    }
                }
            })
        )
    }
    const updateUnvailableExercises = (exercise, add) => {
        if (add) {
            setUnvailableExercises([...unvailableExercises, exercise]);
        } else {
            setUnvailableExercises(unvailableExercises.filter(item => item !== exercise));
        }
    }

    const updateModalExercise = (exercise) => {
        const newExercise = exercises[exercise] || allExercises[exercise];
        if (newExercise) {
            setExercise(newExercise);
            setShowExerciseDetails(true);
        }
    }
    const addExercise = (dayName, muscleGroup, exerciseId) => {
        const newExercises = {
            ...daysExercises[dayName][muscleGroup],
            [exerciseId]: { reps: 10, sets: [0, 4], done: false, edit: false }
        };

        setDaysExercises(prevDays => ({
            ...prevDays,
            [dayName]: {
                ...prevDays[dayName],
                [muscleGroup]: newExercises
            }
        }));
    };
    const removeExercise = (dayName, muscleGroup, exerciseIndex) => {
        if (!daysExercises[dayName] || !daysExercises[dayName][muscleGroup]) {
            console.error(`Day or muscle group: ${dayName} - ${muscleGroup} not found.`);
            return;
        }
        const newExercises = Object.entries(daysExercises[dayName][muscleGroup])
            .filter(([exerciseName, _]) => exerciseName !== exerciseIndex)
            .reduce((acc, [exerciseName, exerciseDetails]) => {
                acc[exerciseName] = exerciseDetails;
                return acc;
            }, {});
        setDaysExercises(prevDays => ({
            ...prevDays,
            [dayName]: {
                ...prevDays[dayName],
                [muscleGroup]: newExercises
            }
        }));

    };
    const removeMuscleGroup = (dayName, muscleGroup) => {
        if (!daysExercises[dayName]) {
            console.error(`Day: ${dayName} not found.`);
            return;
        }
        const { [muscleGroup]: removedGroup, ...remainingGroups } = daysExercises[dayName];
        setDaysExercises(prevDays => ({
            ...prevDays,
            [dayName]: remainingGroups
        }));
    };
    const addMuscleGroup = (dayName, muscleGroup) => {
        if (!daysExercises[dayName]) {
            console.error(`Day: ${dayName} not found.`);
            return;
        }
        setDaysExercises(prevDays => ({
            ...prevDays,
            [dayName]: {
                ...prevDays[dayName],
                [muscleGroup]: {}
            }
        }));
    };

    const trainCompleted = verifyAllExercisesDone(selectedDay ? selectedDay.name : 'Sun');

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
                    exercise={exercise} />}

                <View style={styles.sectionContainer}>

                    <Text style={styles.sectionTitle}>Training Plan</Text>
                    <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                        {[
                            { plan_id: 'training', plan_name: 'Training' },
                            { plan_id: 'diet', plan_name: 'Diet' }
                        ].map((planOption, index) =>
                            <Tabs
                                key={index}
                                name={planOption.plan_name}
                                setSelectedTab={() => setPlan(planOption.plan_id)}
                                isSelected={planOption.plan_id === plan}
                                index={index}
                                size={1.5}
                            />
                        )}
                    </View>

                    <View style={styles.headerSectionContent}>

                        {Object.entries(daysExercises).map(([dayName, dayDetails], index) =>
                            <Tabs
                                key={dayName}
                                name={dayName}
                                setSelectedTab={() => setSelectedDay({ name: dayName.slice(0, 3), exercises: { ...dayDetails } })}
                                isSelected={selectedDay && selectedDay.name === dayName.slice(0, 3)}
                                index={index}
                            />
                        )}

                    </View>
                    <View>
                        {selectedDay && allExercises && Object.entries(daysExercises).map(([dayName, dayDetails]) => {
                            if (selectedDay.name === dayName.slice(0, 3)) {
                                return (
                                    <View key={dayName}>
                                        {Object.entries(dayDetails).map(([muscleGroup, exercises_list]) => {
                                            return <TrainingMember key={muscleGroup} dayName={dayName} muscleGroupName={muscle_groups[muscleGroup].name} muscleGroup={muscleGroup} exercises={
                                                Object.entries(exercises_list).map(([exerciseId, exerciseDetails]) => ({ ...exerciseDetails, exercise_id: exerciseId, name: allExercises[exerciseId].title })).filter(Boolean)
                                            }
                                                allExercises={allExercises ?
                                                    Object.values(allExercises)
                                                        .filter(exercise => exercise.muscle_groups.some(group => group.muscle_group_id === muscleGroup))
                                                    //.map(exercise => {exercise.exercise_id})
                                                    : []
                                                }
                                                updateModalExercise={updateModalExercise}
                                                addExercise={addExercise}
                                                removeExercise={removeExercise}
                                                removeMuscleGroup={removeMuscleGroup}
                                                updateExerciseDone={updateExerciseDone}
                                                updateExerciseSetsDone={updateExerciseSetsDone}
                                                unvailableExercises={unvailableExercises}
                                                updateUnvailableExercises={updateUnvailableExercises}
                                            />

                                        })}
                                    </View>
                                )
                            }
                        })}
                    </View>
                    <View >
                        <TouchableOpacity style={[styles.trainCompleteButton, { backgroundColor: trainCompleted ? '#aaa' : '#4CAF50' }]} onPress={() => {
                            updateAllExercisesDone(selectedDay.name, !verifyAllExercisesDone(selectedDay.name));
                        }}>
                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{trainCompleted ? "Train Incomplete" : "Train Complete"}</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.addMuscleGroupButton} onPress={() => setAddNewMuscleGroup(!addNewMuscleGroup)}>
                        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Add Muscle Group</Text>
                    </TouchableOpacity>
                    {selectedDay && addNewMuscleGroup && <AddMuscleGroupList muscleGroups={
                        Object.values(muscle_groups).filter(group => !Object.keys(daysExercises[selectedDay.name]).includes(group.id)).map(group => ({ id: group.id, name: group.name }))
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
    exerciseItemText: {
        fontSize: width * 0.04,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    exerciseItemRemoveBox: {
        padding: 5,
        position: 'absolute',
        top: -6,
        left: -6,
        alignItems: 'center',
        justifyContent: 'center'
    },
    exerciseItemRemove: {
        padding: 3,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F44336'
    },
    planDetailsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: width * 0.02,
        paddingVertical: width * 0.008,
        borderRadius: width * 0.02,
        margin: width * 0.01,
        backgroundColor: '#aaa',
    },
    exerciseItemInfo: {
        minWidth: width * 0.07,
        paddingHorizontal: 3,
        borderRadius: width * 0.025,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 100, 0, 0.9)',
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
    addMuscleGroupButton: {
        width: '80%',
        height: width * 0.08,
        backgroundColor: '#6495ED',
        borderRadius: width * 0.04,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: '10%',
        top: 10,
        zIndex: 1,
    },
    trainCompleteButton: {
        width: '80%',
        padding: width * 0.02,
        borderRadius: width * 0.04,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: '10%',
        marginTop: 5,
    },



    removeButton: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF0000',
    },
});

export default MyPlansScreen;