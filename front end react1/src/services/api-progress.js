import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});

export const getProgress = async () => {
  const response = await api.get('/progress');
  return response.data;
};

export const postProgress = async (progress) => {
  const response = await api.post('/progress', progress);
  return response.data;
};

export const deleteProgress = async (id) => {
    const response = await api.delete(`/progress/${id}`);
    return response.data;
  };
