import api from './api.js';

export const loginUser = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials);
  localStorage.setItem('auth_token', data.token);
  localStorage.setItem('user_id', data.user.user_id);
  localStorage.setItem('email', data.user.email);
  return data;
};

export const registerUser = async (credentials) => {
  const { data } = await api.post('/auth/register', credentials);
  return data;
};

export const validateToken = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) return false;
    const { data } = await api.get('/auth/validate');
    return data.valid === true;
  } catch {
    return false;
  }
};

export const logoutUser = async () => {
  try { await api.post('/auth/logout'); } catch { /* stateless */ }
  removeAuthToken();
  window.location.href = '/login';
};

export const removeAuthToken = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_id');
  localStorage.removeItem('email');
};