import supabase from '../config/supabase.js';
import jwt from 'jsonwebtoken';

export const authenticate = async (c, next) => {
  try {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Acesso negado. Token não fornecido.' }, 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.sub) {
      return c.json({ error: 'Token inválido ou expirado.' }, 401);
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('user_id, email')
      .eq('user_id', decoded.sub)
      .single();

    if (userError || !user) {
      return c.json({ error: 'Usuário não encontrado.' }, 401);
    }

    c.set('user', user);
    c.set('user_id', user.user_id);

    await next();
  } catch (error) {
    return c.json({ error: 'Token inválido ou expirado.' }, 401);
  }
};