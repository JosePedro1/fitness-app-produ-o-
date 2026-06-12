import jwt    from 'jsonwebtoken';
import crypto from 'crypto';
import supabase, { supabaseAdmin }                                from '../config/supabase.js';
import { sendEmail }                                              from '../services/emailService.js';
import {
  sendRegisterEmail,
  sendVerificationEmail,
  sendLoginEmail,
  sendSessionReplacedEmail,
} from '../services/authEmailService.js';

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
      .select('user_id, email_verified')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      // Se já existe mas ainda não verificou, reenvia o link de verificação
      if (existing.email_verified === false) {
        const token   = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        await supabaseAdmin
          .from('users')
          .update({ verification_token: token, verification_token_expires: expires })
          .eq('user_id', existing.user_id);

        sendVerificationEmail(email, token).catch((err) =>
          console.error('Reenvio de verificação falhou:', err.message)
        );

        return c.json({
          message: 'Conta já cadastrada mas não verificada. Reenviamos o link para seu e-mail.',
        }, 200);
      }

      return c.json({ error: 'Este e-mail já está registrado.' }, 400);
    }

    // Cria usuário no Supabase Auth
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return c.json({ error: error.message }, 400);

    const user_id = data?.user?.id;
    if (!user_id) return c.json({ error: 'Erro ao obter user_id.' }, 500);

    // Resolve academy_id pelo slug
    let academy_id = null;
    if (academy_slug?.trim()) {
      const { data: academy, error: acadErr } = await supabaseAdmin
        .from('academies')
        .select('id')
        .eq('slug', academy_slug.trim().toLowerCase())
        .eq('is_active', true)
        .maybeSingle();

      if (acadErr) {
        console.error('Erro ao buscar academia:', acadErr.message);
      } else if (academy) {
        academy_id = academy.id;
      } else {
        console.warn(`register: academia "${academy_slug}" não encontrada ou inativa.`);
      }
    }

    // Gera token de verificação de e-mail (válido 24 h)
    const verificationToken   = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Upsert com email_verified = false
    const upsertPayload = {
      user_id,
      email,
      email_verified:              false,
      verification_token:          verificationToken,
      verification_token_expires:  verificationExpires,
    };
    if (academy_id) upsertPayload.academy_id = academy_id;

    const { error: upsertError } = await supabaseAdmin
      .from('users')
      .upsert(upsertPayload, { onConflict: 'user_id' });

    if (upsertError) {
      console.error('Erro no upsert de users:', upsertError.message, upsertError.details);
      await supabaseAdmin.auth.admin.deleteUser(user_id).catch(() => {});
      return c.json({ error: 'Erro ao salvar usuário.' }, 500);
    }

    if (academy_id) {
      await supabaseAdmin
        .from('users')
        .update({ academy_id })
        .eq('user_id', user_id);
    }

    // Envia e-mail de verificação (NÃO o de boas-vindas — este vem após confirmação)
    sendVerificationEmail(email, verificationToken).catch((err) =>
      console.error('E-mail de verificação falhou:', err.message)
    );

    return c.json({
      message: 'Cadastro iniciado! Verifique seu e-mail para ativar sua conta.',
      user: { user_id, email },
      academy_id,
    });
  } catch (err) {
    console.error('register error:', err);
    return c.json({ error: err.message }, 500);
  }
};
// ── GET /auth/verify-email?token=xxx ─────────────────────────────────────────
export const verifyEmail = async (c) => {
  try {
    const token = c.req.query('token');

    if (!token) {
      return c.json({ error: 'Token de verificação não informado.' }, 400);
    }

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('user_id, email, verification_token_expires, email_verified')
      .eq('verification_token', token)
      .maybeSingle();

    if (!user) {
      return c.json({ error: 'Link de verificação inválido ou já utilizado.' }, 400);
    }

    if (user.email_verified) {
      return c.json({ message: 'E-mail já verificado. Você pode fazer login.' });
    }

    if (new Date(user.verification_token_expires) < new Date()) {
      return c.json({
        error: 'Link expirado. Faça login para receber um novo link de verificação.',
      }, 400);
    }

    // Marca como verificado e limpa o token
    await supabaseAdmin
      .from('users')
      .update({
        email_verified:             true,
        verification_token:         null,
        verification_token_expires: null,
      })
      .eq('user_id', user.user_id);

    // Agora sim, envia o e-mail de boas-vindas
    sendRegisterEmail(user.email).catch((err) =>
      console.error('E-mail de boas-vindas falhou:', err.message)
    );

    return c.json({ message: 'E-mail verificado com sucesso! Você já pode fazer login.' });
  } catch (err) {
    console.error('verifyEmail error:', err);
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

    // Verifica se o e-mail foi confirmado na nossa tabela
    const { data: userRecord } = await supabaseAdmin
      .from('users')
      .select('email_verified, current_session_id')
      .eq('user_id', user_id)
      .single();

    // email_verified === false (explicitamente false, não null) → bloqueia login
    if (userRecord?.email_verified === false) {
      return c.json({
        error: 'E-mail não verificado. Verifique sua caixa de entrada e clique no link enviado.',
        code: 'EMAIL_NOT_VERIFIED',
      }, 403);
    }

    const session_id = crypto.randomBytes(32).toString('hex');
    const userAgent  = c.req.header('User-Agent') || '';

    // FIX: atualiza SOMENTE o session_id aqui.
    // O last_user_agent é lido e atualizado dentro de sendLoginEmail,
    // garantindo que a comparação aconteça com o valor anterior (não o novo).
    await supabaseAdmin
      .from('users')
      .update({ current_session_id: session_id })
      .eq('user_id', user_id);

    const token = jwt.sign(
      { sub: user_id, sid: session_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Envia alerta de novo dispositivo (se for o caso) e atualiza last_user_agent
    sendLoginEmail(email, user_id, userAgent).catch((err) =>
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

    // Resposta genérica para não revelar quais e-mails existem
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

// ── POST /auth/google ─────────────────────────────────────────────────────────
export const googleLogin = async (c) => {
  try {
    const { credential, academy_slug } = await c.req.json();

    if (!credential) {
      return c.json({ error: 'credential é obrigatório.' }, 400);
    }

    // Valida o token com o Google
    const googleRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
    );
    const profile = await googleRes.json();

    if (!googleRes.ok || profile.error) {
      return c.json({ error: 'Token do Google inválido.' }, 401);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (clientId && profile.aud !== clientId) {
      return c.json({ error: 'Token não pertence a este app.' }, 401);
    }

    const email     = profile.email;
    const google_id = profile.sub;

    if (!email) {
      return c.json({ error: 'Não foi possível obter o e-mail do Google.' }, 400);
    }

    let { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('user_id, email')
      .eq('email', email)
      .maybeSingle();

    let user_id;

    if (existingUser) {
      user_id = existingUser.user_id;
      try {
        await supabaseAdmin.from('users').update({ google_id }).eq('user_id', user_id);
      } catch (_) { /* coluna pode não existir ainda */ }

    } else {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { google_id, full_name: profile.name, avatar_url: profile.picture },
      });

      if (authError) {
        if (authError.message?.includes('already been registered')) {
          const { data: { users: authUsers } } = await supabaseAdmin.auth.admin.listUsers();
          const found = authUsers?.find(u => u.email === email);
          if (!found) return c.json({ error: 'Erro ao localizar usuário.' }, 500);
          user_id = found.id;
        } else {
          console.error('googleLogin — createUser error:', authError.message);
          return c.json({ error: authError.message }, 500);
        }
      } else {
        user_id = authData.user.id;
      }

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

      // Google já confirma o e-mail — email_verified = true direto
      const upsertPayload = { user_id, email, email_verified: true };
      if (academy_id) upsertPayload.academy_id = academy_id;

      await supabaseAdmin
        .from('users')
        .upsert(upsertPayload, { onConflict: 'user_id' });

      sendRegisterEmail(email).catch(() => {});
    }

    const session_id = crypto.randomBytes(32).toString('hex');
    const userAgent  = c.req.header('User-Agent') || '';

    // FIX: atualiza SOMENTE o session_id aqui.
    // last_user_agent é lido e atualizado dentro de sendLoginEmail.
    await supabaseAdmin
      .from('users')
      .update({ current_session_id: session_id })
      .eq('user_id', user_id);

    const token = jwt.sign(
      { sub: user_id, sid: session_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    sendLoginEmail(email, user_id, userAgent).catch(() => {});

    return c.json({
      message: 'Login com Google bem-sucedido.',
      token,
      user: { user_id, email },
    });

  } catch (err) {
    console.error('googleLogin error:', err);
    return c.json({ error: err.message }, 500);
  }
};