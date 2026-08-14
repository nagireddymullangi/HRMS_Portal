// src/services/bankService.js
import api from '../api/axiosConfig';

const bankService = {
  save: (empId, data) => api.post(`/bank-details/${empId}`, data),
  getByEmployee: (empId) => api.get(`/bank-details/employee/${empId}`),
  getAll: () => api.get('/bank-details'),
  verify: (id) => api.patch(`/bank-details/${id}/verify`),
};

export default bankService;