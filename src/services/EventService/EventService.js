import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

class EventService {

  // Create a new Event
  async createEvent(eventData) {
    try {
      const response = await axios.post(`${API_URL}events/`, eventData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get a list of all Events
  async getEvents() {
    try {
      const response = await axios.get(`${API_URL}events/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get details of a single Event
  async getEventDetails(eventId) {
    try {
      const response = await axios.get(`${API_URL}events/${eventId}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Update an Event
  async updateEvent(eventId, updateData) {
    try {
      const response = await axios.put(`${API_URL}events/${eventId}/`, updateData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Delete an Event
  async deleteEvent(eventId) {
    try {
      const response = await axios.delete(`${API_URL}events/${eventId}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new EventService();
