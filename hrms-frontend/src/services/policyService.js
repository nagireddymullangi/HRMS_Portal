// src/services/policyService.js
import api from '../api/axiosConfig';

const policyService = {
  getAll: () => api.get('/policies'),
  getActive: () => api.get('/policies/active'),
  getById: (id) => api.get(`/policies/${id}`),
  getByCategory: (category) => api.get(`/policies/category/${category}`),
  getPending: (empId) => api.get(`/policies/pending/${empId}`),
  create: (data) => api.post('/policies', data),
  update: (id, data) => api.put(`/policies/${id}`, data),
  delete: (id) => api.delete(`/policies/${id}`),
  updateStatus: (id, status) =>
    api.patch(`/policies/${id}/status?status=${status}`),
  approve: (id) => api.patch(`/policies/${id}/approve`),

  acknowledge: (id, data) => api.post(`/policies/${id}/acknowledge`, data),
  getAcknowledgments: (id) => api.get(`/policies/${id}/acknowledgments`),

  getStatistics: () => api.get('/policies/statistics'),
  getComplianceReport: (id) => api.get(`/policies/${id}/compliance-report`),
};

export default policyService;