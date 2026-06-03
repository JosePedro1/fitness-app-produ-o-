import api from './api.js';

// ── Programa Semanal ──────────────────────────────────────────────────────────
export const getWeeklyProgram  = async ()       => (await api.get('/routines/program')).data;
export const updateProgramName = async (name)   => (await api.patch('/routines/program', { name })).data;

// ── Dias da Semana ────────────────────────────────────────────────────────────
export const getDayByWeekday  = async (weekday)         => (await api.get(`/routines/day/${weekday}`)).data;
export const saveDay          = async (weekday, data)   => (await api.put(`/routines/day/${weekday}`, data)).data;
export const addExerciseToDay = async (weekday, exercise) => (await api.post(`/routines/day/${weekday}/exercise`, exercise)).data;
export const completeDay      = async (weekday, payload)  => (await api.post(`/routines/day/${weekday}/complete`, payload)).data;

// ── Exercícios ────────────────────────────────────────────────────────────────
export const updateExercise = async (id, updates) => (await api.patch(`/routines/exercise/${id}`, updates)).data;
export const deleteExercise = async (id)          => (await api.delete(`/routines/exercise/${id}`)).data;

// ── Exercícios Customizados ───────────────────────────────────────────────────
export const getCustomExercises    = async ()       => (await api.get('/routines/custom-exercises')).data;
export const createCustomExercise  = async (payload) => (await api.post('/routines/custom-exercises', payload)).data;
export const deleteCustomExercise  = async (id)      => (await api.delete(`/routines/custom-exercises/${id}`)).data;

// ── Retrocompatibilidade ──────────────────────────────────────────────────────
/** Retorna lista de rotinas no formato legado (usado por NutritionPage) */
export const getRoutines = async () => (await api.get('/routines')).data;

/** @deprecated — use saveDay() */
export const createRoutine = async (routine) => {
  const days  = ['domingo','segunda','terca','quarta','quinta','sexta','sabado'];
  const today = days[new Date().getDay()];
  return (await api.put(`/routines/day/${today}`, {
    workout_name: routine.name,
    exercises: (routine.exercises || []).map(e => ({
      exercise_name: typeof e === 'string' ? e : e.name,
      is_custom: false,
    })),
    is_rest_day: false,
  })).data;
};

/** @deprecated */
export const deleteRoutine = async (id) => (await api.delete(`/routines/${id}`)).data;