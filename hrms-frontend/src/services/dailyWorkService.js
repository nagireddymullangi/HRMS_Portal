// src/services/dailyWorkService.js
import api from '../api/axiosConfig';

const dailyWorkService = {
  // Assignments
  create: (data) => api.post('/daily-work/assignments', data),
  createBulk: (data) => api.post('/daily-work/assignments/bulk', data),
  update: (id, data) => api.put(`/daily-work/assignments/${id}`, data),
  getById: (id) => api.get(`/daily-work/assignments/${id}`),
  getAll: (date) =>
    api.get(`/daily-work/assignments${date ? `?date=${date}` : ''}`),
  getOverdue: () => api.get('/daily-work/assignments/overdue'),
  getMy: (empId, params) =>
    api.get(`/daily-work/assignments/my/${empId}`, { params }),
  delete: (id) => api.delete(`/daily-work/assignments/${id}`),

  // Workflow
  accept: (id) => api.patch(`/daily-work/assignments/${id}/accept`),
  start: (id) => api.patch(`/daily-work/assignments/${id}/start`),
  pause: (id, reason) =>
    api.patch(`/daily-work/assignments/${id}/pause`, { reason }),
  block: (id, blockerReason) =>
    api.patch(`/daily-work/assignments/${id}/block`, { blockerReason }),
  resume: (id) => api.patch(`/daily-work/assignments/${id}/resume`),
  complete: (id, notes) =>
    api.patch(`/daily-work/assignments/${id}/complete`, { notes }),
  updateProgress: (id, percentage) =>
    api.patch(`/daily-work/assignments/${id}/progress`, { percentage }),

  // Comments
  addComment: (id, data) =>
    api.post(`/daily-work/assignments/${id}/comments`, data),
  getComments: (id) => api.get(`/daily-work/assignments/${id}/comments`),

  // Breaks
  startBreak: (data) => api.post('/daily-work/breaks/start', data),
  endBreak: (id) => api.patch(`/daily-work/breaks/${id}/end`),
  getCurrentBreak: (empId) => api.get(`/daily-work/breaks/current/${empId}`),
  getMyBreaks: (empId) => api.get(`/daily-work/breaks/my/${empId}`),
  getActiveBreaks: () => api.get('/daily-work/breaks/active'),
  forceEndBreak: (id, adminNote) =>
    api.patch(`/daily-work/breaks/${id}/force-end`, { adminNote }),

  // Dashboard
  getMyDashboard: (empId) => api.get(`/daily-work/dashboard/my/${empId}`),
  getTeamDashboard: () => api.get('/daily-work/dashboard/team'),
  getEmployeeStats: (empId, startDate, endDate) =>
    api.get(`/daily-work/stats/employee/${empId}?startDate=${startDate}&endDate=${endDate}`),
};

export default dailyWorkService;