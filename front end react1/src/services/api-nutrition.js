// src/services/api-nutrition.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://fitness-app-produ-o.onrender.com';
const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Busca status do usuário: isPremium, used, limit.
 * O backend valida o premium via banco (não mais via localStorage).
 * GET /nutrition/me
 */
export const getNutritionMe = async () => {
  const response = await api.get('/nutrition/me');
  return response.data;
  // Retorna: { isPremium, premiumExpiresAt, used, limit }
};

/**
 * Gera plano alimentar GRATUITO (máx. 3/dia para não-premium).
 * POST /nutrition/generate
 */
export const generateFreePlan = async ({ goal, ingredients, restrictions, meals }) => {
  const response = await api.post('/nutrition/generate', {
    goal,
    ingredients,
    restrictions,
    meals,
  });
  return response.data;
  // Retorna: { plan, isPremium: false }
  // Lança erro 429 com { error: 'limite_atingido', message, used, limit } ao atingir limite
};

/**
 * Gera plano alimentar PREMIUM personalizado pelo treino do dia.
 * POST /nutrition/generate-premium
 */
export const generatePremiumPlan = async ({
  goal,
  biotype,
  workout,
  cardio,
  ingredients,
  restrictions,
  profile,
  selectedMeals,
}) => {
  const response = await api.post('/nutrition/generate-premium', {
    goal,
    biotype,
    workout,
    cardio,
    ingredients,
    restrictions,
    profile,
    selectedMeals,
  });
  return response.data;
  // Retorna: { plan, isPremium: true }
  // Lança erro 403 com { error, upgrade: true } se não for premium
};

/**
 * Adiciona exercícios do treino de hoje a uma rotina existente ou cria uma nova.
 * POST /nutrition/add-to-routine
 */
export const addExercisesToRoutine = async ({ exercises, routineId }) => {
  const response = await api.post('/nutrition/add-to-routine', {
    exercises,
    routineId: routineId || null, // null = criar nova rotina
  });
  return response.data;
  // Retorna: { message } ou { message, routine }
};

/**
 * Retorna quantos planos gratuitos foram usados hoje.
 * GET /nutrition/usage
 */
export const getNutritionUsage = async () => {
  const response = await api.get('/nutrition/usage');
  return response.data;
  // Retorna: { used, limit }
};

/**
 * Retorna os últimos 10 planos gerados pelo usuário.
 * GET /nutrition/history
 */
export const getNutritionHistory = async () => {
  const response = await api.get('/nutrition/history');
  return response.data;
  // Retorna: { history: [ { id, date, goal, created_at, plan } ] }
};