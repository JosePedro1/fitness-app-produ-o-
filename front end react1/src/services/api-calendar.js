import api from './api.js';

export const getCalendarSessions = async () => {
  const { data } = await api.get('/calendar');
  return data;
};

export const saveCalendarSession = async ({ date, label, duration_sec, notes = '' }) => {
  const { data } = await api.post('/calendar', { date, label, duration_sec, notes });
  return data;
};

export const updateCalendarSession = async (id, updates) => {
  const { data } = await api.patch(`/calendar/${id}`, updates);
  return data;
};

export const deleteCalendarSession = async (id) => {
  const { data } = await api.delete(`/calendar/${id}`);
  return data;
};

/** Converte array da API em mapa agrupado por data: { 'YYYY-MM-DD': [...] } */
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

/** Soma duração (segundos) de todas as sessões de uma data. */
export const totalSecForDate = (sessions = []) =>
  sessions.reduce((acc, s) => acc + s.durationSec, 0);