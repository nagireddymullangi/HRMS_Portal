// src/services/attendanceService.js
import api from '../api/axiosConfig';

const attendanceService = {
  mark: (data) => api.post('/attendance/mark', data),
  update: (id, data) => api.put(`/attendance/${id}`, data),
  getById: (id) => api.get(`/attendance/${id}`),
  getByEmployee: (id, params) =>
    api.get(`/attendance/employee/${id}`, { params }),
  getAll: (params) => api.get('/attendance/all', { params }),
  getSummary: (empId, month, year) =>
    api.get(`/attendance/summary/${empId}?month=${month}&year=${year}`),
  delete: (id) => api.delete(`/attendance/${id}`),
};
export default attendanceService;