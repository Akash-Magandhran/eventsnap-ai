import api from './client';

export const authApi = {
  register: (payload) => api.post('/auth/register/', payload),
  login: (payload) => api.post('/auth/login/', payload),
  logout: (refresh) => api.post('/auth/logout/', { refresh }),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (payload) => api.patch('/auth/profile/', payload),
  forgotPassword: (email) => api.post('/auth/forgot-password/', { email }),
  resetPassword: (payload) => api.post('/auth/reset-password/', payload),
};
