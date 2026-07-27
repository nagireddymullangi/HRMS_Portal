// src/services/offerLetterService.js
import api from '../api/axiosConfig';

const offerLetterService = {
  getAll: () => api.get('/offer-letters'),
  getById: (id) => api.get(`/offer-letters/${id}`),
  create: (data) => api.post('/offer-letters', data),
  update: (id, data) => api.put(`/offer-letters/${id}`, data),
  updateStatus: (id, data) => api.patch(`/offer-letters/${id}/status`, data),
  delete: (id) => api.delete(`/offer-letters/${id}`),
  downloadPdf: (id) => api.get(`/offer-letters/${id}/pdf`, {
    responseType: 'blob'
  }),
};
export default offerLetterService;