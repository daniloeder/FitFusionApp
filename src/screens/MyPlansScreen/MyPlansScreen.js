import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, Image, StyleSheet, TouchableOpacity, Modal, Dimensions, Pressable, Alert, ActivityIndicator } from 'react-native';
import GradientBackground from '../../components/GradientBackground/GradientBackground';
import { useGlobalContext } from './../../services/GlobalContext';
import Icons from '../../components/Icons/Icons';
import { BASE_URL } from '@env';
import { TextInput } from 'react-native-gesture-handler';
import StripePayment from '../../components/Payment/StripePayment';

const width = Dimensions.get('window').width;

const Tabs = ({ index, name, setSelectedTab, isSelected, len, TabSize = 100 }) => {
    const styles = StyleSheet.create({
        dayContainer: {
            flex: 1,
            maxHeight: width*0.2,
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
            fontWeight: 'bold',
        },
    });

    return (
        <TouchableOpacity onPress={setSelectedTab} style={{ width: TabSize }} activeOpacity={1}>
            <View style={styles.dayContainer}>
                <Text style={styles.dayText}
                    adjustsFontSizeToFit={true}
                    numberOfLines={2}
                >{name}</Text>
            </View>
        </TouchableOpacity>
    );
};

const TrainDetails = ({ dayName, muscleGroup, allExercises, exercise, showExerciseDetails, setShowExerciseDetails, setAlternativeExercise, getAlternativeExercise, removeExercise }) => {
    const onClose = () => {
        setShowExerciseDetails(false);
        setAlternativeExercise(false);
    };

    return (
        <Modal
            visible={showExerciseDetails}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.details_container}>
                <ScrollView style={styles.details_itemscroll}>
                    <Text style={styles.details_title}>{exercise.title}</Text>
                    <Image
                        source={{ uri: exercise.execution_images[0].image_url }}
                        style={styles.details_image}
                    />
                    <Text>{exercise.description}</Text>
                    {exercise.how_to_do && exercise.how_to_do.length ? <View style={styles.details_exerciseInfo}>
                        <Text style={styles.details_sectionTitle}>How to do:</Text>
                        {exercise.how_to_do.map((step, index) => (
                            <Text key={index}>{index + 1}. {step}</Text>
                        ))}
                    </View> : ''}
                    {exercise.equipment && exercise.equipment.length ? <View style={styles.details_exerciseInfo}>
                        <Text style={styles.details_sectionTitle}>Equipment:</Text>
                        {exercise.equipment.map((item, index) => (
                            <Text key={index}>- {item}</Text>
                        ))}
                    </View> : ''}
                    {exercise.item_groups && exercise.item_groups.length ? <View style={[styles.details_exerciseInfo, { marginBottom: width * 0.05 }]}>
                        <Text style={styles.details_sectionTitle}>Muscle Groups:</Text>
                        {exercise.item_groups.map((group, index) => (
                            <Text key={index}>- {group.name}</Text>
                        ))}
                    </View> : ''}
                    <View style={{ marginBottom: width * 0.1 }}></View>
                </ScrollView>
                <View style={{ width: '90%', left: '5%', bottom: 10, position: 'absolute', flexDirection: 'row', justifyContent: 'space-between' }}>
                    {exercise.alternative && <>
                        <TouchableOpacity style={[styles.details_closeButton, { backgroundColor: '#4CAF50' }]} onPress={() => {
                            removeExercise(exercise.alternative.dayName, exercise.alternative.muscleGroup, exercise.alternative.from, exercise.alternative.to);
                            setAlternativeExercise(false);
                        }}>
                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Set Alternative</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.details_closeButton, { backgroundColor: '#00BCD4' }]} onPress={() => {
                            const alternative = getAlternativeExercise(exercise.alternative.dayName, exercise.alternative.muscleGroup, exercise.item_id);
                            setAlternativeExercise(
                                { ...allExercises.find(exercise => exercise.item_id === alternative), alternative: { from: exercise.alternative.from, to: alternative, dayName: dayName, muscleGroup: muscleGroup } }
                            );
                        }}>
                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Another</Text>
                        </TouchableOpacity>
                    </>}
                    <TouchableOpacity style={[styles.details_closeButton, !exercise.alternative ? { marginLeft: 'auto' } : {}]} onPress={() => onClose()}>
                        <Text style={{ color: '#000', fontWeight: 'bold' }}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const FoodDetails = ({ food, showFoodDetails, setShowFoodDetails }) => {
    const onClose = () => {
        setShowFoodDetails(false);
    };

    const stylesFood = StyleSheet.create({
        details_container: {
            flex: 1,
            backgroundColor: '#FFF',
            padding: 20,
        },
        details_itemscroll: {
            marginBottom: 20,
        },
        details_title: {
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 10,
        },
        detail: {
            marginLeft: 10,
            marginBottom: 5,
        },
        details_sectionTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            marginTop: 15,
        },
        details_closeButton: {
            padding: 10,
            borderRadius: 5,
            alignItems: 'center',
            justifyContent: 'center',
        },
    });

    return (
        <Modal
            visible={showFoodDetails}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.details_container}>
                <ScrollView style={stylesFood.details_itemscroll}>
                    <Text style={stylesFood.details_title}>{food.title}</Text>
                    {food.description && <Text>{food.description}</Text>}
                    {food.benefits && <><Text style={stylesFood.details_sectionTitle}>Benefits:</Text>
                        {food.benefits.map((benefit, index) => (
                            <Text style={stylesFood.detail} key={index}>- {benefit}</Text>
                        ))}</>}
                    {food.calories && food.amount && <Text style={stylesFood.details_sectionTitle}>Calories: {food.calories}/{food.amount}g</Text>}
                    {food.comments_and_tips && <><Text style={stylesFood.details_sectionTitle}>Comments and Tips:</Text>
                        {food.comments_and_tips.map((comment, index) => (
                            <Text key={index}>- {comment}</Text>
                        ))}</>}
                    {food.how_to_make && <><Text style={stylesFood.details_sectionTitle}>How to Make:</Text>
                        {food.how_to_make.map((step, index) => (
                            <Text key={index}>- {step}</Text>
                        ))}</>}
                    {food.item_groups && <><Text style={stylesFood.details_sectionTitle}>Meals:</Text>
                        {food.item_groups.map((group, index) => <Text key={index}>- {group.name}</Text>)}</>}
                </ScrollView>
                <View style={{ width: '90%', left: '5%', bottom: 10, position: 'absolute', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={[styles.details_closeButton, { marginLeft: 'auto' }]} onPress={() => onClose()}>
                        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}

const ExerciseSetsIndicators = ({ plan, edit, dayName, muscleGroup, exercise, updateExerciseSetsDone, showSetsEditModal, setShowSetsEditModal, updateExerciseDone, setShowBallon }) => {
    const [setsToDo, setSetsToDo] = useState(exercise.sets);
    const [reps, setReps] = useState(exercise.reps || '10');
    const [restTime, setRestTime] = useState(exercise.rest);

    const [grams, setGrams] = useState(exercise.amount);
    const [calories, setCalories] = useState(exercise.calories);

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
                        {plan === "workout" ? <>
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
                        </> : <>
                            <View style={stylesSetsIndicator.row}>
                                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 10 }}>Kcal:</Text>
                                <TextInput
                                    style={[stylesSetsIndicator.textInput, { fontSize: 8 }]}
                                    keyboardType='numeric'
                                    onChangeText={text => { setCalories(text); setUpdate(false); }}
                                    defaultValue={String(calories)}
                                />
                            </View>
                            <View style={stylesSetsIndicator.row}>
                                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Grams:</Text>
                                <TextInput
                                    style={stylesSetsIndicator.textInput}
                                    keyboardType='numeric'
                                    onChangeText={text => { setGrams(text); setUpdate(false); setCalories(parseInt(text / exercise.amount * exercise.calories)); }}
                                    defaultValue={String(exercise.amount)}
                                />
                            </View>
                        </>}
                        <TouchableOpacity style={stylesSetsIndicator.okButton}
                            onPress={() => {
                                setShowSetsEditModal(false);
                                setUpdate(false);
                                if (plan === "workout") {
                                    updateExerciseSetsDone(dayName, muscleGroup, exercise.item_id, setsToDo, reps, restTime);
                                } else {
                                    updateExerciseSetsDone(dayName, muscleGroup, exercise.item_id, grams, calories);
                                }
                            }}
                        >
                            <Text style={stylesSetsIndicator.okButtonText}>Ok</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            :
            <View style={stylesSetsIndicator.infoContainer}>
                <TouchableOpacity style={[stylesSetsIndicator.touchableOpacity, { left: width * 0.016, margin: plan === "workout" ? 1 : 3 }]}
                    onLongPress={() => {
                        setShowSetsEditModal(true);
                        if (plan === "workout") {
                            setRestTime(exercise.rest); setUpdate(false);
                        }
                    }}
                    onPress={() => {
                        if (plan === "workout") {
                            if (!edit) {
                                setUpdate(true);
                                setRestTime(exercise.rest)
                            }
                            if (updated) {
                                setUpdate(false);
                                setRestTime(exercise.rest)
                            }
                        } else {
                            if (edit) {
                                setShowSetsEditModal(true);
                            } else {
                                setShowBallon(true);
                            }
                        }
                    }}
                >
                    <View style={[styles.exerciseItemInfo, {
                        backgroundColor: exercise.done || !exercise.rest ? 'rgb(0,208,0)' : `rgb(${255 - restTime / exercise.rest * 255}, ${restTime / exercise.rest * 255 * 0.8}, 0)`,
                    }, edit ? { padding: 2, borderRadius: 4 } : {}]}>
                        {plan === "workout" ? <>
                            <Icons name="Watch" size={10} fill="#FFF" style={{ marginRight: 2 }} />
                            <Text style={[styles.exerciseItemInfoText, { fontSize: width * 0.022 }]}>
                                {updated && !exercise.done ? `${spentTime} of ${totalTime}` : totalTime}
                            </Text>
                        </> : <>
                            <Icons name="Fire" size={8} fill="#FFF" style={{ marginRight: 2 }} />
                            <Text style={[styles.exerciseItemInfoText, { fontSize: width * 0.02 }]}>
                                {calories} kcal
                            </Text>
                        </>

                        }
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={[stylesSetsIndicator.touchableOpacity, { right: width * 0.016 }]}
                    onLongPress={() => {
                        setShowSetsEditModal(true);
                        if (plan === "workout") {
                            setRestTime(exercise.rest); setUpdate(false);
                        }
                    }}
                    onPress={() => {
                        if (plan === "workout") {
                            if (!exercise.done) {
                                setSetsDone(setsDone + 1);
                                if ((setsDone + 1) % (exercise.sets + 1) === exercise.sets) {
                                    setSetsDone(0);
                                    setUpdate(false);
                                    updateExerciseDone(dayName, muscleGroup, exercise.item_id, true);
                                } else {
                                    setUpdate(!edit && true);
                                    setRestTime(exercise.rest)
                                }
                            }
                            if (edit) {
                                setShowSetsEditModal(true);
                            }
                        } else {
                            if (edit) {
                                setShowSetsEditModal(true);
                            } else {
                                setShowBallon(true);
                            }
                        }
                    }}
                >
                    <View style={[styles.exerciseItemInfo, { backgroundColor: '#6495ED' }, edit ? { padding: 2, borderRadius: 4 } : {}]}>
                        {plan === "workout" ?
                            <Text style={[styles.exerciseItemInfoText, { fontSize: width * 0.022 }]}>
                                {!exercise.done && (setsDone > 0) && `${setsDone} of `}{exercise.sets}x{exercise.reps}
                            </Text> :
                            <Text style={[styles.exerciseItemInfoText, { fontSize: width * 0.02 }]}>
                                {grams}g
                            </Text>
                        }
                        {edit && <Icons name="Edit" size={10} style={{ marginLeft: 5 }} />}
                    </View>
                </TouchableOpacity >
            </View >
    )
}

const BallonDetails = ({ plan, dayName, muscleGroup, allExercises, setShowBallon, setAlternativeExercise, addExercise, removeExercise, exerciseId, done, updateExerciseDone, updateUnavailableExercises, getAlternativeExercise, setShowExerciseDetails, adding }) => {
    return (
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>

            <View style={{ alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: 5, borderRadius: 5 }}>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>

                    {adding ?
                        <TouchableOpacity style={{ padding: 10, backgroundColor: done ? '#aaa' : '#4CAF50', borderRadius: 10 }} onPress={() => {
                            if (plan === "workout") {
                                addExercise(dayName, muscleGroup, exerciseId, { sets: 4, reps: 10, rest: 120, done: false, edit: false });
                            } else {
                                const e = allExercises.find(e => e.item_id === exerciseId);
                                addExercise(dayName, muscleGroup, exerciseId, e.amount ? e : { ...e, calories: e.calories * 0.2, amount: 200 });
                            }
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

                {!done && plan === "workout" && <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: width * 0.02 }}>
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
                                { ...allExercises.find(exercise => exercise.item_id === alternative), alternative: { from: exerciseId, to: alternative, dayName: dayName, muscleGroup: muscleGroup } }
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

const ExerciseItem = ({ plan, dayName, muscleGroup, exercise, allExercises, edit, addExercise, removeExercise, updateExerciseDone, updateExerciseSetsDone, updateUnavailableExercises, getAlternativeExercise, adding }) => {
    const [showBallon, setShowBallon] = useState(false);
    const [showSetsEditModal, setShowSetsEditModal] = useState(false);
    const [showExerciseDetails, setShowExerciseDetails] = useState(false);
    const [alternativeExercise, setAlternativeExercise] = useState(null);

    return (
        <View>
            {showExerciseDetails ?
                plan === "workout" ?
                    <TrainDetails
                        dayName={dayName}
                        muscleGroup={muscleGroup}
                        allExercises={allExercises}
                        exercise={alternativeExercise || allExercises.find(e => e.item_id === exercise.item_id)}
                        showExerciseDetails={showExerciseDetails}
                        setShowExerciseDetails={setShowExerciseDetails}
                        setAlternativeExercise={setAlternativeExercise}
                        getAlternativeExercise={getAlternativeExercise}
                        removeExercise={removeExercise}
                    />
                    :
                    <FoodDetails
                        dayName={dayName}
                        foodGroup={muscleGroup}
                        food={{ ...allExercises.find(f => f.item_id === exercise.item_id), calories: exercise.calories, amount: exercise.amount }}
                        showFoodDetails={showExerciseDetails}
                        setShowFoodDetails={setShowExerciseDetails}
                    />
                : ''
            }
            <Pressable style={[styles.planDetailsContainer, { backgroundColor: exercise.done ? '#4CAF50' : '#aaa', zIndex: 1 }, { margin: edit ? width * 0.03 : width * 0.01, minWidth: plan === "workout" ? 0 : width * 0.25 }]}
                onLongPress={() => {
                    setShowExerciseDetails(true);
                }}
                delayLongPress={200}
                onPress={() => {
                    if (edit) {
                        removeExercise(dayName, muscleGroup, exercise.item_id);
                    } else {
                        setShowBallon(!showBallon);
                    }
                }}>

                <Text style={styles.exerciseItemText}>{exercise.title || exercise.item_id}</Text>

                {!adding && <>
                    {(edit || showBallon) &&
                        <TouchableOpacity style={styles.exerciseItemRemoveBox}
                            onPress={() => {
                                setShowBallon(false);
                                removeExercise(dayName, muscleGroup, exercise.item_id);
                            }}
                        >
                            <View style={styles.exerciseItemRemove}>
                                <Icons name="CloseX" size={width * 0.03} />
                            </View>
                        </TouchableOpacity>
                    }
                    <View style={[StyleSheet.absoluteFill, { justifyContent: 'flex-end', alignItems: 'flex-end', right: width * -0.02, bottom: -width * 0.018 }]}>
                        <ExerciseSetsIndicators
                            plan={plan}
                            edit={edit}
                            dayName={dayName}
                            muscleGroup={muscleGroup}
                            exercise={exercise}
                            updateExerciseSetsDone={updateExerciseSetsDone}
                            showSetsEditModal={showSetsEditModal}
                            setShowSetsEditModal={setShowSetsEditModal}
                            updateExerciseDone={updateExerciseDone}
                            setShowBallon={setShowBallon}
                        />
                    </View>
                </>}

            </Pressable>

            {showBallon && (
                <BallonDetails
                    plan={plan}
                    dayName={dayName}
                    muscleGroup={muscleGroup}
                    allExercises={allExercises}
                    setShowBallon={setShowBallon}
                    setAlternativeExercise={setAlternativeExercise}
                    exerciseId={exercise.item_id}
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

const TrainingMember = ({ plan, dayName, muscleGroup, muscleGroupName, exercises, allExercises, addExercise, removeExercise, removeMuscleGroup, updateExerciseDone, updateExerciseSetsDone, unavailableExercises, updateUnavailableExercises, getAlternativeExercise }) => {
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
                    plan={plan}
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
                plan={plan}
                dayName={dayName}
                muscleGroup={muscleGroup}
                exercises={allExercises.filter(exercise => (!exercises.map(exercise => exercise.item_id).includes(exercise.item_id) && !unavailableExercises.includes(exercise.item_id)))}
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
                    <TouchableOpacity key={index} style={styles.planDetailsContainer} onPress={() => { addMuscleGroup(dayName, muscle.id) }}>
                        <Text style={styles.exerciseItemText}>{muscle.name}</Text>
                    </TouchableOpacity>
                )
            }) : ''}
            <TouchableOpacity onPress={setAddNewMuscleGroup} style={{ position: 'absolute', right: 0, top: -12, padding: 5, backgroundColor: '#F44336', borderRadius: 10 }}>
                <Icons name="CloseX" size={width * 0.045} />
            </TouchableOpacity>
        </View>
    )
}

const AddExerciseList = ({ plan, dayName, muscleGroup, exercises, allExercises, addExercise, updateUnavailableExercises }) => {

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
                                plan={plan}
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

    const styles = StyleSheet.create({
        selectBox: {
            width: '90%',
            marginLeft: '5%',
            borderRadius: 5,
            justifyContent: 'space-between',
            marginBottom: 10,
            padding: 3,
            borderRadius: 8,
            backgroundColor: '#eee'
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

    });

    return (
        <View style={styles.selectBox}>
            <View style={styles.textContainer}>
                <Text style={{ fontWeight: 'bold', fontSize: width * 0.03, color: '#000' }}>{title}</Text>
            </View>
            <View style={[styles.itemsList, styles.selectedItems]}>
                {
                    selectedOptions.length ? selectedOptions.map((option, index) => {
                        return (
                            <TouchableOpacity key={index} style={styles.selectBoxItem} onPress={() => onRemoveItem(option)}>
                                <Text style={styles.selectBoxItemText}>{allOptionsNames[option]}</Text>
                            </TouchableOpacity>
                        )
                    }) :
                        <Text style={{ color: '#888', fontSize: width * 0.025 }}>Select an option to add.{obligatory && " Obligatory!"}</Text>
                }
            </View>
            <View style={[styles.itemsList, styles.unselectedItems]}>
                {
                    allOptions.filter(option => !selectedOptions.includes(option)).map((option, index) => {
                        return (
                            <TouchableOpacity key={index} style={styles.selectBoxItem} onPress={() => !max || selectedOptions.length < max ? onSelectItem(option) : alertMaxItems(title)}>
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

const NewTrainingModal = ({ plan, newTrainingModal, setNewTrainingModal, GenerateWeekWorkoutPlan, GenerateWeekDietPlan, userSubscriptionPlan, setUpdatePlanModal, plansLength }) => {
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState(false);
    const [useAI, setUseAI] = useState(false);

    const [trainingName, setTrainingName] = useState('');

    const [workoutDays, setWorkoutDays] = useState(plan === "workout" ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
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

    const allDietGoals = ['weight_loss', 'muscle_gain', 'healthy_eating', 'calorie_control', 'portion_control', 'balanced_nutrition', 'nutrient_density', 'hydration', 'mindful_eating'];
    const allDietGoalsNames = { 'weight_loss': 'Weight Loss', 'muscle_gain': 'Muscle Gain', 'healthy_eating': 'Healthy Eating', 'calorie_control': 'Calorie Control', 'portion_control': 'Portion Control', 'balanced_nutrition': 'Balanced Nutrition', 'nutrient_density': 'Nutrient Density', 'hydration': 'Hydration', 'mindful_eating': 'Mindful Eating' };
    const [dietGoals, setDietGoals] = useState([]);

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
            marginTop: useAI ? 10 : width * 0.5,
            marginBottom: 20,
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

    function checkBeforeCreation() {
        if (userSubscriptionPlan.features[plan].max[0] && plansLength >= userSubscriptionPlan.features[plan].max[1]) {
            Alert.alert('You need to upgrate to create a new plan.', `Max of ${userSubscriptionPlan.features[plan].max[1]} plans with "${userSubscriptionPlan.name}" plan.`,
                [{ text: 'Cancel', style: 'cancel' }, { text: 'Upgrade Plan', onPress: () => setUpdatePlanModal(true) }]
            );
            return;
        }
        if (!trainingName) {
            alert('Please enter a workout name')
            return false
        }
        if (useAI) {
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

    useEffect(() => {
        setGenerating(false);
        setError(false);
        setUseAI(false);
    }, [newTrainingModal]);

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
                        : <><TextInput style={styles.newTrainingTitle} placeholder={plan === "workout" ? "Workout Name" : "Diet Name"} onChangeText={setTrainingName} />
                            {userSubscriptionPlan && userSubscriptionPlan.features[plan].max[0] && !useAI && <><Text style={{ marginLeft: 20, fontSize: width * 0.028, fontWeight: 'bold', color: '#FF0000' }}>
                                You can have {userSubscriptionPlan.features[plan].max[1]} plans with "{userSubscriptionPlan.name}" subscription.
                            </Text>
                                <TouchableOpacity style={[styles.workoutButton, { backgroundColor: '#000', borderWidth: 0.4, borderColor: '#999' }]} onPress={() => {
                                    setUpdatePlanModal(true);
                                }}>
                                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Update Subscription</Text>
                                </TouchableOpacity>
                            </>}

                            {useAI ?
                                plan === "workout" ?
                                    <>
                                        <SelectBox
                                            title={"Week Workout Days" + (userSubscriptionPlan.features[plan].max_days < 7 ? ` (max ${userSubscriptionPlan.features[plan].max_days} with your "${userSubscriptionPlan.name}" plan.)` : '')}
                                            max={userSubscriptionPlan.features[plan].max_days < 7 ? userSubscriptionPlan.features[plan].max_days : undefined}
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
                                    </> :
                                    <>
                                        <SelectBox
                                            title="Diet Days"
                                            allOptions={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
                                            allOptionsNames={allWorkoutDaysNames}
                                            selectedOptions={workoutDays}
                                            setSelectedItem={setWorkoutDays}
                                            obligatory
                                        />
                                        <SelectBox
                                            title="Goals"
                                            max={1}
                                            allOptions={allDietGoals}
                                            allOptionsNames={allDietGoalsNames}
                                            selectedOptions={dietGoals}
                                            setSelectedItem={setDietGoals}
                                        />
                                    </>
                                : ''
                            }

                            <TouchableOpacity
                                style={[styles.workoutButton, { backgroundColor: '#FF5733' }]}
                                onPress={() => {
                                    if (useAI) {
                                        if (plan === "workout") {
                                            if (checkBeforeCreation()) {
                                                if (userSubscriptionPlan.features[plan].use_ai === 0) {
                                                    Alert.alert('You need to upgrate to continue to use AI.', 'Press Upgrade Plan to continue.',
                                                        [{ text: 'Cancel', style: 'cancel' }, { text: 'Upgrade Plan', onPress: () => setUpdatePlanModal(true) }]
                                                    );
                                                    return;
                                                }
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
                                            if (checkBeforeCreation()) {
                                                setGenerating(true);
                                                GenerateWeekDietPlan({
                                                    "name": trainingName,
                                                    "diet_days": workoutDays,
                                                    "goal": dietGoals[0],
                                                    "use_ai": true
                                                }, setError, onClose);
                                            }
                                        }
                                    } else {
                                        setUseAI(true);
                                    }
                                }}
                            >
                                <Text style={styles.workoutButtonText}>{plan === "workout" ? ("Generate with AI (GPT)" + (userSubscriptionPlan && userSubscriptionPlan.features[plan].use_ai < 6 ? ` (${userSubscriptionPlan.features[plan].use_ai} left)` : "")) : "Automatic Generation"}</Text>
                            </TouchableOpacity>

                            {!useAI && <TouchableOpacity
                                style={[styles.workoutButton, { backgroundColor: '#4CAF50' }]}
                                onPress={() => {
                                    if (plan === "workout") {
                                        if (checkBeforeCreation()) {
                                            setGenerating(true);
                                            GenerateWeekWorkoutPlan({
                                                "name": trainingName,
                                                "use_ai": false
                                            }, setError, onClose)
                                        }
                                    } else {
                                        if (checkBeforeCreation()) {
                                            setGenerating(true);
                                            GenerateWeekDietPlan({
                                                "name": trainingName,
                                                "use_ai": false
                                            }, setError, onClose);
                                        }
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

const NewFoodModal = ({ newFoodModal, setNewFoodModal, createFood }) => {
    const [foodName, setFoodName] = useState('');
    const [foodAmount, setFoodAmount] = useState(0);
    const [foodCalories, setFoodCalories] = useState(0);
    const [status, setStatus] = useState('none');

    const allMeals = ['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout'];
    const allMealsNames = { 'breakfast': "Breakfast", 'lunch': "Lunch", 'dinner': "Dinner", 'snack': "Snack", 'pre_workout': "Pre Workout", 'post_workout': "Post Workout" };;
    const [meals, setMeals] = useState([]);

    const onClose = () => {
        setNewFoodModal(false);
        setStatus('none');
        setFoodName('');
        setFoodAmount(0);
        setFoodCalories(0);
        setMeals([]);
    }

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.7)',
            justifyContent: 'center',
        },
        section: {
            padding: 10,
            backgroundColor: '#dddeee',
            borderRadius: 5,
            borderWidth: 2,
            borderColor: '#fff',
            marginHorizontal: 20,
        },
        title: {
            fontSize: 18,
            fontWeight: 'bold',
            color: '#333',
            marginBottom: 10,
        },
        textInput: {
            height: 40,
            borderWidth: 1,
            borderColor: '#eee',
            backgroundColor: '#FFF',
            borderRadius: 5,
            paddingHorizontal: 10,
            marginHorizontal: 15,
            marginVertical: 10,
            fontSize: 14,
            color: '#111',
        },
        addButton: {
            flex: 1,
            height: 40,
            flexDirection: 'row',
            borderRadius: 5,
            marginHorizontal: 5,
            marginVertical: 10,
            justifyContent: 'center',
            alignItems: 'center'
        },
        addButtonText: {
            color: '#fff',
            fontSize: 15,
            fontWeight: 'bold',
        },
    });

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={newFoodModal}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View style={styles.section}>
                    {status === "creating" ? <>
                        <Text style={styles.title}>Creating Food...</Text>
                    </> : status === "created" ? <>
                        <Text style={styles.title}>Food Created! You will see this option available when adding a new food to a meal.</Text>
                    </> : status === "error" ? <>
                        <Text style={styles.title}>Error Creating Food, try again later.</Text>
                    </> :
                        <>
                            <Text style={styles.title}>Add Food</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Name"
                                placeholderTextColor="#999"
                                autoCapitalize="none"
                                onChangeText={setFoodName}
                            />
                            <TextInput
                                style={styles.textInput}
                                placeholder="Amount"
                                placeholderTextColor="#999"
                                autoCapitalize="none"
                                onChangeText={setFoodAmount}
                                keyboardType="numeric"
                                maxLength={4}
                            />
                            <TextInput
                                style={styles.textInput}
                                placeholder="Calories"
                                placeholderTextColor="#999"
                                autoCapitalize="none"
                                onChangeText={setFoodCalories}
                                keyboardType="numeric"
                                maxLength={4}
                            />

                            <SelectBox
                                title="Meals"
                                allOptions={allMeals}
                                allOptionsNames={allMealsNames}
                                selectedOptions={meals}
                                setSelectedItem={setMeals}
                            />
                        </>}
                    <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        {status === "none" && <TouchableOpacity style={[styles.addButton, { backgroundColor: '#4CAF50' }]} onPress={() => {
                            if (foodName === '') {
                                Alert.alert("Error", "Please enter a name.");
                            } else if (foodAmount < 10) {
                                Alert.alert("Error", "Please enter an amount in grams.");
                            } else if (meals.length === 0) {
                                Alert.alert("Error", "Please select at least one meal.");
                            } else {
                                setStatus('creating');
                                createFood({ "title": foodName, "amount": foodAmount, "calories": foodCalories, "meals": meals }, setStatus);
                            }
                        }}>
                            <Text style={styles.addButtonText}>Add</Text>
                        </TouchableOpacity>}
                        <TouchableOpacity style={[styles.addButton, { backgroundColor: '#AAA' }]} onPress={() => {
                            onClose();
                        }}>
                            <Text style={styles.addButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
};

const UpgradePlanModal = ({ userToken, updatePlanModal, setUpdatePlanModal, subscriptionPlansOptions, setCompletedPaymentData }) => {
    const [status, setStatus] = useState('plans');
    const allPlans = subscriptionPlansOptions.map(plan => plan.id);
    const allPlansNames = subscriptionPlansOptions.reduce((obj, plan) => {
        obj[plan.id] = plan.name;
        return obj;
    }, {});

    const [plans, setPlans] = useState([]);
    const subscriptionPlan = plans.length ? subscriptionPlansOptions.find(plan => plan.id === plans[0]) : undefined;

    const [useCreditCard, setUseCreditCard] = useState(false);

    const onClose = () => {
        setStatus('plans');
        setUseCreditCard(false);
        setUpdatePlanModal(false);
    };

    const PricePlanTable = () => {

        const styles = StyleSheet.create({
            tableContainer: {
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginVertical: 10,
                flexWrap: 'wrap',
            },
            tableColumn: {
                width: width * 0.8 / 3,
                backgroundColor: '#fff',
                borderRadius: 8,
                margin: 5,
                padding: 3,
                marginHorizontal: 4,
                elevation: 4,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
            },
            planTitle: {
                fontSize: 15,
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: 2,
            },
            planPrice: {
                fontSize: 12,
                fontWeight: 'bold',
                textAlign: 'center',
                color: '#555',
            },
            planDescription: {
                fontSize: 10,
                marginBottom: 8,
            },
            planBenefits: {
                marginTop: 5,
            },
        });

        return (
            <View style={styles.tableContainer}>
                {subscriptionPlansOptions.map((plan, index) => (
                    <View key={index} style={styles.tableColumn}>
                        <Text style={styles.planTitle}>{plan.name}</Text>
                        <Text style={styles.planPrice}>${plan.price} {plan.currency}</Text>
                        <View style={styles.planBenefits}>
                            {plan.details && plan.details.map((benefit) => (
                                <Text key={benefit} style={styles.planDescription}>
                                    ✓ {benefit}
                                </Text>
                            ))}
                        </View>
                    </View>
                ))}
            </View>
        );
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.7)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        section: {
            width: '96%',
            backgroundColor: '#ddd',
            borderRadius: 10,
            padding: 10,
            marginVertical: width * 0.2,
        },
        title: {
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 10,
        },
        selectedPlanText: {
            fontSize: 15,
            fontWeight: 'bold',
            marginBottom: 10,
        },
        confirmButton: {
            width: '100%',
            height: 40,
            backgroundColor: '#000',
            borderRadius: 5,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 20,
        },
        confirmButtonText: {
            fontSize: 15,
            fontWeight: 'bold',
            color: '#fff',
        },

        creditCardContainer: {
            backgroundColor: '#fff',
            borderRadius: 8,
            padding: 16,
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
        },
        creditCardInput: {
            height: 48,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 4,
            paddingHorizontal: 12,
            marginBottom: 12,
            fontSize: 16,
        },
        creditCardName: {
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: 8,
        },
        creditCardNumber: {
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: 8,
        },
        creditCardExpiration: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 8,
        },
        creditCardExpirationDate: {
            flex: 1,
            fontSize: 16,
            fontWeight: 'bold',
        },
        creditCardCVV: {
            fontSize: 16,
            fontWeight: 'bold',
        },
        creditCardContainer: {
            backgroundColor: '#fff',
            borderRadius: 8,
            padding: 16,
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
        },
        creditCardInput: {
            height: 48,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 4,
            paddingHorizontal: 12,
            marginBottom: 12,
            fontSize: 16,
        },
        creditCardName: {
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: 8,
        },
        creditCardNumber: {
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: 8,
        },
        creditCardExpiration: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 8,
        },
        creditCardExpirationDate: {
            flex: 1,
            fontSize: 16,
            fontWeight: 'bold',
        },
        creditCardCVV: {
            fontSize: 16,
            fontWeight: 'bold',
        },
    });
    if (status === 'success') {
        Alert.alert(
            'Success!', 'Your plan has been updated!'
        );
        onClose();
    } else if (status === 'error') {
        Alert.alert(
            'Error!', 'There was an error updating your plan.'
        );
        setStatus('creditCard');
    }

    useEffect(() => {
        if (useCreditCard) {
            setUseCreditCard(plans.length > 0);
        }
    }, [plans])

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={updatePlanModal}
            onRequestClose={onClose}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.container}>
                    <View style={styles.section}>
                        <Text style={styles.title}>Upgrade Plan</Text>
                        {status === 'plans' ?
                            <View>
                                <PricePlanTable />
                                <SelectBox
                                    title="Select a Plan:"
                                    max={1}
                                    allOptions={allPlans}
                                    allOptionsNames={allPlansNames}
                                    selectedOptions={plans}
                                    setSelectedItem={setPlans}
                                />
                                <TouchableOpacity style={styles.confirmButton} onPress={() => {
                                    if (plans.length > 0) {
                                        setUseCreditCard(true);
                                        return;
                                    }
                                    Alert.alert('Error!', 'Please select a plan.');
                                }}>
                                    <Text style={styles.confirmButtonText}>Next</Text>
                                </TouchableOpacity>
                                {useCreditCard && subscriptionPlan && <StripePayment userToken={userToken} amount={subscriptionPlan.price} currency={subscriptionPlan.currency} item={{ type: "plan", id: subscriptionPlan.id }} setCompletedPaymentData={setCompletedPaymentData} />}
                            </View>
                            : status === 'loading' ?
                                <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#0000ff" /></View>
                                : ''
                        }
                    </View>
                </View>
            </ScrollView>
        </Modal>
    )
};

const MyPlansScreen = ({ }) => {
    const { online, userToken, userSubscriptionPlan, setUserSubscriptionPlan } = useGlobalContext();

    const [plan, setPlan] = useState('workout');
    const [plans, setPlans] = useState({ "workout": null, "diet": null });
    const [planId, setPlanId] = useState(null);
    const muscle_groups = {
        chest: { group_id: 'chest', name: 'Chest' },
        back: { group_id: 'back', name: 'Back' },
        neck: { group_id: 'neck', name: 'Neck' },
        trapezius: { group_id: 'trapezius', name: 'Trapezius' },
        shoulders: { group_id: 'shoulders', name: 'Shoulders' },
        biceps: { group_id: 'biceps', name: 'Biceps' },
        triceps: { group_id: 'triceps', name: 'Triceps' },
        forearm: { group_id: 'forearm', name: 'Forearm' },
        abs: { group_id: 'abs', name: 'Abs' },
        leg: { group_id: 'leg', name: 'Leg' },
        hip: { group_id: 'hip', name: 'Hip' },
        cardio: { group_id: 'cardio', name: 'Cardio' },
        full_body: { group_id: 'full_body', name: 'Full Body' },
        calf: { group_id: 'calf', name: 'Calf' },
        erector_spinae: { group_id: 'erector_spinae', name: 'Erector Spinae' },
    };
    const [daysItems, setDaysItems] = useState({
        workout: {
            Sun: {
                items: {
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
                items: {
                    chest: {
                        'standing-medicine-ball-chest-pass': { sets: 4, reps: 10, rest: 120, done: false, edit: false }
                    }
                },
                rest: false
            },
            Tue: {
                items: {
                    biceps: {
                        'seated-zottman-curl': { sets: 4, reps: 10, rest: 120, done: false, edit: false }
                    }
                },
                rest: false
            },
            Wed: {
                items: {
                    abs: {
                        'medicine-ball-rotational-throw': { sets: 4, reps: 10, rest: 120, done: false, edit: false }
                    }
                },
                rest: false
            },
            Thu: {
                items: {
                    hip: {
                        'high-knee-lunge-on-bosu-ball': { sets: 4, reps: 10, rest: 120, done: false, edit: false }
                    }
                },
                rest: false
            },
            Fri: {
                items: {
                    neck: {
                        'diagonal-neck-stretch': { sets: 4, reps: 10, rest: 120, done: false, edit: false }
                    }
                },
                rest: false
            },
            Sat: {
                items: {},
                rest: true
            },
        },
        diet: {
            Sun: {
                items: {
                    breakfast: {
                        'oatmeal': { quantity: 1, amount: 180, done: false, edit: false, calories: 350 },
                    },
                    lunch: {
                        'tuna_salad': { quantity: 1, amount: 200, done: false, edit: false, calories: 400 },
                        'chicken_wrap': { quantity: 1, amount: 220, done: false, edit: false, calories: 380 },
                        'turkey_sandwich': { quantity: 1, amount: 230, done: false, edit: false, calories: 390 },
                        'egg_salad_sandwich': { quantity: 1, amount: 210, done: false, edit: false, calories: 370 },
                        'quinoa_salad': { quantity: 1, amount: 280, done: false, edit: false, calories: 430 },
                        'caprese_salad': { quantity: 1, amount: 200, done: false, edit: false, calories: 400 },
                        'cucumber_salad': { quantity: 1, amount: 150, done: false, edit: false, calories: 300 },
                    },
                    dinner: {
                        'pasta_carbonara': { quantity: 1, amount: 400, done: false, edit: false, calories: 550 },
                        'vegetable_stir_fry': { quantity: 1, amount: 320, done: false, edit: false, calories: 470 },
                        'rice_bowl': { quantity: 1, amount: 350, done: false, edit: false, calories: 500 },
                    }
                },
                rest: false
            },
            Mon: {
                items: {},
                rest: true
            },
            Tue: {

                items: {},
                rest: true
            },
            Wed: {

                items: {},
                rest: true
            },
            Thu: {

                items: {},
                rest: true
            },
            Fri: {

                items: {},
                rest: true
            },
            Sat: {

                items: {},
                rest: true
            },
        }
    }
    );
    const meal_groups = {
        breakfast: { group_id: 'breakfast', name: 'Breakfast' },
        lunch: { group_id: 'lunch', name: 'Lunch' },
        dinner: { group_id: 'dinner', name: 'Dinner' },
        snack: { group_id: 'snack', name: 'Snack' },
        pre_workout: { group_id: 'pre_workout', name: 'Pre Workout' },
        post_workout: { group_id: 'post_workout', name: 'Post Workout' },
    };

    const [edit, setEdit] = useState(false);

    const [unavailableExercises, setUnavailableExercises] = useState([]);

    const [selectedDay, setSelectedDay] = useState(null);
    const [allItems, setAllItems] = useState({ "workout": null, "diet": null });

    const [updatePlanModal, setUpdatePlanModal] = useState(false);
    const [completedPaymentData, setCompletedPaymentData] = useState(null);

    const [newTrainingModal, setNewTrainingModal] = useState(false);
    const [newFoodModal, setNewFoodModal] = useState(false);
    const [addNewMuscleGroup, setAddNewMuscleGroup] = useState(false);

    const [subscriptionPlansOptions, setSubscriptionPlansOptions] = useState([]);

    const fetchAllExercises = async () => {
        const response = await fetch(BASE_URL + `/api/exercises/all-exercises/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${userToken}`,
            },
        });
        const data = await response.json();
        setAllItems(prevItems => ({ ...prevItems, "workout": data }));
    }
    const fetchAllFoods = async () => {
        const response = await fetch(BASE_URL + `/api/exercises/all-foods/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${userToken}`,
            },
        });
        const data = await response.json();
        setAllItems(prevItems => ({ ...prevItems, "diet": data }));
    }

    const updatePlans = async () => {
        try {
            const response = await fetch(BASE_URL + `/api/exercises/${plan === "workout" ? "training-plans" : "diet-plans"}/${planId}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Token ${userToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "days": daysItems[plan] })
            });
            const data = await response.json();

            setPlans(prevPlans => ({ ...prevPlans, [plan]: plans[plan].map(plan => plan.id === planId ? data : plan) }));
            if (response.ok) {
                setEdit(false);
            }
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    }
    const deleteTrainingPlan = async (training_id) => {
        try {
            const response = await fetch(BASE_URL + `/api/exercises/${plan === "workout" ? "training-plans" : "diet-plans"}/${training_id}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${userToken}`,
                    'Content-Type': 'application/json'
                },
            });
            if (response.ok && response.status === 204) {
                setPlans(prevPlans => ({ ...prevPlans, [plan]: plans[plan].filter(plan => plan.id !== training_id) }));
                setPlanId(plans[plan].find(plan => plan.id !== training_id).id);
            }
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    }

    const GenerateWeekWorkoutPlan = async (requestBody, setError, onClose) => {
        try {
            const response = await fetch(BASE_URL + '/api/exercises/generate-workout-plan/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${userToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            const data = await response.json();

            if (response.ok && data.id) {
                setPlans(prevPlans => ({
                    ...prevPlans,
                    [plan]: prevPlans[plan] ? [...prevPlans[plan], data] : [data]
                }));
                setDaysItems(prevDays => ({
                    ...prevDays,
                    [plan]: data.days
                }));
                setPlanId(data.id);
                Alert.alert(
                    "Success. Your workout plan has been generated successfully.",
                    "Be aware that this is a workout plan generated by AI and do not replace a professional support of a certified trainer.",
                    [{ text: "I Understand!", onPress: () => { } }], { cancelable: true },
                )
                onClose();
                if (requestBody.use_ai) {
                    setSelectedDay({ name: requestBody.workout_days[0], items: data.days[requestBody.workout_days[0]].items })
                }
                setUserSubscriptionPlan(prevUserSubscriptionPlan => ({
                    ...prevUserSubscriptionPlan,
                    update: true,
                    features: {
                        ...prevUserSubscriptionPlan.features,
                        workout: {
                            ...prevUserSubscriptionPlan.features.workout,
                            use_ai: prevUserSubscriptionPlan.features.workout.use_ai - 1
                        }
                    }
                }))

            } else {
                setError(true);
                throw new Error('Failed to generate exercises');
            }
        } catch (error) {
            setError(true);
            console.error('There was a problem with the fetch operation:', error);
            throw error;
        }
    };
    const GenerateWeekDietPlan = async (requestBody, setError, onClose) => {
        try {
            const response = await fetch(BASE_URL + '/api/exercises/generate-diet-plan/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${userToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            const data = await response.json();
            if (response.ok && data.id && plans[plan]) {
                setPlans(prevPlans => ({
                    ...prevPlans,
                    [plan]: prevPlans[plan] ? [...prevPlans[plan], data] : [data]
                }));
                setDaysItems(prevDays => ({
                    ...prevDays,
                    [plan]: data.days
                }));
                setPlanId(data.id);
                onClose();
                if (requestBody.use_ai) {
                    setSelectedDay({ name: requestBody.diet_days[0], items: data.days[requestBody.diet_days[0]].items })
                }
            } else {
                setError(true);
            }
        } catch (error) {
            setError(true);
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
        setPlans(data);
        if (!planId && data[plan].length > 0) {
            setPlanId(data[plan][0].id);
            setDaysItems(prevDays => ({
                ...prevDays,
                [plan]: data[plan][0].days
            }));
        }
        setUnavailableExercises(data.unavailable_exercises);
        fetchSubscriptionPlans();
    }

    const fetchSubscriptionPlans = async () => {
        const response = await fetch(BASE_URL + `/api/payments/plans/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${userToken}`,
            },
        });
        const data = await response.json();
        setSubscriptionPlansOptions(data);
    }
    const confirmSubscriptionPlan = async () => {
        try {
            const response = await fetch(BASE_URL + `/api/payments/confirm-subscription-plan/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${userToken}`
                },
                body: JSON.stringify(completedPaymentData)
            });
            const data = await response.json();
            if (response.ok) {
                setUserSubscriptionPlan(data.plan.current_data);
            }
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    }

    const updateExerciseDone = (dayName, muscleGroup, exerciseIndex, done) => {
        setDaysItems(prevDays => ({
            ...prevDays,
            [plan]: {
                ...prevDays[plan],
                [dayName]: {
                    ...prevDays[plan][dayName],
                    items: {
                        ...prevDays[plan][dayName].items,
                        [muscleGroup]: {
                            ...prevDays[plan][dayName].items[muscleGroup],
                            [exerciseIndex]: {
                                ...prevDays[plan][dayName].items[muscleGroup][exerciseIndex],
                                done: done
                            }
                        }
                    }
                }
            }
        }));
    }
    const updateAllExercisesDone = (dayName, done) => {
        setDaysItems(prevDays => ({
            ...prevDays,
            [plan]: {
                ...prevDays[plan],
                [dayName]: {
                    ...prevDays[plan][dayName],
                    items: Object.fromEntries(
                        Object.entries(prevDays[plan][dayName].items).map(([muscleGroup, exercises]) => [
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
            }
        }));
    };

    const verifyAllExercisesDone = (plan, dayName) => {
        return Object.values(daysItems[plan][dayName].items).every(muscleGroup =>
            Object.values(muscleGroup).every(exercise => exercise.done)
        );
    };

    const updateExerciseSetsDone = (dayName, muscleGroup, exerciseName, setsDone, repsToDo, restTime) => {
        if (plan === "workout") {
            const updatedExercises = prevDays => ({
                ...prevDays,
                [plan]: {
                    ...prevDays[plan],
                    [dayName]: {
                        ...prevDays[plan][dayName],
                        items: {
                            ...prevDays[plan][dayName].items,
                            [muscleGroup]: {
                                ...prevDays[plan][dayName].items[muscleGroup],
                                [exerciseName]: {
                                    ...prevDays[plan][dayName].items[muscleGroup][exerciseName],
                                    sets: setsDone,
                                    reps: repsToDo || prevDays[plan][dayName].items[muscleGroup][exerciseName].reps,
                                    rest: restTime || prevDays[plan][dayName].items[muscleGroup][exerciseName].rest
                                }
                            }
                        }
                    }
                }
            });
            setDaysItems(prevDays => (
                updatedExercises(prevDays)
            ));
        } else {
            setDaysItems(prevDays => ({
                ...prevDays,
                [plan]: {
                    ...prevDays[plan],
                    [dayName]: {
                        ...prevDays[plan][dayName],
                        items: {
                            ...prevDays[plan][dayName].items,
                            [muscleGroup]: {
                                ...prevDays[plan][dayName].items[muscleGroup],
                                [exerciseName]: {
                                    ...prevDays[plan][dayName].items[muscleGroup][exerciseName],
                                    amount: setsDone,
                                    calories: repsToDo
                                }
                            }
                        }
                    }
                }
            }));
        }

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
                    { "action": action, "items": exercises },
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
        const all_exercises = Object.values(allItems[plan])
        const exercises_from_muscle = all_exercises.filter(exercise => exercise.item_groups.some(muscle => muscle.group_id === muscleGroup))
            .map(exercise => exercise.item_id)

        const not_selected_exercises = exercises_from_muscle.filter(e =>
            !Object.keys(daysItems[plan][dayName].items[muscleGroup]).includes(e) || e === exercise
        )

        const exercise_index = not_selected_exercises.indexOf(exercise) + 1 + salt;

        return not_selected_exercises.length > exercise_index ? not_selected_exercises[exercise_index] : false;
    };

    const addExercise = (dayName, muscleGroup, exerciseId, newExercise) => {
        if (Object.keys(daysItems[plan][dayName].items[muscleGroup]).length >= userSubscriptionPlan.features[plan].max_items_per_group) {
            Alert.alert('You need to upgrate to add more exercises.', `Max ${userSubscriptionPlan.features[plan].max_items_per_group} exercises per Muscle Group with "${userSubscriptionPlan.name}" plan.`,
                [{
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Upgrade Plan',
                    onPress: () => setUpdatePlanModal(true)
                }]
            );
            return;
        }

        setEdit(true);

        setDaysItems(prevDays => ({
            ...prevDays,
            [plan]: {
                ...prevDays[plan],
                [dayName]: {
                    ...prevDays[plan][dayName],
                    items: {
                        ...prevDays[plan][dayName].items,
                        [muscleGroup]: {
                            ...prevDays[plan][dayName].items[muscleGroup],
                            [exerciseId]: newExercise
                        }
                    }
                }
            }
        }));
    };

    const removeExercise = (dayName, muscleGroup, exerciseId, replace = false) => {
        if (!daysItems[plan][dayName] || !daysItems[plan][dayName].items || !daysItems[plan][dayName].items[muscleGroup]) {
            console.error(`Day or muscle group: ${dayName} - ${muscleGroup} not found.`);
            return;
        }
        const newExercises = Object.entries(daysItems[plan][dayName].items[muscleGroup])
            .filter(([exerciseName, _]) => exerciseName !== exerciseId)
            .reduce((acc, [exerciseName, exerciseDetails]) => {
                acc[exerciseName] = exerciseDetails;
                return acc;
            }, replace ? { [replace]: { reps: 10, sets: 4, rest: 120, done: false, edit: false } } : {});

        setEdit(true);

        if (replace && userSubscriptionPlan.features[plan].items_alternatives[0]) {
            if (userSubscriptionPlan.features[plan].items_alternatives[1] >= userSubscriptionPlan.features[plan].items_alternatives[2]) {
                Alert.alert('You need to upgrate to set new Alternatives.', `Max ${userSubscriptionPlan.features[plan].items_alternatives[2]} Alternatives changes with "${userSubscriptionPlan.name}" plan.`,
                    [{ text: 'Cancel', style: 'cancel' }, { text: 'Upgrade Plan', onPress: () => setUpdatePlanModal(true) }]);
                return
            }
        }

        setDaysItems(prevDays => ({
            ...prevDays,
            [plan]: {
                ...prevDays[plan],
                [dayName]: {
                    ...prevDays[plan][dayName],
                    items: {
                        ...prevDays[plan][dayName].items,
                        [muscleGroup]: newExercises
                    }
                }
            }
        }));
        Alert.alert('Alternative Updated!', `You need to upgrate to set new Alternatives.\nMax ${userSubscriptionPlan.features[plan].items_alternatives[2] - userSubscriptionPlan.features[plan].items_alternatives[1] - 1} Alternatives changes left with "${userSubscriptionPlan.name}" plan.`);
        setUserSubscriptionPlan(prevUserSubscriptionPlan => ({
            ...prevUserSubscriptionPlan,
            update: true,
            features: {
                ...prevUserSubscriptionPlan.features,
                workout: {
                    ...prevUserSubscriptionPlan.features.workout,
                    items_alternatives: [
                        userSubscriptionPlan.features.workout.items_alternatives[0],
                        userSubscriptionPlan.features.workout.items_alternatives[1] + 1,
                        userSubscriptionPlan.features.workout.items_alternatives[2],
                    ]
                }
            }
        }))
    };

    const removeMuscleGroup = (dayName, muscleGroup) => {
        if (!daysItems[plan][dayName] || !daysItems[plan][dayName].items) {
            console.error(`Day: ${dayName} not found.`);
            return;
        }
        const { [muscleGroup]: removedGroup, ...remainingGroups } = daysItems[plan][dayName].items;
        setEdit(true);
        setDaysItems(prevDays => ({
            ...prevDays,
            [plan]: {
                ...prevDays[plan],
                [dayName]: {
                    ...prevDays[plan][dayName],
                    items: remainingGroups,
                    rest: Object.keys(remainingGroups).length === 0
                }
            }
        }));
    };

    const addMuscleGroup = (dayName, muscleGroup) => {

        if (Object.keys(daysItems[plan][dayName].items).length >= userSubscriptionPlan.features[plan].max_groups_per_day) {
            Alert.alert('You need to upgrate to add more Muscle Groups.', `Max ${userSubscriptionPlan.features[plan].max_groups_per_day} Muscle Groups per Day with "${userSubscriptionPlan.name}" plan.`,
                [{
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Upgrade Plan',
                    onPress: () => setUpdatePlanModal(true)
                }]
            );
            return;
        }
        if (Object.keys(daysItems[plan][dayName].items).length === 0)

            if (!daysItems[plan][dayName] || !daysItems[plan][dayName].items) {
                console.error(`Day: ${dayName} not found.`);
                return;
            }
        setEdit(true);
        setDaysItems(prevDays => ({
            ...prevDays,
            [plan]: {
                ...prevDays[plan],
                [dayName]: {
                    ...prevDays[plan][dayName],
                    items: {
                        ...prevDays[plan][dayName].items,
                        [muscleGroup]: {}
                    },
                    rest: false
                }
            }
        }));
    };

    const removeTrainingPlan = (planId) => {
        if (online) {
            deleteTrainingPlan(planId);
        } else {
            setPlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
        }
        setPlanId(plans[plan].length ? plans[plan][0].id : 0);
        setDaysItems(prevDays => ({
            ...prevDays,
            [plan]: plans[plan].length ? plans[plan][0].days : {}
        }));
    };
    const createFood = async ({ title, amount, calories, meals }, setStatus) => {
        try {
            const response = await fetch(BASE_URL + `/api/exercises/user-plans/update_foods/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${userToken}`
                },
                body: JSON.stringify({
                    "action": "add",
                    "item": {
                        "title": title,
                        "amount": amount,
                        "calories": calories,
                        "item_groups": Object.values(meal_groups).filter(group => meals.includes(group.group_id))
                    }
                })
            });
            const data = await response.json();
            if (response.ok) {
                setAllItems(prevItems => ({ ...prevItems, [plan]: { [data.item_id]: data, ...allItems[plan] } }));
                setStatus("created");
            }
        } catch (error) {
            console.error(error);
            setStatus("error");
        }
    };

    useEffect(() => {
        fetchPlans();
        if (plan === "workout") {
            fetchAllExercises();
        } else {
            fetchAllFoods();
        }
    }, [plan]);

    useEffect(() => {
        if (planId && plans[plan]) {
            const selectedPlan = plans[plan].find(plan => plan.id === planId);
            const newDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].find(day => !selectedPlan.days[day].rest) || 'Sun';
            setSelectedDay({ name: newDay, items: selectedPlan.days[newDay] });
        }
    }, [planId]);

    useEffect(() => {
        if (addNewMuscleGroup) {
            setAddNewMuscleGroup(false);
        }
    }, [selectedDay]);

    useEffect(() => {
        if (completedPaymentData) {
            setCompletedPaymentData(null);
            confirmSubscriptionPlan();
        }
    }, [completedPaymentData]);

    const trainCompleted = verifyAllExercisesDone(plan, selectedDay ? selectedDay.name : 'Sun');
    const fit_plans = [{ plan_id: 'workout', plan_name: 'Workout' }, { plan_id: 'diet', plan_name: 'Diet' }];

    return (
        <View style={styles.container}>
            <GradientBackground firstColor="#1A202C" secondColor="#991B1B" thirdColor="#1A202C" />

            <UpgradePlanModal userToken={userToken} updatePlanModal={updatePlanModal} setUpdatePlanModal={setUpdatePlanModal} subscriptionPlansOptions={subscriptionPlansOptions} setCompletedPaymentData={setCompletedPaymentData} />
            <NewTrainingModal plan={plan} newTrainingModal={newTrainingModal} setNewTrainingModal={setNewTrainingModal} GenerateWeekWorkoutPlan={GenerateWeekWorkoutPlan} GenerateWeekDietPlan={GenerateWeekDietPlan} userSubscriptionPlan={userSubscriptionPlan} setUpdatePlanModal={setUpdatePlanModal} plansLength={plans[plan] ? plans[plan].length : 0} />
            <NewFoodModal newFoodModal={newFoodModal} setNewFoodModal={setNewFoodModal} createFood={createFood} />

            <ScrollView
                style={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                overScrollMode="never"
            >

                <View style={styles.sectionContainer}>

                    <Text style={styles.sectionTitle}>Fitness Plan</Text>
                    <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                        {fit_plans.map((planOption, index) =>
                            <Tabs
                                key={index}
                                index={index}
                                name={planOption.plan_name}
                                setSelectedTab={() => {
                                    setPlan(planOption.plan_id);
                                    if (plans[planOption.plan_id]) {
                                        setPlanId(plans[planOption.plan_id][0].id);
                                        setDaysItems(prevDays => ({
                                            ...prevDays,
                                            [planOption.plan_id]: plans[planOption.plan_id][0].days
                                        }));
                                    }
                                }}
                                isSelected={planOption.plan_id === plan}
                                len={fit_plans.length}
                                TabSize={width * 0.89 / fit_plans.length * 0.8}
                            />
                        )}
                    </View>

                    <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                        {plans[plan] && plans[plan].map((tabPlan, index) =>
                            <Tabs
                                key={index}
                                index={index}
                                name={tabPlan.name}
                                setSelectedTab={() => {
                                    if (edit) {
                                        alert('You must save or cancel changes before moving to another plan.');
                                        return;
                                    }
                                    setDaysItems(prevDays => ({
                                        ...prevDays,
                                        [plan]: tabPlan.days
                                    }));
                                    setPlanId(tabPlan.id);
                                }}
                                isSelected={tabPlan.id === planId}
                                len={plans[plan].length}
                                TabSize={width * 0.89 / plans[plan].length * 0.9}
                            />
                        )}
                    </View>

                    <View style={styles.headerSectionContent}>
                        {plans[plan] && Object.entries(daysItems[plan]).sort((a, b) => {
                            const order = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                            return order.indexOf(a[0]) - order.indexOf(b[0]);
                        }).map(([dayName, dayDetails], index) =>
                            <Tabs
                                key={index}
                                index={index}
                                name={dayName}
                                setSelectedTab={() => {
                                    if (Object.keys(daysItems[plan][dayName].items).length === 0 && Object.values(daysItems[plan]).filter(day => !day.rest).length >= userSubscriptionPlan.features[plan].max_days) {
                                        Alert.alert('You need to upgrate to access others days.', `Max ${userSubscriptionPlan.features[plan].max_days} Days on this plan with "${userSubscriptionPlan.name}".`,
                                            [{
                                                text: 'Cancel',
                                                style: 'cancel'
                                            },
                                            {
                                                text: 'Upgrade Plan',
                                                onPress: () => setUpdatePlanModal(true)
                                            }]
                                        );
                                        return;
                                    }
                                    if (plan === 'workout') {
                                        setSelectedDay({ name: dayName.slice(0, 3), items: { ...dayDetails } })
                                    } else {
                                        setSelectedDay({ name: dayName.slice(0, 3), items: { ...dayDetails } })
                                    }
                                }}
                                isSelected={selectedDay && selectedDay.name === dayName.slice(0, 3)}
                                len={7}
                                TabSize={width * 0.89 / 7}
                            />
                        )}
                    </View>

                    <View>
                        {selectedDay && allItems[plan] && Object.entries(daysItems[plan]).map(([dayName, dayInfo]) => {
                            if (selectedDay.name === dayName.slice(0, 3)) {
                                return (
                                    <View key={dayName}>
                                        {Object.keys(dayInfo.items).length > 0 ? Object.entries(dayInfo.items).map(([muscleGroup, exercises_list]) => {
                                            return <TrainingMember key={muscleGroup} plan={plan} dayName={dayName} muscleGroupName={(plan === "workout" ? muscle_groups[muscleGroup] : meal_groups[muscleGroup]).name} muscleGroup={muscleGroup}
                                                exercises={
                                                    Object.entries(exercises_list).map(([exerciseId, exerciseDetails]) => {
                                                        return { ...exerciseDetails, item_id: exerciseId, title: allItems[plan][exerciseId].title }
                                                    }).filter(Boolean)
                                                }
                                                allExercises={allItems[plan] ?
                                                    Object.values(allItems[plan])
                                                        .filter(exercise => {
                                                            return exercise.item_groups.some(group => group.group_id === muscleGroup)
                                                        })
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
                                                userSubscriptionPlan={userSubscriptionPlan}
                                            />
                                        }
                                        ) : <View><Text style={{ fontSize: 20, color: '#aaa', fontWeight: 'bold', textAlign: 'center', padding: 10 }}>No workout for this day</Text></View>}
                                    </View>
                                )
                            }
                        })}
                    </View>

                    {plans[plan] && <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        {Object.keys(daysItems[plan][selectedDay ? selectedDay.name : 'Mon'].items).length > 0 && plan === "workout" && <TouchableOpacity style={[styles.planDetailsContainer, { backgroundColor: trainCompleted ? '#aaa' : '#4CAF50' }]} onPress={() => {
                            updateAllExercisesDone(selectedDay.name, !verifyAllExercisesDone(plan, selectedDay.name));
                        }}>
                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{trainCompleted ? "Train Incomplete" : "Train Complete"}</Text>
                        </TouchableOpacity>}
                        {Object.keys(daysItems[plan][selectedDay ? selectedDay.name : 'Mon'].items).length > 0 && plan === "diet" && <TouchableOpacity style={[styles.planDetailsContainer, { backgroundColor: trainCompleted ? '#aaa' : '#4CAF50' }]} onPress={() => {
                            setNewFoodModal(true);
                        }}>
                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Add Custom Food Option</Text>
                        </TouchableOpacity>}
                        <TouchableOpacity style={[styles.planDetailsContainer, { backgroundColor: '#6495ED' }]} onPress={() => setAddNewMuscleGroup(!addNewMuscleGroup)}>
                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{plan === "workout" ? "Add Muscle Group" : "Add New Meal"}</Text>
                        </TouchableOpacity>
                    </View>}

                    {selectedDay && addNewMuscleGroup && <AddMuscleGroupList muscleGroups={
                        Object.values(plan === "workout" ? muscle_groups : meal_groups).filter(group => !Object.keys(daysItems[plan][selectedDay.name].items).includes(group.group_id)).map(group => ({ id: group.group_id, name: group.name }))
                    } dayName={selectedDay.name} addMuscleGroup={addMuscleGroup} setAddNewMuscleGroup={() => setAddNewMuscleGroup(false)} />}

                    {edit && <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 }}>
                        <TouchableOpacity style={[styles.trainCompleteButton, { backgroundColor: '#BDBDBD', flex: 1, marginRight: 5 }]} onPress={() => {
                            setDaysItems(prevDays => ({
                                ...prevDays,
                                [plan]: plans[plan].find(plan => plan.id === planId).days
                            }));
                            setEdit(false);
                            setAddNewMuscleGroup(false);
                        }}>
                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Cancel Changes</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.trainCompleteButton, { backgroundColor: '#4CAF50', flex: 1 }]} onPress={() => {
                            if (userSubscriptionPlan.features[plan].max_saves[2] < userSubscriptionPlan.features[plan].max_saves[1]) {
                                Alert.alert('You need to upgrate to Save more plans.', `Max ${userSubscriptionPlan.features[plan].max_saves[2]} Saves with "${userSubscriptionPlan.name}" plan.`,
                                    [{
                                        text: 'Cancel',
                                        style: 'cancel'
                                    },
                                    {
                                        text: 'Upgrade Plan',
                                        onPress: () => setUpdatePlanModal(true)
                                    }]
                                );
                                return;
                            }
                            updatePlans();
                            setAddNewMuscleGroup(false);
                            if (userSubscriptionPlan.features[plan].max_saves[0]) {
                                Alert.alert('Plan Saved', `You are able to Save more ${userSubscriptionPlan.features[plan].max_saves[2] - userSubscriptionPlan.features[plan].max_saves[1]} with ${userSubscriptionPlan.name} plan.`, [{ text: 'OK' }]);
                                setUserSubscriptionPlan(prevState => {
                                    const updatedFeatures = { ...prevState.features };
                                    const maxSaves = [...updatedFeatures[plan].max_saves];
                                    maxSaves[1] += 1;
                                    updatedFeatures[plan] = {
                                        ...updatedFeatures[plan],
                                        max_saves: maxSaves,
                                    };
                                    return {
                                        ...prevState,
                                        update: true,
                                        features: updatedFeatures,
                                    };
                                });
                            }
                        }}>
                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Save Train</Text>
                        </TouchableOpacity>

                    </View>}

                    <TouchableOpacity style={[styles.trainCompleteButton, { backgroundColor: '#6495ED', marginTop: 5 }]} onPress={() => {
                        setNewTrainingModal(true);
                    }}>
                        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{plan === "workout" ? "New Workout Plan" : "New Diet Plan"}</Text>
                    </TouchableOpacity>

                    {plans[plan] && plans[plan].length > 1 && <TouchableOpacity style={[styles.trainCompleteButton, { backgroundColor: '#F44336', marginTop: 5 }]} onPress={() => {
                        Alert.alert("Confirm Deletion", "Are you sure you want to delete this training plan?",
                            [{ text: "Cancel", style: "cancel" }, { text: "Delete", onPress: () => removeTrainingPlan(planId) }]);
                    }}>
                        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Delete Train</Text>
                    </TouchableOpacity>}

                    <TouchableOpacity style={[styles.trainCompleteButton, { backgroundColor: '#222', paddingVertical: 9, marginTop: 5, borderWidth: 0.4, borderColor: '#999' }]} onPress={() => {
                        setUpdatePlanModal(true);
                    }}>
                        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Update Subscription</Text>
                    </TouchableOpacity>

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
        maxHeight: width * 0.095,
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
        backgroundColor: '#aaa',
        margin: 5,
    },
    exerciseItemInfo: {
        minWidth: width * 0.07,
        paddingHorizontal: 3,
        borderRadius: width * 0.025,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    exerciseItemInfoText: {
        color: '#FFF',
        fontWeight: 'bold',
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

    // Item details
    details_container: {
        width: '90%',
        height: '90%',
        backgroundColor: '#FFF',
        padding: width * 0.02,
        borderRadius: width * 0.02,
        marginLeft: '5%',
        marginTop: '5%',
    },
    details_exerciseScroll: {
        padding: width * 0.02,
    },
    details_title: {
        fontWeight: '600',
        fontSize: 20,
        textAlign: 'center',
        color: '#333',
    },
    details_image: {
        height: width * 0.9,
        resizeMode: 'contain',
        marginVertical: 10,
    },
    details_sectionTitle: {
        fontWeight: '600',
        fontSize: 22,
        color: '#333',
    },
    details_exerciseInfo: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
    details_listItem: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
    details_closeButton: {
        paddingHorizontal: width * 0.03,
        paddingVertical: width * 0.025,
        borderRadius: width * 0.01,
        backgroundColor: '#CCC',
    },

    removeButton: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF0000',
    },
});

export default MyPlansScreen;