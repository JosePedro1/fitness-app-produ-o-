import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://fitness-app-produ-o.onrender.com';
const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getProgress = async () => {
  const response = await api.get('/progress');
  return response.data;
};

export const postProgress = async (progress) => {
  const response = await api.post('/progress', progress);
  return response.data;
};

export const deleteProgress = async (id) => {
  const response = await api.delete(`/progress/${id}`);
  return response.data;
};