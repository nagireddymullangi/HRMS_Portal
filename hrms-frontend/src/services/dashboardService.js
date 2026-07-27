// src/services/dashboardService.js
import api from '../api/axiosConfig';

const dashboardService = {
  getAdminDashboard: () => api.get('/dashboard/admin'),
  getEmployeeDashboard: (id) => api.get(`/dashboard/employee/${id}`),
};
export default dashboardService;