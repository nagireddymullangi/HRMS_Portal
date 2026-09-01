// src/services/aiService.js
import api from '../api/axiosConfig';

const aiService = {
  getComprehensive: () => api.get('/ai-insights/comprehensive'),
  getAttritionRisks: () => api.get('/ai-insights/attrition-risks'),
  getSentiment: () => api.get('/ai-insights/sentiment'),
  getTopPerformers: (limit = 10) =>
    api.get(`/ai-insights/top-performers?limit=${limit}`),
  getAttendanceAnomalies: () => api.get('/ai-insights/attendance-anomalies'),
  getRecommendations: () => api.get('/ai-insights/recommendations'),
  getSalaryBenchmarks: () => api.get('/ai-insights/salary-benchmarks'),
  getSkillGaps: () => api.get('/ai-insights/skill-gaps'),
  chatbot: (query) => api.post('/ai-insights/chatbot', { query }),
};

export default aiService;