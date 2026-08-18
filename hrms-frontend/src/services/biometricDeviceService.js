// src/services/biometricDeviceService.js
import api from '../api/axiosConfig';

const biometricDeviceService = {
  getAll: () => api.get('/biometric-devices'),
  getById: (id) => api.get(`/biometric-devices/${id}`),
  create: (data) => api.post('/biometric-devices', data),
  update: (id, data) => api.put(`/biometric-devices/${id}`, data),
  delete: (id) => api.delete(`/biometric-devices/${id}`),
  testConnection: (id) =>
    api.post(`/biometric-devices/${id}/test-connection`),
};

export default biometricDeviceService;