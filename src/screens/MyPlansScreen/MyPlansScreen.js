import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, Image, StyleSheet, TouchableOpacity, Modal, Dimensions, Pressable, Alert, ActivityIndicator } from 'react-native';
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

const ExerciseSetsIndicators = ({ edit, dayName, muscleGroup, exercise, updateExerciseSetsDone, showSetsEditModal, setShowSetsEditModal, updateExerciseDone }) => {
    const [setsToDo, setSetsToDo] = useState(exercise.sets);
    const [reps, setReps] = useState(exercise.reps || '10');
    const [restTime, setRestTime] = useState(exercise.rest);
    const [setsDone, setSetsDone] = useState(0);
    const [updated, setUpdate] = useState(false);

    useEffect(() => {
        let interval = null;
        if (restTime > 0 && updated) {
            interval = setInterval(() => {
                setRestTime((prevRestTime) => prevRestTime - 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [restTime, updated]);

    const stylesSetsIndicator = StyleSheet.create({
        modalBackground: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
        },
        modalView: {
            width: '40%',
            height: '30%',
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
        },
        infoContainer: {
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            position: 'absolute',
            bottom: -width * 0.017,
            zIndex: 2
        }
    });
    const spentTime = `${Math.floor(restTime / 60)}:${restTime % 60 < 10 ? '0' : ''}${restTime % 60}`;
    const totalTime = `${Math.floor(exercise.rest / 60)}:${exercise.rest % 60 < 10 ? '0' : ''}${exercise.rest % 60}`;

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
                                defaultValue={String(reps)}
                            />
                        </View>
                        <View style={stylesSetsIndicator.row}>
                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Rest Seconds:</Text>
                            <TextInput
                                style={stylesSetsIndicator.textInput}
                                keyboardType='numeric'
                                onChangeText={text => { setRestTime(text.slice(-3)); setUpdate(false); }}
                                defaultValue={String(exercise.rest)}
                            />
                        </View>
                        <TouchableOpacity style={stylesSetsIndicator.okButton}
                            onPress={() => {
                                setShowSetsEditModal(false);
                                updateExerciseSetsDone(dayName, muscleGroup, exercise.exercise_id, setsToDo, reps, restTime);
                                setUpdate(false);
                            }}
                        >
                            <Text style={stylesSetsIndicator.okButtonText}>Ok</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            :
            <View style={stylesSetsIndicator.infoContainer}>
                <TouchableOpacity style={[stylesSetsIndicator.touchableOpacity, { left: width * 0.016 }]}
                    onLongPress={() => { setShowSetsEditModal(true); setRestTime(exercise.rest); setUpdate(false); }}
                    onPress={() => {
                        if (!edit) {
                            setUpdate(true);
                            setRestTime(exercise.rest)
                        }
                        if (updated) {
                            setUpdate(false);
                            setRestTime(exercise.rest)
                        }
                    }}
                >
                    <View style={[styles.exerciseItemInfo, {
                        backgroundColor: exercise.done || !exercise.rest ? 'rgb(0,208,0)' : `rgb(${255 - restTime / exercise.rest * 255}, ${restTime / exercise.rest * 255 * 0.8}, 0)`
                    }, edit ? { padding: 2, borderRadius: 4 } : {}]}>
                        <Icons name="Watch" size={10} fill="#FFF" style={{ marginRight: 2 }} />
                        <Text style={styles.exerciseItemInfoText}>
                            {updated && !exercise.done ? `${spentTime} of ${totalTime}` : totalTime}
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={[stylesSetsIndicator.touchableOpacity, { right: width * 0.016 }]}
                    onLongPress={() => setShowSetsEditModal(true)}
                    onPress={() => {
                        if (!exercise.done) {
                            setSetsDone(setsDone + 1);
                            if ((setsDone + 1) % (exercise.sets + 1) === exercise.sets) {
                                setSetsDone(0);
                                setUpdate(false);
                                updateExerciseDone(dayName, muscleGroup, exercise.exercise_id, true);
                            } else {
                                setUpdate(!edit && true);
                                setRestTime(exercise.rest)
                            }
                        }
                        if (edit) {
                            setShowSetsEditModal(true);
                        }
                    }}
                >
                    <View style={[styles.exerciseItemInfo, { backgroundColor: '#6495ED' }, edit ? { padding: 2, borderRadius: 4 } : {}]}>
                        <Text style={styles.exerciseItemInfoText}>{!exercise.done && (setsDone > 0) && `${setsDone} of `}{exercise.sets}x{exercise.reps}</Text>
                        {edit && <Icons name="Edit" size={15} style={{ marginLeft: 5 }} />}
                    </View>
                </TouchableOpacity>
            </View>
    )
}

const BallonDetails = ({ dayName, muscleGroup, allExercises, setShowBallon, setAlternativeExercise, addExercise, removeExercise, exerciseId, done, updateExerciseDone, updateUnavailableExercises, getAlternativeExercise, setShowExerciseDetails, adding }) => {
    return (
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>

            <View style={{ alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: 5, borderRadius: 5 }}>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>

                    {adding ?
                        <TouchableOpacity style={{ padding: 10, backgroundColor: done ? '#aaa' : '#4CAF50', borderRadius: 10 }} onPress={() => {
                            addExercise(dayName, muscleGroup, exerciseId);
                            setShowBallon(false);
                        }}>
                            <Text style={{ color: '#FFF' }}>
                                Add
                            </Text>
                        </TouchableOpacity>
                        :
                        <TouchableOpacity style={{ padding: 10, backgroundColor: done ? '#aaa' : '#4CAF50', borderRadius: 10 }} onPress={() => {
                            updateExerciseDone(dayName, muscleGroup, exerciseId, !done);
                            setShowBallon(false);
                        }}>
                            <Text style={{ color: '#FFF' }}>
                                {done ? 'Undone' : 'Done'}
                            </Text>
                        </TouchableOpacity>
                    }

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
                        if (!adding) removeExercise(dayName, muscleGroup, exerciseId);
                        setShowBallon(false);
                    }}>
                        <Text style={{ color: '#FFF' }}>
                            Unavailable
                        </Text>
                    </TouchableOpacity>

                    {!adding && <TouchableOpacity style={{ padding: 10, backgroundColor: '#00BCD4', borderRadius: 10, marginLeft: 10 }} onPress={() => {
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
                    </TouchableOpacity>}
                </View>}

            </View>
        </View>
    )
}

const ExerciseItem = ({ dayName, muscleGroup, exercise, allExercises, edit, addExercise, removeExercise, updateExerciseDone, updateExerciseSetsDone, updateUnavailableExercises, getAlternativeExercise, adding }) => {
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
            <Pressable style={[styles.planDetailsContainer, { backgroundColor: exercise.done ? '#4CAF50' : '#aaa', zIndex: 1 }]}
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

                <Text style={styles.exerciseItemText}>{exercise.title || exercise.exercise_id}</Text>

                {!adding && <>
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
                        <ExerciseSetsIndicators
                            edit={edit}
                            dayName={dayName}
                            muscleGroup={muscleGroup}
                            exercise={exercise}
                            updateExerciseSetsDone={updateExerciseSetsDone}
                            showSetsEditModal={showSetsEditModal}
                            setShowSetsEditModal={setShowSetsEditModal}
                            updateExerciseDone={updateExerciseDone}
                        />

                    </View>
                </>}

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
                    adding={adding}
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
                allExercises={allExercises}
                addExercise={addExercise}
                updateUnavailableExercises={updateUnavailableExercises}
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

const AddExerciseList = ({ dayName, muscleGroup, exercises, allExercises, addExercise, updateUnavailableExercises }) => {

    return (
        <View style={{ width: '100%' }}>
            <ScrollView
                style={styles.addExercisesListScrollView}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
            >
                <View style={styles.addExercisesListContainer}>
                    {exercises.length > 0 ? exercises.map((exercise, index) => {
                        return (
                            <ExerciseItem
                                key={index}
                                dayName={dayName}
                                muscleGroup={muscleGroup}
                                exercise={exercise}
                                allExercises={allExercises}
                                addExercise={addExercise}
                                updateUnavailableExercises={updateUnavailableExercises}
                                adding
                            />
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
            exercises: {
                neck: {
                    'lying-weighted-lateral-neck-flexion': { sets: 4, reps: 10, rest: 120, rest: 120, done: false, edit: false }
                },
                hip: {
                    'high-knee-lunge-on-bosu-ball': { sets: 4, reps: 10, rest: 120, done: false, edit: false }
                }
            },
            rest: false
        },
        Mon: {
            exercises: {
                chest: {
                    'standing-medicine-ball-chest-pass': { sets: 4, reps: 10, rest: 120, done: false, edit: false }
                }
            },
            rest: false
        },
        Tue: {
            exercises: {
                biceps: {
                    'seated-zottman-curl': { sets: 4, reps: 10, rest: 120, done: false, edit: false }
                }
            },
            rest: false
        },
        Wed: {
            exercises: {
                abs: {
                    'medicine-ball-rotational-throw': { sets: 4, reps: 10, rest: 120, done: false, edit: false }
                }
            },
            rest: false
        },
        Thu: {
            exercises: {
                hip: {
                    'high-knee-lunge-on-bosu-ball': { sets: 4, reps: 10, rest: 120, done: false, edit: false }
                }
            },
            rest: false
        },
        Fri: {
            exercises: {
                neck: {
                    'diagonal-neck-stretch': { sets: 4, reps: 10, rest: 120, done: false, edit: false }
                }
            },
            rest: false
        },
        Sat: {
            exercises: {},
            rest: true
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
        full_body: { id: 'full_body', name: 'Full Body' },
        calf: { id: 'calf', name: 'Calf' },
        erector_spinae: { id: 'erector_spinae', name: 'Erector Spinae' },
    };
    const [unavailableExercises, setUnavailableExercises] = useState([]);
    const [exercises_list, setExercisesList] = useState([]);

    const [selectedDay, setSelectedDay] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [allExercises, setAllExercises] = useState(null);

    const [newTrainingModal, setNewTrainingModal] = useState(false);
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
                const newPlans = plans.filter(plan => plan.id!== training_id);
                setPlans(newPlans);
                setPlanId(newPlans[0].id);;
            }
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    }
    const GenerateWeekWorkoutPlan = async (requestBody, setError, onClose) => {
        try {
            const response = await fetch(BASE_URL + '/api/exercises/generate-exercises/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${userToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            const data = await response.json();
            if (response.ok && data.id && plans) {
                setPlans(prevPlans => [...prevPlans, data]);
                setDaysExercises(data.days);
                setPlanId(data.id);
                onClose();
                if(requestBody.use_ai){
                    setSelectedDay({ name: requestBody.workout_days[0], exercises: data.days[requestBody.workout_days[0]].exercises })
                }
            } else {
                setError(true);
                throw new Error('Failed to generate exercises');
            }

        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            throw error;
        }
    };
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
            setDaysExercises(data.training_plans[0].days);
        }
        setUnavailableExercises(data.unavailable_exercises);
    }

    const updateExerciseDone = (dayName, muscleGroup, exerciseIndex, done) => {
        setDaysExercises(prevDays => ({
            ...prevDays,
            [dayName]: {
                ...prevDays[dayName],
                exercises: {
                    ...prevDays[dayName].exercises,
                    [muscleGroup]: {
                        ...prevDays[dayName].exercises[muscleGroup],
                        [exerciseIndex]: {
                            ...prevDays[dayName].exercises[muscleGroup][exerciseIndex],
                            done: done
                        }
                    }
                }
            }
        }));
    }
    const updateAllExercisesDone = (dayName, done) => {
        setDaysExercises(prevDays => ({
            ...prevDays,
            [dayName]: {
                ...prevDays[dayName],
                exercises: Object.fromEntries(
                    Object.entries(prevDays[dayName].exercises).map(([muscleGroup, exercises]) => [
                        muscleGroup,
                        Object.fromEntries(
                            Object.entries(exercises).map(([exerciseName, exerciseDetails]) => [
                                exerciseName,
                                { ...exerciseDetails, done: done }
                            ])
                        )
                    ])
                )
            }
        }));
    };

    const verifyAllExercisesDone = (dayName) => {
        return Object.values(daysExercises[dayName].exercises).every(muscleGroup =>
            Object.values(muscleGroup).every(exercise => exercise.done)
        );
    };

    const updateExerciseSetsDone = (dayName, muscleGroup, exerciseName, setsDone, repsToDo, restTime) => {
        const updatedExercises = prevDays => ({
            ...prevDays,
            [dayName]: {
                ...prevDays[dayName],
                exercises: {
                    ...prevDays[dayName].exercises,
                    [muscleGroup]: {
                        ...prevDays[dayName].exercises[muscleGroup],
                        [exerciseName]: {
                            ...prevDays[dayName].exercises[muscleGroup][exerciseName],
                            sets: setsDone,
                            reps: repsToDo || prevDays[dayName].exercises[muscleGroup][exerciseName].reps,
                            rest: restTime || prevDays[dayName].exercises[muscleGroup][exerciseName].rest
                        }
                    }
                }
            }
        });
        setDaysExercises(updatedExercises);
        setEdit(true);
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

        const not_selected_exercises = exercises_from_muscle.filter(e =>
            !Object.keys(daysExercises[dayName].exercises[muscleGroup]).includes(e) || e === exercise
        )

        const exercise_index = not_selected_exercises.indexOf(exercise) + 1 + salt;

        return not_selected_exercises.length > exercise_index ? not_selected_exercises[exercise_index] : false;
    };

    const addExercise = (dayName, muscleGroup, exerciseId) => {
        const newExercise = { sets: 4, reps: 10, rest: 120, done: false, edit: false };

        setEdit(true);

        setDaysExercises(prevDays => ({
            ...prevDays,
            [dayName]: {
                ...prevDays[dayName],
                exercises: {
                    ...prevDays[dayName].exercises,
                    [muscleGroup]: {
                        ...prevDays[dayName].exercises[muscleGroup],
                        [exerciseId]: newExercise
                    }
                }
            }
        }));
    };

    const removeExercise = (dayName, muscleGroup, exerciseId, replace = false) => {
        if (!daysExercises[dayName] || !daysExercises[dayName].exercises || !daysExercises[dayName].exercises[muscleGroup]) {
            console.error(`Day or muscle group: ${dayName} - ${muscleGroup} not found.`);
            return;
        }
        const newExercises = Object.entries(daysExercises[dayName].exercises[muscleGroup])
            .filter(([exerciseName, _]) => exerciseName !== exerciseId)
            .reduce((acc, [exerciseName, exerciseDetails]) => {
                acc[exerciseName] = exerciseDetails;
                return acc;
            }, replace ? { [replace]: { reps: 10, sets: 4, rest: 120, done: false, edit: false } } : {});

        setEdit(true);

        setDaysExercises(prevDays => ({
            ...prevDays,
            [dayName]: {
                ...prevDays[dayName],
                exercises: {
                    ...prevDays[dayName].exercises,
                    [muscleGroup]: newExercises
                }
            }
        }));

    };

    const removeMuscleGroup = (dayName, muscleGroup) => {
        if (!daysExercises[dayName] || !daysExercises[dayName].exercises) {
            console.error(`Day: ${dayName} not found.`);
            return;
        }
        const { [muscleGroup]: removedGroup, ...remainingGroups } = daysExercises[dayName].exercises;
        setEdit(true);
        setDaysExercises(prevDays => ({
            ...prevDays,
            [dayName]: {
                ...prevDays[dayName],
                exercises: remainingGroups,
                rest: Object.keys(remainingGroups).length === 0
            }
        }));
    };

    const addMuscleGroup = (dayName, muscleGroup) => {
        if (!daysExercises[dayName] || !daysExercises[dayName].exercises) {
            console.error(`Day: ${dayName} not found.`);
            return;
        }
        setEdit(true);
        setDaysExercises(prevDays => ({
            ...prevDays,
            [dayName]: {
                ...prevDays[dayName],
                exercises: {
                    ...prevDays[dayName].exercises,
                    [muscleGroup]: {}
                },
                rest: false
            }
        }));
    };

    const removeTrainingPlan = (planId) => {
        if (online) {
            deleteTrainingPlan(planId);
        } else {
            setPlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
        }
        setPlanId(plans.length ? plans[0].id : 0);
        setDaysExercises(plans.length ? plans[0].days : {});
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
            const selectedPlan = plans.find(plan => plan.id === planId);
            const newDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].find(day => !selectedPlan.days[day].rest) || 'Sun';
            setSelectedDay({ name: newDay, exercises: selectedPlan.days[newDay] });
        }
    }, [planId]);

    const trainCompleted = verifyAllExercisesDone(selectedDay ? selectedDay.name : 'Sun');
    const fit_plans = [{ plan_id: 'workout', plan_name: 'Workout' }, { plan_id: 'diet', plan_name: 'Diet' }];

    const NewTrainingModal = ({ setNewTrainingModal }) => {
        const [generating, setGenerating] = useState(false);
        const [error, setError] = useState(false);
        const [useAI, setUseAI] = useState(false);

        const [trainingName, setTrainingName] = useState('');

        const [workoutDays, setWorkoutDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
        const allWorkoutDaysNames = { 'Mon': 'Monday', 'Tue': 'Tuesday', 'Wed': 'Wednesday', 'Thu': 'Thursday', 'Fri': 'Friday', 'Sat': 'Saturday', 'Sun': 'Sunday' };
        const orderDays = (dayList) => {
            const orderedDays = [];
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            for (let day of days) {
                if (dayList.includes(day)) {
                    orderedDays.push(day);
                }
            }
            return orderedDays;
        }
        useEffect(() => {
            const orderedDays = orderDays(workoutDays);
            if (JSON.stringify(orderedDays) !== JSON.stringify(workoutDays)) {
                setWorkoutDays(orderDays(workoutDays));
            }
        }, [workoutDays]);

        const allRestOptions = ['short', 'medium', 'long'];
        const allRestOptionsNames = { 'short': 'Short', 'medium': 'Medium', 'long': 'Long' }
        const [rest, setRest] = useState(['medium']);

        const allWorkoutTypes = ["home", "gym", "crossfit", "pilates", "yoga", "endurance"]
        const allWorkoutTypesNames = { 'home': 'Home', 'gym': 'Gym', 'crossfit': 'Crossfit', 'pilates': 'Pilates', 'yoga': 'Yoga', 'endurance': 'Endurance' }
        const [workoutType, setWorkoutType] = useState(['gym']);

        const allFocusOrAvoid = ['neck', 'trapezius', 'shoulders', 'chest', 'back', 'erector_spinae', 'biceps', 'triceps', 'forearm', 'abs', 'leg', 'calf', 'hip', 'cardio', 'full_body'];
        const allFocusOrAvoidNames = { 'neck': 'Neck', 'trapezius': 'Trapezius', 'shoulders': 'Shoulders', 'chest': 'Chest', 'back': 'Back', 'erector_spinae': 'Erector Spinae', 'biceps': 'Biceps', 'triceps': 'Triceps', 'forearm': 'Forearm', 'abs': 'Abs', 'leg': 'Leg', 'calf': 'Calf', 'hip': 'Hip', 'cardio': 'Cardio', 'full_body': 'Full Body' };
        const [focus, setFocus] = useState([]);
        const [avoid, setAvoid] = useState([]);

        const allGoals = ['general_fitness', 'muscle_strength', 'weight_loss', 'core_strength_and_stability', 'body_recomposition', 'balance_and_coordination', 'athletic_performance_improvement', 'posture_correction', 'stress_reduction_and_relaxation', 'muscle_definition_and_toning', 'endurance_training', 'power_and_explosiveness', 'increase_energy_levels', 'enhance_overall_health_and_well_being', 'cardiovascular_endurance', 'muscle_hypertrophy', 'flexibility_and_mobility', 'injury_rehabilitation_and_prevention', 'functional_fitness', 'agility_and_speed'];
        const allGoalsNames = { 'general_fitness': 'General Fitness', 'muscle_strength': 'Muscle Strength', 'weight_loss': 'Weight Loss', 'core_strength_and_stability': 'Core Strength and Stability', 'body_recomposition': 'Body Recomposition', 'balance_and_coordination': 'Balance and Coordination', 'athletic_performance_improvement': 'Athletic Performance Improvement', 'posture_correction': 'Posture Correction', 'stress_reduction_and_relaxation': 'Stress Reduction and Relaxation', 'muscle_definition_and_toning': 'Muscle Definition and Toning', 'endurance_training': 'Endurance Training', 'power_and_explosiveness': 'Power and Explosiveness', 'increase_energy_levels': 'Increase Energy Levels', 'enhance_overall_health_and_well_being': 'Enhance Overall Health and Well Being', 'cardiovascular_endurance': 'Cardiovascular Endurance', 'muscle_hypertrophy': 'Muscle Hypertrophy', 'flexibility_and_mobility': 'Flexibility and Mobility', 'injury_rehabilitation_and_prevention': 'Injury Rehabilitation and Prevention', 'functional_fitness': 'Functional Fitness', 'agility_and_speed': 'Agility and Speed' };
        const [goals, setGoals] = useState([]);

        const [newTrainingComment, setNewTrainingComment] = useState('');

        const onClose = () => {
            setNewTrainingModal(false);
        }
        const styles = StyleSheet.create({
            container: {
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.4)',
                paddingTop: 10,
                paddingBottom: 10,
                paddingHorizontal: 15,
            },
            newTrainingScroll: {
                backgroundColor: 'rgba(0,0,0,0.7)',
                borderRadius: 10,
                padding: 10,
                paddingTop: 10,
            },
            generating: {
                width: '100%',
                height: width * 1.5,
                borderRadius: 10,
                marginTop: width * 0.15,
                backgroundColor: '#FFF',
                justifyContent: 'center',
                alignItems: 'center',
            },
            generatingText: {
                color: '#000',
                fontSize: width * 0.05,
                fontWeight: 'bold',
                marginHorizontal: '1%',
            },
            newTrainingTitle: {
                width: '80%',
                fontSize: width * 0.04,
                color: '#000',
                backgroundColor: '#FFF',
                fontWeight: 'bold',
                padding: 10,
                borderRadius: 10,
                marginLeft: '5%',
                marginTop: useAI ? 10 : width*0.5,
                marginBottom: 20,
            },
            selectBox: {
                width: '90%',
                marginLeft: '5%',
                borderRadius: 5,
                justifyContent: 'space-between',
                marginBottom: 10,
            },
            textContainer: {
                flex: 0,
                borderTopRightRadius: 5,
                borderTopLeftRadius: 5,
                justifyContent: 'center',
                backgroundColor: '#fff',
                paddingVertical: 2,
                paddingHorizontal: 15,
                marginRight: 'auto',
            },
            itemsList: {
                width: '100%',
                padding: 10,
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                flexWrap: 'wrap',
            },
            selectedItems: {
                borderTopRightRadius: 5,
                backgroundColor: '#F0F0F0',
                justifyContent: 'center',
                flexWrap: 'wrap',
            },
            unselectedItems: {
                borderRadius: 5,
                borderTopLeftRadius: 0,
                borderTopEndRadius: 0,
                backgroundColor: '#CCCCCC',
            },
            selectBoxItem: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: width * 0.02,
                paddingVertical: width * 0.008,
                borderRadius: width * 0.01,
                margin: width * 0.01,
                backgroundColor: '#DDD',
            },
            selectBoxItemText: {
                color: '#000',
                fontWeight: 'bold',
                fontSize: width * 0.03
            },
            showAllButton: {
                padding: 5,
                width: '50%',
                marginLeft: '5%',
                borderRadius: 5,
                backgroundColor: '#0000FF',
            },
            showAllText: {
                color: '#fff',
                fontWeight: 'bold',
                fontSize: width * 0.03
            },
            workoutButton: {
                flex: 0,
                padding: 12,
                borderRadius: 5,
                marginHorizontal: '5%',
                marginTop: 5,
                alignItems: 'center',
                justifyContent: 'center',
            },
            workoutButtonText: {
                color: '#fff',
                fontWeight: 'bold',
                fontSize: width * 0.035
            },
            newTrainingComment: {
                width: '90%',
                fontSize: width * 0.03,
                color: '#000',
                backgroundColor: '#FFF',
                fontWeight: 'bold',
                padding: 10,
                borderRadius: 10,
                marginLeft: '5%',
                marginBottom: 20,
            }

        });

        const SelectBox = ({ title, max, allOptions, allOptionsNames, selectedOptions, setSelectedItem, obligatory = false }) => {
            const onSelectItem = (item) => {
                if (selectedOptions.includes(item)) {
                    setSelectedItem(selectedOptions.filter(selected => selected !== item));
                } else {
                    setSelectedItem([...selectedOptions, item]);
                }
            }
            const onRemoveItem = (item) => {
                setSelectedItem(selectedOptions.filter(selected => selected !== item));
            }
            const alertMaxItems = (title) => {
                alert(`You can only select ${max} "${title}" per training day. Please remove an item first.`);
            }

            return (
                <View style={styles.selectBox}>
                    <View style={styles.textContainer}>
                        <Text style={{ fontWeight: 'bold', fontSize: width * 0.03, color: '#000' }}>{title}</Text>
                    </View>
                    <View style={[styles.itemsList, styles.selectedItems]}>
                        {
                            selectedOptions.length ? selectedOptions.map(option => {
                                return (
                                    <TouchableOpacity key={option} style={styles.selectBoxItem} onPress={() => onRemoveItem(option)}>
                                        <Text style={styles.selectBoxItemText}>{allOptionsNames[option]}</Text>
                                    </TouchableOpacity>
                                )
                            }) :
                                <Text style={{ color: '#888', fontSize: width * 0.025 }}>Select an option to add.{obligatory && " Obligatory!"}</Text>
                        }
                    </View>
                    <View style={[styles.itemsList, styles.unselectedItems]}>
                        {
                            allOptions.filter(option => !selectedOptions.includes(option)).map(option => {
                                return (
                                    <TouchableOpacity key={option} style={styles.selectBoxItem} onPress={() => !max || selectedOptions.length < max ? onSelectItem(option) : alertMaxItems(title)}>
                                        <Text style={[styles.selectBoxItemText, { color: '#888' }]}>{allOptionsNames[option]}</Text>
                                    </TouchableOpacity>
                                )
                            })
                        }
                        {max && <Text style={{ position: 'absolute', bottom: 0, right: 3, color: '#888', fontSize: width * 0.03 }}>Max: {max}</Text>}
                    </View>
                </View>
            )
        }

        function checkBeforeCreation(){
            if (!trainingName) {
                alert('Please enter a workout name')
                return false
            }
            if(useAI){
                if (workoutType.length === 0) {
                    alert('Please select a workout type')
                    return false
                }
                if (workoutDays.length === 0) {
                    alert('Please select at least one day')
                    return false
                }
                if (rest.length === 0) {
                    alert('Please select a rest time')
                    return false
                }
            }
            return true
        }

        return (

            <Modal
                visible={newTrainingModal}
                animationType="slide"
                transparent={true}
                onRequestClose={onClose}
            >
                <View style={styles.container}>
                    <ScrollView style={styles.newTrainingScroll}>

                        {generating ?
                            <View style={styles.generating}>
                                {error ?
                                    <>
                                        <Text style={styles.generatingText}>Sorry, we got an error while Generating Workout... :/</Text>
                                    </>
                                    : <>
                                        <ActivityIndicator size="large" color="#0000ff" />
                                        <Text style={styles.generatingText}>Generating Workout...</Text>
                                    </>

                                }
                            </View>
                            : <>
                                <TextInput style={styles.newTrainingTitle} placeholder="Workout Name" onChangeText={setTrainingName} />

                                {useAI && <>
                                    <SelectBox
                                        title="Week Workout Days"
                                        allOptions={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
                                        allOptionsNames={allWorkoutDaysNames}
                                        selectedOptions={workoutDays}
                                        setSelectedItem={setWorkoutDays}
                                        obligatory
                                    />
                                    <SelectBox
                                        title="Workout Type"
                                        max={1}
                                        allOptions={allWorkoutTypes}
                                        allOptionsNames={allWorkoutTypesNames}
                                        selectedOptions={workoutType}
                                        setSelectedItem={setWorkoutType}
                                        obligatory
                                    />
                                    <SelectBox
                                        title="Rest Time Among Sets"
                                        max={1}
                                        allOptions={allRestOptions}
                                        allOptionsNames={allRestOptionsNames}
                                        selectedOptions={rest}
                                        setSelectedItem={setRest}
                                        obligatory
                                    />
                                    <SelectBox
                                        title="Goals"
                                        max={3}
                                        allOptions={allGoals}
                                        allOptionsNames={allGoalsNames}
                                        selectedOptions={goals}
                                        setSelectedItem={setGoals}
                                    />
                                    <SelectBox
                                        title="Muscles to Focus"
                                        max={3}
                                        allOptions={allFocusOrAvoid.filter(focus => !avoid.includes(focus))}
                                        allOptionsNames={allFocusOrAvoidNames}
                                        selectedOptions={focus}
                                        setSelectedItem={setFocus}
                                    />
                                    <SelectBox
                                        title="Muscles to Avoid"
                                        max={3}
                                        allOptions={allFocusOrAvoid.filter(avoid => !focus.includes(avoid))}
                                        allOptionsNames={allFocusOrAvoidNames}
                                        selectedOptions={avoid}
                                        setSelectedItem={setAvoid}
                                    />
                                    <TextInput style={styles.newTrainingComment} placeholder="Say what do you want about your workout.(Optional)" onChangeText={setNewTrainingComment} />
                                </>}

                                <TouchableOpacity
                                    style={[styles.workoutButton, { backgroundColor: '#FF5733' }]}
                                    onPress={() => {
                                        if(useAI){
                                            if(checkBeforeCreation()){
                                                setGenerating(true);
                                                GenerateWeekWorkoutPlan({
                                                        "name": trainingName,
                                                        "workout_days": workoutDays,
                                                        "rest": rest,
                                                        "workout_type": workoutType[0],
                                                        "focus": focus,
                                                        "avoid": avoid,
                                                        "main_goal": '',
                                                        "goals": goals,
                                                        "comment": newTrainingComment,
                                                        "use_ai": true
                                                    }, setError, onClose)
                                            }
                                        } else {
                                            setUseAI(true);
                                        }
                                    }}
                                >
                                    <Text style={styles.workoutButtonText}>Generate with AI (GPT)</Text>
                                </TouchableOpacity>

                                {!useAI && <TouchableOpacity
                                    style={[styles.workoutButton, { backgroundColor: '#4CAF50' }]}
                                    onPress={() => {
                                        if(checkBeforeCreation()){
                                            setGenerating(true);
                                            GenerateWeekWorkoutPlan({
                                                "name": trainingName,
                                                "use_ai": false
                                            }, setError, onClose)
                                        }
                                    }}
                                >
                                    <Text style={styles.workoutButtonText}>Generate From Zero</Text>
                                </TouchableOpacity>}

                                <TouchableOpacity
                                    style={[styles.workoutButton, { backgroundColor: '#999', marginBottom: 50 }]}
                                    onPress={onClose}
                                >
                                    <Text style={styles.workoutButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            </>
                        }

                    </ScrollView>
                </View>
            </Modal>
        )
    }

    return (
        <View style={styles.container}>
            <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />

            <NewTrainingModal setNewTrainingModal={setNewTrainingModal} />

            <ScrollView
                style={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                overScrollMode="never"
            >

                <View style={styles.sectionContainer}>

                    <Text style={styles.sectionTitle}>Workout Plan</Text>
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
                                    setDaysExercises(plan.days); setPlanId(plan.id);
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
                        {selectedDay && allExercises && Object.entries(daysExercises).map(([dayName, dayInfo]) => {
                            if (selectedDay.name === dayName.slice(0, 3)) {
                                return (
                                    <View key={dayName}>
                                        {Object.keys(dayInfo.exercises).length > 0 ? Object.entries(dayInfo.exercises).map(
                                            ([muscleGroup, exercises_list]) => {
                                                return <TrainingMember key={muscleGroup} dayName={dayName} muscleGroupName={muscle_groups[muscleGroup].name} muscleGroup={muscleGroup}
                                                    exercises={
                                                        Object.entries(exercises_list).map(([exerciseId, exerciseDetails]) => ({ ...exerciseDetails, exercise_id: exerciseId, title: allExercises[exerciseId].title })).filter(Boolean)
                                                    }
                                                    allExercises={allExercises ?
                                                        Object.values(allExercises)
                                                            .filter(exercise => exercise.muscle_groups.some(group => group.muscle_group_id === muscleGroup))
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

                                            }
                                        ) :
                                            <View>
                                                <Text style={{ fontSize: 20, color: '#aaa', fontWeight: 'bold', textAlign: 'center', padding: 10 }}>No workout for this day</Text>
                                            </View>}
                                    </View>
                                )
                            }
                        })}
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        {Object.keys(daysExercises[selectedDay ? selectedDay.name : 'Mon'].exercises).length > 0 && <TouchableOpacity style={[styles.planDetailsContainer, { backgroundColor: trainCompleted ? '#aaa' : '#4CAF50' }]} onPress={() => {
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
                            setDaysExercises(plans.find(plan => plan.id === planId).days);
                            setEdit(false);
                        }}>
                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Cancel Changes</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.trainCompleteButton, { backgroundColor: '#4CAF50', flex: 1 }]} onPress={() => updatePlans(planId, { "days": daysExercises })}>
                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Save Train</Text>
                        </TouchableOpacity>

                    </View>}

                    <TouchableOpacity style={[styles.trainCompleteButton, { backgroundColor: '#6495ED', marginTop: 5 }]} onPress={() => {
                        setNewTrainingModal(true);
                    }}>
                        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>New Workout</Text>
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
        flexDirection: 'row'
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