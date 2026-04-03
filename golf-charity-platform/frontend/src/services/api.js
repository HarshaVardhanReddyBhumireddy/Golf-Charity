import axios from 'axios';

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
});

// Attach JWT
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/change-password', data),
};

// ── Scores ───────────────────────────────────────────────────────────────────
export const scoresAPI = {
  get: () => API.get('/scores'),
  add: (data) => API.post('/scores', data),
  update: (id, data) => API.put(`/scores/${id}`, data),
  delete: (id) => API.delete(`/scores/${id}`),
};

// ── Charities ────────────────────────────────────────────────────────────────
export const charitiesAPI = {
  getAll: (params) => API.get('/charities', { params }),
  getOne: (id) => API.get(`/charities/${id}`),
  select: (data) => API.post('/charities/select', data),
  create: (data) => API.post('/charities', data),
  update: (id, data) => API.put(`/charities/${id}`, data),
  delete: (id) => API.delete(`/charities/${id}`),
};

// ── Draws ─────────────────────────────────────────────────────────────────────
export const drawsAPI = {
  getPublished: () => API.get('/draws'),
  getUpcoming: () => API.get('/draws/upcoming'),
  adminGetAll: () => API.get('/draws/admin'),
  create: (data) => API.post('/draws', data),
  simulate: (id) => API.post(`/draws/${id}/simulate`),
  publish: (id) => API.post(`/draws/${id}/publish`),
};

// ── Subscriptions ─────────────────────────────────────────────────────────────
export const subscriptionsAPI = {
  getPlans: () => API.get('/subscriptions/plans'),
  checkout: (plan) => API.post('/subscriptions/checkout', { plan }),
  cancel: () => API.post('/subscriptions/cancel'),
  manualActivate: (data) => API.post('/subscriptions/manual-activate', data),
};

// ── Winners ───────────────────────────────────────────────────────────────────
export const winnersAPI = {
  getMy: () => API.get('/winners/my'),
  uploadProof: (drawId, winnerId, formData) =>
    API.post(`/winners/${drawId}/${winnerId}/proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  getUsers: (params) => API.get('/admin/users', { params }),
  getUser: (id) => API.get(`/admin/users/${id}`),
  updateUser: (id, data) => API.put(`/admin/users/${id}`, data),
  editUserScores: (id, scores) => API.put(`/admin/users/${id}/scores`, { scores }),
  getWinners: (params) => API.get('/admin/winners', { params }),
  updateWinnerStatus: (drawId, winnerId, data) => API.put(`/admin/winners/${drawId}/${winnerId}`, data),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersAPI = {
  updateCharityContribution: (data) => API.put('/users/charity-contribution', data),
};

export default API;
