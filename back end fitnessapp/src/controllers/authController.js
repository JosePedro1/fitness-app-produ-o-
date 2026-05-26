import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import supabase from '../config/supabase.js';
import { sendEmail } from '../services/emailService.js';
import { sendRegisterEmail, sendLoginEmail, } from '../services/authEmailService.js';


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

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    const user_id = data?.user?.id || data?.session?.user?.id;

    if (!user_id) {
      return c.json({ error: 'Erro ao gerar user_id' }, 500);
    }

    const { error: userError } = await supabase
      .from('users')
      .insert({ user_id, email, password });

    if (userError) {
      return c.json({ error: 'Erro ao salvar usuário' }, 500);
    }

    sendRegisterEmail(email).catch((err) =>
      console.error('Falha ao enviar e-mail de cadastro:', err.message)
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

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

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

    sendLoginEmail(email, user_id).catch((err) =>
      console.error('Falha ao enviar e-mail de login:', err.message)
    );

    return c.json({
      message: 'Login bem-sucedido',
      token,
      user: { user_id, email },
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
  return c.json({ message: 'Logout bem-sucedido' });

    return c.json({ message: 'Logout bem-sucedido' });
  } catch (error) {
    console.error('Erro no logout:', error);
    return c.json({ error: error.message }, 500);
  }
};



export const forgotPassword = async (c) => {
  try {
    const { email } = await c.req.json();

    const { data: user } = await supabase
      .from('users')
      .select('user_id')
      .eq('email', email)
      .single();

    // Responde igual mesmo se o e-mail não existir (segurança)
    if (!user) {
      return c.json({ message: 'Se o e-mail existir, você receberá as instruções.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

    await supabase
      .from('users')
      .update({
        reset_token: token,
        reset_token_expires: expires.toISOString(),
      })
      .eq('user_id', user.user_id);

    const resetLink = `https://fitness-app-produ-o.vercel.app/reset-password?token=${token}`;

    await sendEmail(
      email,
      'Redefinição de senha — Fitness App',
      `Olá!\n\nRecebemos uma solicitação para redefinir a senha da sua conta.\n\nClique no link abaixo para criar uma nova senha (válido por 1 hora):\n\n${resetLink}\n\nSe você não solicitou isso, ignore este e-mail.\n\nEquipe Fitness App`
    );

    return c.json({ message: 'Se o e-mail existir, você receberá as instruções.' });
  } catch (error) {
    console.error(error);
    return c.json({ error: error.message }, 500);
  }
};

export const resetPassword = async (c) => {
  try {
    const { token, password } = await c.req.json();

    const { data: user } = await supabase
      .from('users')
      .select('user_id, reset_token_expires')
      .eq('reset_token', token)
      .single();

    if (!user) {
      return c.json({ error: 'Link inválido ou expirado.' }, 400);
    }

    if (new Date(user.reset_token_expires) < new Date()) {
      return c.json({ error: 'Link expirado. Solicite uma nova recuperação.' }, 400);
    }

    await supabase.auth.admin.updateUserById(user.user_id, { password });

    await supabase
      .from('users')
      .update({
        password,
        reset_token: null,
        reset_token_expires: null,
      })
      .eq('user_id', user.user_id);

    return c.json({ message: 'Senha redefinida com sucesso.' });
  } catch (error) {
    console.error(error);
    return c.json({ error: error.message }, 500);
  }
};