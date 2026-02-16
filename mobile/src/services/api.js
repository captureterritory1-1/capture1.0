import axios from 'axios';

// Change this to your FastAPI backend URL
// For local development: http://localhost:8000 or your computer's IP
// For production: your deployed backend URL
const API_BASE_URL = 'http://10.182.59.189:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// User API
export const userAPI = {
  createUser: (userData) => api.post('/users', userData),
  getUser: (userId) => api.get(`/users/${userId}`),
  updatePreferences: (userId, preferences) =>
    api.put(`/users/${userId}/preferences`, preferences),
  getPreferences: (userId) => api.get(`/users/${userId}/preferences`),
  patchPreferences: (userId, updates) =>
    api.patch(`/users/${userId}/preferences`, updates),
};

// Territory API
export const territoryAPI = {
  create: (territoryData) => api.post('/territories', territoryData),
  getAll: (userId) => api.get('/territories', { params: { user_id: userId } }),
  getById: (territoryId) => api.get(`/territories/${territoryId}`),
  delete: (territoryId) => api.delete(`/territories/${territoryId}`),
  claim: (territoryId, claimData) =>
    api.put(`/territories/${territoryId}/claim`, claimData),
};

// Leaderboard API
export const leaderboardAPI = {
  get: (limit = 10) => api.get('/leaderboard', { params: { limit } }),
};

// Brand Territories API
export const brandAPI = {
  getBrandTerritories: () => api.get('/brand-territories'),
};

// Profile Picture API
export const profileAPI = {
  upload: (userId, formData) =>
    api.post(`/profile-picture/${userId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  get: (userId) => api.get(`/profile-picture/${userId}`),
  delete: (userId) => api.delete(`/profile-picture/${userId}`),
};

export default api;
