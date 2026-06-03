import supabase from '../config/supabase.js';

/**
 * POST /exercises
 * Adiciona exercício avulso (retrocompatibilidade com FloatingWorkoutTimer)
 */
export const postExercise = async (c) => {
  try {
    const user_id = c.get('user_id');
    const {
      routine_id,
      exercise,
      completed = false,
      // novos campos opcionais
      sets,
      reps,
      weight,
      rest,
      observations,
      rpe,
    } = await c.req.json();

    const { data, error } = await supabase
      .from('exercises')
      .insert([{
        routine_id,
        exercise,
        completed,
        user_id,
        sets:         sets     ? parseInt(sets)     : null,
        reps:         reps     || null,
        weight:       weight   ? parseFloat(weight) : null,
        rest:         rest     ? parseInt(rest)     : null,
        observations: observations || null,
        rpe:          rpe      ? parseInt(rpe)      : null,
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return c.json(data, 201);
  } catch (err) {
    console.error('Erro na requisição postExercise:', err.message);
    return c.json({ error: err.message }, 500);
  }
};

export const getExercises = async (c) => {
  try {
    const user_id = c.get('user_id');

    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('user_id', user_id);

    if (error) throw new Error(error.message);
    return c.json(data);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
};

export const getExercisesByRoutine = async (c) => {
  try {
    const user_id    = c.get('user_id');
    const routine_id = c.req.param('routine_id');

    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('user_id', user_id)
      .eq('routine_id', routine_id)
      .order('created_at');

    if (error) throw new Error(error.message);
    return c.json(data);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
};

/**
 * PUT /exercises/:id
 * Atualiza completed + campos opcionais de treino.
 */
export const putExercise = async (c) => {
  try {
    const id      = c.req.param('id');
    const user_id = c.get('user_id');
    const body    = await c.req.json();

    const allowed = ['completed', 'sets', 'reps', 'weight', 'rest', 'observations', 'rpe'];
    const updates = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    const { data, error } = await supabase
      .from('exercises')
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