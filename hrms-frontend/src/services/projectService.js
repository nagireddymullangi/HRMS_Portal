// src/services/projectService.js
import api from '../api/axiosConfig';

const projectService = {
  getAll: () => api.get('/projects'),
  getActive: () => api.get('/projects/active'),
  getById: (id) => api.get(`/projects/${id}`),
  getByEmployee: (empId) => api.get(`/projects/employee/${empId}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  updateStatus: (id, status) =>
    api.patch(`/projects/${id}/status?status=${status}`),

  // Members
  addMember: (projectId, data) =>
    api.post(`/projects/${projectId}/members`, data),
  removeMember: (projectId, empId) =>
    api.delete(`/projects/${projectId}/members/${empId}`),
  getMembers: (projectId) => api.get(`/projects/${projectId}/members`),

  // Tasks
  createTask: (projectId, data) =>
    api.post(`/projects/${projectId}/tasks`, data),
  updateTask: (taskId, data) => api.put(`/projects/tasks/${taskId}`, data),
  updateTaskStatus: (taskId, status) =>
    api.patch(`/projects/tasks/${taskId}/status?status=${status}`),
  getTasks: (projectId) => api.get(`/projects/${projectId}/tasks`),
  getMyTasks: (empId) => api.get(`/projects/tasks/my/${empId}`),
  deleteTask: (taskId) => api.delete(`/projects/tasks/${taskId}`),

  getStatistics: () => api.get('/projects/statistics'),
};

export default projectService;