import supabase from '../config/supabase.js';

/**
 * GET /calendar
 * Retorna todas as sessões de treino do usuário autenticado.
 */
export const getCalendar = async (c) => {
  try {
    const user_id = c.get('user_id');

    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', user_id)
      .order('date', { ascending: false });

    if (error) throw new Error(error.message);

    return c.json(data);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
};

/**
 * POST /calendar
 * Cria ou atualiza (upsert) uma sessão de treino para uma data específica.
 * Body: { date, label, duration_sec, notes? }
 */
export const upsertCalendar = async (c) => {
  try {
    const user_id = c.get('user_id');
    const { date, label, duration_sec, notes = '' } = await c.req.json();

    if (!date || !label || duration_sec === undefined) {
      return c.json({ error: 'Campos obrigatórios: date, label, duration_sec' }, 400);
    }

    const { data, error } = await supabase
      .from('workout_sessions')
      .upsert(
        { user_id, date, label, duration_sec, notes },
        { onConflict: 'user_id,date' }
      )
      .select()
      .single();

    if (error) throw new Error(error.message);

    return c.json(data, 201);
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
    const id = c.req.param('id');

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
