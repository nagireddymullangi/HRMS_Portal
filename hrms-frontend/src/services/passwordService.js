// src/services/passwordService.js
import api from '../api/axiosConfig';

const passwordService = {
  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }),

  validateToken: (token) =>
    api.get(`/auth/validate-reset-token?token=${token}`),

  resetPassword: (data) =>
    api.post('/auth/reset-password', data),

  changePassword: (data) =>
    api.post('/auth/change-password', data),
};

export default passwordService;