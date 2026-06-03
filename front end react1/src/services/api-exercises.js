import api from './api.js';
export const getExercisesByRoutine    = async (routineId) => (await api.get(`/exercises/routine/${routineId}`)).data;
export const toggleExerciseCompleted  = async (id, completed) => (await api.put(`/exercises/${id}`, { completed })).data;
export const postExerciseToRoutine    = async ({ routine_id, exercise }) =>
  (await api.post('/exercises', { routine_id, exercise, completed: false })).data;