import supabase from '../config/supabase.js';
import { sendEmail } from './emailService.js';

export const sendRegisterEmail = async (email) => {
  await sendEmail(
    email,
    'Bem-vindo ao Fitness App!',
    `Olá!\n\nSeu cadastro foi realizado com sucesso.\n\nAcesse: https://fitness-app-produ-o.vercel.app\n\nBons treinos!\nEquipe Fitness App`
  );
};

export const sendLoginEmail = async (email, user_id) => {
  const today = new Date().toISOString().split('T')[0];

  const { data: user } = await supabase
    .from('users')
    .select('last_login_email_sent')
    .eq('user_id', user_id)
    .single();

  // Envia no máximo 1 e-mail de login por dia
  if (user?.last_login_email_sent === today) return;

  await sendEmail(
    email,
    'Novo acesso à sua conta',
    `Olá!\n\nDetectamos um novo login em ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}.\n\nSe não foi você, altere sua senha.\n\nEquipe Fitness App`
  );

  await supabase
    .from('users')
    .update({ last_login_email_sent: today })
    .eq('user_id', user_id);
};