import { supabaseAdmin as supabase } from '../config/supabase.js';

/**
 * GET /calendar
 * Retorna todas as sessões de treino do usuário autenticado.
 * Cada data pode ter múltiplas sessões (sem upsert por data).
 */
export const getCalendar = async (c) => {
  try {
    const user_id = c.get('user_id');

    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', user_id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return c.json(data);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
};

/**
 * POST /calendar
 * Cria uma nova sessão de treino para uma data.
 * Múltiplas sessões no mesmo dia são permitidas.
 * Body: { date, label, duration_sec, notes? }
 */
export const createCalendar = async (c) => {
  try {
    const user_id = c.get('user_id');
    const { date, label, duration_sec, notes = '' } = await c.req.json();

    if (!date || !label || duration_sec === undefined) {
      return c.json({ error: 'Campos obrigatórios: date, label, duration_sec' }, 400);
    }

    const { data, error } = await supabase
      .from('workout_sessions')
      .insert({ user_id, date, label, duration_sec, notes })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return c.json(data, 201);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
};

/**
 * PATCH /calendar/:id
 * Edita campos de uma sessão existente pelo id.
 * Body: { label?, duration_sec?, notes? }
 */
export const patchCalendar = async (c) => {
  try {
    const user_id = c.get('user_id');
    const id      = c.req.param('id');
    const body    = await c.req.json();

    const allowed = ['label', 'duration_sec', 'notes'];
    const updates = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    if (Object.keys(updates).length === 0) {
      return c.json({ error: 'Nenhum campo válido para atualizar.' }, 400);
    }

    const { data, error } = await supabase
      .from('workout_sessions')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return c.json(data);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
};

/**
 * DELETE /calendar/:id
 * Remove uma sessão de treino pelo id.
 */
export const deleteCalendar = async (c) => {
  try {
    const user_id = c.get('user_id');
    const id      = c.req.param('id');

    const { error } = await supabase
      .from('workout_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id);

    if (error) throw new Error(error.message);

    return c.json({ message: 'Sessão removida com sucesso.' });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
};