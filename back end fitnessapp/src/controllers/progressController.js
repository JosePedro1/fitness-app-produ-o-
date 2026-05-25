import supabase from '../config/supabase.js';

export const postProgress = async (c) => {
  try {
    const { weight, measurements, date } = await c.req.json();
    const user_id = c.get('user_id');

    const { data, error } = await supabase
      .from('progress')
      .insert([{
        weight,
        measurements,
        user_id,
        date: date || new Date().toISOString().split('T')[0],
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);

    return c.json(data, 201);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
};

export const getProgress = async (c) => {
  try {
    const user_id = c.get('user_id');

    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', user_id)
      .order('date', { ascending: false });

    if (error) throw new Error(error.message);

    return c.json(data);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
};

export const deleteProgress = async (c) => {
  const user_id = c.get('user_id');
  const id = Number(c.req.param('id'));
  
  const { error } = await supabase
    .from('progress')
    .delete()
    .eq('id', id)
    .eq('user_id', user_id);

  if (error) {
    console.error('Erro ao excluir progresso:', error.message);
    return c.json({ error: error.message }, 500);
  }

  return c.json({ message: 'Progresso deletado com sucesso' });
};

