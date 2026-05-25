import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});

export const getRoutines = async () => {
  const response = await api.get('/routines');
  return response.data;
};

export const createRoutine = async (routine) => {
  const response = await api.post('/routines', routine);
  return response.data;
};

export const deleteRoutine = async (id) => {
  const response = await api.delete(`/routines/${id}`);
  return response.data;
};
