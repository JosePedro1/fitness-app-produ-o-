import supabase from '../config/supabase.js';
import jwt from 'jsonwebtoken';

export const authenticate = async (c, next) => {
  try {
    const cookieHeader = c.req.header('Cookie');
    
    if (!cookieHeader) {
      console.warn('Nenhum cookie encontrado');
      return c.json({ error: 'Acesso negado. Token não fornecido.' }, 401);
    }

    const cookies = Object.fromEntries(cookieHeader.split('; ').map(cookie => cookie.split('=')));

    const token = cookies['auth_token'];

    if (!token) {
      console.warn('auth_token não encontrado no cookie');
      return c.json({ error: 'Acesso negado. Token não fornecido.' }, 401);
    }

    console.log('Token do Cookie:', token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded JWT:', decoded);

    if (!decoded || !decoded.sub) {
      console.error('Erro na autenticação: Token inválido (sub claim ausente)');
      return c.json({ error: 'Token inválido ou expirado.' }, 401);
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('user_id, email')
      .eq('user_id', decoded.sub)
      .single();

    if (userError || !user) {
      console.error('Usuário não encontrado:', userError?.message);
      return c.json({ error: 'Usuário não encontrado.' }, 401);
    }

    c.set('user', user);
    c.set('user_id', user.user_id);
    
    await next();

  } catch (error) {
    console.error('Erro ao verificar token:', error.message);
    return c.json({ error: 'Token inválido ou expirado.' }, 401);
  }
};
