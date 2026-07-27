// src/services/employeeService.js
import api from '../api/axiosConfig';

const employeeService = {
  getAll: () => api.get('/employees'),
  getById: (id) => api.get(`/employees/${id}`),
  getByUserId: (userId) => api.get(`/employees/user/${userId}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  search: (keyword) => api.get(`/employees/search?keyword=${keyword}`),
};
export default employeeService;