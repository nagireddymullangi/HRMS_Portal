// src/services/performanceService.js
import api from '../api/axiosConfig';

const performanceService = {
  // Cycles
  createCycle: (data) => api.post('/performance/cycles', data),
  getAllCycles: () => api.get('/performance/cycles'),
  updateCycleStatus: (id, status) =>
    api.patch(`/performance/cycles/${id}/status?status=${status}`),

  // KRAs
  createKra: (data) => api.post('/performance/kras', data),
  getKras: (empId, cycleId) =>
    api.get(`/performance/kras/${empId}/${cycleId}`),
  updateKra: (id, data) => api.put(`/performance/kras/${id}`, data),
  submitSelfReview: (id, data) =>
    api.post(`/performance/kras/${id}/self-review`, data),
  submitManagerReview: (id, data) =>
    api.post(`/performance/kras/${id}/manager-review`, data),

  // Summary
  getSummary: (empId, cycleId) =>
    api.get(`/performance/summary/${empId}/${cycleId}`),
};

export default performanceService;