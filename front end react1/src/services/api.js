/**
 * api.js — instância axios centralizada.
 *
 * Request interceptor: anexa o Bearer token de cada requisição.
 * Response interceptor: 401 → limpa sessão e redireciona para /login.
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://fitness-app-produ-o.onrender.com';

const api = axios.create({ baseURL: BASE_URL });

// ── Request: injeta token ────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response: trata 401 globalmente ─────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const code = error.response?.data?.code;

      // Limpa sessão local
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('email');
      localStorage.removeItem('ft_user');

      const publicPaths = ['/login', '/register', '/'];
      if (!publicPaths.includes(window.location.pathname)) {
        if (code === 'SESSION_REPLACED') {
          // Sessão substituída por outro dispositivo — avisa o usuário
          sessionStorage.setItem(
            'auth_message',
            'Sua sessão foi encerrada porque a conta foi acessada em outro dispositivo.'
          );
        }
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;