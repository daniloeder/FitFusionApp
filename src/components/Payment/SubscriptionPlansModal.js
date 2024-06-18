import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Modal, Alert, ActivityIndicator, Dimensions, TextInput } from 'react-native';
import StripePayment from './StripePayment';
import PayPalPayment from './PaypalPayment';
import SelectBox from '../Tools/SelectBox';
import Icons from '../Icons/Icons';
import { BASE_URL } from '@env';

const width = Dimensions.get('window').width;

const SubscriptionPlansModal = ({ userToken, currentPlanId, object, subscriptionTexts, patternMode = 'see', table = false, confirmedSubscription }) => {

    const [subscriptionPlansOptions, setSubscriptionPlansOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState(patternMode);
    const [updatePlanModal, setUpdatePlanModal] = useState(patternMode === 'subscription' ? true : false);

    const [useCreditCard, setUseCreditCard] = useState(false);
    const [usePayPal, setUsePayPal] = useState(false);

    const [completedPaymentData, setCompletedPaymentData] = useState(null);

    const fetchSubscriptionPlans = async (endpoint) => {
        setLoading(true);
        try {
            const response = await fetch(BASE_URL + endpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${userToken}`,
                },
            });
            const data = await response.json();

            if (response.ok) {
                if (data.length) {
                    setSubscriptionPlansOptions(data);
                } else {
                    Alert.alert('Error', 'There are no subscription plans available.');
                    setUpdatePlanModal(false);
                }
            }
        } catch (error) {
            console.error('There was a problem with the fetch subscription plans request.', error);
        }
        setLoading(false);
    }
    const updateSubscriptionData = async (planData) => {
        setLoading(true);
        try {
            const response = await fetch(BASE_URL + `/api/payments/manage-subscription-plan/${object ? '?' + object.obj_key + '=' + object.obj_id : ''}`, {
                method: planData.is_new ? 'POST' : (planData.delete ? 'DELETE' : 'PUT'),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${userToken}`
                },
                body: JSON.stringify(planData)
            });
            const data = await response.json();
            setEdit(false);
            setPlans([]);
            if (response.ok) {
                if (planData.delete) {
                    setSubscriptionPlansOptions([
                        ...subscriptionPlansOptions.filter(plan => plan.id !== planData.id)
                    ]);
                } else {
                    setSubscriptionPlansOptions([
                        data,
                        ...subscriptionPlansOptions.filter(plan => plan.id !== planData.id)
                    ]);
                }
            }
        } catch (error) {
            console.error('There was a problem with update operation:', error);
        }
        setLoading(false);
    }
    const confirmSubscriptionPlan = async () => {
        try {
            const response = await fetch(BASE_URL + `/api/payments/confirm-subscription-plan/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${userToken}`
                },
                body: JSON.stringify(
                    useCreditCard || usePayPal ? completedPaymentData : { plan_id: subscriptionPlan.id }
                )
            });
            const data = await response.json();
            if (response.ok) {
                setUpdatePlanModal(false);
                Alert.alert('Success', 'Your subscription plan has been updated!', [{ text: "Ok", onPress: () => { } }], { cancelable: true });
                if (confirmedSubscription) {
                    confirmedSubscription(data)
                }
            }
        } catch (error) {
            console.error('There was a problem with subscription plan confirmation:', error);
        }
    }

    useEffect(() => {
        if (object.get_id && (object.get_id.length !== subscriptionPlansOptions.length || object.get_id.some(id => !subscriptionPlansOptions.find(sub_plan => sub_plan.id === id)))) {
            if (!object.plans_in || object.get_id.some(id => !object.plans_in.find(sub_plan => sub_plan.id === id))) {
                fetchSubscriptionPlans(`/api/payments/plans/${object ? '?' + object.get_key + '=' + object.get_id.join(',') : ''}`);
            } else {
                setSubscriptionPlansOptions(object.plans_in);
            }
        } else if (object.mode && object.mode === 'app' && !loading && subscriptionPlansOptions.length === 0) {
            fetchSubscriptionPlans(`/api/payments/plans/?mode=app`);
        }
    }, [object]);

    useEffect(() => {
        if (completedPaymentData) {
            confirmSubscriptionPlan();
            setUseCreditCard(false);
            setPlans([]);
            setCompletedPaymentData(null);
        }
    }, [completedPaymentData]);

    const [edit, setEdit] = useState(false);
    const [status, setStatus] = useState('plans');

    const allPlans = subscriptionPlansOptions.filter(plan => {
        return (mode === 'manager') || currentPlanId !== plan.id
    }).map(plan => plan.id);
    const allPlansNames = subscriptionPlansOptions.reduce((obj, plan) => {
        obj[plan.id] = plan.name;
        return obj;
    }, {});

    const [plans, setPlans] = useState([]);
    const subscriptionPlan = plans.length ? subscriptionPlansOptions.find(plan => plan.id === plans[0]) : undefined;

    const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#B2FF59', '#00FF00'];
    const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'SEK', 'NZD', 'NOK', 'BRL'];
    const plans_periods = { 'dayly': 'Dayly', 'weekly': 'Weekly', 'monthly': 'Monthly', 'quarterly': 'Quarterly', 'semesterly': 'Semesterly', 'yearly': 'Yearly' };

    const onClose = () => {
        setStatus('plans');
        setUseCreditCard(false);
        setUpdatePlanModal(false);
        setPlans([]);
        setEdit(false);
        if (patternMode !== 'manager') {
            setMode('see');
        }
    };
    const PricePlanTable = ({ options }) => {

        const styles = StyleSheet.create({
            tableContainer: {
                marginVertical: 10,
                flexWrap: 'wrap',
            },
            tableColumn: {
                width: '98%',
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
            planHead: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-evenly',
                flexWrap: 'wrap',
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
            planBenefits: {
                flexDirection: 'row',
                flexWrap: 'wrap',
                marginTop: 5,
                padding: 2,
                borderRadius: 8,
                backgroundColor: '#ccc',
            },
            planBenefit: {
                fontSize: 10,
                padding: 2,
                borderRadius: 4,
                backgroundColor: '#555',
                fontWeight: 'bold',
                margin: 2,
            },
            commentSection: {
                padding: 2,
                borderRadius: 3,
                backgroundColor: '#aaa',
                marginTop: 5,
            },
        });

        return (
            <View style={styles.tableContainer}>
                {options.map((plan, index) => {
                    return (
                        <View key={index} style={styles.tableColumn}>
                            <View style={styles.planHead}>
                                <Text style={styles.planTitle}>{plan.name}</Text>
                                <Text style={styles.planPrice}>${plan.price} {plan.currency}</Text>
                                <Text style={styles.planPrice}>{plans_periods[plan.period]}</Text>
                            </View>
                            {plan.details && plan.details.features.benefits && plan.details.features.benefits.length > 0 && <View style={styles.planBenefits}>
                                {plan.details.features.benefits.map((benefit, index) => {
                                    return (
                                        <Text key={index} style={[styles.planBenefit, { color: colors[benefit[0]] }]}>
                                            ✓ {benefit[1]}
                                        </Text>
                                    )
                                })}
                            </View>}
                            {false && plan.details && plan.details.features.comment.length > 0 && <View style={styles.commentSection}>
                                <Text style={{ fontSize: 10, color: '#FFF' }}>{plan.details.features.comment}</Text>
                            </View>}
                            {currentPlanId === plan.id && <Text style={{ alignSelf: 'center', fontWeight: 'bold', fontSize: 13, color: '#888' }}>Current</Text>}
                        </View>
                    )
                })}
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
            width: mode === 'subscribe' ? '90%' : '100%',
            backgroundColor: '#ddd',
            borderRadius: 10,
            padding: 10,
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
        editingPlanName: {
            flex: 1,
            padding: 2,
            fontSize: 12,
            backgroundColor: '#fff',
            borderRadius: 5,
            paddingLeft: 10,
        },
    });

    const EditPlan = ({ plan }) => {
        const [newPlan, setNewPlan] = useState(plan);

        const [editOptions, setEditOptions] = useState(undefined);

        if (!newPlan) return;

        return (
            <View style={{ width: '100%', backgroundColor: '#ccc', padding: 5, borderRadius: 5 }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#000' }}>Plan Name:</Text>
                <TextInput
                    style={styles.editingPlanName}
                    placeholder="Plan Name"
                    defaultValue={newPlan.name}
                    onChangeText={(text) => setNewPlan({
                        ...newPlan,
                        name: text
                    })}
                />

                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#000' }}>Currency:</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-start' }}>
                    {currencies.map((currency, index) => {
                        return (
                            <TouchableOpacity key={index} style={{ backgroundColor: currency === newPlan.currency ? '#000' : '#FFF', height: 30, width: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginHorizontal: 5, marginTop: 3 }}
                                onPress={() => setNewPlan({
                                    ...newPlan,
                                    currency: currencies[index]
                                })}
                            >
                                <Text style={{ color: currency === newPlan.currency ? '#FFF' : '#000', fontSize: 10, fontWeight: 'bold' }}>{currency}</Text>
                            </TouchableOpacity>
                        )
                    })}
                </View>

                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#000' }}>Price:</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TextInput
                        placeholder="Price"
                        keyboardType="numeric"
                        style={[styles.editingPlanName, { maxWidth: width * 0.2, marginRight: 10 }]}
                        defaultValue={String(newPlan.price || '')}
                        onChangeText={text => {
                            setNewPlan({
                                ...newPlan,
                                price: parseInt(text * 100) / 100 || 0
                            })
                        }}
                    />
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#000', marginRight: 10 }}>{newPlan.currency} {newPlan.price}</Text>
                </View>

                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#000' }}>Plan Period:</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                    {Object.keys(plans_periods).map((period, index) => {
                        return (
                            <TouchableOpacity key={index} style={{ backgroundColor: period === newPlan.period ? '#000' : '#FFF', padding: 5, borderRadius: 4, justifyContent: 'center', alignItems: 'center', marginHorizontal: 5, marginTop: 3 }}
                                onPress={() => setNewPlan({
                                    ...newPlan,
                                    period: period
                                })}
                            >
                                <Text style={{ color: period === newPlan.period ? '#FFF' : '#000', fontSize: 10, fontWeight: 'bold' }}>{plans_periods[period]}</Text>
                            </TouchableOpacity>
                        )
                    })}
                </View>

                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#000' }}>Benefits:</Text>
                <View>
                    {newPlan.details.features.benefits && newPlan.details.features.benefits.map((benefit, index) => {
                        return (
                            <View key={index}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', margin: 1 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                        <TouchableOpacity style={{ backgroundColor: colors[benefit[0]], height: 30, width: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 5 }} onPress={() => setEditOptions(index)}>
                                            <Text style={{ color: '#000', fontSize: 10, fontWeight: 'bold' }}>{benefit[0] + 1}</Text>
                                        </TouchableOpacity>
                                        {editOptions === index && <View style={{ flexDirection: 'row', position: 'absolute', backgroundColor: '#ddd', zIndex: 2, left: 40, borderRadius: 5, padding: 2 }}>
                                            {[...Array(5).keys()].map((i) => {
                                                return (
                                                    <TouchableOpacity key={i} style={{ backgroundColor: colors[i], height: 25, width: 25, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 5 }}
                                                        onPress={() => {
                                                            setNewPlan({
                                                                ...newPlan,
                                                                details: {
                                                                    ...newPlan.details,
                                                                    features: {
                                                                        ...newPlan.details.features,
                                                                        benefits: newPlan.details.features.benefits.map((benefit, j) => j === index ? [i, benefit[1]] : benefit)
                                                                    }
                                                                }
                                                            });
                                                            setEditOptions(undefined);
                                                        }}
                                                    >
                                                        <Text style={{ color: '#000', fontSize: 10, fontWeight: 'bold' }}>{i + 1}</Text>
                                                    </TouchableOpacity>
                                                )
                                            })}
                                        </View>}
                                    </View>
                                    <TextInput
                                        style={styles.editingPlanName}
                                        placeholder="Benefit"
                                        defaultValue={newPlan.details.features.benefits[index][1]}
                                        onChangeText={(text) => setNewPlan({
                                            ...newPlan,
                                            details: {
                                                ...newPlan.details,
                                                features: {
                                                    ...newPlan.details.features,
                                                    benefits: newPlan.details.features.benefits.map((benefit, i) => i === index ? [benefit[0], text] : benefit)
                                                }
                                            }
                                        })}
                                    />
                                    <TouchableOpacity style={{ backgroundColor: '#FF0000', height: 20, width: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: 5 }} onPress={() => {
                                        setNewPlan({
                                            ...newPlan,
                                            details: {
                                                ...newPlan.details,
                                                features: {
                                                    ...newPlan.details.features,
                                                    benefits: newPlan.details.features.benefits.filter((_, i) => i !== index)
                                                }
                                            }
                                        });
                                    }}>
                                        <Icons name="CloseX" size={15} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )
                    })}
                    <TouchableOpacity style={{ backgroundColor: '#000', width: '50%', height: 30, marginLeft: '25%', alignItems: 'center', justifyContent: 'center', borderRadius: 5, marginVertical: 3 }} onPress={() => {
                        setNewPlan({
                            ...newPlan,
                            details: {
                                ...newPlan.details,
                                features: {
                                    ...newPlan.details.features,
                                    benefits: [...newPlan.details.features.benefits, [4, ""]]
                                }
                            }
                        });
                    }}>
                        <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>Add Benefit</Text>
                    </TouchableOpacity>
                </View>

                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#000' }}>Comment:</Text>
                <TextInput
                    style={styles.editingPlanName}
                    placeholder="Comment"
                    defaultValue={newPlan.details.features.comment}
                    onChangeText={(text) => setNewPlan({
                        ...newPlan,
                        details: {
                            ...newPlan.details,
                            features: {
                                ...newPlan.details.features,
                                comment: text
                            }
                        }
                    })}
                />

                <View style={{ flexDirection: 'row', width: '100%', flexWrap: 'wrap' }}>
                    <TouchableOpacity style={{ backgroundColor: '#FFF', width: '49%', height: 30, borderRadius: 5, justifyContent: 'center', alignItems: 'center', marginTop: 5 }} onPress={() => {
                        setPlans([]);
                        setEdit(false);
                        if (newPlan.id === 0) {
                            setSubscriptionPlansOptions(subscriptionPlansOptions.filter(plan => plan.id > 0))
                        }
                    }}>
                        <Text style={{ color: '#000', fontWeight: 'bold' }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ backgroundColor: '#000', width: '49%', marginLeft: '2%', height: 30, borderRadius: 5, justifyContent: 'center', alignItems: 'center', marginTop: 5 }} onPress={() => {
                        updateSubscriptionData(newPlan);
                    }}>
                        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ backgroundColor: '#FF0000', width: '100%', height: 30, borderRadius: 5, justifyContent: 'center', alignItems: 'center', marginTop: 5 }} onPress={() => {
                        Alert.alert('Delete Plan', 'Are you sure you want to delete this plan?', [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Delete', onPress: () => updateSubscriptionData({ ...newPlan, delete: true }) }
                        ]);
                    }}>
                        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View >
        )
    }

    useEffect(() => {
        if (useCreditCard) {
            setUseCreditCard(plans.length > 0);
        }
    }, [plans])

    useEffect(() => {
        if (!updatePlanModal) {
            onClose();
        }
    }, [updatePlanModal]);

    if (table && subscriptionPlansOptions) return <PricePlanTable options={subscriptionPlansOptions} />;

    const PlansBody = () =>
        <View style={styles.section}>
            <Text style={styles.title}>{mode !== 'subscription' ? "Plans" : "Upgrade Plans"}</Text>
            {
                loading ?
                    <ActivityIndicator size="large" color="#000" />
                    : status === 'plans' ? (
                        edit && mode === 'manager' ? (
                            subscriptionPlan ? <EditPlan plan={subscriptionPlan} />
                                : <>
                                    {allPlans.length > 0 &&
                                        <SelectBox
                                            title={"Select a Plan to Edit:"}
                                            max={1}
                                            allOptions={allPlans}
                                            allOptionsNames={allPlansNames}
                                            selectedOptions={plans}
                                            setSelectedItem={setPlans}
                                        />}
                                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#000', marginTop: 10 }}>Or add new plan:</Text>
                                    <TouchableOpacity style={styles.confirmButton} onPress={() => {
                                        setSubscriptionPlansOptions([
                                            {
                                                "id": 0,
                                                "is_new": true,
                                                "name": "Plan Name",
                                                "price": "0",
                                                "currency": "USD",
                                                "details": {
                                                    "features": {
                                                        "benefits": [[2, "Edit Benefits Here"]],
                                                        "comment": "This is the comment"
                                                    },
                                                },
                                                "event": null,
                                                "period": "monthly",
                                                "place": null,
                                            },
                                            ...subscriptionPlansOptions
                                        ])
                                        setPlans([0]);
                                    }}>
                                        <Text style={styles.confirmButtonText}>Add New Plan</Text>
                                    </TouchableOpacity>
                                </>
                        ) : (
                            <View>
                                <PricePlanTable options={subscriptionPlansOptions} />
                                {mode === 'subscription' &&
                                    <SelectBox
                                        title={"Select a Plan:"}
                                        max={1}
                                        allOptions={allPlans}
                                        allOptionsNames={allPlansNames}
                                        selectedOptions={plans}
                                        setSelectedItem={setPlans}
                                    />
                                }
                                {mode !== 'see' && <TouchableOpacity style={styles.confirmButton} onPress={() => {
                                    if (mode === 'manager') {
                                        setEdit(true);
                                        setUpdatePlanModal(true);
                                    } else {
                                        if (plans.length > 0) {
                                            if (subscriptionPlan.price > 0) {
                                                setUsePayPal(true);
                                            } else {
                                                Alert.alert('Confirm Subscription Plan', 'Are you sure you want to subscribe to this plan?', [
                                                    { text: 'Cancel', style: 'cancel' },
                                                    { text: 'Confirm', onPress: () => confirmSubscriptionPlan() }
                                                ])
                                            }
                                        } else {
                                            Alert.alert('Error!', 'Please select a plan.');
                                        }
                                    }
                                }}>
                                    <Text style={styles.confirmButtonText}>{mode === 'manager' ? "Edit Plans" : "Pay Now"}</Text>
                                </TouchableOpacity>}

                                {mode === 'see' &&
                                    <TouchableOpacity style={{ width: '100%', height: 40, backgroundColor: '#000', padding: 5, borderRadius: 5, alignItems: 'center', justifyContent: 'center', marginTop: 15, borderWidth: 1, borderColor: '#FFF' }} onPress={() => {
                                        if (subscriptionTexts.alert_title) {
                                            Alert.alert(
                                                subscriptionTexts.alert_title, subscriptionTexts.alert_message,
                                                [
                                                    { text: 'Cancel', style: 'cancel' },
                                                    {
                                                        text: 'OK', onPress: () => {
                                                            setMode('subscription');
                                                            setUpdatePlanModal(true);
                                                        }
                                                    }])
                                        } else {
                                            setMode('subscription');
                                            setUpdatePlanModal(true);
                                        }
                                    }}>
                                        <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>{subscriptionTexts.button_text}</Text>
                                    </TouchableOpacity>
                                }

                                {subscriptionPlan && !completedPaymentData && <>
                                    {useCreditCard && <StripePayment userToken={userToken} amount={subscriptionPlan.price} currency={subscriptionPlan.currency} item={{ type: "plan", id: subscriptionPlan.id, extra: object && object.extra }} setCompletedPaymentData={setCompletedPaymentData} />}
                                    {usePayPal && <PayPalPayment userToken={userToken} amount={subscriptionPlan.price} currency={subscriptionPlan.currency} item={{ type: "plan", id: subscriptionPlan.id, extra: object && object.extra }} setCompletedPaymentData={setCompletedPaymentData} setUpdatePlanModal={setUpdatePlanModal} setUsePayPal={setUsePayPal} />}
                                </>}
                            </View>
                        )
                    ) : status === 'loading' ?
                        <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#0000ff" /></View>
                        : ''
            }
        </View>

    if (!updatePlanModal && patternMode === 'none') {
        return <TouchableOpacity style={[styles.trainCompleteButton, { backgroundColor: '#222', paddingVertical: 9, marginTop: 5, borderWidth: 0.4, borderRadius: 5, borderColor: '#999', alignItems: 'center' }]} onPress={() => {
            setUpdatePlanModal(true);
        }}>
            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Update Subscription</Text>
        </TouchableOpacity>
    }

    if (!updatePlanModal) return <PlansBody />;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={updatePlanModal}
            onRequestClose={onClose}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.container}>
                    <PlansBody />
                </View>
            </ScrollView>
        </Modal>
    )
};

export default SubscriptionPlansModal;