// src/services/documentTemplateService.js
import api from '../api/axiosConfig';

const documentTemplateService = {
  getAll: () => api.get('/document-templates'),
  getById: (id) => api.get(`/document-templates/${id}`),
  getByType: (type) => api.get(`/document-templates/type/${type}`),
  create: (data) => api.post('/document-templates', data),
  update: (id, data) => api.put(`/document-templates/${id}`, data),
  delete: (id) => api.delete(`/document-templates/${id}`),
  generate: (data) => api.post('/document-templates/generate', data),
  downloadPdf: (data) => api.post('/document-templates/generate-pdf', data, {
    responseType: 'blob'
  }),
};
export default documentTemplateService;