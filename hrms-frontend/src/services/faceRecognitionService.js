// src/services/faceRecognitionService.js
import api from '../api/axiosConfig';

const faceRecognitionService = {
  // Enrollment
  enroll: (data) => api.post('/face-recognition/enroll', data),
  updateEnrollment: (empId, data) =>
    api.put(`/face-recognition/enroll/${empId}`, data),
  getEnrollment: (empId) => api.get(`/face-recognition/enrollment/${empId}`),
  getAllEnrollments: () => api.get('/face-recognition/enrollments'),
  deleteEnrollment: (empId) =>
    api.delete(`/face-recognition/enrollment/${empId}`),
  isEnrolled: (empId) => api.get(`/face-recognition/is-enrolled/${empId}`),

  // Verification & Attendance
  verify: (data) => api.post('/face-recognition/verify', data),
  markAttendance: (data) =>
    api.post('/face-recognition/mark-attendance', data),
};

export default faceRecognitionService;