import axios from 'axios';

const api = axios.create({
  baseURL: 'https://fitness-app-produ-o.onrender.com',
  withCredentials: true,
});

export const getExercisesByRoutine = async (routineId) => {
  const response = await api.get(`/exercises/routine/${routineId}`);
  return response.data;
};

export const toggleExerciseCompleted = async (exerciseId, completed) => {
  const response = await api.put(`/exercises/${exerciseId}`, { completed });
  return response.data;
};
