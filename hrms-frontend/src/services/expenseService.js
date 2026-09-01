// src/services/expenseService.js
import api from '../api/axiosConfig';

const expenseService = {
  // Categories
  getCategories: () => api.get('/expenses/categories'),
  getActiveCategories: () => api.get('/expenses/categories/active'),
  createCategory: (data) => api.post('/expenses/categories', data),
  updateCategory: (id, data) => api.put(`/expenses/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/expenses/categories/${id}`),

  // Claims
  getAll: () => api.get('/expenses/claims'),
  getById: (id) => api.get(`/expenses/claims/${id}`),
  getByEmployee: (empId) => api.get(`/expenses/claims/employee/${empId}`),
  getByStatus: (status) => api.get(`/expenses/claims/status/${status}`),
  create: (data) => api.post('/expenses/claims', data),
  update: (id, data) => api.put(`/expenses/claims/${id}`, data),
  delete: (id) => api.delete(`/expenses/claims/${id}`),

  submit: (id) => api.patch(`/expenses/claims/${id}/submit`),
  approve: (id) => api.patch(`/expenses/claims/${id}/approve`),
  reject: (id, reason) =>
    api.patch(`/expenses/claims/${id}/reject`, { reason }),
  reimburse: (id, amount) =>
    api.patch(`/expenses/claims/${id}/reimburse`, { amount }),

  getEmployeeStats: (empId) => api.get(`/expenses/stats/employee/${empId}`),
  getOverallStats: () => api.get('/expenses/stats/overall'),
};

export default expenseService;