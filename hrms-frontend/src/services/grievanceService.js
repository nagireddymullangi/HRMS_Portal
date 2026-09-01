// src/services/grievanceService.js
import api from '../api/axiosConfig';

const grievanceService = {
  getAll: () => api.get('/grievances'),
  getById: (id) => api.get(`/grievances/${id}`),
  getByEmployee: (empId) => api.get(`/grievances/employee/${empId}`),
  getByStatus: (status) => api.get(`/grievances/status/${status}`),
  getMyAssigned: () => api.get('/grievances/assigned/me'),
  create: (data) => api.post('/grievances', data),

  updateStatus: (id, status) =>
    api.patch(`/grievances/${id}/status?status=${status}`),
  assign: (id, userId) =>
    api.patch(`/grievances/${id}/assign`, { userId }),
  resolve: (id, resolution) =>
    api.patch(`/grievances/${id}/resolve`, { resolution }),
  escalate: (id) => api.patch(`/grievances/${id}/escalate`),
  submitFeedback: (id, data) =>
    api.patch(`/grievances/${id}/feedback`, data),

  addComment: (id, data) => api.post(`/grievances/${id}/comments`, data),
  getComments: (id) => api.get(`/grievances/${id}/comments`),

  getStatistics: () => api.get('/grievances/statistics'),
};

export default grievanceService;