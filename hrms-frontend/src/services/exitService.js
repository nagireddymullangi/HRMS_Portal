// src/services/exitService.js
import api from '../api/axiosConfig';

const exitService = {
  getAll: () => api.get('/employee-exits'),
  getById: (id) => api.get(`/employee-exits/${id}`),
  getByEmployee: (empId) => api.get(`/employee-exits/employee/${empId}`),
  initiate: (data) => api.post('/employee-exits', data),
  update: (id, data) => api.put(`/employee-exits/${id}`, data),
  approve: (id) => api.patch(`/employee-exits/${id}/approve`),
  cancel: (id) => api.delete(`/employee-exits/${id}`),
};
export default exitService;