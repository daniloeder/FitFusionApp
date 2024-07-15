import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, Image, StyleSheet, TouchableOpacity, Modal, Dimensions, Pressable, Alert, ActivityIndicator } from 'react-native';
import GradientBackground from '../../components/GradientBackground/GradientBackground';
import { useGlobalContext } from '../../services/GlobalContext';
import { storeData, fetchData } from '../../store/store';
import UsersBall from '../../components/UsersBall/UsersBall';
import Icons from '../../components/Icons/Icons';
import { BASE_URL } from '@env';
import { TextInput } from 'react-native-gesture-handler';
import SelectBox from '../../components/Tools/SelectBox';
import SubscriptionPlansModal from '../../components/Payment/SubscriptionPlansModal';
import DatePicker from '../../components/Forms/DatePicker';
import PaymentCard from '../../components/Management/PaimentCard.js';
import { checkAvailableFeature } from '../../utils/helpers';

const width = Dimensions.get('window').width;

const Tabs = ({ index, name, setSelectedTab, isSelected, len, TabSize = 100, textColor = "#1C274C", selectedColor = "#FFF", unselectedColor = "#DDD" }) => {
    const styles = StyleSheet.create({
        dayContainer: {
            flex: 1,
            maxHeight: width * 0.2,
            backgroundColor: isSelected ? selectedColor : unselectedColor,
            padding: width * 0.01,
            borderTopLeftRadius: width * 0.01,
            borderTopEndRadius: width * 0.045,
            borderBottomLeftRadius: index == 0 ? width * 0.02 : 0,
            borderBottomEndRadius: index == len - 1 ? width * 0.008 : 0,
            borderBottomWidth: width * 0.03,
            borderBottomColor: selectedColor,
        },
        dayText: {
            color: textColor,
            fontWeight: 'bold',
        },
    });

    return (
        <TouchableOpacity onPress={setSelectedTab} style={{ width: TabSize, marginLeft: -0.05 }} activeOpacity={1}>
            <View style={styles.dayContainer}>
                <Text style={styles.dayText}
                    adjustsFontSizeToFit={true}
                    numberOfLines={2}
                >{name}</Text>
            </View>
        </TouchableOpacity>
    );
};

const TrainDetails = ({ online, dayName, muscleGroup, allExercises, exercise, showExerciseDetails, setShowExerciseDetails, setAlternativeExercise, getAlternativeExercise, removeExercise, plan, userSubscriptionPlan, mode }) => {
    const onClose = () => {
        setShowExerciseDetails(false);
        setAlternativeExercise(false);
    };
    const [image, setImage] = useState(null);

    useEffect(() => {
        if (!image || exercise.alternative) {
            fetchData("exercise_image_" + exercise.execution_images[0].image_url.split('/').pop())
                .then(data => {
                    if (data) {
                        if (online || userSubscriptionPlan.current_data.settings[plan].store_exercises_images) {
                            setImage(`data:image/${exercise.execution_images[0].image_url.split('/').pop().split('.').shift().toLowerCase()};base64,${data}`)
                        } else {
                            Alert.alert('You need to upgrate to Save images and see them offline.', 'Please upgrade to Save images and see them offline.',
                                [{ text: 'Cancel', style: 'cancel' }]);
                        }
                    } else {
                        setImage(BASE_URL + exercise.execution_images[0].image_url)
                    }
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                })
        }
    }, [exercise]);

    const muscle_groups_data = { 'neck': 'Neck', 'trapezius': 'Trapezius', 'shoulders': 'Shoulders', 'chest': 'Chest', 'back': 'Back', 'erector_spinae': 'Erector Spinae', 'biceps': 'Biceps', 'triceps': 'Triceps', 'forearm': 'Forearm', 'abs': 'Abs', 'leg': 'Leg', 'calf': 'Calf', 'hip': 'Hip', 'cardio': 'Cardio', 'full_body': 'Full Body' }

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
                    {image && checkAvailableFeature('store_exercises_images', { userSubscriptionPlan: userSubscriptionPlan, plan: plan, online: online }, mode) &&
                        <Image
                            source={{ uri: image }}
                            style={styles.details_image}
                        />}
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
                            <Text key={index}>- {muscle_groups_data[group]}</Text>
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

const BallonDetails = ({ plan, dayName, muscleGroup, allExercises, setShowBallon, setAlternativeExercise, addExercise, removeExercise, exerciseId, done, updateExerciseDone, updateUnavailableExercises, getAlternativeExercise, fetchManyExercises, setShowExerciseDetails, adding }) => {
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
                        } else {
                            Alert.alert('Fetching more alternatives, try it again in 5 seconds.');
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

const ExerciseItem = ({ online, plan, dayName, muscleGroup, exercise, allExercises, edit, addExercise, removeExercise, updateExerciseDone, updateExerciseSetsDone, updateUnavailableExercises, getAlternativeExercise, fetchManyExercises, adding, userSubscriptionPlan, mode }) => {
    const [showBallon, setShowBallon] = useState(false);
    const [showSetsEditModal, setShowSetsEditModal] = useState(false);
    const [showExerciseDetails, setShowExerciseDetails] = useState(false);
    const [alternativeExercise, setAlternativeExercise] = useState(null);

    return (
        <View>
            {showExerciseDetails ?
                plan === "workout" ?
                    <TrainDetails
                        online={online}
                        dayName={dayName}
                        muscleGroup={muscleGroup}
                        allExercises={allExercises}
                        exercise={alternativeExercise || allExercises.find(e => e.item_id === exercise.item_id)}
                        showExerciseDetails={showExerciseDetails}
                        setShowExerciseDetails={setShowExerciseDetails}
                        setAlternativeExercise={setAlternativeExercise}
                        getAlternativeExercise={getAlternativeExercise}
                        removeExercise={removeExercise}
                        plan={plan}
                        userSubscriptionPlan={userSubscriptionPlan}
                        mode={mode}
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
                    fetchManyExercises={fetchManyExercises}
                    setShowExerciseDetails={setShowExerciseDetails}
                    adding={adding}
                />
            )}
        </View>
    )
}

const TrainingMember = ({ online, plan, dayName, muscleGroup, muscleGroupName, exercises, allExercises, addExercise, removeExercise, removeMuscleGroup, updateExerciseDone, updateExerciseSetsDone, unavailableExercises, updateUnavailableExercises, getAlternativeExercise, fetchManyExercises, fetchManyFoods, userSubscriptionPlan, mode }) => {
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
                    online={online}
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
                    fetchManyExercises={fetchManyExercises}
                    userSubscriptionPlan={userSubscriptionPlan}
                    mode={mode}
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
                online={online}
                dayName={dayName}
                muscleGroup={muscleGroup}
                exercises={allExercises.filter(exercise => (!exercises.map(exercise => exercise.item_id).includes(exercise.item_id) && !unavailableExercises.includes(exercise.item_id)))}
                allExercises={allExercises}
                addExercise={addExercise}
                updateUnavailableExercises={updateUnavailableExercises}
                fetchManyExercises={fetchManyExercises}
                fetchManyFoods={fetchManyFoods}
                userSubscriptionPlan={userSubscriptionPlan}
                mode={mode}
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

const AddExerciseList = ({ online, plan, dayName, muscleGroup, exercises, allExercises, addExercise, updateUnavailableExercises, fetchManyExercises, fetchManyFoods, userSubscriptionPlan, mode }) => {
    const [search, setSearch] = useState('');
    useEffect(() => {
        if (exercises.length < 20) {
            if (plan === 'workout') {
                fetchManyExercises({ muscle_group: muscleGroup })
            } else {
                fetchManyFoods({ item_groups: muscleGroup })
            }
        }
    }, [])

    return (
        <View style={{ width: '100%' }}>
            <ScrollView
                style={styles.addExercisesListScrollView}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
            >
                <View style={styles.addExercisesListContainer}>
                    <View style={styles.searchInputContainer}>
                        <Icons name="Search" fill={"#000"} size={width * 0.05} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search"
                            onChangeText={text => setSearch(text)}
                        />
                    </View>
                    {exercises.length > 0 ? exercises.filter(exercise => exercise.title.toLowerCase().includes(search.toLowerCase())).map((exercise, index) => {
                        return (
                            <ExerciseItem
                                key={index}
                                online={online}
                                plan={plan}
                                dayName={dayName}
                                muscleGroup={muscleGroup}
                                exercise={exercise}
                                allExercises={allExercises}
                                addExercise={addExercise}
                                updateUnavailableExercises={updateUnavailableExercises}
                                adding
                                userSubscriptionPlan={userSubscriptionPlan}
                                mode={mode}
                            />
                        )
                    }) : ''}
                </View>
            </ScrollView>
        </View>
    )
}

const NewTrainingModal = ({ plan, newTrainingModal, setNewTrainingModal, GenerateWeekWorkoutPlan, GenerateWeekDietPlan, userSubscriptionPlan, setUpdatePlanModal, plansLength, room, mode }) => {
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
        setTrainingName('');
        setRest(['medium']);
        setWorkoutType(['gym']);
        setFocus([]);
        setAvoid([]);
        setGoals([]);
        setDietGoals([]);
        setNewTrainingComment('');
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
        if (!checkAvailableFeature("create_new_plan", { userSubscriptionPlan: userSubscriptionPlan, plansLength: plansLength, plan: plan, setUpdatePlanModal: setUpdatePlanModal }, mode)) return;
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
                            {userSubscriptionPlan && userSubscriptionPlan.current_data.settings[plan].max[0] && !useAI && <><Text style={{ marginLeft: 20, fontSize: width * 0.028, fontWeight: 'bold', color: '#FF0000' }}>
                                You can have {userSubscriptionPlan.current_data.settings[plan].max[1]} plans with "{userSubscriptionPlan.current_data.name}" subscription.
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
                                            title={"Week Workout Days" + (userSubscriptionPlan.current_data.settings[plan].max_days < 7 ? ` (max ${userSubscriptionPlan.current_data.settings[plan].max_days} with your "${userSubscriptionPlan.current_data.name}" plan.)` : '')}
                                            max={userSubscriptionPlan.current_data.settings[plan].max_days < 7 ? userSubscriptionPlan.current_data.settings[plan].max_days : undefined}
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
                                                if (!checkAvailableFeature('use_ai_plan_creation', { userSubscriptionPlan: userSubscriptionPlan, plan: plan, setUpdatePlanModal: setUpdatePlanModal }, mode)) return;
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
                                                    "use_ai": true,
                                                    "plan": "workout",
                                                    "manager_room": room
                                                }, setError, onClose)
                                            }
                                        } else {
                                            if (checkBeforeCreation()) {
                                                setGenerating(true);
                                                GenerateWeekDietPlan({
                                                    "name": trainingName,
                                                    "diet_days": workoutDays,
                                                    "goal": dietGoals[0],
                                                    "use_ai": true,
                                                    "plan": "diet",
                                                    "manager_room": room
                                                }, setError, onClose);
                                            }
                                        }
                                    } else {
                                        setUseAI(true);
                                    }
                                }}
                            >
                                <Text style={styles.workoutButtonText}>{plan === "workout" ? ("Generate with AI (GPT)" + (userSubscriptionPlan && userSubscriptionPlan.current_data.settings[plan].use_ai < 6 ? ` (${userSubscriptionPlan.current_data.settings[plan].use_ai} left)` : "")) : "Automatic Generation"}</Text>
                            </TouchableOpacity>

                            {!useAI && <TouchableOpacity
                                style={[styles.workoutButton, { backgroundColor: '#4CAF50' }]}
                                onPress={() => {
                                    if (plan === "workout") {
                                        if (checkBeforeCreation()) {
                                            setGenerating(true);
                                            GenerateWeekWorkoutPlan({
                                                "name": trainingName,
                                                "use_ai": false,
                                                "plan": "workout",
                                                "manager_room": room
                                            }, setError, onClose)
                                        }
                                    } else {
                                        if (checkBeforeCreation()) {
                                            setGenerating(true);
                                            GenerateWeekDietPlan({
                                                "name": trainingName,
                                                "use_ai": false,
                                                "plan": "diet",
                                                "manager_room": room
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

const NewFoodModal = ({ newFoodModal, setNewFoodModal, createFood, userSubscriptionPlan }) => {
    const [foodName, setFoodName] = useState('');
    const [foodAmount, setFoodAmount] = useState(0);
    const [foodCalories, setFoodCalories] = useState(0);
    const [status, setStatus] = useState('none');

    const allMeals = ['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout'];
    const allMealsNames = { 'breakfast': "Breakfast", 'lunch': "Lunch", 'dinner': "Dinner", 'snack': "Snack", 'pre_workout': "Pre Workout", 'post_workout': "Post Workout" };;
    const [meals, setMeals] = useState([]);

    const add_custom_food = !userSubscriptionPlan.current_data.settings.diet.add_custom_food[0] || userSubscriptionPlan.current_data.settings.diet.add_custom_food[1] < userSubscriptionPlan.current_data.settings.diet.add_custom_food[2]

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
                        </>
                    }
                    {!add_custom_food && <Text style={{ color: '#FF0000', fontSize: 10, fontWeight: 'bold', marginLeft: '2%' }}>* You need to upgrade your subscription to add custom food.</Text>}
                    <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        {status === "none" && <TouchableOpacity style={[styles.addButton, { backgroundColor: '#4CAF50' }]} onPress={() => {
                            if (foodName === '') {
                                Alert.alert("Error", "Please enter a name.");
                            } else if (foodAmount < 10) {
                                Alert.alert("Error", "Please enter an amount in grams.");
                            } else if (meals.length === 0) {
                                Alert.alert("Error", "Please select at least one meal.");
                            } else {
                                if (!add_custom_food) {
                                    Alert.alert("Error", "You need to upgrade your subscription to add custom food.");
                                    return;
                                }
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

const SettingsModal = ({ planId, plan, plans, settings, setSettings, removeTrainingPlan, setPlans, updatePlans }) => {
    const [title, setTitle] = useState("");
    const onClose = () => {
        setSettings(false);
    }

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
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 12,
        },
        trainCompleteButton: {
            padding: width * 0.02,
            borderRadius: width * 0.025,
            justifyContent: 'center',
            alignItems: 'center',
        },
        confirmButton: {
            width: '20%',
            height: 40,
            marginTop: 12,
            backgroundColor: '#AAA',
            borderRadius: 5,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 'auto',
        },
        confirmButtonText: {
            fontSize: 15,
            fontWeight: 'bold',
            color: '#fff',
        },
    });

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={settings}
            onRequestClose={onClose}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.container}>
                    <View style={styles.section}>
                        <Text style={styles.title}>Settings</Text>
                        <TextInput
                            style={{
                                width: '100%',
                                height: 40,
                                backgroundColor: '#fff',
                                borderRadius: 5,
                                paddingLeft: 10,
                                marginBottom: 10,
                            }}
                            placeholder="Workout Title"
                            onChangeText={text => setTitle(text)}
                            defaultValue={plans[plan].find(plan => plan.id === planId).name}
                        />

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>

                            <TouchableOpacity style={[styles.trainCompleteButton, { backgroundColor: '#888', marginTop: 5 }]} onPress={() => {
                                onClose();
                            }}>
                                <Text style={styles.confirmButtonText}>Close</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.trainCompleteButton, { backgroundColor: '#F44336', marginTop: 5 }]} onPress={() => {
                                Alert.alert("Confirm Deletion", "Are you sure you want to delete this workout plan?",
                                    [{ text: "Cancel", style: "cancel" }, { text: "Delete", onPress: () => { removeTrainingPlan(planId); onClose(); } }]);
                            }}>
                                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{plan === "workout" ? "Delete Workout" : "Delete Diet"}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.trainCompleteButton, { backgroundColor: '#4CAF50', marginTop: 5 }]} onPress={() => {
                                setPlans(prevPlans => {
                                    const updatedPlans = { ...prevPlans };
                                    updatedPlans[plan] = updatedPlans[plan].map(plan => {
                                        if (plan.id === planId) {
                                            plan.name = title;
                                        }
                                        return plan;
                                    });
                                    return updatedPlans;
                                });
                                updatePlans({ title: title });
                                onClose();
                            }}>
                                <Text style={styles.confirmButtonText}>Set Changes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </Modal>
    )
}

const PersonalManagementPaste = ({ navigation, userToken, personal, setPersonal, setManagerData }) => {

    if (!personal) {
        return (
            <TouchableOpacity
                style={{
                    width: width * 0.12,
                    height: width * 0.12,
                    borderRadius: width * 0.06,
                    backgroundColor: '#FFF',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: 'auto',
                }}
                onPress={() => setPersonal(true)}
            >
                <Icons name="Paste" size={width * 0.08} />
            </TouchableOpacity>
        )
    }

    const [generalData, setGeneralData] = useState(null);
    const [mode, setMode] = useState(null);
    const [userMode, setUserMode] = useState('trainers');
    const [personalMode, setPersonalMode] = useState('rooms_clients');
    const [members, setMembers] = useState([]);
    const [personalRooms, setPersonalRooms] = useState([]);
    const [selectedTrainerPersonalRoom, setSelectedTrainerPersonalRoom] = useState(null);
    const [selectedTrainerRoom, setSelectedTrainerRoom] = useState(null);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [manage, setManage] = useState(false);
    const [selectedTrainer, setSelectedTrainer] = useState(null);
    const [manageRoomPlans, setManageRoomPlans] = useState(true);
    const [manageRoomModal, setManageRoomModal] = useState('none');
    const [userRequests, setUserRequests] = useState(null);
    const [selectedUserRequest, setSelectedUserRequest] = useState(null);
    const [newUserRequest, setNewUserRequest] = useState(null);

    const [evaluationMode, setEvaluationMode] = useState(null);
    const [evaluations, setEvaluations] = useState(null);
    const [evaluationModal, setEvaluationModal] = useState(false);

    const [selectedTrainerRoomId, setSelectedTrainerRoomId] = useState(null);

    const updateRoomUserPlan = (room_id, user_id, plan_id, newPlan) => {
        setPersonalRooms(prevRooms => {
            const updatedRooms = [...prevRooms];
            const roomIndex = updatedRooms.map(room => room.id).indexOf(room_id);
            const userIndex = updatedRooms[roomIndex].members.map(member => member.id).indexOf(user_id);
            if (!newPlan) {
                updatedRooms[roomIndex].members[userIndex].request[plan_id === 'workout' ? 'training_plan' : 'diet_plan'] = null
            } else {
                updatedRooms[roomIndex].members[userIndex].request[plan_id === 'workout' ? 'training_plan' : 'diet_plan'] = [newPlan];
            }
            return updatedRooms;
        })
    }

    const fetchUserProfileImages = async (participants) => {
        if (participants.length) {
            try {
                const response = await fetch(BASE_URL + `/api/users/get-user-profile-images/?user_ids=${participants.join()}`);
                const data = await response.json();
                if (response.ok) {
                    setMembers(prevMembers => {
                        const updatedMembers = { ...prevMembers };
                        data.forEach(user => {
                            updatedMembers[user.user_id].profile_image = user.profile_image;
                            updatedMembers[user.user_id].checked = true;
                        });
                        return updatedMembers;
                    });
                }
            } catch (error) {
                console.error('Error fetching user profile images:', error);
            }
        }
    };

    const fetchGeneralData = async () => {
        const response = await fetch(BASE_URL + '/api/exercises/user-general-data/', {
            method: 'GET',
            headers: {
                'Authorization': 'Token ' + userToken,
                'Content-Type': 'application/json'
            },
        });
        const data = await response.json();
        setGeneralData(data);
    };

    const fetchPersonalRoomData = async (personal_id, owner) => {
        const response = await fetch(BASE_URL + `/api/exercises/personal-data/?personal_id=${personal_id}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Token ' + userToken,
                'Content-Type': 'application/json'
            },
        });

        const data = await response.json();
        if (owner) {
            setPersonalRooms(data.personal_rooms);
            setEvaluations(data.evaluations);
            setEvaluationMode(data.evaluations.schedules && data.evaluations.schedules.length > 0 ? 'schedules' : 'plans');
            if (selectedTrainerPersonalRoom) {
                setSelectedTrainerPersonalRoom(data.personal_rooms.find(room => room.id === selectedTrainerPersonalRoom.id));
            }
        } else {
            setSelectedTrainer(prevData => {
                const updatedData = { ...prevData };
                updatedData['rooms'] = data.personal_rooms;
                updatedData['evaluations'] = data.evaluations;
                updatedData['loading'] = false;
                return updatedData;
            });
        }
    }

    const manageRoomUser = async (user_id, room_id, request_id, action) => {
        try {
            const response = await fetch(BASE_URL + `/api/exercises/manage-room/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${userToken}`
                },
                body: JSON.stringify({ user_id: user_id, room_id: room_id, request_id: request_id, 'action': action })
            });
            if (response.ok) {
                if (action === 'delete') {
                    setSelectedRequestId(null);
                    setPersonalRooms(prevRooms => {
                        const updatedRooms = [...prevRooms];
                        const roomIndex = updatedRooms.map(room => room.id).indexOf(room_id);
                        updatedRooms[roomIndex].requests = updatedRooms[roomIndex].requests.filter(request => request.user.id !== user_id);
                        return updatedRooms;
                    });
                } else if (action === 'leave') {
                    setUserRequests(prevRequests => {
                        return prevRequests.filter(request => request.user.id !== user_id);
                    });
                    setSelectedUserRequest(userRequests.find(request => request.user.id !== user_id));
                }
            }
        } catch (error) {
            console.error('There was a problem with the manage room user request:', error);
        }
    }

    useEffect(() => {
        fetchGeneralData();
    }, []);

    useEffect(() => {
        if (generalData) {
            if (generalData.tabs.personal && !personalRooms.length) {
                fetchPersonalRoomData(generalData.tabs.personal.id, true);
            }

            if (Object.keys(generalData.tabs).length > 1) {
                setMode('personal');
            } else {
                setMode('user');
            }
            if (generalData.tabs) {
                for (let trainer of generalData.tabs.user.nearby_trainers) {
                    if (!members[trainer.user.id]) {
                        setMembers(prevMembers => {
                            const updatedMembers = { ...prevMembers };
                            updatedMembers[trainer.user.id] = { id: trainer.user.id, username: trainer.user.username, name: trainer.name, gender: trainer.user.gender, favorite_sports: trainer.user.favorite_sports, profile_image: trainer.user.profile_image };
                            return updatedMembers;
                        });
                    }
                }
                for (let trainer of generalData.tabs.user.global_trainers) {
                    if (!members[trainer.user.id]) {
                        setMembers(prevMembers => {
                            const updatedMembers = { ...prevMembers };
                            updatedMembers[trainer.user.id] = { id: trainer.user.id, username: trainer.user.username, name: trainer.name, gender: trainer.user.gender, favorite_sports: trainer.user.favorite_sports, profile_image: trainer.user.profile_image };
                            return updatedMembers;
                        });
                    }
                }
                if (generalData.tabs.user.requests.length) {
                    setUserRequests(generalData.tabs.user.requests);
                    setSelectedUserRequest(generalData.tabs.user.requests[generalData.tabs.user.requests.length - 1]);
                    setUserMode('my_data');
                }
            }
        }
    }, [generalData]);

    useEffect(() => {
        if (generalData && selectedTrainerPersonalRoom) {
            fetchPersonalRoomData(generalData.tabs.personal.id, true);
        }
    }, [manageRoomPlans]);

    useEffect(() => {
        if (personalRooms && personalRooms.length > 0) {
            if (!selectedTrainerPersonalRoom) {
                setSelectedTrainerPersonalRoom(personalRooms[0]);
            }
            for (const room of personalRooms) {
                if (room.requests) {
                    for (const request of [...(room.requests || [])]) {
                        if (!members[request.user.id]) {
                            setMembers(prevMembers => {
                                const updatedMembers = { ...prevMembers };
                                updatedMembers[request.user.id] = { id: request.user.id, username: request.user.username, name: request.user.name, gender: request.user.gender, favorite_sports: request.user.favorite_sports, profile_image: request.user.profile_image };
                                return updatedMembers;
                            });
                        }
                    }
                }
            }
        }
    }, [personalRooms]);

    useEffect(() => {
        const members_without_image = Object.values(members).filter(member => {
            return member.checked === undefined;
        }).map(member => {
            return member.id;
        });
        if (members_without_image.length > 0) {
            fetchUserProfileImages(members_without_image);
        }
    }, [members]);

    useEffect(() => {
        if (!selectedTrainerRoomId && selectedTrainer && selectedTrainer.rooms && selectedTrainer.rooms.length) {
            setSelectedTrainerRoom(selectedTrainer.rooms[0]);
            setSelectedTrainerRoomId(selectedTrainer.rooms[0].id);
        }
    }, [selectedTrainer]);

    const selectedRequest = selectedRequestId && selectedTrainerPersonalRoom.requests.find(request => request.user.id === selectedRequestId);

    useEffect(() => {
        if (manage) {
            if (mode === 'user') {
                setManagerData({
                    mode: 'user',
                    plan: manage,
                    plan_id: selectedUserRequest[manage === 'workout' ? 'training_plan' : 'diet_plan'].id,

                });
            } else {
                const plans = {}
                if (manage === 'workout' || (selectedRequestId && selectedRequest.training_plan)) {
                    plans['workout'] = selectedRequest.training_plan ? [selectedRequest.training_plan] : null;
                }
                if (manage === 'diet' || (selectedRequestId && selectedRequest.diet_plan)) {
                    plans['diet'] = selectedRequest.diet_plan ? [selectedRequest.diet_plan] : null;
                }
                setManagerData({
                    mode: 'trainer',
                    plan: manage,
                    room: { request_id: selectedRequest.id, room_id: selectedTrainerPersonalRoom.id, user_id: selectedRequest.id },
                    user: members[selectedRequestId],
                    plans: plans,
                    updateRoomUserPlan: updateRoomUserPlan
                });
            }
            onClose();
            setManage(null);
        }
    }, [manage]);

    const styles = StyleSheet.create({
        title: {
            fontSize: 18,
            fontWeight: 'bold',
            color: '#FFF',
        },
        usersContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
        },
        userButtons: {
            flex: 0,
            padding: 5,
            borderRadius: 5,
            margin: 3,
            alignItems: 'center',
        },
        openPlanButton: {
            width: '95%',
            flexDirection: 'row',
            backgroundColor: '#DDD',
            padding: 3,
            borderRadius: 4,
            alignSelf: 'center',
            justifyContent: 'center',
            marginTop: 4,
        }
    });
    const onClose = () => {
        setPersonal(false);
    }

    STATUS_CHOICES = { 'active': 'Active', 'inactive': 'Inactive', 'cancelled': 'Cancelled', 'pending': 'Pending', 'expired': 'Expired', 'suspended': 'Suspended', 'deleted': 'Deleted' }
    const plans_periods = { 'dayly': 'Dayly', 'weekly': 'Weekly', 'monthly': 'Monthly', 'quarterly': 'Quarterly', 'semesterly': 'Semesterly', 'yearly': 'Yearly' };

    const ManageRoomModal = () => {
        const manageRoom = async () => {
            try {
                const response = await fetch(BASE_URL + '/api/exercises/personal-data/', {
                    method: manageRoomModal,
                    headers: {
                        'Authorization': 'Token ' + userToken,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: manageRoomModal === 'PUT' || manageRoomModal === 'DELETE' ? selectedTrainerPersonalRoom.id : null,
                        name: title,
                        description: description,
                    })
                });

                if (response.ok) {
                    if (manageRoomModal === 'DELETE') {
                        setPersonalRooms(
                            personalRooms.filter(room => room.id !== selectedTrainerPersonalRoom.id)
                        );
                        setSelectedTrainerPersonalRoom(personalRooms.find(room => room.id !== selectedTrainerPersonalRoom.id));
                    } else {
                        const data = await response.json();
                        if (manageRoomModal === 'POST') {
                            if (personalRooms.length > 0) {
                                setPersonalRooms(prevRooms => {
                                    const updatedRooms = [...prevRooms];
                                    updatedRooms.push(data);
                                    return updatedRooms;
                                })
                            } else {
                                setPersonalRooms([data]);
                            }
                        } else if (manageRoomModal === 'PUT') {
                            setPersonalRooms(
                                personalRooms.map(room => {
                                    if (room.id === data.id) {
                                        return data;
                                    }
                                    return room;
                                })
                            );
                        }
                        setSelectedTrainerPersonalRoom(data);
                    }
                    setManageRoomModal('none');
                }
            } catch (error) {
                console.error('Error with room:', error);
            }
        }

        useEffect(() => {
            if (manageRoomModal === 'DELETE') {
                manageRoom();
                setManageRoomModal('none');
            }
        }, [manageRoomModal]);

        const onClose = () => {
            setManageRoomModal('none');
        }
        const [title, setTitle] = useState(manageRoomModal === 'PUT' ? selectedTrainerPersonalRoom.name : '');
        const [description, setDescription] = useState(manageRoomModal === 'PUT' ? selectedTrainerPersonalRoom.description : '');
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={manageRoomModal !== 'none' && manageRoomModal !== 'DELETE'}
                onRequestClose={onClose}
            >
                <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <View style={{ width: '90%', padding: 10, borderRadius: 10, backgroundColor: '#333', alignItems: 'center' }}>
                        <Text style={styles.title}>Manage Room Plans</Text>
                        <TextInput
                            style={{ width: '100%', height: 40, backgroundColor: '#fff', borderRadius: 5, paddingLeft: 10, marginBottom: 10, }}
                            placeholder="Room Name"
                            onChangeText={text => setTitle(text)}
                            defaultValue={title}
                        />
                        <TextInput
                            style={{ width: '100%', height: 80, backgroundColor: '#fff', borderRadius: 5, paddingLeft: 10, marginBottom: 10 }}
                            placeholder="Room Description"
                            onChangeText={text => setDescription(text)}
                            defaultValue={description}
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                            <TouchableOpacity style={[styles.userButtons, { flex: 1, backgroundColor: 'blue', right: 0, bottom: 0 }]} onPress={() => {
                                if (title.length > 0) {
                                    manageRoom();
                                } else {
                                    Alert.alert('Error!', 'Please enter a room name.');
                                }
                            }}>
                                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.userButtons, { flex: 1, backgroundColor: '#F44336', right: 0, bottom: 0 }]} onPress={onClose}>
                                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    }

    const ManageEvaluations = ({ }) => {
        const [addEvaluationPlan, setAddEvaluationPlan] = useState(false);

        const [evaluationId, setEvaluationId] = useState(null);
        const [title, setTitle] = useState('');
        const [description, setDescription] = useState('');
        const [minutes, setMinutes] = useState(30);

        const [startTime, setStartTime] = useState('');
        const [endTime, setEndTime] = useState('');

        const selectedEvaluation = evaluations && evaluations[evaluationMode] && evaluations[evaluationMode].length > 0 && evaluations[evaluationMode].find(evaluation => evaluation.id === evaluationId);

        const [workoutDays, setWorkoutDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
        const allWorkoutDaysNames = { 'Mon': 'Monday', 'Tue': 'Tuesday', 'Wed': 'Wednesday', 'Thu': 'Thursday', 'Fri': 'Friday', 'Sat': 'Saturday', 'Sun': 'Sunday' };

        const onEvaluationModalClose = () => {
            setAddEvaluationPlan(false);
            setEvaluationId(null);
            setTitle('');
            setDescription('');
            setMinutes(30);
            setWorkoutDays(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
            fetchPersonalRoomData(generalData.tabs.personal.id, true);
        }

        const manageEvaluations = async (id, method) => {

            try {
                const response = await fetch(BASE_URL + '/api/exercises/evaluations/', {
                    method: !id ? 'POST' : method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${userToken}`
                    },
                    body: method !== 'DELETE' ? JSON.stringify({
                        evaluation_id: id,
                        evaluation: {
                            name: title,
                            description: description,
                            time_from: startTime,
                            time_to: endTime,
                            minutes: minutes,
                            workout_days: workoutDays
                        }
                    }) : JSON.stringify({
                        'evaluation_id': id
                    })
                });
                if (response.ok) {
                    if (method === 'DELETE') {
                        setEvaluations(prevEvaluations => {
                            return prevEvaluations.plans.filter(evaluation => evaluation.id !== id);
                        });
                    } else {
                        const data = await response.json();
                        if (method === 'POST') {
                            setEvaluations(prevEvaluations => {
                                return [...prevEvaluations, data];
                            });
                        }
                    }
                    onEvaluationModalClose();
                }
            } catch (error) {
                console.error('Error with evaluations:', error);
            }
        }

        const styles = StyleSheet.create({
            container: {
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.8)',
                padding: 3,
                borderRadius: 5,
                marginTop: 10,
            },
            text: {
                flex: 1,
                color: '#555',
                fontWeight: 'bold',
                fontSize: 12,
            },
            userButtons: {
                flex: 0,
                padding: 5,
                borderRadius: 5,
                margin: 3,
                alignItems: 'center',
            },
        });

        return (
            <View>
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={addEvaluationPlan}
                    onRequestClose={() => onEvaluationModalClose}
                >
                    <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }}>
                        <View style={{ width: width * 0.9, maxHeight: '88%', padding: 10, borderRadius: 10, backgroundColor: '#333' }}>
                            <ScrollView>
                                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Add Evaluation Plan</Text>

                                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', marginTop: 10 }}>Evaluation Name</Text>
                                <TextInput style={{ width: '100%', height: 40, backgroundColor: '#fff', borderRadius: 5, paddingLeft: 10 }}
                                    placeholder="Evaluation Name"
                                    onChangeText={text => { setTitle(text) }}
                                    defaultValue={title}
                                />

                                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', marginTop: 10 }}>Avarage Evaluation Description</Text>
                                <TextInput style={{ width: '100%', height: 80, backgroundColor: '#fff', borderRadius: 5, paddingLeft: 10 }}
                                    placeholder="Evaluation Description"
                                    onChangeText={text => { setDescription(text) }}
                                    defaultValue={description}
                                />

                                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', marginTop: 10 }}>Availave Days</Text>
                                <SelectBox
                                    title="Available Days"
                                    allOptions={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
                                    allOptionsNames={allWorkoutDaysNames}
                                    selectedOptions={workoutDays}
                                    setSelectedItem={setWorkoutDays}
                                    obligatory
                                />

                                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', marginTop: 10 }}>Evaluation Time (In minutes)</Text>
                                <TextInput
                                    style={{ width: '100%', height: 40, backgroundColor: '#fff', borderRadius: 5, paddingLeft: 10 }}
                                    placeholder="Evaluation Time (Minutes)"
                                    onChangeText={text => { setMinutes(text) }}
                                    keyboardType="numeric"
                                    defaultValue={minutes.toString()}
                                />

                                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', marginTop: 10 }}>Available Time (Click on icon to select time you are available for evaluations)</Text>
                                <View style={{ backgroundColor: '#eee', borderRadius: 5, paddingLeft: 10, flexDirection: 'row', alignItems: 'space-between' }}>
                                    <View style={{ alignItems: 'center', width: '50%' }}>
                                        <Text style={{ color: '#555', fontSize: 12, fontWeight: 'bold' }}>Start Time </Text>
                                        <DatePicker
                                            showText={false}
                                            time={startTime}
                                            mode="time"
                                            setTime={setStartTime}
                                        />
                                        {startTime && <Text style={{ color: '#000', fontSize: 12, fontWeight: 'bold' }}>{startTime}</Text>}
                                    </View>
                                    <View style={{ alignItems: 'center', width: '50%' }}>
                                        <Text style={{ color: '#555', fontSize: 12, fontWeight: 'bold' }}>End Time</Text>
                                        <DatePicker
                                            showText={false}
                                            time={endTime}
                                            mode="time"
                                            setTime={setEndTime}
                                        />
                                        {endTime && <Text style={{ color: '#000', fontSize: 12, fontWeight: 'bold' }}>{endTime}</Text>}
                                    </View>
                                </View>

                                {evaluationId && <>
                                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', marginTop: 10 }}>Evaluation Subscription Plans</Text>
                                    <SubscriptionPlansModal
                                        userToken={userToken}
                                        object={{
                                            get_key: 'plans_ids',
                                            get_id: selectedEvaluation ? selectedEvaluation.subscription_plans.map(plan => plan.id) : [],
                                            obj_key: 'evaluation_id',
                                            obj_id: selectedEvaluation && selectedEvaluation.id,
                                            plans_in: selectedEvaluation && selectedEvaluation.subscription_plans,
                                        }}
                                        single
                                        patternMode='manager'
                                        setConfirmedSubscription={setNewUserRequest}
                                    />
                                </>}

                            </ScrollView>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 }}>

                                <TouchableOpacity style={{ flex: 1, height: 30, backgroundColor: '#4CAF50', borderRadius: 5, alignItems: 'center', justifyContent: 'center', marginHorizontal: 2 }} onPress={() => {
                                    if (title.length > 0) {
                                        if (workoutDays.length > 0) {
                                            if (minutes > 0) {
                                                if (startTime.length > 0 && endTime.length > 0) {
                                                    manageEvaluations(evaluationId, 'PATCH');
                                                } else { Alert.alert('Error!', 'Please select start and end time.'); }
                                            } else { Alert.alert('Error!', 'Please enter evaluation time.'); }
                                        } else { Alert.alert('Error!', 'Please select at least one day.'); }
                                    } else { Alert.alert('Error!', 'Please enter a evaluation name.'); }
                                }}>
                                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Save</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={{ flex: 1, height: 30, backgroundColor: '#777', borderRadius: 5, alignItems: 'center', justifyContent: 'center', marginHorizontal: 2 }} onPress={onEvaluationModalClose}>
                                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Close</Text>
                                </TouchableOpacity>

                            </View>
                        </View>
                    </View>
                </Modal>

                {evaluations && evaluations.plans && evaluations.plans.map((evaluation) => {
                    return (
                        <View key={evaluation.id} style={styles.container}>
                            <Text style={{ color: '#222', fontSize: 15, fontWeight: 'bold', alignSelf: 'center' }}>{evaluation.name}</Text>
                            {evaluation.description && <Text style={styles.text}>Description: {evaluation.description}</Text>}
                            <Text style={styles.text}>Days: {evaluation.days.map(day => day).join(', ')}</Text>
                            <Text style={styles.text}>Availave Time: {evaluation.time_from} - {evaluation.time_to}</Text>

                            {evaluation.subscription_plans && evaluation.subscription_plans.length > 0 ?
                                <View style={{ marginTop: 10 }}>
                                    <Text style={{ color: '#222', fontSize: 15, fontWeight: 'bold' }}>Subscription Plans:</Text>
                                    {evaluation.subscription_plans.map((subscription_plan) => <Text key={subscription_plan.id} style={styles.text}>{subscription_plan.currency} {subscription_plan.price} - {subscription_plan.name}</Text>)}
                                </View> :
                                <Text style={[styles.text, { color: '#FF0000' }]}>You need to edit to add Subscription Plan</Text>
                            }

                            <View style={{ flexDirection: 'row', justifyContent: 'center', width: '100%', marginTop: 10 }}>

                                <TouchableOpacity style={{ flex: 1, height: 30, backgroundColor: '#F44336', borderRadius: 5, alignItems: 'center', justifyContent: 'center', marginTop: 10, marginHorizontal: 2 }} onPress={() => {
                                    manageEvaluations(evaluation.id, 'DELETE');
                                }}>
                                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>Delete</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={{ flex: 1, height: 30, backgroundColor: '#6495ED', borderRadius: 5, alignItems: 'center', justifyContent: 'center', marginTop: 10, marginHorizontal: 2 }} onPress={() => {
                                    setAddEvaluationPlan(true);
                                    setEvaluationId(evaluation.id);
                                    setTitle(evaluation.name);
                                    setDescription(evaluation.description);
                                    setStartTime(evaluation.time_from);
                                    setEndTime(evaluation.time_to);
                                    setMinutes(evaluation.duration);
                                    setWorkoutDays(evaluation.days);
                                }}>
                                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>Edit</Text>
                                </TouchableOpacity>

                            </View>
                        </View>
                    )
                })}

                <TouchableOpacity style={{ width: '100%', height: 40, backgroundColor: '#4CAF50', borderRadius: 5, alignItems: 'center', justifyContent: 'center', marginTop: 10 }} onPress={() => {
                    setEvaluationId(null);
                    setAddEvaluationPlan(true);
                }}>
                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>Add Evaluation Plan</Text>
                </TouchableOpacity>
            </View >
        )
    }

    const EvaluationList = ({ evaluations }) => {
        const manageEvaluationsSchedules = async (method, id, action) => {
            try {
                const response = await fetch(BASE_URL + '/api/exercises/evaluation-schedules/', {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${userToken}`
                    },
                    body: JSON.stringify({
                        schedule_id: id,
                        action: action
                    })
                });
                if (response.ok) {
                    if (mode === 'personal') {
                        setEvaluations(prevEvaluations => ({
                            ...prevEvaluations,
                            schedules: prevEvaluations.schedules.filter(schedule => schedule.id !== id)
                        }));
                    } else {
                        setGeneralData(prevData => ({
                            ...prevData, tabs: {
                                ...prevData.tabs,
                                user: {
                                    ...prevData.tabs.user,
                                    evaluations: prevData.tabs.user.evaluations.filter(evaluation => {
                                        return evaluation.id !== id;
                                    })
                                }
                            }
                        }));
                    }
                    setEvaluationModal(false);
                } else {
                    try {
                        const data = await response.json();
                        Alert.alert('Error!', data.error);
                    } catch (error) {
                        console.error('Error parsing JSON response:', error);
                        Alert.alert('Error!', 'An unexpected error occurred.');
                    }
                }
            } catch (error) {
                console.error('Error with evaluations:', error);
            }
        }

        const [requestEvaluation, setRequestEvaluation] = useState(false);
        const RequestEvaluationModal = ({ evaluation }) => {
            const [selectedDatetime, setSelectedDatetime] = useState(null);
            const [confirmedSubscription, setConfirmedSubscription] = useState(null);
            useEffect(() => {
                if (confirmedSubscription) {
                    setEvaluationModal(false);
                    fetchGeneralData();
                    setConfirmedSubscription(null);
                }
            }, [confirmedSubscription]);
            return (
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={requestEvaluation}
                    onRequestClose={() => setRequestEvaluation(false)}
                >
                    <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                        <View style={{ width: width * 0.85, maxHeight: '75%', padding: 10, borderRadius: 10, backgroundColor: '#eee' }}>
                            <Text style={{ color: '#000', fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Request Evaluation</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 10, backgroundColor: '#ddd', marginBottom: 10 }}>
                                <Text style={{ color: '#000', fontSize: 12, fontWeight: 'bold', marginLeft: 10 }}>Select Date and Time: </Text>
                                <DatePicker
                                    showText={false}
                                    time={selectedDatetime}
                                    mode="datetime"
                                    setTime={setSelectedDatetime}
                                />
                            </View>

                            {selectedDatetime && <>
                                <Text style={{ color: '#000', fontSize: 12, fontWeight: 'bold', marginBottom: 10 }}>Selected Date and Time: {selectedDatetime}</Text>
                                <SubscriptionPlansModal
                                    userToken={userToken}
                                    subscriptionTexts={{ button_text: "Request a Evaluation", alert_title: "Evaluation", alert_message: "Do you want to request a evaluation?" }}
                                    object={{
                                        get_key: 'plans_ids',
                                        get_id: evaluation.subscription_plans.map(plan => plan.id),
                                        plans_in: evaluation.subscription_plans,
                                        extra: {
                                            type: 'create_evaluation_schedule',
                                            datetime: selectedDatetime
                                        }
                                    }}
                                    patternMode='see'
                                    single
                                    setConfirmedSubscription={setConfirmedSubscription}
                                />
                            </>
                            }
                        </View>
                    </View>
                </Modal>
            )
        }

        const ListBody = () => <View style={{ flex: 1, padding: 3, backgroundColor: '#fff', borderRadius: 3, marginBottom: 20 }}>
            <Text style={{ color: '#222', fontSize: 15, fontWeight: 'bold' }}>Evaluations:</Text>
            {evaluations && evaluations.length > 0 ? evaluations.map((evaluation) => {
                return (
                    <View key={evaluation.id} style={{ backgroundColor: evaluationModal ? '#ccc' : '#eee', padding: 5, marginVertical: 5, borderRadius: 5 }}>
                        {mode === 'personal' || userMode === 'evaluations' ? <>
                            <View>
                                <Text style={styles.text}>Plan Name: {evaluation.name}</Text>
                                <Text style={styles.text}>Date: {evaluation.date}</Text>
                                <Text style={[styles.text, { fontWeight: 'bold' }]}>Time: {evaluation.time}</Text>
                                <Text style={styles.text}>Duration: {evaluation.duration} minutes</Text>
                                <Text style={[styles.text, { color: evaluation.status === 'cancelled' ? '#F44336' : evaluation.status === 'pending' ? '#FFA500' : '#4CAF50' }]}>
                                    Status: {STATUS_CHOICES[evaluation.status]}
                                </Text>
                                {evaluation.note && <Text style={styles.text}>Note: {evaluation.note}</Text>}
                                <View style={{ padding: 5, backgroundColor: '#FFF', borderRadius: 5, marginLeft: 8 }}>
                                    {userMode === 'evaluations' ? <>
                                        <Text style={[styles.text, { fontWeight: 'bold', fontSize: 15, marginBottom: 8 }]}>Personal Trainer Details:</Text>
                                        <Text style={styles.text}>Name: {evaluation.personal_trainer.name}</Text>
                                        {evaluation.personal_trainer.phone_number && <Text style={styles.text}>Phone: {evaluation.personal_trainer.phone_number}</Text>}
                                        {evaluation.personal_trainer.email && <Text style={styles.text}>Email: {evaluation.personal_trainer.email}</Text>}
                                        {evaluation.personal_trainer.address && <Text style={styles.text}>Address: {evaluation.personal_trainer.address}</Text>}
                                    </> :
                                        <>
                                            <Text style={[styles.text, { fontWeight: 'bold', fontSize: 15, marginBottom: 8 }]}>Client Details:</Text>
                                            {evaluation.user.name && <Text style={styles.text}>Name: {evaluation.user.name}</Text>}
                                            {evaluation.user.username && <Text style={styles.text}>Username: {evaluation.user.username}</Text>}
                                            {evaluation.user.gender && <Text style={styles.text}>Gender: {evaluation.user.gender}</Text>}
                                            <Text style={styles.text}>Age: {evaluation.user.age}</Text>
                                        </>}
                                </View>
                                <TouchableOpacity style={{ backgroundColor: '#F44336', alignItems: 'center', justifyContent: 'center', padding: 5, borderRadius: 5, marginTop: 5 }} onPress={() => {
                                    Alert.alert('Cancel Evaluation', 'Do you want to cancel this evaluation?', [
                                        { text: 'Cancel', onPress: () => { } },
                                        { text: 'Yes', onPress: () => { manageEvaluationsSchedules('PATCH', evaluation.id, 'cancel'); } }
                                    ]);
                                }}>
                                    <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>Cancel Evaluation</Text>
                                </TouchableOpacity>
                            </View>
                        </> : <>
                            <View style={{ padding: 3, backgroundColor: '#fff', borderRadius: 5, marginBottom: 5 }}>
                                <Text style={[styles.text, { fontWeight: 'bold', alignSelf: 'center' }]}>{evaluation.name}</Text>
                                <Text style={styles.text}>Available Days: {evaluation.days.map(day => day).join(', ')}</Text>
                                <Text style={styles.text}>Available Time: {evaluation.time_from} - {evaluation.time_to}</Text>
                                <Text style={styles.text}>Evaluation Duration: {evaluation.duration} minutes</Text>
                                {evaluation.note && <Text style={styles.text}>Note: {evaluation.note}</Text>}
                            </View>
                            {requestEvaluation ?
                                <RequestEvaluationModal evaluation={evaluation} />
                                :
                                <>
                                    <SubscriptionPlansModal
                                        userToken={userToken}
                                        subscriptionTexts={{ button_text: "Request a Evaluation", alert_title: "Evaluation", alert_message: "Do you want to request a evaluation?" }}
                                        object={{
                                            get_key: 'plans_ids',
                                            get_id: evaluation.subscription_plans.map(plan => plan.id),
                                            plans_in: evaluation.subscription_plans,
                                        }}
                                        patternMode='see'
                                        table
                                    />
                                    <TouchableOpacity style={{ backgroundColor: '#4CAF50', alignItems: 'center', justifyContent: 'center', padding: 5, borderRadius: 5, marginTop: 5 }} onPress={() => {
                                        setRequestEvaluation(true);
                                    }}>
                                        <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>Request Evaluation</Text>
                                    </TouchableOpacity>
                                </>

                            }
                        </>
                        }
                    </View>
                )
            }) : <Text style={styles.text}>No Evaluations Available</Text>}
        </View>

        if (mode === 'user') {
            if (!evaluationModal && userMode !== 'evaluations') {
                return <TouchableOpacity
                    style={{ borderRadius: 6, justifyContent: 'center', alignItems: 'center', backgroundColor: '#4CAF50', padding: 7 }}
                    onPress={() => setEvaluationModal(true)}
                >
                    <Text style={{ color: '#FFF', fontSize: 13, fontWeight: 'bold' }}>
                        Schedule Evaluation
                    </Text>
                </TouchableOpacity>
            } else if (userMode === 'evaluations') {
                return <ListBody />
            }
        } else {
            return <ListBody />
        }

        return (
            <Modal animationType="slide" transparent={true} visible={evaluationModal} onRequestClose={() => { setEvaluationModal(false) }}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', padding: 10, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ width: '95%', marginVertical: 'auto', padding: 3, backgroundColor: '#fff', borderRadius: 3 }}>
                        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                            <ListBody />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        )
    }

    const SubscriptionItem = ({ subscription }) => {
        const styles = StyleSheet.create({
            container: {
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.8)',
                padding: 3,
                borderRadius: 5,
                marginBottom: 3,
            },
            text: {
                flex: 1,
                color: '#000',
                fontWeight: 'bold',
                fontSize: 12,
            }
        });

        STATUS_CHOICES = { 'active': 'Active', 'inactive': 'Inactive', 'cancelled': 'Cancelled', 'pending': 'Pending', 'expired': 'Expired', 'suspended': 'Suspended', 'deleted': 'Deleted' }
        PAYMENT_STATUS_CHOICES = { 'paid': 'Paid', 'pending': 'Pending', 'overdue': 'Overdue' }

        return (
            <View style={styles.container}>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-evenly' }}>
                    <Text style={styles.text}>{subscription.amount} {subscription.currency}</Text>
                    <Text style={styles.text}>{STATUS_CHOICES[subscription.status]}</Text>
                </View>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-evenly', padding: 3, backgroundColor: '#eee', borderRadius: 3 }}>
                    <Text style={[styles.text, { fontSize: 10, fontWeight: 'normal', }]}>Start: {subscription.date_start}</Text>
                    <Text style={[styles.text, { fontSize: 10, fontWeight: 'normal', }]}>End: {subscription.date_end}</Text>
                </View>
                <View style={{ flex: 1, flexDirection: 'row', padding: 3, borderRadius: 3 }}>
                    <Text style={[styles.text, { fontSize: 8 }]}>Due Date: {subscription.due_date}{"\n"}Generated At: {subscription.generated_at}</Text>
                    {//<Text style={[styles.text, { fontSize: 8 }]}>Payment Status: {PAYMENT_STATUS_CHOICES[subscription.payment_status]}</Text>
                    }
                </View>
            </View>
        )
    }

    const ManagePayments = ({ payments }) => {
        const requestWithdrawal = async () => {
            try {
                response = await fetch(BASE_URL + '/api/payments/withdrawal-request/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Token ' + userToken
                    },
                    body: JSON.stringify({
                        'type': 'personal_trainer',
                        'payment_method': paymentMethod,
                        'address': paymentData,
                    })
                });
                data = await response.json();
                if (response.ok) {
                    fetchGeneralData();
                    setPersonalMode('payments');
                } else {
                    Alert.alert('Error', data.error)
                }
            } catch (error) {
                Alert.alert('Error', error.message)
            }
        }
        const payments_options = [
            { label: 'PayPal', value: 'paypal' },
            { label: 'USDT', value: 'usdt_theter' },
            { label: 'Bitcoin Lightning', value: 'bitcoin_lightning' },
            { label: 'Bitcoin', value: 'bitcoin' },
            //{ label: 'Bank Transfer', value: 'bank_transfer' },
        ];
        const [paymentMethod, setPaymentMethod] = useState('paypal');
        const [paymentData, setPaymentData] = useState({
            address: ''
        });
        const withdrawalStyles = StyleSheet.create({
            addressInput: { width: '100%', height: 40, backgroundColor: '#fff', borderRadius: 5, padding: 5, marginTop: 10 },
        });

        return (
            <View style={{ marginVertical: 8, alignItems: 'flex-start', width: '100%' }}>
                <View style={{ width: '100%', marginVertical: 8 }}>
                    {payments.unreceived && Object.keys(payments.unreceived).map(currency => {
                        return (
                            <View key={currency} style={{ width: '100%', borderRadius: 5, justifyContent: 'center', marginTop: 10 }}>
                                <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>${currency}: {payments.unreceived[currency]}</Text>
                            </View>
                        )
                    }
                    )}
                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold', textAlign: 'center', width: '100%' }}>Total Available in USD: {payments.total_unreceived_usd}</Text>
                </View>
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold', marginTop: 20 }}>Payment Method:</Text>
                <ScrollView horizontal={true}>
                    <View style={{ flexDirection: 'row', marginVertical: 8, minHeight: 40, alignItems: 'flex-start', width: '100%' }}>
                        {payments_options.map((tab, index) => {
                            return <Tabs
                                key={index}
                                index={index}
                                name={tab.label}
                                setSelectedTab={() => setPaymentMethod(tab.value)}
                                isSelected={tab.value === paymentMethod}
                                len={payments_options.length}
                                TabSize={width * 0.89 / payments_options.length * 1.5}
                                textColor='#222'
                                selectedColor='#FFF'
                                unselectedColor='#DDD'
                            />
                        })}
                    </View>
                </ScrollView>
                <View style={{ width: '100%', marginVertical: 8 }}>
                    {paymentMethod === 'paypal' ? (<>
                        <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>PayPal Email:</Text>
                        <TextInput style={withdrawalStyles.addressInput}
                            value={paymentData.address}
                            onChangeText={text => setPaymentData({ ...paymentData, address: text })}
                            placeholder="Enter PayPal Email"
                        />

                    </>) : paymentMethod === 'bitcoin' ? (<>
                        <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>Bitcoin Address:</Text>
                        <TextInput style={withdrawalStyles.addressInput}
                            value={paymentData.address}
                            onChangeText={text => setPaymentData({ ...paymentData, address: text })}
                            placeholder="Enter Bitcoin Address"
                        />
                    </>) : paymentMethod === 'usdt_theter' ? (<>
                        <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>USDT Address:</Text>
                        <TextInput style={withdrawalStyles.addressInput}
                            value={paymentData.address}
                            onChangeText={text => setPaymentData({ ...paymentData, address: text })}
                            placeholder="Enter USDT Address"
                        />
                    </>) : paymentMethod === 'bitcoin_lightning' ? (<>
                        <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>Bitcoin Lightning Address:</Text>
                        <TextInput style={withdrawalStyles.addressInput}
                            value={paymentData.address}
                            onChangeText={text => setPaymentData({ ...paymentData, address: text })}
                            placeholder="Enter Bitcoin Lightning Address"
                        />
                    </>) : paymentMethod === 'bank_transfer' ? (<></>) : (
                        <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>No Payment Method Selected</Text>
                    )}
                </View>
                <TouchableOpacity
                    style={{ width: '100%', height: 40, backgroundColor: '#4CAF50', borderRadius: 5, alignItems: 'center', justifyContent: 'center', marginTop: 10 }}
                    onPress={() => {
                        if (payments.total_unreceived_usd >= 100) {
                            requestWithdrawal();
                        } else {
                            Alert.alert('Error!', 'You need to have at least $100 to request a withdrawal.');
                        }
                    }}
                >
                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold', textAlign: 'center', width: '100%' }}>Request WithDraw (Min $100)</Text>
                </TouchableOpacity>
                {payments.withdraw_requests && payments.withdraw_requests.length > 0 && <View style={{ width: '100%', marginVertical: 8 }}>
                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>Withdraw Requests:</Text>
                    <ScrollView horizontal>
                        <View style={{ flexDirection: 'row' }}>
                            {payments.withdraw_requests.map((withdrawal, index) => {
                                return <View key={index} style={{ marginRight: 8, maxWidth: '80%', backgroundColor: '#ccc', borderRadius: 5, justifyContent: 'center', padding: 10 }}>
                                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>Amount: {withdrawal.amount} {withdrawal.currency}</Text>
                                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>Datetime: {withdrawal.datetime.split('T')[0]} {withdrawal.datetime.split('T')[1].split('.')[0]}</Text>
                                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>Status: {withdrawal.status}</Text>
                                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>Method: {withdrawal.payment_method}</Text>
                                    <Text style={{ color: '#fff', fontSize: 8, fontWeight: 'bold' }}>Id: {withdrawal.id}</Text>
                                </View>

                            })}
                        </View>
                    </ScrollView>
                </View>}
            </View>
        )
    }

    const user_tabs = [{ 'mode': "my_data", 'name': "My Data" }, { 'mode': "trainers", 'name': "Trainers" },
    ...(generalData && generalData.tabs && generalData.tabs.user.evaluations ? [{ 'mode': "evaluations", 'name': "Evaluations" }] : [])
    ]

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Paste Workout</Text>
            <View style={{ flexDirection: 'row', marginVertical: 8, minHeight: 40, alignItems: 'flex-start', width: '100%' }}>
                {generalData && Object.keys(generalData.tabs).map((tab, index) => {
                    const len = Object.keys(generalData.tabs).length;
                    return <Tabs
                        key={index}
                        index={index}
                        name={generalData.tabs[tab].name}
                        setSelectedTab={() => setMode(tab)}
                        isSelected={tab === mode}
                        len={len}
                        TabSize={width * 0.89 / len * 0.8}
                        textColor='#222'
                        selectedColor='#FFF'
                        unselectedColor='#DDD'
                    />
                })
                }
            </View>
            {mode === 'user' ? <>
                <View style={{ flexDirection: 'row', marginVertical: 8, minHeight: 40, alignItems: 'flex-start', width: '100%' }}>
                    {user_tabs.map((tab, index) => {
                        return <Tabs
                            key={index}
                            index={index}
                            name={tab.name}
                            setSelectedTab={() => setUserMode(tab.mode)}
                            isSelected={tab.mode === userMode}
                            len={user_tabs.length}
                            TabSize={width * 0.89 / user_tabs.length * 0.9}
                            textColor='#222'
                            selectedColor='#FFF'
                            unselectedColor='#DDD'
                        />
                    })}
                </View>
                <ScrollView>
                    {userMode === "trainers" ?
                        <View>
                            <View style={{ maxHeight: width * 0.65 }}>
                                {generalData.tabs && generalData.tabs.user && generalData.tabs.user.nearby_trainers.length > 0 && <>
                                    <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold', marginVertical: 5, top: 5 }}>
                                        Nearby Trainers:
                                    </Text>
                                    <ScrollView horizontal>
                                        <View style={styles.usersContainer}>
                                            {generalData.tabs.user.nearby_trainers.map(trainer => {
                                                return (
                                                    <View key={trainer.id}>
                                                        {trainer.distance && <View style={{ position: 'absolute', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3, backgroundColor: '#0000FF', borderRadius: 5, zIndex: 1 }}>
                                                            <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#FFF' }}>{trainer.distance.toFixed(2)} km</Text>
                                                        </View>}
                                                        <UsersBall user={members[trainer.user.id]} onPress={() => {
                                                            setSelectedTrainer({
                                                                ...trainer,
                                                                id: trainer.user.id,
                                                                name: trainer.name,
                                                                loading: true,
                                                                rooms: [],
                                                            });
                                                            fetchPersonalRoomData(trainer.id, false);
                                                        }} size={0.8} nameColor="#EEE" />
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    </ScrollView>
                                </>}
                                {generalData.tabs && generalData.tabs.user && generalData.tabs.user.global_trainers.length > 0 ?
                                    <>
                                        <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold', marginVertical: 5, top: 5 }}>
                                            World Trainers:
                                        </Text>
                                        <ScrollView horizontal>
                                            <View style={styles.usersContainer}>
                                                {generalData.tabs.user.global_trainers.map(trainer => {
                                                    return <UsersBall key={trainer.id} user={members[trainer.user.id]} onPress={() => {
                                                        setSelectedTrainer({
                                                            ...trainer,
                                                            id: trainer.user.id,
                                                            name: trainer.name,
                                                            loading: true,
                                                            rooms: [],
                                                        });
                                                        fetchPersonalRoomData(trainer.id, false);
                                                    }} size={0.8} nameColor="#EEE" />
                                                })}
                                            </View>
                                        </ScrollView>
                                    </>
                                    : <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold', marginVertical: 5, top: 5 }}>No Trainers Found</Text>
                                }
                            </View>
                            {selectedTrainer && <View style={{ width: '100%', padding: 5, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.15)' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', height: width * 0.12 }}>
                                    <UsersBall user={members[selectedTrainer.id]} name="none" size={0.5} nameColor="#EEE" />
                                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#FFF', marginLeft: 5 }}>{selectedTrainer.name}</Text>
                                </View>
                                {selectedTrainer.address && <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 12 }}>
                                    {selectedTrainer.address}
                                </Text>}

                                {selectedTrainer.evaluations && <EvaluationList evaluations={selectedTrainer.evaluations.plans} />}

                                {selectedTrainer.loading ? <ActivityIndicator size="large" color="#fff" />
                                    : selectedTrainer.rooms && selectedTrainer.rooms.length > 0 && (
                                        <View style={{ width: '100%' }}>
                                            <View style={{ flexDirection: 'row', marginVertical: 8, minHeight: 40, alignItems: 'flex-start', width: '100%' }}>
                                                {selectedTrainer.rooms.map((room, index) => {
                                                    return <Tabs
                                                        key={index}
                                                        index={index}
                                                        name={room.name}
                                                        setSelectedTab={() => {
                                                            setSelectedTrainerRoomId(room.id);
                                                            setSelectedTrainerRoom(room);
                                                        }}
                                                        isSelected={room.id === selectedTrainerRoomId}
                                                        len={selectedTrainer.rooms.length}
                                                        TabSize={width * 0.89 / selectedTrainer.rooms.length * 0.9}
                                                        textColor='#222'
                                                        selectedColor='#FFF'
                                                        unselectedColor='#DDD'
                                                    />
                                                }
                                                )}
                                            </View>
                                            {selectedTrainerRoom && <>
                                                <View>
                                                    <View style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 6, padding: 5 }}>
                                                        <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 12 }}>{selectedTrainerRoom.description}</Text>
                                                    </View>
                                                </View>

                                                {selectedTrainerRoom.subscription_plans.length > 0 &&
                                                    <View style={{ width: '100%', marginTop: 10 }}>
                                                        <SubscriptionPlansModal
                                                            userToken={userToken}
                                                            subscriptionTexts={{ button_text: "Request to Join Room", alert_title: "Joining Room", alert_message: "Are you sure you want to join this room?" }}
                                                            object={{
                                                                get_key: 'plans_ids',
                                                                get_id: selectedTrainerRoom.subscription_plans.map(plan => plan.id),
                                                                plans_in: selectedTrainerRoom.subscription_plans,
                                                            }}
                                                            patternMode='see'
                                                            setNewUserRequest={setNewUserRequest}
                                                        />
                                                    </View>
                                                }
                                            </>
                                            }
                                        </View>
                                    )
                                }
                            </View>}
                        </View>
                        : userMode === "my_data" ?
                            <View>
                                {userRequests && <ScrollView horizontal>
                                    <View style={{ flexDirection: 'row', marginVertical: 8, minHeight: 40, alignItems: 'flex-start', width: '100%' }}>
                                        {userRequests && userRequests.map((request, index) => {
                                            if (!request.room) return;
                                            return (
                                                <Tabs
                                                    key={index}
                                                    index={index}
                                                    name={request.room.name}
                                                    setSelectedTab={() => {
                                                        setSelectedUserRequest(request);
                                                    }}
                                                    isSelected={request.id === selectedUserRequest.id}
                                                    len={userRequests.length}
                                                    TabSize={width * 0.89 / userRequests.length * 1}
                                                    textColor='#222'
                                                    selectedColor='#FFF'
                                                    unselectedColor='#DDD'
                                                />
                                            )
                                        })}
                                    </View>
                                </ScrollView>}
                                {selectedUserRequest && selectedUserRequest.room ? <>
                                    <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 18 }}>Room: {selectedUserRequest.room.name}</Text>
                                    {selectedUserRequest.room.description && <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 12, marginVertical: 2 }}>Description: {selectedUserRequest.room.description}</Text>}

                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', marginVertical: 8 }}>
                                        {selectedUserRequest.training_plan &&
                                            <View style={{ flex: 1, padding: 5, borderRadius: 5, marginHorizontal: 5, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                                                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 12 }}>Workout Plan</Text>
                                                <TouchableOpacity style={styles.openPlanButton} onPress={() => setManage('workout')}>
                                                    <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 16 }}>{selectedUserRequest.training_plan.name}</Text>
                                                </TouchableOpacity>
                                            </View>}
                                        {selectedUserRequest.diet_plan &&
                                            <View style={{ flex: 1, padding: 5, borderRadius: 5, marginHorizontal: 5, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                                                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 12 }}>Diet Plan</Text>
                                                <TouchableOpacity style={styles.openPlanButton} onPress={() => setManage('diet')}>
                                                    <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 16 }}>{selectedUserRequest.diet_plan.name}</Text>
                                                </TouchableOpacity>
                                            </View>}
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => {
                                            if (selectedUserRequest.status !== 'active') {
                                                Alert.alert("Chat Trainer", "Your Subscription is not active. Are you sure you want to chat trainer?",
                                                    [{ text: "Cancel", style: "cancel" }, { text: "Chat", onPress: () => { navigation.navigate('User Profile', { id: selectedUserRequest.user_owner }); } }]);
                                            } else {
                                                navigation.navigate('User Profile', { id: selectedUserRequest.user_owner });
                                            }
                                        }}
                                        style={[styles.userButtons, { backgroundColor: '#2196F3' }]}
                                    >
                                        <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>Chat Trainer</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => {
                                            Alert.alert("Leave Room", "Are you sure you want to leave this room?",
                                                [{ text: "Cancel", style: "cancel" }, { text: "Leave", onPress: () => { manageRoomUser(selectedUserRequest.user.id, selectedUserRequest.room.id, selectedUserRequest.id, 'leave'); } }]);
                                        }}
                                        style={[styles.userButtons, { backgroundColor: '#FF4444' }]}
                                    >
                                        <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>Leave Room</Text>
                                    </TouchableOpacity>

                                    {selectedUserRequest.current_subscription && (
                                        <PaymentCard subscriptionData={selectedUserRequest.current_subscription} />
                                    )}
                                    {selectedUserRequest.subscriptions.map(subscription => <SubscriptionItem key={subscription.id} subscription={subscription} />)}
                                </> :
                                    <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold', marginVertical: 5, top: 5 }}>No Rooms to Show Yet</Text>
                                }
                            </View>
                            : userMode === "evaluations" ?
                                <EvaluationList evaluations={generalData.tabs.user.evaluations} />
                                : ''
                    }
                </ScrollView>

            </> : mode === 'personal' ?
                <>
                    <ScrollView horizontal>
                        <View style={{ flexDirection: 'row', marginVertical: 8, minHeight: 40, alignItems: 'flex-start', width: '100%' }}>
                            {[{ 'mode': "rooms_clients", 'name': "Rooms Clients" }, { 'mode': "rooms_data", 'name': "Rooms Data" }, { 'mode': "evaluations", 'name': "Evaluations" }, { 'mode': "payments", 'name': "Payments" }].map((tab, index) => {
                                return <Tabs
                                    key={index}
                                    index={index}
                                    name={tab.name}
                                    setSelectedTab={() => setPersonalMode(tab.mode)}
                                    isSelected={tab.mode === personalMode}
                                    len={4}
                                    TabSize={width * 0.89 / 4 * 1}
                                    textColor='#222'
                                    selectedColor='#FFF'
                                    unselectedColor='#DDD'
                                />
                            })}
                        </View>
                    </ScrollView>
                    {manageRoomModal && <ManageRoomModal />}
                    {selectedTrainerPersonalRoom && (
                        personalMode === 'rooms_clients' ? (
                            <View style={{ width: '100%' }}>
                                <ScrollView horizontal>
                                    <View style={{ flexDirection: 'row', marginVertical: 8, minHeight: 40, alignItems: 'flex-start', width: '100%' }}>
                                        {personalRooms.map((room, index) => {
                                            return (
                                                <Tabs
                                                    key={index}
                                                    index={index}
                                                    name={room.name}
                                                    setSelectedTab={() => {
                                                        setSelectedTrainerPersonalRoom(room);
                                                        setSelectedRequestId(null);
                                                    }}
                                                    isSelected={room.id === selectedTrainerPersonalRoom.id}
                                                    len={personalRooms.length}
                                                    TabSize={width * 0.89 / personalRooms.length * 1}
                                                    textColor='#222'
                                                    selectedColor='#FFF'
                                                    unselectedColor='#DDD'
                                                />
                                            )
                                        })}
                                    </View>
                                </ScrollView>

                                {selectedTrainerPersonalRoom.requests && selectedTrainerPersonalRoom.requests.length > 0 && <>
                                    <Text style={{ color: '#FFF', fontSize: 14, fontWeight: 'bold', marginVertical: 5, top: 5 }}>
                                        Clients:
                                    </Text>
                                    <ScrollView horizontal>
                                        <View style={styles.usersContainer}>
                                            {selectedTrainerPersonalRoom.requests.map(request => {
                                                return <UsersBall key={request.id} user={members[request.user.id]} onPress={setSelectedRequestId} size={0.8} nameColor="#EEE" />
                                            })}
                                        </View>
                                    </ScrollView>
                                </>}

                                {selectedRequest &&
                                    <View style={{ flexDirection: 'row', padding: 4, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.25)' }}>
                                        <UsersBall user={members[selectedRequest.user.id]} name="username" size={1.5} nameColor="#EEE" />
                                        <View style={{ marginLeft: 5, flex: 1 }}>
                                            <Text style={{ color: '#FFF' }}>{selectedRequest.user.name}, {selectedRequest.user.age}</Text>
                                            {selectedRequest.status && <View>
                                                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                                    {selectedRequest.training_plan &&
                                                        <TouchableOpacity style={[styles.userButtons, { backgroundColor: '#2196F3', padding: 8 }]}
                                                            onPress={() => { setManage('workout'); }}
                                                        >
                                                            <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>Manage Workout</Text>
                                                        </TouchableOpacity>}
                                                    {selectedRequest.diet_plan &&
                                                        <TouchableOpacity style={[styles.userButtons, { backgroundColor: '#2196F3', padding: 8 }]}
                                                            onPress={() => { setManage('diet'); }}
                                                        >
                                                            <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>Manage Diet</Text>
                                                        </TouchableOpacity>}
                                                </View>
                                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 'auto' }}>
                                                    {!selectedRequest.training_plan &&
                                                        <TouchableOpacity style={[styles.userButtons, { backgroundColor: '#FF4444' }]}
                                                            onPress={() => { setManage('workout'); }}
                                                        >
                                                            <Text style={{ color: '#FFF', fontSize: 8, fontWeight: 'bold' }}>Create Workout</Text>
                                                        </TouchableOpacity>}
                                                    {!selectedRequest.diet_plan &&
                                                        <TouchableOpacity style={[styles.userButtons, { backgroundColor: '#FF4444' }]}
                                                            onPress={() => { setManage('diet'); }}
                                                        >
                                                            <Text style={{ color: '#FFF', fontSize: 8, fontWeight: 'bold' }}>Create Diet</Text>
                                                        </TouchableOpacity>}
                                                    <TouchableOpacity style={[styles.userButtons, { backgroundColor: '#2196F3', paddingHorizontal: 24 }]}
                                                        onPress={() => { navigation.navigate('User Profile', { id: selectedRequest.user.id }); }}
                                                    >
                                                        <Text style={{ color: '#FFF', fontSize: 8, fontWeight: 'bold' }}>Chat User</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>}
                                            <View style={{ backgroundColor: 'rgba(255,255,255,0.8)', padding: 5, borderRadius: 5, flex: 0 }}>
                                                <Text style={{ fontSize: 12, fontWeight: 'bold' }}>Subscription Data</Text>
                                                {selectedRequest.subscriptions && selectedRequest.subscriptions.length ?
                                                    selectedRequest.subscriptions.map(subscription => <SubscriptionItem key={subscription.id} subscription={subscription} />)
                                                    : <Text style={{ fontSize: 9, color: 'gray' }}>No Subscription</Text>}
                                            </View>
                                        </View>

                                        <TouchableOpacity style={{ position: 'absolute', padding: 4, right: 0, top: -6, backgroundColor: '#FF4444', borderRadius: 5, alignItems: 'center', justifyContent: 'center' }}
                                            onPress={() => {
                                                Alert.alert("Confirm Deletion", "Are you sure you want to remove this member?",
                                                    [{ text: "Cancel", style: "cancel" }, {
                                                        text: "Delete", onPress: () => {
                                                            manageRoomUser(
                                                                selectedRequest.user.id,
                                                                selectedTrainerPersonalRoom.id,
                                                                selectedRequest.id,
                                                                'delete'
                                                            );
                                                        }
                                                    }]);
                                            }}
                                        >
                                            <View style={styles.exerciseItemRemove}>
                                                <Icons name="CloseX" size={width * 0.05} />
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                }
                            </View>
                        ) : (personalMode === 'rooms_data' ?

                            <View style={{ width: '100%' }}>
                                <ScrollView horizontal>
                                    <View style={{ flexDirection: 'row', marginVertical: 8, minHeight: 40, alignItems: 'flex-start', width: '100%' }}>
                                        {personalRooms.map((room, index) => {
                                            return (
                                                <Tabs
                                                    key={index}
                                                    index={index}
                                                    name={room.name}
                                                    setSelectedTab={() => {
                                                        setSelectedTrainerPersonalRoom(room);
                                                        setSelectedRequestId(null);
                                                    }}
                                                    isSelected={room.id === selectedTrainerPersonalRoom.id}
                                                    len={personalRooms.length}
                                                    TabSize={width * 0.89 / personalRooms.length * 1}
                                                    textColor='#222'
                                                    selectedColor='#FFF'
                                                    unselectedColor='#DDD'
                                                />
                                            )
                                        })}
                                    </View>
                                </ScrollView>

                                <View style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap' }}>
                                    <View style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 6, padding: 5 }}>
                                        <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 12 }}>{selectedTrainerPersonalRoom.description}</Text>
                                    </View>

                                    {personalRooms.length > 0 && <View style={{ flexDirection: 'row', width: '100%', marginTop: 5 }}>
                                        <TouchableOpacity style={{ flex: 1, backgroundColor: '#2196F3', padding: 5, borderRadius: 5, alignItems: 'center', justifyContent: 'center' }} onPress={() => {
                                            setManageRoomModal('PUT');
                                        }}>
                                            <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>Edit Room</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={{ flex: 1, marginLeft: '2%', backgroundColor: 'red', padding: 5, borderRadius: 5, alignItems: 'center', justifyContent: 'center' }} onPress={() => {
                                            Alert.alert("Confirm Deletion", "Are you sure you want to delete this room?",
                                                [{ text: "Cancel", style: "cancel" }, { text: "Delete", onPress: () => { setManageRoomModal('DELETE'); } }]);
                                        }}>
                                            <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>Delete Room</Text>
                                        </TouchableOpacity>
                                    </View>}
                                </View>

                                {personalRooms.length > 0 && <View>
                                    <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 15, marginTop: 10 }}>Room Subscription Plans:</Text>
                                    {false && <View style={{ width: '100%' }}>
                                        {selectedTrainerPersonalRoom && selectedTrainerPersonalRoom.subscription_plans.map(plan => {
                                            return (
                                                <View key={plan.id} style={{ flexDirection: 'row', padding: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.65)', marginVertical: 5, alignItems: 'center', justifyContent: 'space-evenly' }}>
                                                    <Text style={{ color: '#000', fontSize: 15, fontWeight: 'bold' }}>{plan.name}</Text>
                                                    <Text style={{ color: '#000', fontSize: 10, fontWeight: 'bold' }}>{plan.price} {plan.currency}</Text>
                                                    <Text style={{ color: '#000', fontSize: 8, fontWeight: 'bold' }}>{plans_periods[plan.period]}</Text>
                                                </View>
                                            )
                                        })}
                                        <TouchableOpacity style={{ width: '100%', height: 40, backgroundColor: '#000', padding: 5, borderRadius: 5, alignItems: 'center', justifyContent: 'center', marginTop: 5, borderWidth: 1, borderColor: '#FFF' }} onPress={() => {
                                            setManageRoomPlans(true);
                                        }}>
                                            <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>Manage Room Subscription Plans</Text>
                                        </TouchableOpacity>
                                    </View>}
                                    {manageRoomPlans &&
                                        <SubscriptionPlansModal
                                            userToken={userToken}
                                            subscriptionTexts={{ button_text: "Manage Room" }}
                                            object={{
                                                get_key: 'plans_ids',
                                                get_id: selectedTrainerPersonalRoom.subscription_plans.map(plan => plan.id),
                                                obj_key: 'room_id',
                                                obj_id: selectedTrainerPersonalRoom.id,
                                                plans_in: selectedTrainerPersonalRoom.subscription_plans
                                            }}
                                            patternMode='manager'
                                        />
                                    }
                                </View>}
                            </View>
                            : ''
                        )
                    )}
                    {personalMode === 'rooms_data' && <TouchableOpacity style={{ width: '100%', height: 40, backgroundColor: '#4CAF50', borderRadius: 5, alignItems: 'center', justifyContent: 'center', marginTop: 10 }} onPress={() => {
                        setManageRoomModal('POST');
                    }}>
                        <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>Add Room</Text>
                    </TouchableOpacity>}

                    {personalMode === 'evaluations' && <View>
                        <View style={{ flexDirection: 'row', marginVertical: 8, minHeight: 40, alignItems: 'flex-start', width: '100%' }}>
                            {[{ 'mode': "plans", 'name': "Plans" }, { 'mode': "schedules", 'name': "Schedules" }].map((evaluation, index) => {
                                return <Tabs
                                    key={index}
                                    index={index}
                                    name={evaluation.name}
                                    setSelectedTab={() => setEvaluationMode(evaluation.mode)}
                                    isSelected={evaluation.mode === evaluationMode}
                                    len={2}
                                    TabSize={width * 0.89 / 2 * 0.9}
                                    textColor='#222'
                                    selectedColor='#FFF'
                                    unselectedColor='#DDD'
                                />
                            })}
                        </View>
                        {evaluationMode === 'plans' ?
                            <ManageEvaluations />
                            : evaluationMode === 'schedules' ?
                                evaluations && evaluations.schedules && evaluations.schedules.length > 0 ? <EvaluationList evaluations={evaluations.schedules} /> : <Text style={{ color: '#222', fontSize: 15, fontWeight: 'bold', textAlign: 'center', marginTop: 10 }}>No schedules found</Text>
                                : ''
                        }
                    </View>}

                    {personalMode === 'payments' && <>
                        <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold', textAlign: 'center', width: '100%' }}>Payments</Text>
                        <ManagePayments payments={generalData.tabs.personal.payments} />
                    </>
                    }
                </>
                : <></>
            }
        </View>
    )
}

const FitnessScreen = ({ route, navigation }) => {

    const { online, userToken, userSubscriptionPlan, setUserSubscriptionPlan } = useGlobalContext();

    const [plan, setPlan] = useState('workout');
    const [plans, setPlans] = useState({ "workout": null, "diet": null });
    const [planId, setPlanId] = useState(null);
    const [personal, setPersonal] = useState(false);
    const [managerData, setManagerData] = useState(null);
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
                        'diagonal-neck-stretch': { sets: 4, reps: 10, rest: 130, done: false, edit: false }
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

    const [newTrainingModal, setNewTrainingModal] = useState(false);
    const [newFoodModal, setNewFoodModal] = useState(false);
    const [addNewMuscleGroup, setAddNewMuscleGroup] = useState(false);

    const [confirmedSubscription, setConfirmedSubscription] = useState(null);

    const [setting, setSettings] = useState(false);

    const fetchManyExercisesImages = async (missing_exercises_images) => {
        try {
            const response = await fetch(BASE_URL + `/api/exercises/all-exercises/?missing_exercises_images=${missing_exercises_images.join(',')}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${userToken}`,
                },
            });
            const data = await response.json();
            for (const exercise of data) {
                continue
                await new Promise(resolve => setTimeout(resolve, 100));
                storeData(exercise.image, "exercise_image_" + exercise.image_name);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const fetchManyExercises = async ({ exercises_list, muscle_group }) => {

        try {
            const response = await fetch(BASE_URL + `/api/exercises/all-exercises/?${exercises_list && exercises_list.length ? '&exercises_list=' + exercises_list.join(',') : ''}${muscle_group && muscle_group.length ? '&muscle_group=' + muscle_group : ''}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${userToken}`,
                },
            });
            const data = await response.json();

            setAllItems(prevItems => ({ ...prevItems, "workout": { ...prevItems.workout, ...data } }));

            let missing_exercises_images = [];
            for (const exercise of Object.keys(data)) {
                continue
                if (!data[exercise].execution_images[0].image_name) {
                    missing_exercises_images.push(exercise)
                }
                storeData(data[exercise], "exercise_" + exercise);
            }
            if (missing_exercises_images.length > 0) {
                fetchManyExercisesImages(exercises_list);
            }

        } catch (error) {
            console.error('There was a problem with fetching the exercises: \n', error);
        }
    }

    const fetchManyFoods = async () => {
        try {
            const response = await fetch(BASE_URL + `/api/exercises/all-foods/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${userToken}`,
                },
            });
            const data = await response.json();

            setAllItems(prevItems => ({ ...prevItems, "diet": data }));

        } catch (error) {
            console.error('There was a problem with fetching the foods: \n', error);
        }
    }

    const updatePlans = async ({ name = selectedPlan.name, room = (managerData && managerData.room), send_to_user = false }) => {
        if (!checkAvailableFeature('save_plan', { userSubscriptionPlan: userSubscriptionPlan, plan: plan, setUpdatePlanModal: setUpdatePlanModal }, managerData ? 'personal_trainer' : 'user')) return;
        setAddNewMuscleGroup(false);
        checkAvailableFeature('saved_plan', { userSubscriptionPlan: userSubscriptionPlan, plan: plan, setUserSubscriptionPlan: setUserSubscriptionPlan }, managerData ? 'personal_trainer' : 'user')
        try {
            const response = await fetch(BASE_URL + `/api/exercises/plan/${planId}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Token ${userToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "days": daysItems[plan], "name": name, 'plan': plan, "manager_room": room, 'send_to_user': send_to_user })
            });
            const data = await response.json();

            setPlans(prevPlans => ({ ...prevPlans, [plan]: plans[plan].map(plan => plan.id === planId ? data : plan) }));
            if (response.ok) {
                setEdit(false);
            }
        } catch (error) {
            console.error('There was a problem with updating the plan: \n', error);
        }
    }
    const deleteTrainingPlan = async (training_id) => {
        try {
            const response = await fetch(BASE_URL + `/api/exercises/plan/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${userToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "plan": plan, "plan_id": training_id })
            });
            if (response.ok && response.status === 200) {
                setPlans(prevPlans => ({ ...prevPlans, [plan]: plans[plan].length > 1 ? plans[plan].filter(plan => plan.id !== training_id) : null }));
                setPlanId(plans[plan].length > 1 ? plans[plan].find(plan => plan.id !== training_id).id : null);
            }
        } catch (error) {
            console.error('There was a problem with updating the plan: \n', error);
        }
    }

    const GenerateWeekWorkoutPlan = async (requestBody, setError, onClose) => {
        try {
            const response = await fetch(BASE_URL + '/api/exercises/plan/', {
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
                if (requestBody.use_ai) {
                    Alert.alert(
                        "Success. Your workout plan has been generated successfully.",
                        "Be aware that this is a workout plan generated by AI and do not replace a professional support of a certified trainer.",
                        [{ text: "I Understand!", onPress: () => { } }], { cancelable: true },
                    )
                    setSelectedDay({ name: requestBody.workout_days[0], items: data.days[requestBody.workout_days[0]].items })
                }
                onClose();
                setUserSubscriptionPlan(prevUserSubscriptionPlan => ({
                    ...prevUserSubscriptionPlan,
                    update: true,
                    current_data: {
                        ...prevUserSubscriptionPlan.current_data,
                        settings: {
                            ...prevUserSubscriptionPlan.current_data.settings,
                            workout: {
                                ...prevUserSubscriptionPlan.current_data.settings.workout,
                                use_ai: prevUserSubscriptionPlan.current_data.settings.workout.use_ai - (requestBody.use_ai ? 1 : 0)
                            }
                        }
                    }
                }));
            } else {
                setError(true);
                throw new Error('Failed to generate exercises');
            }
        } catch (error) {
            setError(true);
            console.error('There was a problem with generating the week workout plan: \n', error);
            throw error;
        }
    };
    const GenerateWeekDietPlan = async (requestBody, setError, onClose) => {
        try {
            const response = await fetch(BASE_URL + '/api/exercises/plan/', {
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
                onClose();
                if (requestBody.use_ai) {
                    setSelectedDay({ name: requestBody.diet_days[0], items: data.days[requestBody.diet_days[0]].items })
                }
            } else {
                setError(true);
            }
        } catch (error) {
            setError(true);
            console.error('There was a problem with the generation of week diet plan: \n', error);
            throw error;
        }
    };

    const fetchPlans = async () => {
        try {
            const response = await fetch(BASE_URL + `/api/exercises/user-plans/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${userToken}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                setPlans(data.plans);
                if (!planId && data.plans[plan].length > 0) {
                    setPlanId(data.plans[plan][0].id);
                    setDaysItems(prevDays => ({
                        ...prevDays,
                        [plan]: data.plans[plan][0].days
                    }));
                }
                setUnavailableExercises(data.plans.unavailable_exercises);

                if (data.items.missing_exercises.length > 0) {
                    fetchManyExercises({ exercises_list: data.items.missing_exercises });
                }
                if (data.items.missing_foods.length > 0) {
                    fetchManyFoods();
                }
            }
        } catch (error) {
            console.error('There was a problem with fetching the plans: \n', error);
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
            console.error('There was a problem while updating the unavailable exercises: \n', error);
        }
    };
    const getAlternativeExercise = (dayName, muscleGroup, exercise, salt = 0) => {
        const all_exercises = Object.values(allItems[plan])
        const exercises_from_muscle = all_exercises.filter(exercise => exercise.item_groups.some(muscle => muscle === muscleGroup))
            .map(exercise => exercise.item_id)

        let not_selected_exercises = exercises_from_muscle.filter(e =>
            !Object.keys(daysItems[plan][dayName].items[muscleGroup]).includes(e)
        )

        if (not_selected_exercises.length < 20) {
            fetchManyExercises({ muscle_group: muscleGroup });
            not_selected_exercises = exercises_from_muscle.filter(e =>
                !Object.keys(daysItems[plan][dayName].items[muscleGroup]).includes(e)
            )
        }

        const exercise_index = (not_selected_exercises.indexOf(exercise) + 1 + salt) % not_selected_exercises.length;

        return not_selected_exercises.length > exercise_index ? not_selected_exercises[exercise_index] : false;
    };

    const addExercise = (dayName, muscleGroup, exerciseId, newExercise) => {
        if (!checkAvailableFeature('max_items_per_group', { userSubscriptionPlan: userSubscriptionPlan, plan: plan, setUpdatePlanModal: setUpdatePlanModal, daysItems: daysItems, dayName: dayName, muscleGroup: muscleGroup }, managerData ? 'personal_trainer' : 'user')) return;

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

        if (replace) {
            if (!checkAvailableFeature('items_alternatives', { userSubscriptionPlan: userSubscriptionPlan, plan: plan, setUpdatePlanModal: setUpdatePlanModal }, managerData ? 'personal_trainer' : 'user')) return;
            checkAvailableFeature('items_alternatives_updated', { userSubscriptionPlan: userSubscriptionPlan, plan: plan, daysItems: daysItems, dayName: dayName }, managerData ? 'personal_trainer' : 'user');
            setUserSubscriptionPlan(prevUserSubscriptionPlan => ({
                ...prevUserSubscriptionPlan,
                update: true,
                current_data: {
                    ...prevUserSubscriptionPlan.current_data,
                    settings: {
                        ...prevUserSubscriptionPlan.current_data.settings,
                        workout: {
                            ...prevUserSubscriptionPlan.current_data.settings.workout,
                            items_alternatives: [
                                userSubscriptionPlan.current_data.settings.workout.items_alternatives[0],
                                userSubscriptionPlan.current_data.settings.workout.items_alternatives[1] + 1,
                                userSubscriptionPlan.current_data.settings.workout.items_alternatives[2],
                            ]
                        }
                    }
                }
            }))
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
        if (!checkAvailableFeature('max_groups_per_day', { userSubscriptionPlan: userSubscriptionPlan, plan: plan, setUpdatePlanModal: setUpdatePlanModal, daysItems: daysItems, dayName: dayName }, managerData ? 'personal_trainer' : 'user')) return;

        if (Object.keys(daysItems[plan][dayName].items).length === 0) {
            if (!daysItems[plan][dayName] || !daysItems[plan][dayName].items) {
                console.error(`Day: ${dayName} not found.`);
                return;
            }
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
                        "item_groups": Object.values(meal_groups).filter(group => meals.includes(group))
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
    const ManagerSubscriptionPlansModal = () => {
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={true}
                onRequestClose={() => { setUpdatePlanModal(false); }}
            >
                <SubscriptionPlansModal userToken={userToken}
                    subscriptionTexts={{ button_text: "Update Plan" }}
                    object={{ mode: 'app' }}
                    patternMode='subscription'
                    confirmedSubscription={setConfirmedSubscription}
                />
            </Modal>
        );
    };

    useEffect(() => {
        if (!managerData) {
            fetchPlans();
        }

        if (!personal) {
            setPersonal(route.params && route.params.personalTrainer);
        }
    }, [route]);

    useEffect(() => {
        setUpdatePlanModal(false);
        if (confirmedSubscription && confirmedSubscription.current_data && confirmedSubscription.current_data.settings) {
            setUserSubscriptionPlan(confirmedSubscription);
        }
        fetchPlans();
    }, [confirmedSubscription]);

    useEffect(() => {
        if (managerData) {
            if (managerData.mode && managerData.mode === 'user') {
                const found_plan = plans[managerData.plan].find(plan => plan.id === managerData.plan_id)
                if (!found_plan) {
                    Alert.alert('Error', 'We got an error, please try again.');
                    fetchPlans();
                    return;
                }
                setDaysItems(prevDays => ({
                    ...prevDays,
                    [managerData.plan]: found_plan.days
                }));
                setPlan(managerData.plan);
                setPlanId(managerData.plan_id);
                setManagerData(null);
            } else {
                setPlans(managerData.plans);
                setPlanId(managerData.plans[managerData.plan] ? managerData.plans[managerData.plan][0].id : null);
                setPlan(managerData.plan);
                if (managerData.plans[managerData.plan]) {
                    setDaysItems(prevDays => ({
                        ...prevDays,
                        [managerData.plan]: managerData.plans[managerData.plan][0].days
                    }));
                }
            }
        }
    }, [managerData]);

    useEffect(() => {
        if (planId && plans[plan]) {
            const selectedPlan = plans[plan].find(plan => plan.id === planId);
            const newDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].find(day => !selectedPlan.days[day].rest) || 'Sun';
            setSelectedDay({ name: newDay, items: selectedPlan.days[newDay] });
        } else {
            setPlans(prevPlans => ({
                ...prevPlans,
                [plan]: []
            }));
        }
    }, [planId]);

    useEffect(() => {
        if (daysItems[plan] && plans[plan]) {
            let missing_exercises = [];
            let missing_exercises_images = [];
            for (const day of Object.keys(daysItems[plan])) {
                for (const muscleGroup of Object.keys(daysItems[plan][day].items)) {
                    for (const exercise of Object.keys(daysItems[plan][day].items[muscleGroup])) {
                        if (!allItems[plan] || !allItems[plan][exercise]) {
                            fetchData("exercise_" + exercise)
                                .then((exercise_data) => {
                                    if (exercise_data) {
                                        setAllItems(prevItems => ({ ...prevItems, [plan]: { ...prevItems[plan], [exercise]: exercise_data } }));
                                        if (exercise_data.execution_images && exercise_data.execution_images.length > 0) {
                                            fetchData("exercise_image_" + exercise_data.execution_images[0].image_name)
                                                .then((image_data) => {
                                                    if (!image_data) {
                                                        missing_exercises_images.push(exercise);
                                                    }
                                                })
                                        }
                                    } else {
                                        missing_exercises.push(exercise);
                                    }
                                })
                                .catch((error) => console.error('There was a problem with fetching the exercise: \n', error));
                        }
                    }
                }
            }

            setTimeout(() => {
                if (missing_exercises.length > 0) {
                    fetchManyExercises({ exercises_list: missing_exercises });
                } else if (missing_exercises_images.length > 0) {
                    fetchManyExercisesImages(missing_exercises_images);
                }
            }, 2000);
        }

    }, [daysItems]);

    useEffect(() => {
        if (addNewMuscleGroup) {
            setAddNewMuscleGroup(false);
        }
    }, [selectedDay]);

    const trainCompleted = verifyAllExercisesDone(plan, selectedDay ? selectedDay.name : 'Sun');
    const fit_plans = [{ plan_id: 'workout', plan_name: 'Workout' }, { plan_id: 'diet', plan_name: 'Diet' }, { plan_id: 'management', plan_name: 'Management' }];

    const selectedPlan = plans[plan] && plans[plan][0] && plans[plan].find(plan => plan.id === planId);

    return (
        <View style={styles.container}>
            <GradientBackground firstColor="#1A202C" secondColor={personal ? "#1A202C" : managerData ? "#888" : "#991B1B"} thirdColor="#1A202C" />

            <NewTrainingModal plan={plan} newTrainingModal={newTrainingModal} setNewTrainingModal={setNewTrainingModal} GenerateWeekWorkoutPlan={GenerateWeekWorkoutPlan} GenerateWeekDietPlan={GenerateWeekDietPlan} userSubscriptionPlan={userSubscriptionPlan} setUpdatePlanModal={setUpdatePlanModal} plansLength={plans[plan] ? plans[plan].length : 0} room={managerData && managerData.room} mode={managerData ? 'personal_trainer' : 'user'} />
            {selectedPlan && <>
                <SettingsModal planId={planId} plan={plan} plans={plans} settings={setting} setSettings={setSettings} removeTrainingPlan={removeTrainingPlan} setPlans={setPlans} updatePlans={updatePlans} />
                <NewFoodModal newFoodModal={newFoodModal} setNewFoodModal={setNewFoodModal} createFood={createFood} userSubscriptionPlan={userSubscriptionPlan} />
            </>}

            <ScrollView
                style={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                overScrollMode="never"
            >

                <View style={styles.sectionContainer}>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {managerData && managerData.user && <View style={{ top: 5 }}><UsersBall user={managerData.user} size={0.6} /></View>}
                        <Text style={styles.sectionTitle}>Fitness Plan</Text>
                    </View>

                    <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                        {fit_plans.map((planOption, index) => {
                            return <Tabs
                                key={index}
                                index={index}
                                name={planOption.plan_name}
                                setSelectedTab={() => {
                                    if (planOption.plan_id === 'management') {
                                        setPersonal(true);
                                    } else {
                                        setPersonal(false);
                                        setPlan(planOption.plan_id);
                                        if (plans[planOption.plan_id] && plans[planOption.plan_id].length) {
                                            setPlanId(plans[planOption.plan_id][0].id);
                                            setDaysItems(prevDays => ({
                                                ...prevDays,
                                                [planOption.plan_id]: plans[planOption.plan_id][0].days
                                            }));
                                        }
                                    }
                                }}
                                isSelected={(plan === planOption.plan_id && !personal) || (planOption.plan_id === 'management' && personal)}
                                len={fit_plans.length}
                                TabSize={width * 0.89 / fit_plans.length * 0.8}
                            />
                        })}
                    </View>

                    {personal ? <PersonalManagementPaste navigation={navigation} userToken={userToken} personal={personal} setPersonal={setPersonal} setManagerData={setManagerData} />
                        : <>

                            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                                {selectedPlan && plans[plan] && plans[plan].map((tabPlan, index) =>
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

                                {selectedPlan && <TouchableOpacity style={{ position: 'absolute', right: 2, top: 8, alignItems: 'center', justifyContent: 'center', padding: 6, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.5)' }} onPress={() => {
                                    setSettings(true);
                                }}>
                                    <Icons name="Edit" size={15} />
                                </TouchableOpacity>}
                            </View>

                            {selectedPlan && <>
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
                                                if (!checkAvailableFeature('access_other_days', { userSubscriptionPlan: userSubscriptionPlan, daysItems: daysItems, plan: plan, dayName: dayName, setUpdatePlanModal: setUpdatePlanModal }, managerData ? 'personal_trainer' : 'user')) return;
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
                                    {selectedDay && selectedPlan && Object.entries(daysItems[plan]).map(([dayName, dayInfo]) => {
                                        if (selectedDay.name === dayName.slice(0, 3)) {
                                            return (
                                                <View key={dayName}>
                                                    {Object.keys(dayInfo.items).length > 0 ? Object.entries(dayInfo.items).map(([muscleGroup, exercises_list]) => {
                                                        return <TrainingMember key={muscleGroup} online={online} plan={plan} dayName={dayName} muscleGroupName={(plan === "workout" ? muscle_groups[muscleGroup] : meal_groups[muscleGroup]).name} muscleGroup={muscleGroup}
                                                            exercises={
                                                                Object.entries(exercises_list).map(([exerciseId, exerciseDetails]) => {
                                                                    if (!allItems[plan] || !allItems[plan][exerciseId]) return;
                                                                    return { ...exerciseDetails, item_id: exerciseId, title: allItems[plan][exerciseId].title }
                                                                }).filter(Boolean)
                                                            }
                                                            allExercises={
                                                                allItems[plan] ?
                                                                    Object.values(allItems[plan])
                                                                        .filter(exercise => {
                                                                            return exercise.item_groups.some(group => group === muscleGroup)
                                                                        }) : []
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
                                                            fetchManyExercises={fetchManyExercises}
                                                            fetchManyFoods={fetchManyFoods}
                                                            mode={managerData ? 'personal_trainer' : 'user'}
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
                                        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{trainCompleted ? "Workout Incomplete" : "Workout Complete"}</Text>
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
                                        if (managerData) {
                                            setPlanId(null);
                                            setManagerData(null);
                                        }
                                        updatePlans({});
                                    }}>
                                        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{plan === 'workout' ? "Save Workout" : "Save Diet"}</Text>
                                    </TouchableOpacity>
                                </View>}
                            </>}

                            {(!managerData || (managerData && (!plans[plan] || (plans[plan] && plans[plan].length === 0)))) &&
                                <TouchableOpacity style={[styles.trainCompleteButton, { backgroundColor: '#6495ED', marginTop: 5 }]} onPress={() => {
                                    setNewTrainingModal(true);
                                }}>
                                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{plan === "workout" ? "New Workout Plan" : "New Diet Plan"}</Text>
                                </TouchableOpacity>}

                            {managerData ? (
                                <>
                                    {selectedPlan && !selectedPlan.user_access &&
                                        <TouchableOpacity style={[styles.trainCompleteButton, { backgroundColor: '#4CAF50', marginTop: 5 }]} onPress={() => {
                                            setPlanId(null);
                                            setManagerData(null);
                                            updatePlans({ send_to_user: true });
                                        }}>
                                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{edit ? "Save and Notify User" : "Send to User"}</Text>
                                        </TouchableOpacity>
                                    }
                                    <TouchableOpacity style={[styles.trainCompleteButton, { backgroundColor: '#F44336', marginTop: 5 }]} onPress={() => {
                                        setPlanId(null);
                                        setManagerData(null);
                                        fetchPlans();
                                    }}>
                                        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Exit Manager Mode</Text>
                                    </TouchableOpacity>
                                </>
                            ) :
                                updatePlanModal ? <ManagerSubscriptionPlansModal /> : <SubscriptionPlansModal userToken={userToken}
                                    subscriptionTexts={{ button_text: "Update Plan" }}
                                    object={{ mode: 'app' }}
                                    patternMode='none'
                                    confirmedSubscription={setConfirmedSubscription}
                                />
                            }
                        </>}


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
        marginLeft: 10,
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
    searchInputContainer: {
        width: width * 0.5,
        height: width * 0.07,
        borderRadius: 5,
        backgroundColor: '#ddd',
        paddingHorizontal: 10,
        margin: width * 0.01,
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchInput: {
        width: '85%',
        color: '#000',
        fontWeight: 'bold',
        marginLeft: 10,
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

export default FitnessScreen;