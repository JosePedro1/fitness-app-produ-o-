import axios from 'axios';

const api = axios.create({ baseURL: 'https://fitness-app-produ-o.onrender.com' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getRoutines = async () => {
  const response = await api.get('/routines');
  return response.data;
};

export const createRoutine = async (routine) => {
  const response = await api.post('/routines', routine);
  return response.data;
};

export const deleteRoutine = async (id) => {
  const response = await api.delete(`/routines/${id}`);
  return response.data;
};