import supabase from '../config/supabase.js';

export const postExercise = async (c) => {
  try {
    const { routine_id, exercise, completed = false } = await c.req.json();
    const user_id = c.get('user_id');

    const { data, error } = await supabase
      .from('exercises')
      .insert([{ routine_id, exercise, completed, user_id }])
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
    console.error('Erro na requisição getExercises:', err.message);
    return c.json({ error: err.message }, 500);
  }
};

export const getExercisesByRoutine = async (c) => {
  try {
    const user_id = c.get('user_id');
    const routine_id = c.req.param('routine_id');

    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('user_id', user_id)
      .eq('routine_id', routine_id);

    if (error) throw new Error(error.message);

    return c.json(data);
  } catch (err) {
    console.error('Erro na requisição getExercisesByRoutine:', err.message);
    return c.json({ error: err.message }, 500);
  }
};

export const putExercise = async (c) => {
  try {
    const id = c.req.param('id');
    const { completed } = await c.req.json();
    const user_id = c.get('user_id');

    const { data, error } = await supabase
      .from('exercises')
      .update({ completed })
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return c.json(data);
  } catch (err) {
    console.error('Erro na requisição putExercise:', err.message);
    return c.json({ error: err.message }, 500);
  }
};
