// src/services/complianceService.js
import api from '../api/axiosConfig';

const complianceService = {
  // Records
  getAllRecords: () => api.get('/compliance/records'),
  getRecord: (id) => api.get(`/compliance/records/${id}`),
  getRecordsByType: (type) => api.get(`/compliance/records/type/${type}`),
  getRecordsByPeriod: (year, month) =>
    api.get(`/compliance/records/period?year=${year}${month ? `&month=${month}` : ''}`),
  createRecord: (data) => api.post('/compliance/records', data),
  updateRecord: (id, data) => api.put(`/compliance/records/${id}`, data),
  deleteRecord: (id) => api.delete(`/compliance/records/${id}`),
  markFiled: (id, acknowledgmentNumber) =>
    api.patch(`/compliance/records/${id}/file`, { acknowledgmentNumber }),
  markPaid: (id, challanNumber) =>
    api.patch(`/compliance/records/${id}/pay`, { challanNumber }),

  // Events
  getAllEvents: () => api.get('/compliance/events'),
  getUpcoming: (days = 30) =>
    api.get(`/compliance/events/upcoming?days=${days}`),
  getOverdue: () => api.get('/compliance/events/overdue'),
  createEvent: (data) => api.post('/compliance/events', data),
  updateEvent: (id, data) => api.put(`/compliance/events/${id}`, data),
  completeEvent: (id, notes) =>
    api.patch(`/compliance/events/${id}/complete`, { notes }),
  deleteEvent: (id) => api.delete(`/compliance/events/${id}`),

  getDashboard: () => api.get('/compliance/dashboard'),
  getReport: (year) => api.get(`/compliance/report?year=${year}`),
};

export default complianceService;