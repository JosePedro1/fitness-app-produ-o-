import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://fitness-app-produ-o.onrender.com';
const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Busca todas as sessões do usuário. Retorna array ordenado por date desc. */
export const getCalendarSessions = async () => {
  const { data } = await api.get('/calendar');
  return data;
};

/**
 * Cria uma nova sessão de treino (INSERT — múltiplas por dia permitidas).
 * @param {{ date: string, label: string, duration_sec: number, notes?: string }}
 */
export const saveCalendarSession = async ({ date, label, duration_sec, notes = '' }) => {
  const { data } = await api.post('/calendar', { date, label, duration_sec, notes });
  return data;
};

/**
 * Edita uma sessão existente.
 * @param {string} id
 * @param {{ label?: string, duration_sec?: number, notes?: string }} updates
 */
export const updateCalendarSession = async (id, updates) => {
  const { data } = await api.patch(`/calendar/${id}`, updates);
  return data;
};

/** Remove uma sessão pelo id. */
export const deleteCalendarSession = async (id) => {
  const { data } = await api.delete(`/calendar/${id}`);
  return data;
};

/**
 * Converte array da API em mapa agrupado por data.
 * Uma data pode ter múltiplas sessões.
 *
 * Retorna: { 'YYYY-MM-DD': [{ id, label, durationSec, notes }] }
 */
export const sessionsToMap = (sessions = []) => {
  const map = {};
  for (const s of sessions) {
    if (!map[s.date]) map[s.date] = [];
    map[s.date].push({
      id:          s.id,
      label:       s.label,
      durationSec: s.duration_sec,
      durationMin: Math.round(s.duration_sec / 60),
      notes:       s.notes || '',
    });
  }
  return map;
};

/** Soma a duração total (segundos) de todas as sessões de uma data. */
export const totalSecForDate = (sessions = []) =>
  sessions.reduce((acc, s) => acc + s.durationSec, 0);
