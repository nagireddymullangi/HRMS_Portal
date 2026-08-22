// src/services/announcementService.js
import api from '../api/axiosConfig';

const announcementService = {
  getAll: () => api.get('/announcements'),
  getForEmployee: (empId) => api.get(`/announcements/employee/${empId}`),
  getById: (id, empId) =>
    api.get(`/announcements/${id}${empId ? `?employeeId=${empId}` : ''}`),
  create: (data) => api.post('/announcements', data),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  delete: (id) => api.delete(`/announcements/${id}`),
  markAsRead: (id, empId) =>
    api.post(`/announcements/${id}/read/${empId}`),
  togglePin: (id) => api.patch(`/announcements/${id}/toggle-pin`),
  toggleActive: (id) => api.patch(`/announcements/${id}/toggle-active`),
};

export default announcementService;