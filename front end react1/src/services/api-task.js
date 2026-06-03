import api from './api.js';
export const getTasks    = async ()       => (await api.get('/tasks')).data;
export const createTask  = async (task)   => (await api.post('/tasks', task)).data;
export const updateTask  = async (id, t)  => (await api.put(`/tasks/${id}`, t)).data;
export const deleteTask  = async (id)     => (await api.delete(`/tasks/${id}`)).data;