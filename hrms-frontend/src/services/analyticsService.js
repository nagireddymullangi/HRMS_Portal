// src/services/analyticsService.js
import api from '../api/axiosConfig';

const analyticsService = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getWorkforce: () => api.get('/analytics/workforce'),
  getAttrition: (year) =>
    api.get(`/analytics/attrition${year ? `?year=${year}` : ''}`),
  getAttendance: (startDate, endDate) =>
    api.get(`/analytics/attendance?startDate=${startDate}&endDate=${endDate}`),
  getPayroll: (year) =>
    api.get(`/analytics/payroll${year ? `?year=${year}` : ''}`),
  getRecruitment: () => api.get('/analytics/recruitment'),
  getDiversity: () => api.get('/analytics/diversity'),
  getDepartmentReport: () => api.get('/analytics/department-report'),
  getSalaryDistribution: () => api.get('/analytics/salary-distribution'),
  getCostAnalysis: () => api.get('/analytics/cost-analysis'),
};

export default analyticsService;