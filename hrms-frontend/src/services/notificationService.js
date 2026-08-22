// src/services/notificationService.js
import api from '../api/axiosConfig';

const notificationService = {
  getRecent: () => api.get('/notifications/recent'),
  getAll: (page = 0, size = 20) =>
    api.get(`/notifications?page=${page}&size=${size}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  clearRead: () => api.delete('/notifications/clear-read'),
};

export default notificationService;