// src/services/reportService.js
import api from '../api/axiosConfig';

const reportService = {
  exportEmployeesExcel: () =>
    api.get('/reports/employees/excel', { responseType: 'blob' }),

  exportEmployeesCsv: () =>
    api.get('/reports/employees/csv', { responseType: 'blob' }),

  exportAttendanceExcel: (startDate, endDate) =>
    api.get(`/reports/attendance/excel?startDate=${startDate}&endDate=${endDate}`,
      { responseType: 'blob' }),

  exportPayrollExcel: (month, year) =>
    api.get(`/reports/payroll/excel?month=${month}&year=${year}`,
      { responseType: 'blob' }),

  exportLeavesExcel: (status) =>
    api.get(`/reports/leaves/excel?status=${status}`,
      { responseType: 'blob' }),

  generateHRReport: (month, year) =>
    api.get(`/reports/hr-report?month=${month}&year=${year}`,
      { responseType: 'blob' }),
};

// Helper to trigger download
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(new Blob([blob]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export default reportService;