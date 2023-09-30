import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

class AuthService {
  
  // Register a new user
  async register(username, password, email) {
    try {
      const response = await axios.post(`${API_URL}users/`, {
        username,
        password,
        email,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  // Login a user
  async login(username, password) {
    try {
      const response = await axios.post(`${API_URL}login/`, { // assuming there is a login endpoint
        username,
        password,
      });

      // Assuming token is received upon successful login
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Logout a user
  logout() {
    // Remove user from local storage to log user out
    localStorage.removeItem('user');
  }

  // Fetch current user details
  async getCurrentUser() {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) throw Error('User is not logged in');
      const response = await axios.get(`${API_URL}users/${user.id}/`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new AuthService();
