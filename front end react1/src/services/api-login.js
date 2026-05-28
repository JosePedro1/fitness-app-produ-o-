import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://fitness-app-produ-o.onrender.com';
const api = axios.create({ baseURL: BASE_URL });

// Interceptor: adiciona o token em toda requisição automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.status === 200) {
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('user_id', response.data.user.user_id);
    localStorage.setItem('email', response.data.user.email);
  }
  return response.data;
};

export const registerUser = async (credentials) => {
  const response = await api.post('/auth/register', credentials);
  return response.data;
};

export const validateToken = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) return false;
    const response = await api.get('/auth/validate');
    return response.status === 200 && response.data.valid;
  } catch {
    return false;
  }
};

export const logoutUser = async () => {
  try {
    await api.post('/auth/logout');
  } catch {}
  finally {
    removeAuthToken();
    window.location.href = '/login';
  }
};

export const removeAuthToken = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_id');
  localStorage.removeItem('email');
};