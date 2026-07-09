import api from './client';

export const photosApi = {
  upload: (eventId, files, onProgress) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('images', file));
    return api.post(`/photos/upload/${eventId}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (evt) => {
        if (onProgress) onProgress(Math.round((evt.loaded * 100) / evt.total));
      },
    });
  },
  listForEvent: (eventId, params) => api.get(`/photos/event/${eventId}/`, { params }),
  delete: (photoId) => api.delete(`/photos/${photoId}/`),
  myPhotos: (eventId) => api.get(`/photos/my-photos/${eventId}/`),
};
