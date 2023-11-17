import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, Dimensions, StyleSheet, Pressable, Switch, TouchableOpacity } from 'react-native';
import DatePicker from './DatePicker';
import Icons from '../Icons/Icons';

const width = Dimensions.get('window').width;

const RenderItem = ({ item, index, onRemoveDate, onChangeDate, onChangeOpenTime, onChangeCloseTime, onChangeOpen }) => {
    const [selectedDate, setSelectedDate] = useState(item.date);
    const [selectedOpenTime, setSelectedOpenTime] = useState(item.open_time);
    const [selectedCloseTime, setSelectedCloseTime] = useState(item.close_time);

    const handleDateChange = (newDate) => {
        setSelectedDate(newDate);
        onChangeDate(index, newDate);
    };

    const handleOpenTimeChange = (newTime) => {
        setSelectedOpenTime(newTime);
        onChangeOpenTime(index, newTime);
    };

    const handleCloseTimeChange = (newTime) => {
        setSelectedCloseTime(newTime);
        onChangeCloseTime(index, newTime);
    };

    const isDayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].includes(item.date);

    const handleOpenChange = (newValue) => {
        onChangeOpen(index, newValue);
    };


    return (
        <View style={[styles.renderItemContainer, { backgroundColor: item.open ? '#D4EFDF' : '#D6DBDF' }]}>
            <View style={styles.dateItemContainer}>
                {item.date === "" ? (
                    <DatePicker
                        showText={false}
                        date={selectedDate}
                        mode="date"
                        setDate={handleDateChange}
                        dateType="YYYY-MM-DD"
                        customStyle={item.open ? styles.datePickerStyle : styles.datePickerInactiveStyle}
                    />
                ) : (
                    <Text style={[styles.dateText, !item.open && styles.datePickerInactiveStyle]}>
                        {item.date === 'sun' ? "Sunday" :
                            item.date === 'mon' ? "Monday" :
                                item.date === 'tue' ? "Tuesday" :
                                    item.date === 'wed' ? "Wednesday" :
                                        item.date === 'thu' ? "Thursday" :
                                            item.date === 'fri' ? "Friday" :
                                                item.date === 'sat' ? "Saturday" :
                                                    item.date
                        }
                    </Text>

                )}
            </View>

            <View style={styles.pickerContainer}>
                <View style={styles.sectionContainer}>
                    <DatePicker
                        showText={false}
                        time={selectedOpenTime}
                        mode="time"
                        setTime={handleOpenTimeChange}
                        customStyle={item.open ? styles.timePickerStyle : styles.timePickerInactiveStyle}
                    />
                    <Text style={[styles.openCloseTimeText, !item.open && styles.datePickerInactiveStyle]}>
                        {item.open_time}
                    </Text>
                </View>
                <View style={styles.sectionContainer}>
                    <DatePicker
                        showText={false}
                        time={selectedCloseTime}
                        mode="time"
                        setTime={handleCloseTimeChange}
                        customStyle={item.open ? styles.timePickerStyle : styles.timePickerInactiveStyle}
                    />
                    <Text style={[styles.openCloseTimeText, !item.open && styles.datePickerInactiveStyle]}>
                        {item.close_time}
                    </Text>
                </View>
                <View style={styles.switchAndXContainer}>
                    <Switch
                        value={item.open}
                        onValueChange={handleOpenChange}
                        thumbColor={item.open ? '#007bff' : '#ccc'}
                        trackColor={{ false: '#767577', true: '#81b0ff' }}
                    />
                    {!isDayOfWeek ? (
                        <Pressable
                            onPress={() => onRemoveDate(index)}
                            style={styles.closeIconContainer}
                        >
                            <Icons name="CloseX" size={width * 0.08} />
                        </Pressable>
                    ) : null}
                </View>
            </View>
        </View>
    );
};

const OpenTimes = ({ dates, setDates, setSetOpenCloseTime, add = false, cancel = false }) => {
    const [selectedAllOpenTime, setSelectedAllOpenTime] = useState('');
    const [selectedAllCloseTime, setSelectedAllCloseTime] = useState('');

    useEffect(() => {
        const newDates = [];

        const daysOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

        daysOfWeek.forEach(day => {
            const dayData = dates[day];
            if (dayData) {
                newDates.push({
                    date: day,
                    open_time: dayData.open_time ? `${dayData.open_time}:00` : '',
                    close_time: dayData.close_time ? `${dayData.close_time}:00` : '',
                    open: dayData.open
                });
            } else {
                newDates.push({
                    date: day,
                    open_time: '',
                    close_time: '',
                    open: false
                });
            }
        });

        if (dates.custom && dates.custom.length > 0) {
            dates.custom.forEach(customDate => {
                newDates.push({
                    date: customDate.date,
                    open_time: customDate.open_time ? `${customDate.open_time}:00` : '',
                    close_time: customDate.close_time ? `${customDate.close_time}:00` : '',
                    open: customDate.open
                });
            });
        }

        setDates(newDates);
    }, []);

    useEffect(() => {
        if (selectedAllOpenTime) {
            const updatedDates = dates.map(item => ({ ...item, open_time: selectedAllOpenTime }));
            setDates(updatedDates);
        }
    }, [selectedAllOpenTime]);

    useEffect(() => {
        if (selectedAllCloseTime) {
            const updatedDates = dates.map(item => ({ ...item, close_time: selectedAllCloseTime }));
            setDates(updatedDates);
        }
    }, [selectedAllCloseTime]);

    const addDate = () => {
        const newDateObject = { date: "", open_time: null, close_time: null, open: false };
        setDates([...dates, newDateObject]);
    };

    const removeDate = (indexToRemove) => {
        setDates(dates.filter((_, index) => index !== indexToRemove));
    };

    const changeDateAtIndex = (index, newDate) => {
        const updatedDates = [...dates];
        updatedDates[index].date = newDate;
        setDates(updatedDates);
    };

    const changeOpenTimeAtIndex = (index, newTime) => {
        const updatedDates = [...dates];
        updatedDates[index].open_time = newTime;
        setDates(updatedDates);
    };

    const changeCloseTimeAtIndex = (index, newTime) => {
        const updatedDates = [...dates];
        updatedDates[index].close_time = newTime;
        setDates(updatedDates);
    };

    const changeOpenAtIndex = (index, newValue) => {
        const updatedDates = [...dates];
        updatedDates[index].open = newValue;
        setDates(updatedDates);
    }

    const Head = ({ title }) => <>
        <View style={styles.headerContainer}>
            <View style={styles.headerTextContainer}>
                <Text style={styles.dayText}>{title}</Text>
            </View>
            <View style={styles.sectionContainer}>
                <Text style={styles.timeHeader}>Open At</Text>
            </View>
            <View style={styles.sectionContainer}>
                <Text style={styles.timeHeader}>Close At</Text>
            </View>
        </View>
    </>

    if (!dates || !dates.length) return;

    return (
        <View style={styles.viewContainer}>
            <Text>Click on <Icons name="Watch" /> to select time:</Text>
            <Head title="Days" />
            {dates.slice(0, 7).map((date, index) => (
                <RenderItem
                    key={index}
                    item={date}
                    index={index}
                    onRemoveDate={removeDate}
                    onChangeDate={changeDateAtIndex}
                    onChangeOpenTime={changeOpenTimeAtIndex}
                    onChangeCloseTime={changeCloseTimeAtIndex}
                    onChangeOpen={changeOpenAtIndex}
                />
            ))}
            {dates.length > 7 && <Head title="Custom Days" />}
            {dates.slice(7).map((date, index) => (
                <RenderItem
                    key={index}
                    item={date}
                    index={index + 7}
                    onRemoveDate={removeDate}
                    onChangeDate={changeDateAtIndex}
                    onChangeOpenTime={changeOpenTimeAtIndex}
                    onChangeCloseTime={changeCloseTimeAtIndex}
                    onChangeOpen={changeOpenAtIndex}
                />
            ))}

            <View style={styles.pickAllContainer}>
                <View style={{ width: '32%' }}>
                    <Text style={styles.pickAllText}>Pick All:</Text>
                </View>
                <View style={{ width: '16%' }}>
                    <DatePicker
                        showText={false}
                        time={selectedAllOpenTime}
                        mode="time"
                        setTime={setSelectedAllOpenTime}
                        customStyle={styles.emptyString}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <DatePicker
                        showText={false}
                        time={selectedAllCloseTime}
                        mode="time"
                        setTime={setSelectedAllCloseTime}
                        customStyle={styles.datePickerCustomStyle}
                    />
                </View>
            </View>
            {add && dates.length < 20 &&
                <TouchableOpacity style={styles.addDateButton} onPress={addDate}>
                    <Text style={styles.addDateButtonText}>Add Date</Text>
                </TouchableOpacity>
            }
            {cancel &&
                <TouchableOpacity style={[styles.addDateButton, { alignSelf: 'flex-end', paddingHorizontal: width * 0.05 }]} onPress={()=>setSetOpenCloseTime(false)}>
                    <Text style={styles.addDateButtonText}>Cancel</Text>
                </TouchableOpacity>
            }

        </View>
    );
};

const styles = StyleSheet.create({
    renderItemContainer: {
        height: width * 0.1,
        marginVertical: 4,
        paddingHorizontal: width * 0.03,
        backgroundColor: '#D6EAF8',
        borderRadius: width * 0.02,
        shadowColor: '#ABB2B9',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    textContainer: {
        flex: 1,
        marginRight: width * 0.03,
    },
    dateText: {
        fontSize: width * 0.04,
        fontWeight: 'bold',
        color: '#3498DB',
    },
    openCloseTimeText: {
        fontSize: width * 0.04,
        fontWeight: 'bold',
        marginLeft: '5%',
        marginTop: width * 0.01,
        color: '#2ECC71',
    },
    pickerContainer: {
        flexDirection: 'row',
    },
    switchAndXContainer: {
        height: width * 0.1,
        position: 'absolute',
        right: -width * 0.02,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateItemContainer: {
        maxWidth: '33%',
        justifyContent: 'center',
        borderRadius: 5,
        marginVertical: width * 0.01,
    },
    timePickerStyle: {
        opacity: 1,
        borderLeftWidth: 1,
    },
    timePickerInactiveStyle: {
        opacity: 0.2,
        borderLeftWidth: 1,
    },
    removeButton: {
        width: width * 0.09,
        height: width * 0.09,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#95A5A6',
        padding: width * 0.01,
        borderRadius: width * 0.03,
    },

    viewContainer: {
        flex: 1,
        padding: width * 0.02,
        backgroundColor: 'rgba(248, 249, 249, 0.88)',
        marginVertical: width * 0.05,
        borderRadius: width * 0.015,
    },
    titleText: {
        fontSize: 20,
        marginBottom: 10,
        color: '#34495E',
    },
    headerContainer: {
        width: '100%',
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#D5D8DC',
    },
    headerTextContainer: {
        width: '35%',
    },
    headerText: {
        fontSize: width * 0.04,
        fontWeight: 'bold',
        color: '#34495E',
    },
    pickAllContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: width * 0.01,
    },
    datePickerCustomStyle: {
        marginLeft: '13%',
    },
    addDateButton: {
        marginTop: 10,
        backgroundColor: '#2980B9',
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 5,
    },
    addDateButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    timeHeader: {
        fontSize: width * 0.03,
        fontWeight: 'bold',
        color: '#34495E',
    },
    datePickerStyle: {
        opacity: 1,
    },
    datePickerInactiveStyle: {
        opacity: 0.2,
    },
    closeIconContainer: {
        width: width * 0.09,
        height: width * 0.09,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#95A5A6',
        padding: width * 0.01,
        borderRadius: width * 0.03,
    },
    emptyString: {},
    pickAllText: {
        fontSize: width * 0.05,
        fontWeight: 'bold',
        color: '#2ECC71',
    },
    sectionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '35%',
    },
    dayText: {
        fontSize: width * 0.04,
        fontWeight: 'bold',
        color: '#3498DB',
    },
});

export default OpenTimes;