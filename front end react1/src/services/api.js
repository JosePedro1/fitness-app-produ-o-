/**
 * api.js — instância axios centralizada.
 *
 * Todos os arquivos de serviço importam este módulo em vez de
 * criar cada um sua própria instância do axios. Isso elimina a
 * duplicação de ~30 linhas em 7 arquivos e garante consistência.
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://fitness-app-produ-o.onrender.com';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;