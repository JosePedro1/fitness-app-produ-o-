import jwt from 'jsonwebtoken';
import supabase from '../config/supabase.js';
import { sendRegisterEmail, sendLoginEmail } from '../services/authEmailService.js';

export const register = async (c) => {
  try {
    const { email, password } = await c.req.json();

    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return c.json({ error: 'Este e-mail já está registrado.' }, 400);
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    const user_id = data?.user?.id || data?.session?.user?.id;

    if (!user_id) {
      return c.json({ error: 'Erro ao gerar user_id' }, 500);
    }

    const { error: userError } = await supabase
      .from('users')
      .insert({
        user_id,
        email,
        password,
      });

    if (userError) {
      return c.json({ error: 'Erro ao salvar usuário' }, 500);
    }

    // Envia e-mail de boas-vindas (não bloqueia a resposta)
    sendRegisterEmail(email).catch((err) =>
      console.error('Falha ao enviar e-mail de cadastro:', err)
    );

    return c.json({
      message: 'Usuário registrado com sucesso',
      user: { user_id, email },
    });
  } catch (error) {
    console.error(error);
    return c.json({ error: error.message }, 500);
  }
};

export const login = async (c) => {
  try {
    const { email, password } = await c.req.json();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return c.json({ error: 'E-mail ou senha incorretos.' }, 400);
    }

    const user_id = data?.user?.id || data?.session?.user?.id;

    if (!user_id) {
      return c.json({ error: 'Erro ao gerar token' }, 500);
    }

    const token = jwt.sign(
      { sub: user_id },
      process.env.JWT_SECRET,
      { expiresIn: '3h' }
    );

    c.header(
      'Set-Cookie',
      `auth_token=${token}; HttpOnly; Path=/; Max-Age=10800; SameSite=None; Secure`
    );

    // Envia e-mail de login (máx 1 por dia, não bloqueia a resposta)
    sendLoginEmail(email, user_id).catch((err) =>
      console.error('Falha ao enviar e-mail de login:', err)
    );

    return c.json({
      message: 'Login bem-sucedido',
      user: {
        user_id,
        email,
      }
    });
  } catch (error) {
    console.error(error);
    return c.json({ error: error.message }, 500);
  }
};

export const validate = async (c) => {
  try {
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Usuário não autenticado' }, 401);
    }

    return c.json({
      valid: true,
      user: {
        user_id: user.user_id,
        email: user.email,
      }
    });
  } catch (error) {
    console.error(error);
    return c.json({ error: error.message }, 500);
  }
};

export const logout = async (c) => {
  try {
    c.header(
      'Set-Cookie',
      'auth_token=; HttpOnly; Path=/; Max-Age=0; SameSite=None; Secure'
    );

    return c.json({
      message: 'Logout bem-sucedido',
    });
  } catch (error) {
    console.error('Erro no logout:', error);
    return c.json({ error: error.message }, 500);
  }
};
