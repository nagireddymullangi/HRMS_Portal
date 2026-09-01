// src/services/timesheetService.js
import api from '../api/axiosConfig';

const timesheetService = {
  getAll: () => api.get('/timesheets'),
  getById: (id) => api.get(`/timesheets/${id}`),
  getByEmployee: (empId, params) =>
    api.get(`/timesheets/employee/${empId}`, { params }),
  getByProject: (projectId) => api.get(`/timesheets/project/${projectId}`),
  getByStatus: (status) => api.get(`/timesheets/status/${status}`),
  create: (data) => api.post('/timesheets', data),
  update: (id, data) => api.put(`/timesheets/${id}`, data),
  delete: (id) => api.delete(`/timesheets/${id}`),

  submit: (id) => api.patch(`/timesheets/${id}/submit`),
  approve: (id) => api.patch(`/timesheets/${id}/approve`),
  reject: (id, reason) =>
    api.patch(`/timesheets/${id}/reject`, { reason }),
  submitBulk: (ids) => api.post('/timesheets/bulk/submit', ids),
  approveBulk: (ids) => api.post('/timesheets/bulk/approve', ids),

  getEmployeeStats: (empId) => api.get(`/timesheets/stats/employee/${empId}`),
  getProjectStats: (projectId) =>
    api.get(`/timesheets/stats/project/${projectId}`),
  getWeekly: (empId, weekStart) =>
    api.get(`/timesheets/weekly/${empId}?weekStart=${weekStart}`),
};

export default timesheetService;