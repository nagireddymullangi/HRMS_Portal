// src/services/payrollService.js
import api from '../api/axiosConfig';

const payrollService = {
  generate: (data) => api.post('/payroll/generate', data),
  getById: (id) => api.get(`/payroll/${id}`),
  getByEmployee: (id) => api.get(`/payroll/employee/${id}`),
  getAll: () => api.get('/payroll/all'),
  getByMonthYear: (month, year) =>
    api.get(`/payroll/month?month=${month}&year=${year}`),
  update: (id, data) => api.put(`/payroll/${id}`, data),
  markPaid: (id) => api.patch(`/payroll/${id}/mark-paid`),
  delete: (id) => api.delete(`/payroll/${id}`),
};
export default payrollService;