// src/services/authService.js
import api from '../api/axiosConfig';
import { API_ENDPOINTS } from '../utils/constants';

const authService = {

  // Login
  login: async (credentials) => {
    const response = await api.post(API_ENDPOINTS.LOGIN, credentials);
    return response.data;
  },

  // Register (Admin only)
  register: async (userData) => {
    const response = await api.post(API_ENDPOINTS.REGISTER, userData);
    return response.data;
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Check if logged in
  isLoggedIn: () => {
    return !!localStorage.getItem('token');
  },
};

export default authService;