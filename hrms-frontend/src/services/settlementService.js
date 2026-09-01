// src/services/settlementService.js
import api from '../api/axiosConfig';

const settlementService = {
  getAll: () => api.get('/settlements'),
  getById: (id) => api.get(`/settlements/${id}`),
  getByEmployee: (empId) => api.get(`/settlements/employee/${empId}`),
  getByStatus: (status) => api.get(`/settlements/status/${status}`),
  autoCalculate: (empId) => api.get(`/settlements/auto-calculate/${empId}`),
  create: (data) => api.post('/settlements', data),
  update: (id, data) => api.put(`/settlements/${id}`, data),
  delete: (id) => api.delete(`/settlements/${id}`),

  submit: (id) => api.patch(`/settlements/${id}/submit`),
  approve: (id) => api.patch(`/settlements/${id}/approve`),
  markPaid: (id, data) => api.patch(`/settlements/${id}/mark-paid`, data),
  putOnHold: (id, reason) => api.patch(`/settlements/${id}/hold`, { reason }),

  downloadPdf: (id) => api.get(`/settlements/${id}/pdf`,
    { responseType: 'blob' }),

  getStatistics: () => api.get('/settlements/statistics'),
};

export default settlementService;