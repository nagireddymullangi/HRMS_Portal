// src/services/leaveService.js
import api from '../api/axiosConfig';

const leaveService = {
  apply: (employeeId, data) =>
    api.post(`/leaves/apply/${employeeId}`, data),
  getById: (id) => api.get(`/leaves/${id}`),
  getByEmployee: (id) => api.get(`/leaves/employee/${id}`),
  getAll: () => api.get('/leaves/all'),
  getPending: () => api.get('/leaves/pending'),
  updateStatus: (id, data) => api.put(`/leaves/${id}/status`, data),
  delete: (id) => api.delete(`/leaves/${id}`),
  getLeaveTypes: () => api.get('/leaves/types'),
};
export default leaveService;