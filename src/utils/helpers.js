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
  return true;
}