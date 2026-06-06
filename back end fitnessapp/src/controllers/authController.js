import jwt    from 'jsonwebtoken';
import crypto from 'crypto';
import supabase, { supabaseAdmin } from '../config/supabase.js';
import { sendEmail }                              from '../services/emailService.js';
import { sendRegisterEmail, sendLoginEmail }      from '../services/authEmailService.js';

// ── POST /auth/register ───────────────────────────────────────────────────────
export const register = async (c) => {
  try {
    const { email, password, academy_slug } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'E-mail e senha são obrigatórios.' }, 400);
    }

    // Verifica duplicata antes de criar no Auth
    const { data: existing } = await supabaseAdmin
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

    // Resolve academy_id se o slug foi informado
    let academy_id = null;
    if (academy_slug?.trim()) {
      const { data: academy } = await supabaseAdmin
        .from('academies')
        .select('id')
        .eq('slug', academy_slug.trim().toLowerCase())
        .eq('is_active', true)
        .maybeSingle();

      if (academy) academy_id = academy.id;
    }

    // Salva na tabela users usando supabaseAdmin para bypassar RLS
    const insertPayload = { user_id, email };
    if (academy_id) insertPayload.academy_id = academy_id;

    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert(insertPayload);

    if (userError) {
      console.error('Erro no insert de users:', userError.message);
      return c.json({ error: 'Erro ao salvar usuário.' }, 500);
    }

    // E-mail de boas-vindas — fire-and-forget, erro não quebra o cadastro
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

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('user_id')
      .eq('email', email)
      .maybeSingle();

    if (!user) {
      return c.json({ message: 'Se o e-mail existir, você receberá as instruções.' });
    }

    const token   = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await supabaseAdmin
      .from('users')
      .update({ reset_token: token, reset_token_expires: expires.toISOString() })
      .eq('user_id', user.user_id);

    const resetLink = `${process.env.FRONTEND_URL || 'https://fitness-app-produ-o.vercel.app'}/reset-password?token=${token}`;

    // E-mail isolado — se falhar, endpoint ainda retorna sucesso (usuário tenta de novo)
    try {
      await sendEmail(
        email,
        'Redefinição de senha — Fitness App',
        `Olá!\n\nClique no link abaixo para criar uma nova senha (válido por 1 hora):\n\n${resetLink}\n\nSe você não solicitou isso, ignore este e-mail.\n\nEquipe Fitness App`
      );
    } catch (emailErr) {
      console.error('E-mail de recuperação falhou:', emailErr.message);
    }

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

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('user_id, reset_token_expires')
      .eq('reset_token', token)
      .maybeSingle();

    if (!user) return c.json({ error: 'Link inválido ou expirado.' }, 400);

    if (new Date(user.reset_token_expires) < new Date()) {
      return c.json({ error: 'Link expirado. Solicite uma nova recuperação.' }, 400);
    }

    // auth.admin.updateUserById exige service_role — supabaseAdmin já usa essa key
    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(
      user.user_id,
      { password }
    );

    if (updateErr) {
      console.error('Erro ao redefinir senha no Auth:', updateErr.message);
      return c.json({ error: 'Erro ao redefinir senha.' }, 500);
    }

    await supabaseAdmin
      .from('users')
      .update({ reset_token: null, reset_token_expires: null })
      .eq('user_id', user.user_id);

    return c.json({ message: 'Senha redefinida com sucesso.' });
  } catch (err) {
    console.error('resetPassword error:', err);
    return c.json({ error: err.message }, 500);
  }
};
