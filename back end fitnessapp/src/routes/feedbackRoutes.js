/**
 * feedbackRoutes.js
 *
 * POST /feedback  — usuário autenticado envia avaliação + sugestões premium.
 * GET  /feedback/mine — usuário consulta se já avaliou (evita duplicata na UI).
 */

import { Hono } from 'hono';
import { supabaseAdmin as supabase } from '../config/supabase.js';
import { authenticate } from '../middleware/authMiddleware.js';

const feedbackRoutes = new Hono();

// ── POST /feedback ─────────────────────────────────────────────────────────────
feedbackRoutes.post('/', authenticate, async (c) => {
  const userId = c.get('user_id');

  let body;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Corpo inválido.' }, 400); }

  const { rating, message, premium_suggestions } = body;

  // Validação
  const ratingNum = Number(rating);
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return c.json({ error: 'Avaliação deve ser um número entre 1 e 5.' }, 400);
  }

  if (message && message.length > 1000) {
    return c.json({ error: 'Comentário deve ter no máximo 1000 caracteres.' }, 400);
  }
  if (premium_suggestions && premium_suggestions.length > 1000) {
    return c.json({ error: 'Sugestão premium deve ter no máximo 1000 caracteres.' }, 400);
  }

  try {
    const { data, error } = await supabase
      .from('feedback')
      .insert({
        user_id:             userId,
        rating:              ratingNum,
        message:             message?.trim()             || null,
        premium_suggestions: premium_suggestions?.trim() || null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return c.json({ ok: true, id: data.id }, 201);
  } catch (err) {
    console.error('feedback POST error:', err);
    return c.json({ error: 'Erro ao salvar feedback.' }, 500);
  }
});

// ── GET /feedback/mine ─────────────────────────────────────────────────────────
// Retorna o feedback mais recente do usuário (para saber se já avaliou)
feedbackRoutes.get('/mine', authenticate, async (c) => {
  const userId = c.get('user_id');

  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('id, rating, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(error.message);

    return c.json(data || null);
  } catch (err) {
    console.error('feedback GET /mine error:', err);
    return c.json({ error: 'Erro ao buscar feedback.' }, 500);
  }
});

export default feedbackRoutes;