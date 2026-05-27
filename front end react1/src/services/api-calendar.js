import axios from 'axios';

const api = axios.create({ baseURL: 'https://fitness-app-produ-o.onrender.com' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Busca todas as sessões de treino do usuário.
 * Retorna array: [{ id, date, label, duration_sec, notes, created_at }]
 */
export const getCalendarSessions = async () => {
  const response = await api.get('/calendar');
  return response.data;
};

/**
 * Cria ou atualiza (upsert) uma sessão de treino para uma data.
 * @param {{ date: string, label: string, duration_sec: number, notes?: string }}
 */
export const saveCalendarSession = async ({ date, label, duration_sec, notes = '' }) => {
  const response = await api.post('/calendar', { date, label, duration_sec, notes });
  return response.data;
};

/**
 * Remove uma sessão de treino pelo id.
 */
export const deleteCalendarSession = async (id) => {
  const response = await api.delete(`/calendar/${id}`);
  return response.data;
};

/**
 * Converte array da API para o mapa usado pelo CalendarPage e pelo contexto.
 * Retorna: { 'YYYY-MM-DD': { id, label, durationSec, durationMin, notes } }
 */
export const sessionsToMap = (sessions = []) => {
  const map = {};
  for (const s of sessions) {
    map[s.date] = {
      id: s.id,
      label: s.label,
      durationSec: s.duration_sec,
      durationMin: Math.round(s.duration_sec / 60),
      notes: s.notes || '',
    };
  }
  return map;
};
