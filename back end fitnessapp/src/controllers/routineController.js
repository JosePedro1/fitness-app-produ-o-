import supabase from '../config/supabase.js';

export const createRoutine = async (c) => {
  try {
    const { name, exercises, week_days = [], reminder_time = null } = await c.req.json();
    const user_id = c.get('user_id');

    const { data: routineData, error: routineError } = await supabase
      .from('routines')
      .insert([{ name, user_id, week_days, reminder_time }])
      .select()
      .single();

    if (routineError) throw new Error(routineError.message);

    const routine_id = routineData.id;

    if (exercises && exercises.length > 0) {
      const exercisesToInsert = exercises.map((exercise) => ({
        exercise: typeof exercise === 'string' ? exercise : exercise.name,
        completed: false,
        user_id,
        routine_id,
      }));

      const { error: exercisesError } = await supabase
        .from('exercises')
        .insert(exercisesToInsert);

      if (exercisesError) throw new Error(exercisesError.message);
    }

    return c.json({ message: 'Rotina criada com sucesso.', routine: routineData }, 201);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
};

export const getRoutines = async (c) => {
  try {
    const user_id = c.get('user_id');

    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .eq('user_id', user_id);

    if (error) throw new Error(error.message);
    return c.json(data);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
};

export const deleteRoutine = async (c) => {
  try {
    const id = c.req.param('id');
    const user_id = c.get('user_id');

    await supabase.from('exercises').delete().eq('routine_id', id).eq('user_id', user_id);
    await supabase.from('routines').delete().eq('id', id).eq('user_id', user_id);

    return c.json({ message: 'Rotina excluída com sucesso.' });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
};