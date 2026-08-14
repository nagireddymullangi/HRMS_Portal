// src/services/signatureService.js
import api from '../api/axiosConfig';

const signatureService = {
  request: (data) => api.post('/signatures/request', data),
  verify: (token) => api.get(`/signatures/verify/${token}`),
  sign: (token, signatureData) =>
    api.post(`/signatures/sign/${token}`, { signatureData }),
  getAll: () => api.get('/signatures'),
};

export default signatureService;