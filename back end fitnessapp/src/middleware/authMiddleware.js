/**
 * authMiddleware.js
 *
 * CORREÇÃO: usa supabaseAdmin (service_role) para buscar o usuário,
 * evitando que RLS da anon key bloqueie silenciosamente o lookup.
 */

import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase.js';

export const authenticate = async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Token não fornecido.' }, 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
  } catch {
    return c.json({ error: 'Token inválido ou expirado.' }, 401);
  }

  if (!decoded?.sub) {
    return c.json({ error: 'Token inválido.' }, 401);
  }

  // Busca usuário e valida session_id (sessão única por aparelho)
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('user_id, email, current_session_id')
    .eq('user_id', decoded.sub)
    .single();

  if (error || !user) {
    return c.json({ error: 'Usuário não encontrado.' }, 401);
  }

  // Se o token tem sid e não bate com a sessão atual → foi substituído por login em outro aparelho
  if (decoded.sid && user.current_session_id && decoded.sid !== user.current_session_id) {
    return c.json({
      error: 'Sessão encerrada. Sua conta foi acessada em outro dispositivo.',
      code: 'SESSION_REPLACED',
    }, 401);
  }

  c.set('user', user);
  c.set('user_id', user.user_id);

  await next();
};