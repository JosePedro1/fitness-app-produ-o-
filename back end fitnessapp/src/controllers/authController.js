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

    // Cria usuário no Supabase Auth
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) return c.json({ error: error.message }, 400);

    const user_id = data?.user?.id;
    if (!user_id) return c.json({ error: 'Erro ao obter user_id.' }, 500);

    // Resolve academy_id pelo slug (supabaseAdmin bypassa RLS)
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
        console.log(`register: academy_slug="${academy_slug}" → academy_id=${academy_id}`);
      } else {
        console.warn(`register: academia "${academy_slug}" não encontrada ou inativa.`);
      }
    }

    // UPSERT em vez de INSERT para sobreviver a triggers do Supabase que
    // já inserem o usuário em public.users ao criar em auth.users.
    // onConflict: 'user_id' — se já existe, atualiza email + academy_id.
    const upsertPayload = { user_id, email };
    if (academy_id) upsertPayload.academy_id = academy_id;

    const { error: upsertError } = await supabaseAdmin
      .from('users')
      .upsert(upsertPayload, { onConflict: 'user_id' });

    if (upsertError) {
      console.error('Erro no upsert de users:', upsertError.message, upsertError.details);
      await supabaseAdmin.auth.admin.deleteUser(user_id).catch(() => {});
      return c.json({ error: 'Erro ao salvar usuário.' }, 500);
    }

    // Se houver academy_id mas o upsert não salvou (trigger inseriu sem o campo),
    // garante que o academy_id foi de fato persistido com um UPDATE explícito.
    if (academy_id) {
      await supabaseAdmin
        .from('users')
        .update({ academy_id })
        .eq('user_id', user_id);
      console.log(`register: academy_id=${academy_id} gravado para user ${user_id}`);
    }

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

    // Gera um session_id único para esta sessão — invalida sessões anteriores
    const session_id = crypto.randomBytes(32).toString('hex');
    const userAgent  = c.req.header('User-Agent') || '';

    // Salva session_id e user_agent no banco
    await supabaseAdmin
      .from('users')
      .update({ current_session_id: session_id, last_user_agent: userAgent })
      .eq('user_id', user_id);

    const token = jwt.sign(
      { sub: user_id, sid: session_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }  // 7 dias — sessão única dispensa expiração curta
    );

    // E-mail só se for dispositivo diferente do último login
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



export const googleLogin = async (c) => {
  try {
    const { credential, academy_slug } = await c.req.json();
 
    if (!credential) {
      return c.json({ error: 'credential é obrigatório.' }, 400);
    }
 
    // 1. Valida o token com o Google (gratuito, sem chave extra)
    const googleRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
    );
    const profile = await googleRes.json();
 
    if (!googleRes.ok || profile.error) {
      return c.json({ error: 'Token do Google inválido.' }, 401);
    }
 
    // Verifica que o token foi emitido para o nosso app
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (clientId && profile.aud !== clientId) {
      return c.json({ error: 'Token não pertence a este app.' }, 401);
    }
 
    const email     = profile.email;
    const google_id = profile.sub; // ID único do Google
 
    if (!email) {
      return c.json({ error: 'Não foi possível obter o e-mail do Google.' }, 400);
    }
 
    // 2. Verifica se o usuário já existe em public.users
    let { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('user_id, email')
      .eq('email', email)
      .maybeSingle();
 
    let user_id;
 
    if (existingUser) {
      // Usuário já cadastrado — apenas loga
      user_id = existingUser.user_id;
 
      // Atualiza google_id se a coluna existir (opcional)
      await supabaseAdmin
        .from('users')
        .update({ google_id })
        .eq('user_id', user_id)
        .throwOnError()
        .catch(() => { /* coluna pode não existir ainda — ignora */ });
 
    } else {
      // 3. Cria usuário no Supabase Auth (sem senha, confirmado direto)
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { google_id, full_name: profile.name, avatar_url: profile.picture },
      });
 
      if (authError) {
        // Se o usuário já existe no auth.users mas não em public.users
        if (authError.message?.includes('already been registered')) {
          // Busca pelo e-mail via admin
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
 
      // 4. Resolve academy_id (se vier por link de academia)
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
 
      // 5. Upsert em public.users
      const upsertPayload = { user_id, email };
      if (academy_id) upsertPayload.academy_id = academy_id;
      // google_id só se a coluna existir:
      // upsertPayload.google_id = google_id;
 
      await supabaseAdmin
        .from('users')
        .upsert(upsertPayload, { onConflict: 'user_id' });
 
      // E-mail de boas-vindas (não bloqueia)
      sendRegisterEmail(email).catch(() => {});
    }
 
    // 6. Gera sessão única e JWT
    const session_id = crypto.randomBytes(32).toString('hex');
    const userAgent  = c.req.header('User-Agent') || '';

    await supabaseAdmin
      .from('users')
      .update({ current_session_id: session_id, last_user_agent: userAgent })
      .eq('user_id', user_id);

    const token = jwt.sign(
      { sub: user_id, sid: session_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // E-mail só se for dispositivo diferente
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