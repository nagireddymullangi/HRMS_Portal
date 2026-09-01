// src/services/onboardingService.js
import api from '../api/axiosConfig';

const onboardingService = {
  initiate: (empId, data) => api.post(`/onboarding/initiate/${empId}`, data),
  getAll: () => api.get('/onboarding'),
  getById: (id) => api.get(`/onboarding/${id}`),
  getByEmployee: (empId) => api.get(`/onboarding/employee/${empId}`),
  updateStatus: (id, status) =>
    api.patch(`/onboarding/${id}/status?status=${status}`),

  // Tasks
  addTask: (onboardingId, data) =>
    api.post(`/onboarding/${onboardingId}/tasks`, data),
  updateTask: (taskId, data) =>
    api.put(`/onboarding/tasks/${taskId}`, data),
  completeTask: (taskId) =>
    api.patch(`/onboarding/tasks/${taskId}/complete`),
  deleteTask: (taskId) =>
    api.delete(`/onboarding/tasks/${taskId}`),
  getTasks: (onboardingId) =>
    api.get(`/onboarding/${onboardingId}/tasks`),

  getStatistics: () => api.get('/onboarding/statistics'),
};

export default onboardingService;