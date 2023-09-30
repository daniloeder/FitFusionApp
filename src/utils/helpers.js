export function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
  
  export function formatTime(dateString) {
    return new Date(dateString).toLocaleTimeString();
  }
  