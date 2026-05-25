import supabase from '../config/supabase.js';
import { sendEmail } from './emailService.js';

export const sendRegisterEmail = async (email) => {
  try {
    await sendEmail(
      email,
      ' Bem-vindo ao Fitness App!',
      `Olá!\n\nSeu cadastro no Fitness App foi realizado com sucesso.\n\nAgora você tem acesso a:\n• Criação de rotinas de treino personalizadas\n• Registro de progresso físico\n• Gerenciamento de tarefas e metas\n• Cronômetro para seus treinos\n\nAcesse agora: https://fitness-app-produ-o.vercel.app\n\nBons treinos!\nEquipe Fitness App`
    );
  } catch (error) {
    console.error('Erro ao enviar e-mail de cadastro:', error.message);
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

    if (user?.last_login_email_sent === today) return;

    await sendEmail(
      email,
      ' Novo acesso à sua conta',
      `Olá!\n\nDetectamos um novo login na sua conta do Fitness App.\n\nData e hora: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}\n\nSe não foi você, recomendamos que altere sua senha imediatamente.\n\nEquipe Fitness App`
    );

    await supabase
      .from('users')
      .update({ last_login_email_sent: today })
      .eq('user_id', user_id);

  } catch (error) {
    console.error('Erro ao enviar e-mail de login:', error.message);
  }
};