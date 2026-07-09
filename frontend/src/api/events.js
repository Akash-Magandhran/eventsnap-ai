import api from './client';

export const eventsApi = {
  list: (params) => api.get('/events/', { params }),
  create: (payload) => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') formData.append(key, value);
    });
    return api.post('/events/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  detail: (id) => api.get(`/events/${id}/`),
  update: (id, payload) => api.patch(`/events/${id}/`, payload),
  delete: (id) => api.delete(`/events/${id}/`),
  regenerateQr: (id) => api.post(`/events/${id}/regenerate-qr/`),
  attendees: (id) => api.get(`/events/${id}/attendees/`),
  analytics: (id) => api.get(`/events/${id}/analytics/`),
  dashboard: () => api.get('/events/dashboard/'),
  publicLookup: (slug) => api.get(`/events/join/${slug}/`),
  joinConfirm: (slug) => api.post(`/events/join/${slug}/confirm/`),
};
