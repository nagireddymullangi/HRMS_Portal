// src/services/trainingService.js
import api from '../api/axiosConfig';

const trainingService = {
  // Programs
  getAllPrograms: () => api.get('/training/programs'),
  getOpenPrograms: (empId) =>
    api.get(`/training/programs/open${empId ? `?employeeId=${empId}` : ''}`),
  getProgram: (id, empId) =>
    api.get(`/training/programs/${id}${empId ? `?employeeId=${empId}` : ''}`),
  createProgram: (data) => api.post('/training/programs', data),
  updateProgram: (id, data) => api.put(`/training/programs/${id}`, data),
  deleteProgram: (id) => api.delete(`/training/programs/${id}`),
  updateStatus: (id, status) =>
    api.patch(`/training/programs/${id}/status?status=${status}`),

  // Enrollments
  enroll: (programId, employeeId) =>
    api.post('/training/enroll', { programId, employeeId }),
  getMyEnrollments: (empId) =>
    api.get(`/training/enrollments/employee/${empId}`),
  getEnrollmentsByProgram: (programId) =>
    api.get(`/training/enrollments/program/${programId}`),
  markComplete: (id, data) =>
    api.patch(`/training/enrollments/${id}/complete`, data),
  submitFeedback: (id, data) =>
    api.patch(`/training/enrollments/${id}/feedback`, data),
  dropEnrollment: (id) => api.delete(`/training/enrollments/${id}`),

  getStatistics: () => api.get('/training/statistics'),
  getEmployeeStats: (empId) => api.get(`/training/statistics/employee/${empId}`),
};

export default trainingService;