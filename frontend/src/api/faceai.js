import api from './client';

export const faceaiApi = {
  captureSelfie: (eventId, imageBlob) => {
    const formData = new FormData();
    formData.append('image', imageBlob, 'selfie.jpg');
    return api.post(`/faceai/selfie/${eventId}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  reprocessEvent: (eventId) => api.post(`/faceai/reprocess/${eventId}/`),
};
