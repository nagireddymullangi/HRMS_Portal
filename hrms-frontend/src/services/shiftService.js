// src/services/shiftService.js
import api from '../api/axiosConfig';

const shiftService = {
  // Shifts
  getAll: () => api.get('/shifts'),
  create: (data) => api.post('/shifts', data),
  update: (id, data) => api.put(`/shifts/${id}`, data),
  delete: (id) => api.delete(`/shifts/${id}`),

  // Roster
  assign: (data) => api.post('/shifts/assign', data),
  getRoster: () => api.get('/shifts/roster'),

  // Overtime
  getAllOvertime: () => api.get('/shifts/overtime'),
  addOvertime: (data) => api.post('/shifts/overtime', data),
  approveOvertime: (id, status) =>
    api.patch(`/shifts/overtime/${id}?status=${status}`),
};

export default shiftService;