/**
 * api-feedback.js
 * Serviços de feedback do usuário.
 */
import api from './api.js';

/**
 * Envia avaliação do usuário.
 * @param {{ rating: number, message?: string, premium_suggestions?: string }} data
 */
export async function submitFeedback(data) {
  const res = await api.post('/feedback', data);
  return res.data;
}

/**
 * Retorna o feedback mais recente do usuário (ou null se nunca avaliou).
 */
export async function getMyFeedback() {
  const res = await api.get('/feedback/mine');
  return res.data;
}