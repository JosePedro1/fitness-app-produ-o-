import supabase from '../config/supabase.js';

export const createRoutine = async (c) => {
  try {
    const { name, exercises } = await c.req.json();
    const user_id = c.get('user_id');

    console.log(`Criando rotina para user_id: ${user_id}`);

    const { data: routineData, error: routineError } = await supabase
      .from('routines')
      .insert([{ name, user_id }])
      .select()
      .single();

    if (routineError) {
      console.error('Erro ao criar rotina:', routineError.message);
      throw new Error(routineError.message);
    }

    console.log('Rotina criada com sucesso:', routineData);

    const routine_id = routineData.id;

    if (exercises && exercises.length > 0) {
      const exercisesToInsert = exercises.map((exercise) => ({
        exercise: typeof exercise === 'string' ? exercise : exercise.name,
        completed: false,
        user_id,
        routine_id
      }));

      const { error: exercisesError } = await supabase
        .from('exercises')
        .insert(exercisesToInsert);

      if (exercisesError) {
        console.error('Erro ao adicionar exercícios:', exercisesError.message);
        throw new Error(exercisesError.message);
      }

      console.log('Exercícios adicionados com sucesso.');
    }

    return c.json({ message: 'Rotina e exercícios criados com sucesso.', routine: routineData }, 201);

  } catch (err) {
    console.error('Erro na requisição createRoutine:', err.message);
    return c.json({ error: err.message }, 500);
  }
};

export const getRoutines = async (c) => {
  try {
    const user_id = c.get('user_id'); 

    console.log(`Buscando rotinas para user_id: ${user_id}`);

    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .eq('user_id', user_id);

    if (error) {
      console.error('Erro ao buscar rotinas:', error.message);
      throw new Error(error.message);
    }

    console.log('Rotinas encontradas:', data);
    return c.json(data);
  } catch (err) {
    console.error('Erro na requisição getRoutines:', err.message);
    return c.json({ error: err.message }, 500);
  }
};

export const deleteRoutine = async (c) => {
  try {
    const id = c.req.param('id');
    const user_id = c.get('user_id');

    const { error: exercisesError } = await supabase
      .from('exercises')
      .delete()
      .eq('routine_id', id)
      .eq('user_id', user_id);

    if (exercisesError) {
      console.error('Erro ao excluir exercícios:', exercisesError.message);
      throw new Error(exercisesError.message);
    }

    const { error: routineError } = await supabase
      .from('routines')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id);

    if (routineError) {
      console.error('Erro ao excluir rotina:', routineError.message);
      throw new Error(routineError.message);
    }

    return c.json({ message: 'Rotina e exercícios excluídos com sucesso.' });

  } catch (err) {
    console.error('Erro na requisição deleteRoutine:', err.message);
    return c.json({ error: err.message }, 500);
  }
};
