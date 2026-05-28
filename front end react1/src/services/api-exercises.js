import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://fitness-app-produ-o.onrender.com';
const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getExercisesByRoutine = async (routineId) => {
  const response = await api.get(`/exercises/routine/${routineId}`);
  return response.data;
};

export const toggleExerciseCompleted = async (exerciseId, completed) => {
  const response = await api.put(`/exercises/${exerciseId}`, { completed });
  return response.data;
};

/**
 * Adiciona um exercício avulso a uma rotina existente.
 * Usado no modal de finalização do treino.
 * @param {{ routine_id: string, exercise: string }} payload
 */
export const postExerciseToRoutine = async ({ routine_id, exercise }) => {
  const response = await api.post('/exercises', { routine_id, exercise, completed: false });
  return response.data;
};
