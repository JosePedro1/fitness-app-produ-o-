import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to, subject, text) => {
  console.log(`Tentando enviar e-mail para ${to}...`);
  try {
    const { data, error } = await resend.emails.send({
      from: 'Fitness App <onboarding@resend.dev>',
      to,
      subject,
      text,
    });

    if (error) {
      console.error('ERRO AO ENVIAR E-MAIL:', error);
      throw error;
    }

    console.log(`E-mail enviado para ${to} — ID: ${data.id}`);
  } catch (err) {
    console.error('ERRO AO ENVIAR E-MAIL:', err);
    throw err;
  }
};