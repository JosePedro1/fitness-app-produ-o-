/**
 * authController.js — versão atualizada com academy_slug no registro
 *
 * MUDANÇA EM RELAÇÃO AO ORIGINAL:
 *   - register() aceita academy_slug opcional no body
 *   - Se informado, busca a academia e salva academy_id em users
 *   - Todo o resto do arquivo é idêntico ao original
 */

import jwt    from 'jsonwebtoken';
import crypto from 'crypto';
import supabase from '../config/supabase.js';
import { sendEmail }         from '../services/emailService.js';
import { sendRegisterEmail, sendLoginEmail } from '../services/authEmailService.js';

// ── POST /auth/register ───────────────────────────────────────────────────────
export const register = async (c) => {
  try {
    const { email, password, academy_slug } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'E-mail e senha são obrigatórios.' }, 400);
    }

    // Verifica duplicata antes de criar no Auth
    const { data: existing } = await supabase
      .from('users')
      .select('user_id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      return c.json({ error: 'Este e-mail já está registrado.' }, 400);
    }

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) return c.json({ error: error.message }, 400);

    const user_id = data?.user?.id;
    if (!user_id) return c.json({ error: 'Erro ao obter user_id.' }, 500);

    // ── NOVO: resolve academy_id se o slug foi informado ────────────────────
    let academy_id = null;
    if (academy_slug?.trim()) {
      const { data: academy } = await supabase
        .from('academies')
        .select('id')
        .eq('slug', academy_slug.trim().toLowerCase())
        .eq('is_active', true)
        .maybeSingle();

      if (academy) academy_id = academy.id;
      // Se o slug não existir, simplesmente ignora (não falha o cadastro)
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Salva na tabela users com academy_id (pode ser null)
    const { error: userError } = await supabase
      .from('users')
      .insert({ user_id, email, academy_id });

    if (userError) return c.json({ error: 'Erro ao salvar usuário.' }, 500);

    sendRegisterEmail(email).catch((err) =>
      console.error('E-mail de cadastro falhou:', err.message)
    );

    return c.json({
      message: 'Usuário registrado com sucesso.',
      user: { user_id, email },
      academy_id,
    });
  } catch (err) {
    console.error('register error:', err);
    return c.json({ error: err.message }, 500);
  }
};

// ── POST /auth/login ──────────────────────────────────────────────────────────
// IDÊNTICO AO ORIGINAL
export const login = async (c) => {
  try {
    const { email, password } = await c.req.json();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return c.json({ error: 'E-mail ou senha incorretos.' }, 400);

    const user_id = data?.user?.id;
    if (!user_id) return c.json({ error: 'Erro ao gerar token.' }, 500);

    const token = jwt.sign(
      { sub: user_id },
      process.env.JWT_SECRET,
      { expiresIn: '3h' }
    );

    sendLoginEmail(email, user_id).catch((err) =>
      console.error('E-mail de login falhou:', err.message)
    );

    return c.json({ message: 'Login bem-sucedido.', token, user: { user_id, email } });
  } catch (err) {
    console.error('login error:', err);
    return c.json({ error: err.message }, 500);
  }
};

// ── GET /auth/validate ────────────────────────────────────────────────────────
export const validate = (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'Não autenticado.' }, 401);
  return c.json({ valid: true, user: { user_id: user.user_id, email: user.email } });
};

// ── POST /auth/logout ─────────────────────────────────────────────────────────
export const logout = (c) => c.json({ message: 'Logout bem-sucedido.' });

// ── POST /auth/forgot-password ────────────────────────────────────────────────
export const forgotPassword = async (c) => {
  try {
    const { email } = await c.req.json();

    const { data: user } = await supabase
      .from('users')
      .select('user_id')
      .eq('email', email)
      .maybeSingle();

    if (!user) {
      return c.json({ message: 'Se o e-mail existir, você receberá as instruções.' });
    }

    const token   = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await supabase
      .from('users')
      .update({ reset_token: token, reset_token_expires: expires.toISOString() })
      .eq('user_id', user.user_id);

    const resetLink = `${process.env.FRONTEND_URL || 'https://fitness-app-produ-o.vercel.app'}/reset-password?token=${token}`;

    await sendEmail(
      email,
      'Redefinição de senha — Fitness App',
      `Olá!\n\nClique no link abaixo para criar uma nova senha (válido por 1 hora):\n\n${resetLink}\n\nSe você não solicitou isso, ignore este e-mail.\n\nEquipe Fitness App`
    );

    return c.json({ message: 'Se o e-mail existir, você receberá as instruções.' });
  } catch (err) {
    console.error('forgotPassword error:', err);
    return c.json({ error: err.message }, 500);
  }
};

// ── POST /auth/reset-password ─────────────────────────────────────────────────
export const resetPassword = async (c) => {
  try {
    const { token, password } = await c.req.json();

    if (!token || !password) {
      return c.json({ error: 'Token e nova senha são obrigatórios.' }, 400);
    }

    const { data: user } = await supabase
      .from('users')
      .select('user_id, reset_token_expires')
      .eq('reset_token', token)
      .maybeSingle();

    if (!user) return c.json({ error: 'Link inválido ou expirado.' }, 400);

    if (new Date(user.reset_token_expires) < new Date()) {
      return c.json({ error: 'Link expirado. Solicite uma nova recuperação.' }, 400);
    }

    await supabase.auth.admin.updateUserById(user.user_id, { password });

    await supabase
      .from('users')
      .update({ reset_token: null, reset_token_expires: null })
      .eq('user_id', user.user_id);

    return c.json({ message: 'Senha redefinida com sucesso.' });
  } catch (err) {
    console.error('resetPassword error:', err);
    return c.json({ error: err.message }, 500);
  }
};
