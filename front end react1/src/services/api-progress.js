// api-progress.js
import api from './api.js';
export const getProgress    = async ()         => (await api.get('/progress')).data;
export const postProgress   = async (progress) => (await api.post('/progress', progress)).data;
export const deleteProgress = async (id)       => (await api.delete(`/progress/${id}`)).data;