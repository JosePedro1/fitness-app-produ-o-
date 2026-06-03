import api from './api.js';
export const getNutritionMe       = async ()       => (await api.get('/nutrition/me')).data;
export const generateFreePlan     = async (params) => (await api.post('/nutrition/generate', params)).data;
export const generatePremiumPlan  = async (params) => (await api.post('/nutrition/generate-premium', params)).data;
export const addExercisesToRoutine = async ({ exercises, routineId }) =>
  (await api.post('/nutrition/add-to-routine', { exercises, routineId: routineId || null })).data;
export const getNutritionUsage    = async ()       => (await api.get('/nutrition/usage')).data;
export const getNutritionHistory  = async ()       => (await api.get('/nutrition/history')).data;