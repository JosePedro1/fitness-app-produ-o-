import supabase from '..supabase.js';
import { sendEmail } from '.emailService.js';

export const sendRegisterEmail = async (email) => {
  try {
    await sendEmail(
      email,
      'Cadastro realizado com sucesso',
      `Olá, seu cadastro no Fitness App foi realizado com sucesso. Seja bem-vindo!`
    );

    console.log(`E-mail de cadastro enviado para ${email}`);
  } catch (error) {
    console.error('Erro ao enviar e-mail de cadastro', error);
  }
};

export const sendLoginEmail = async (email, user_id) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data: user } = await supabase
      .from('users')
      .select('last_login_email_sent')
      .eq('user_id', user_id)
      .single();

    if (user?.last_login_email_sent === today) {
      console.log(`E-mail de login já enviado hoje para ${email}`);
      return;
    }

    await sendEmail(
      email,
      'Novo login realizado',
      `Olá, um novo login foi realizado na sua conta do Fitness App.`
    );

    await supabase
      .from('users')
      .update({
        last_login_email_sent: today,
      })
      .eq('user_id', user_id);

    console.log(`E-mail de login enviado para ${email}`);
  } catch (error) {
    console.error('Erro ao enviar e-mail de login', error);
  }
};