// src/services/eventService.js
import api from '../api/axiosConfig';

const eventService = {
  getAll: () => api.get('/events'),
  getUpcoming: () => api.get('/events/upcoming'),
  getForEmployee: (empId) => api.get(`/events/employee/${empId}`),
  getByDateRange: (start, end) =>
    api.get(`/events/date-range?start=${start}&end=${end}`),
  getById: (id, empId) =>
    api.get(`/events/${id}${empId ? `?employeeId=${empId}` : ''}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  updateStatus: (id, status) =>
    api.patch(`/events/${id}/status?status=${status}`),
  updateRsvp: (eventId, data) =>
    api.post(`/events/${eventId}/rsvp`, data),
};

export default eventService;