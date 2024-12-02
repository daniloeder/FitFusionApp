import { Alert } from 'react-native';

export const formatDate = (dateString) => {
  const messageDate = new Date(dateString);
  const now = new Date();

  // Check if the message was sent today
  const isToday = messageDate.getDate() === now.getDate() &&
    messageDate.getMonth() === now.getMonth() &&
    messageDate.getFullYear() === now.getFullYear();

  // Formatting options
  const timeOptions = { hour: '2-digit', minute: '2-digit' };
  const dateTimeOptions = { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' };

  // Format the date based on whether it was sent today or earlier
  if (isToday) {
    // If today, show only the time
    return new Intl.DateTimeFormat('default', timeOptions).format(messageDate);
  } else {
    // If not today, show the date and time
    return new Intl.DateTimeFormat('default', dateTimeOptions).format(messageDate);
  }
};

export function timeAgo(timestamp) {
  const currentDate = new Date();
  const pastDate = new Date(timestamp);

  const timeDifference = currentDate - pastDate;
  const seconds = Math.floor(timeDifference / 1000);

  if (seconds < 60) {
    return `${seconds + 1} second${seconds === 1 ? '' : 's'} ago`;
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
}

export const checkAvailableFeature = (feature, data, mode = 'any') => {
  if (feature === 'add_max_feed_images') {
    if (data.len >= data.userSubscriptionPlan.current_data.settings.add_max_feed_images) {
      Alert.alert('You need to upgrate to add more images.', `Max ${data.userSubscriptionPlan.current_data.settings.add_max_feed_images} images with "${data.userSubscriptionPlan.current_data.name}" plan.`,
        [{ text: 'Cancel', style: 'cancel' }, { text: 'Upgrade Plan', onPress: () => data.setUpdatePlanModal(true) }]
      );
      return false;
    }
  } else if (mode === 'user') {
    if (feature === 'create_new_plan' && (data.userSubscriptionPlan.current_data.settings[data.plan].max[0] && data.plansLength >= data.userSubscriptionPlan.current_data.settings[data.plan].max[1])) {
      Alert.alert('You need to upgrate to create a new plan.', `Max of ${data.userSubscriptionPlan.current_data.settings[data.plan].max[1]} plans with "${data.userSubscriptionPlan.current_data.name}" plan.`,
        [{ text: 'Cancel', style: 'cancel' }, { text: 'Upgrade Plan', onPress: () => data.setUpdatePlanModal(true) }]
      );
      return false;
    } else if (feature === 'access_other_days' && (Object.keys(data.daysItems[data.plan][data.dayName].items).length === 0 && Object.values(data.daysItems[data.plan]).filter(day => !day.rest).length >= data.userSubscriptionPlan.current_data.settings[data.plan].max_days)) {
      Alert.alert('You need to upgrate to access others days.', `Max ${data.userSubscriptionPlan.current_data.settings[data.plan].max_days} Days on this plan with "${data.userSubscriptionPlan.current_data.name}".`,
        [{
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Upgrade Plan',
          onPress: () => data.setUpdatePlanModal(true)
        }]
      );
      return false;
    } else if (feature === 'use_ai_plan_creation' && (data.userSubscriptionPlan.current_data.settings[data.plan].use_ai === 0)) {
      Alert.alert('You need to upgrate to continue to use AI.', 'Press Upgrade Plan to continue.',
        [{ text: 'Cancel', style: 'cancel' }, { text: 'Upgrade Plan', onPress: () => data.setUpdatePlanModal(true) }]
      );
      return false;
    } else if (feature === 'items_alternatives' && (!data.userSubscriptionPlan.current_data.settings[data.plan].items_alternatives[0] || (data.userSubscriptionPlan.current_data.settings[data.plan].items_alternatives[1] >= data.userSubscriptionPlan.current_data.settings[data.plan].items_alternatives[2]))) {
      Alert.alert('You need to upgrate to set new Alternatives.', `Max ${data.userSubscriptionPlan.current_data.settings[data.plan].items_alternatives[2]} Alternatives changes with "${data.userSubscriptionPlan.current_data.name}" plan.`,
        [{ text: 'Cancel', style: 'cancel' }, { text: 'Upgrade Plan', onPress: () => data.setUpdatePlanModal(true) }]);
      return false;
    } else if (feature === 'items_alternatives_updated') {
      Alert.alert('Alternative Updated!', `Max ${data.userSubscriptionPlan.current_data.settings[data.plan].items_alternatives[2] - data.userSubscriptionPlan.current_data.settings[data.plan].items_alternatives[1] - 1} Alternatives changes left with "${data.userSubscriptionPlan.current_data.name}" plan.`);
    } else if (feature === 'store_exercises_images' && !data.userSubscriptionPlan.current_data.settings[data.plan].store_exercises_images) {
      return false;
    }
  } else if (mode === 'personal_trainer') {
    console.log('Personal Trainer Mode')
  } else {
    console.log('Invalid mode', mode);
  }
  return true;
}