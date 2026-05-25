import supabase from '../config/supabase.js';

export const getTasks = async (c) => {
  const userId = c.get('user_id');

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId);

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
};

// export const getTaskById = async (c) => {
//   const userId = c.get('user_id');
//   const id = Number(c.req.param('id'));

//   const { data, error } = await supabase
//     .from('tasks')
//     .select('*')
//     .eq('id', id)
//     .eq('user_id', userId)
//     .single();

//   if (error) return c.json({ error: error.message }, 500);
//   if (!data) return c.json({ error: 'Tarefa não encontrada' }, 404);

//   return c.json(data);
// };

export const addTask = async (c) => {
  const userId = c.get('user_id');
  const body = await c.req.json();
  const { title, start_date, end_date, category, status } = body;

  if (!title || !start_date || !end_date || !category || !status) {
    return c.json({ error: 'Todos os campos são obrigatórios' }, 400);
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert([
      {
        title,
        start_date,
        end_date,
        category,
        status,
        user_id: userId
      }
    ])
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
};


export const updateTask = async (c) => {
  const userId = c.get('user_id');
  const id = Number(c.req.param('id'));
  const body = await c.req.json();

  const { data, error } = await supabase
    .from('tasks')
    .update(body)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
};

export const deleteTask = async (c) => {
  const userId = c.get('user_id');
  const id = Number(c.req.param('id'));

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ message: 'Tarefa removida com sucesso' });
};
