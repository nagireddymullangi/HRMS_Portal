// src/services/recruitmentService.js
import api from '../api/axiosConfig';

const recruitmentService = {
  // Jobs
  getJobs: () => api.get('/recruitment/jobs'),
  getOpenJobs: () => api.get('/recruitment/jobs/open'),
  getJob: (id) => api.get(`/recruitment/jobs/${id}`),
  createJob: (data) => api.post('/recruitment/jobs', data),
  updateJob: (id, data) => api.put(`/recruitment/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/recruitment/jobs/${id}`),
  updateJobStatus: (id, status) =>
    api.patch(`/recruitment/jobs/${id}/status?status=${status}`),

  // Candidates
  getCandidates: () => api.get('/recruitment/candidates'),
  getCandidate: (id) => api.get(`/recruitment/candidates/${id}`),
  createCandidate: (data) => api.post('/recruitment/candidates', data),
  updateCandidate: (id, data) => api.put(`/recruitment/candidates/${id}`, data),

  // Applications
  getApplications: () => api.get('/recruitment/applications'),
  getApplication: (id) => api.get(`/recruitment/applications/${id}`),
  getApplicationsByJob: (jobId) =>
    api.get(`/recruitment/applications/job/${jobId}`),
  applyForJob: (jobId, candidateId, coverLetter) =>
    api.post('/recruitment/applications', {
      jobId, candidateId, coverLetter
    }),
  updateApplicationStage: (id, stage) =>
    api.patch(`/recruitment/applications/${id}/stage?stage=${stage}`),

  // Interviews
  scheduleInterview: (data) => api.post('/recruitment/interviews', data),
  updateInterview: (id, data) => api.put(`/recruitment/interviews/${id}`, data),
  getInterviewsByApplication: (appId) =>
    api.get(`/recruitment/interviews/application/${appId}`),
  submitFeedback: (id, feedback, rating, recommendation) =>
    api.post(`/recruitment/interviews/${id}/feedback`,
      { feedback, rating, recommendation }),

  getStatistics: () => api.get('/recruitment/statistics'),
};

export default recruitmentService;