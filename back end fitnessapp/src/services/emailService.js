import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verifica a conexão com o Gmail ao iniciar
transporter.verify((error, success) => {
  if (error) {
    console.error('ERRO NA CONEXÃO SMTP:', error);
  } else {
    console.log('SMTP conectado com sucesso, pronto para enviar e-mails');
  }
});

export const sendEmail = async (to, subject, text) => {
  console.log(`Tentando enviar e-mail para ${to}...`);
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
    console.log(`E-mail enviado para ${to} — ID: ${info.messageId}`);
  } catch (err) {
    console.error('ERRO AO ENVIAR E-MAIL:', JSON.stringify(err, null, 2));
    throw err;
  }
};