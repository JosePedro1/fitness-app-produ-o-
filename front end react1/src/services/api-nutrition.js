// src/services/api-nutrition.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://fitness-app-produ-o.onrender.com';
const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const generateNutritionPlan = async ({ goal, ingredients, restrictions, meals, profile }) => {
  // Por enquanto isPremium vem do localStorage (futuro: validar no backend)
  const isPremium = localStorage.getItem('is_premium') === 'true';
  const response = await api.post('/nutrition/generate', {
    goal, ingredients, restrictions, meals, profile, isPremium,
  });
  return response.data;
};

export const getNutritionUsage = async () => {
  const response = await api.get('/nutrition/usage');
  return response.data;
};

export const getNutritionHistory = async () => {
  const response = await api.get('/nutrition/history');
  return response.data;
};