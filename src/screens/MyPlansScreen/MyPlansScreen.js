import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, Image, StyleSheet, TouchableOpacity, Modal, Dimensions, Pressable, Alert } from 'react-native';
import GradientBackground from '../../components/GradientBackground/GradientBackground';
import { useGlobalContext } from './../../services/GlobalContext';
import Icons from '../../components/Icons/Icons';
import { BASE_URL } from '@env';
import { TextInput } from 'react-native-gesture-handler';

const width = Dimensions.get('window').width;

const Tabs = ({ index, name, setSelectedTab, isSelected, len, TabSize = 100 }) => {
    const styles = StyleSheet.create({
        dayContainer: {
            backgroundColor: isSelected ? '#FFF' : '#DDD',
            padding: width * 0.01,
            borderTopLeftRadius: width * 0.01,
            borderTopEndRadius: width * 0.045,
            borderBottomLeftRadius: index == 0 ? width * 0.02 : 0,
            borderBottomEndRadius: index == len - 1 ? width * 0.008 : 0,
            borderBottomWidth: width * 0.03,
            borderBottomColor: '#FFF',
        },
        dayText: {
            color: '#1C274C',
            fontSize: width * 0.035,
            fontWeight: 'bold',
        },
    });

    return (
        <TouchableOpacity onPress={setSelectedTab} style={{ width: TabSize }} activeOpacity={1}>
            <View style={styles.dayContainer}>
                <Text style={styles.dayText}>{name}</Text>
            </View>
        </TouchableOpacity>
    );
};

const TrainDetails = ({ dayName, muscleGroup, allExercises, exercise, showExerciseDetails, setShowExerciseDetails, setAlternativeExercise, getAlternativeExercise, removeExercise }) => {
    const onClose = () => {
        setShowExerciseDetails(false);
        setAlternativeExercise(false);
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
            paddingHorizontal: width * 0.03,
            paddingVertical: width * 0.025,
            borderRadius: width * 0.01,
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
                    <View style={{ marginBottom: width * 0.1 }}></View>
                </ScrollView>
                <View style={{ width: '90%', left: '5%', bottom: 10, position: 'absolute', flexDirection: 'row', justifyContent: 'space-between' }}>
                    {exercise.alternative && <>
                        <TouchableOpacity style={[styles.closeButton, { backgroundColor: '#4CAF50' }]} onPress={() => {
                            removeExercise(exercise.alternative.dayName, exercise.alternative.muscleGroup, exercise.alternative.from, exercise.alternative.to);
                            setAlternativeExercise(false);
                        }}>
                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Set Alternative</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.closeButton, { backgroundColor: '#00BCD4' }]} onPress={() => {
                            const alternative = getAlternativeExercise(exercise.alternative.dayName, exercise.alternative.muscleGroup, exercise.exercise_id);
                            setAlternativeExercise(
                                { ...allExercises.find(exercise => exercise.exercise_id === alternative), alternative: { from: exercise.alternative.from, to: alternative, dayName: dayName, muscleGroup: muscleGroup } }
                            );
                        }}>
                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Another</Text>
                        </TouchableOpacity>
                    </>}
                    <TouchableOpacity style={[styles.closeButton, !exercise.alternative ? { marginLeft: 'auto' } : {}]} onPress={() => onClose()}>
                        <Text style={{ color: '#000', fontWeight: 'bold' }}>Close</Text>
                    </TouchableOpacity>
                </View>
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

const BallonDetails = ({ dayName, muscleGroup, allExercises, setShowBallon, setAlternativeExercise, removeExercise, exerciseId, done, updateExerciseDone, updateUnavailableExercises, getAlternativeExercise, setShowExerciseDetails }) => {
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
                        setShowExerciseDetails(true);
                    }}>
                        <Text style={{ color: '#FFF' }}>
                            See
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{ padding: 10, backgroundColor: '#555', borderRadius: 10, marginLeft: 10 }} onPress={() => {
                        setShowBallon(false);
                    }}>
                        <Text style={{ color: '#FFF' }}>
                            Close
                        </Text>
                    </TouchableOpacity>
                </View>

                {!done && <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: width * 0.02 }}>
                    <TouchableOpacity style={{ padding: 10, backgroundColor: '#FFC107', borderRadius: 10, marginLeft: 10 }} onPress={() => {
                        updateUnavailableExercises('add', [exerciseId]);
                        removeExercise(dayName, muscleGroup, exerciseId);
                    }}>
                        <Text style={{ color: '#FFF' }}>
                            Unavailable
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{ padding: 10, backgroundColor: '#00BCD4', borderRadius: 10, marginLeft: 10 }} onPress={() => {
                        const alternative = getAlternativeExercise(dayName, muscleGroup, exerciseId);
                        if (alternative) {
                            setShowExerciseDetails(true);
                            setAlternativeExercise(
                                { ...allExercises.find(exercise => exercise.exercise_id === alternative), alternative: { from: exerciseId, to: alternative, dayName: dayName, muscleGroup: muscleGroup } }
                            );
                        }
                    }}>
                        <Text style={{ color: '#FFF' }}>
                            Alternative
                        </Text>
                    </TouchableOpacity>
                </View>}

            </View>
        </View>
    )
}

const ExerciseItem = ({ dayName, muscleGroup, exercise, allExercises, edit, addExercise, removeExercise, updateExerciseDone, updateExerciseSetsDone, updateUnavailableExercises, getAlternativeExercise }) => {
    const [showBallon, setShowBallon] = useState(false);
    const [showSetsEditModal, setShowSetsEditModal] = useState(false);
    const [showExerciseDetails, setShowExerciseDetails] = useState(false);
    const [alternativeExercise, setAlternativeExercise] = useState(null);

    return (
        <View>
            {showExerciseDetails && <TrainDetails
                dayName={dayName}
                muscleGroup={muscleGroup}
                allExercises={allExercises}
                exercise={alternativeExercise || allExercises.find(e => e.exercise_id === exercise.exercise_id)}
                showExerciseDetails={showExerciseDetails}
                setShowExerciseDetails={setShowExerciseDetails}
                setAlternativeExercise={setAlternativeExercise}
                getAlternativeExercise={getAlternativeExercise}
                removeExercise={removeExercise}
            />}
            <Pressable style={[styles.planDetailsContainer, { backgroundColor: exercise.done ? '#4CAF50' : '#aaa' }]}
                onLongPress={() => {
                    setShowExerciseDetails(true);
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
                    dayName={dayName}
                    muscleGroup={muscleGroup}
                    allExercises={allExercises}
                    setShowBallon={setShowBallon}
                    setAlternativeExercise={setAlternativeExercise}
                    exerciseId={exercise.exercise_id}
                    addExercise={addExercise}
                    removeExercise={removeExercise}
                    done={exercise.done}
                    updateExerciseDone={updateExerciseDone}
                    updateUnavailableExercises={updateUnavailableExercises}
                    getAlternativeExercise={getAlternativeExercise}
                    setShowExerciseDetails={setShowExerciseDetails}
                />
            )}

        </View>
    )
}

const TrainingMember = ({ dayName, muscleGroup, muscleGroupName, exercises, allExercises, addExercise, removeExercise, removeMuscleGroup, updateExerciseDone, updateExerciseSetsDone, unavailableExercises, updateUnavailableExercises, getAlternativeExercise }) => {
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
                    allExercises={allExercises}
                    edit={edit}
                    addExercise={addExercise}
                    removeExercise={removeExercise}
                    updateExerciseDone={updateExerciseDone}
                    updateExerciseSetsDone={updateExerciseSetsDone}
                    updateUnavailableExercises={updateUnavailableExercises}
                    getAlternativeExercise={getAlternativeExercise}
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
                exercises={allExercises.filter(exercise => !exercises.map(exercise => exercise.exercise_id).includes(exercise.exercise_id) && !unavailableExercises.includes(exercise.exercise_id))}
                addExercise={addExercise}
            />}

        </View>
    )
}

const AddMuscleGroupList = ({ muscleGroups, dayName, addMuscleGroup, setAddNewMuscleGroup }) => {

    return (
        <View style={[styles.trainingMemberGroup, { marginBottom: 20 }]}>
            {muscleGroups.length > 0 ? muscleGroups.map((muscle, index) => {
                return (
                    <TouchableOpacity key={index} style={styles.planDetailsContainer} onPress={() => { addMuscleGroup(dayName, muscle.id); setAddNewMuscleGroup(); }}>
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

    const [online, setOnline] = useState(true);
    const [plan, setPlan] = useState('training');
    const [plans, setPlans] = useState(null);
    const [planId, setPlanId] = useState(null);
    const [daysExercises, setDaysExercises] = useState({
        Sun: {
            neck: {
                'lying-weighted-lateral-neck-flexion': { sets: [0, 4], reps: 10, done: false, edit: false }
            }
        },
        Mon: {
            chest: {
                'standing-medicine-ball-chest-pass': { sets: [0, 4], reps: 10, done: false, edit: false }
            }
        },
        Tue: {
            biceps: {
                'seated-zottman-curl': { sets: [0, 4], reps: 10, done: false, edit: false }
            }
        },
        Wed: {
            abs: {
                'medicine-ball-rotational-throw': { sets: [0, 4], reps: 10, done: false, edit: false }
            }
        },
        Thu: {
            hip: {
                'high-knee-lunge-on-bosu-ball': { sets: [0, 4], reps: 10, done: false, edit: false }
            }
        },
        Fri: {
            neck: {
                'diagonal-neck-stretch': { sets: [0, 4], reps: 10, done: false, edit: false }
            }
        },
        Sat: {
            chest: {
                'incline-chest-fly-machine': { sets: [0, 4], reps: 10, done: false, edit: false }
            }
        },



    });
    const [edit, setEdit] = useState(false);

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
    const [unavailableExercises, setUnavailableExercises] = useState([]);
    const [exercises_list, setExercisesList] = useState([]);

    const [selectedDay, setSelectedDay] = useState(null);
    const [exercises, setExercises] = useState([]);
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
    const formatToAddSets = (days) => {
        return Object.fromEntries(
            Object.entries(days).map(([day, exercises]) => [
                day,
                Object.fromEntries(
                    Object.entries(exercises).map(([muscleGroup, exercises]) => [
                        muscleGroup,
                        Object.fromEntries(
                            Object.entries(exercises).map(([exerciseName, details]) => [
                                exerciseName,
                                { ...details, sets: [0, details.sets] },
                            ])
                        ),
                    ])
                ),
            ])
        )
    }
    const formatToRemoveSets = (days) => {
        return Object.fromEntries(
            Object.entries(days).map(([day, exercises]) => [
                day,
                Object.fromEntries(
                    Object.entries(exercises).map(([muscleGroup, exercises]) => [
                        muscleGroup,
                        Object.fromEntries(
                            Object.entries(exercises).map(([exerciseName, details]) => [
                                exerciseName,
                                { ...details, sets: details.sets[1] },
                            ])
                        ),
                    ])
                ),
            ])
        )
    }
    const updatePlans = async (training_id, daysExercises) => {
        try {
            const response = await fetch(BASE_URL + `/api/exercises/training-plans/${training_id}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Token ${userToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(daysExercises)
            });
            const data = await response.json();
            setPlans(prevPlans => prevPlans.map(plan => plan.id === planId ? data : plan));
            if (response.ok) {
                setEdit(false);
            }
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    }
    const createTrainingPlan = async (daysExercises) => {
        try {
            const response = await fetch(BASE_URL + `/api/exercises/training-plans/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${userToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(daysExercises)
            });
            const data = await response.json();
            if (response.ok && data.id) {
                setPlans(prevPlans => [...prevPlans, data]);
                setDaysExercises(data.days)
                setPlanId(data.id);
            }
            return false;
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    }
    const deleteTrainingPlan = async (training_id) => {
        try {
            const response = await fetch(BASE_URL + `/api/exercises/training-plans/${training_id}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${userToken}`,
                    'Content-Type': 'application/json'
                },
            });
            if (response.ok && response.status === 204) {
                setPlans(prevPlans => prevPlans.filter(plan => plan.id !== training_id));
            }
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    }

    const fetchPlans = async () => {
        const response = await fetch(BASE_URL + `/api/exercises/user-plans/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${userToken}`,
            },
        });
        const data = await response.json();
        setPlans(data.training_plans);
        if (!planId && data.training_plans.length > 0) {
            setPlanId(data.training_plans[0].id);
            setDaysExercises(formatToAddSets(data.training_plans[0].days));
        }
        setUnavailableExercises(data.unavailable_exercises);
    }

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
    const updateUnavailableExercises = async (action, exercises) => {
        try {
            response = await fetch(BASE_URL + `/api/exercises/user-plans/update_plan/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Token ${userToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    { "action": action, "exercises": exercises },
                )
            });
            data = await response.json();
            if (response.ok) {
                setUnavailableExercises(data.unavailable_exercises);
            }

        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    };
    const getAlternativeExercise = (dayName, muscleGroup, exercise, salt = 0) => {
        const all_exercises = Object.values(allExercises)
        const exercises_from_muscle = all_exercises.filter(exercise => exercise.muscle_groups.some(muscle => muscle.muscle_group_id === muscleGroup))
            .map(exercise => exercise.exercise_id)

        const not_selected_exercises = exercises_from_muscle.filter(e => !Object.keys(daysExercises[dayName][muscleGroup]).includes(e) || e === exercise)

        const exercise_index = not_selected_exercises.indexOf(exercise) + 1 + salt;

        return not_selected_exercises.length > exercise_index ? not_selected_exercises[exercise_index] : false;
    };
    const addExercise = (dayName, muscleGroup, exerciseId) => {
        const newExercises = {
            ...daysExercises[dayName][muscleGroup],
            [exerciseId]: { reps: 10, sets: [0, 4], done: false, edit: false }
        };

        setEdit(true);

        setDaysExercises(prevDays => ({
            ...prevDays,
            [dayName]: {
                ...prevDays[dayName],
                [muscleGroup]: newExercises
            }
        }));
    };
    const removeExercise = (dayName, muscleGroup, exerciseIndex, replace = false) => {
        if (!daysExercises[dayName] || !daysExercises[dayName][muscleGroup]) {
            console.error(`Day or muscle group: ${dayName} - ${muscleGroup} not found.`);
            return;
        }
        const newExercises = Object.entries(daysExercises[dayName][muscleGroup])
            .filter(([exerciseName, _]) => exerciseName !== exerciseIndex)
            .reduce((acc, [exerciseName, exerciseDetails]) => {
                acc[exerciseName] = exerciseDetails;
                return acc;
            }, replace ? { [replace]: { reps: 10, sets: [0, 4], done: false, edit: false } } : {});

        setEdit(true);

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
        setEdit(true);
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
        setEdit(true);
        setDaysExercises(prevDays => ({
            ...prevDays,
            [dayName]: {
                ...prevDays[dayName],
                [muscleGroup]: {}
            }
        }));
    };
    const addTrainingPlan = (plan) => {
        if (!plan || !plan.days || typeof plan.name !== 'string') {
            console.error('Invalid plan format.');
            return;
        }
        if (online) {
            createTrainingPlan(plan);
        } else {
            setPlans(prevPlans => [...prevPlans, plan]);
            setDaysExercises(plan.days);
            setPlanId(0);
        }
    };
    const removeTrainingPlan = (planId) => {
        if (online) {
            deleteTrainingPlan(planId);
        } else {
            setPlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
        }
        setPlanId(plans.length ? plans[0].id : 0);
        setDaysExercises(plans.length ? formatToAddSets(plans[0].days) : {});
    };

    useEffect(() => {
        setExercisesList(Object.values(daysExercises).flatMap(day => Object.values(day).flatMap(part => Object.keys(part))))
    }, [daysExercises]);

    useEffect(() => {
        if (!exercises.length) {
            fetchExercises();
            fetchAllExercises();
            fetchPlans();
        }
    }, []);

    useEffect(() => {
        if (planId) {
            setSelectedDay({ name: 'Sun', exercises: plans.filter(plan => plan.id === planId)[0].days.Sun });
        }
    }, [planId]);

    useEffect(() => {
    }, [allExercises, selectedDay]);

    const trainCompleted = verifyAllExercisesDone(selectedDay ? selectedDay.name : 'Sun');
    const fit_plans = [{ plan_id: 'training', plan_name: 'Training' }, { plan_id: 'diet', plan_name: 'Diet' }];

    return (
        <View style={styles.container}>
            <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />

            <ScrollView
                style={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                overScrollMode="never"
            >

                <View style={styles.sectionContainer}>

                    <Text style={styles.sectionTitle}>Training Plan</Text>
                    <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                        {fit_plans.map((planOption, index) =>
                            <Tabs
                                key={index}
                                index={index}
                                name={planOption.plan_name}
                                setSelectedTab={() => setPlan(planOption.plan_id)}
                                isSelected={planOption.plan_id === plan}
                                len={fit_plans.length}
                                TabSize={width * 0.89 / fit_plans.length * 0.8}
                            />
                        )}
                    </View>

                    <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                        {plans && plans.map((plan, index) =>
                            <Tabs
                                key={index}
                                index={index}
                                name={plan.name}
                                setSelectedTab={() => {
                                    if (edit) {
                                        alert('You must save or cancel changes before moving to another plan.');
                                        return;
                                    }
                                    setDaysExercises(formatToAddSets(plan.days)); setPlanId(plan.id);
                                }}
                                isSelected={plan.id === planId}
                                len={plans.length}
                                TabSize={width * 0.89 / plans.length * 0.9}
                            />
                        )}
                    </View>

                    <View style={styles.headerSectionContent}>

                        {Object.entries(daysExercises).sort((a, b) => {
                            const order = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                            return order.indexOf(a[0]) - order.indexOf(b[0]);
                        }).map(([dayName, dayDetails], index) =>
                            <Tabs
                                key={index}
                                index={index}
                                name={dayName}
                                setSelectedTab={() => setSelectedDay({ name: dayName.slice(0, 3), exercises: { ...dayDetails } })}
                                isSelected={selectedDay && selectedDay.name === dayName.slice(0, 3)}
                                len={7}
                                TabSize={width * 0.89 / 7}
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
                                                addExercise={addExercise}
                                                removeExercise={removeExercise}
                                                removeMuscleGroup={removeMuscleGroup}
                                                updateExerciseDone={updateExerciseDone}
                                                updateExerciseSetsDone={updateExerciseSetsDone}
                                                unavailableExercises={unavailableExercises}
                                                updateUnavailableExercises={updateUnavailableExercises}
                                                getAlternativeExercise={getAlternativeExercise}
                                            />

                                        })}
                                    </View>
                                )
                            }
                        })}
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        {Object.keys(daysExercises[selectedDay ? selectedDay.name : 'Mon']).length > 0 && <TouchableOpacity style={[styles.planDetailsContainer, { backgroundColor: trainCompleted ? '#aaa' : '#4CAF50' }]} onPress={() => {
                            updateAllExercisesDone(selectedDay.name, !verifyAllExercisesDone(selectedDay.name));
                        }}>
                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{trainCompleted ? "Train Incomplete" : "Train Complete"}</Text>
                        </TouchableOpacity>}
                        <TouchableOpacity style={[styles.planDetailsContainer, { backgroundColor: '#6495ED' }]} onPress={() => setAddNewMuscleGroup(!addNewMuscleGroup)}>
                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Add Muscle Group</Text>
                        </TouchableOpacity>
                    </View>

                    {selectedDay && addNewMuscleGroup && <AddMuscleGroupList muscleGroups={
                        Object.values(muscle_groups).filter(group => !Object.keys(daysExercises[selectedDay.name]).includes(group.id)).map(group => ({ id: group.id, name: group.name }))
                    } dayName={selectedDay.name} addMuscleGroup={addMuscleGroup} setAddNewMuscleGroup={() => setAddNewMuscleGroup(false)} />}

                    {edit && <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 }}>

                        <TouchableOpacity style={[styles.trainCompleteButton, { backgroundColor: '#BDBDBD', flex: 1, marginRight: 5 }]} onPress={() => {
                            setDaysExercises(formatToAddSets(plans.find(plan => plan.id === planId).days));
                            setEdit(false);
                        }}>
                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Cancel Changes</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.trainCompleteButton, { backgroundColor: '#4CAF50', flex: 1 }]} onPress={() => updatePlans(planId, { "days": formatToRemoveSets(daysExercises) })}>
                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Save Train</Text>
                        </TouchableOpacity>

                    </View>}

                    <TouchableOpacity style={[styles.trainCompleteButton, { backgroundColor: '#6495ED', marginTop: 5 }]} onPress={() => {
                        addTrainingPlan({ id: 0, name: 'New Training', days: { Sun: {}, Mon: {}, Tue: {}, Wed: {}, Thu: {}, Fri: {}, Sat: {} } })
                    }}>
                        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>New Train</Text>
                    </TouchableOpacity>

                    {plans && plans.length > 1 && <TouchableOpacity style={[styles.trainCompleteButton, { backgroundColor: '#F44336', marginTop: 5 }]} onPress={() => {
                        Alert.alert(
                            "Confirm Deletion",
                            "Are you sure you want to delete this training plan?",
                            [
                                {
                                    text: "Cancel",
                                    style: "cancel"
                                },
                                { text: "Delete", onPress: () => removeTrainingPlan(planId) }
                            ]
                        );

                    }}>
                        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Delete Train</Text>
                    </TouchableOpacity>}

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
        padding: width * 0.02,
        borderRadius: width * 0.025,
        justifyContent: 'center',
        alignItems: 'center',
    },

    removeButton: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF0000',
    },
});

export default MyPlansScreen;