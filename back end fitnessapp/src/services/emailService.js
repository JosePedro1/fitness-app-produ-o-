import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

const makeEmailBody = (to, subject, text) => {
  const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset=utf-8',
    '',
    text,
  ].join('\n');

  return Buffer.from(message).toString('base64url');
};

export const sendEmail = async (to, subject, text) => {
  try {
    const raw = makeEmailBody(to, subject, text);
    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw },
    });
    console.log(`E-mail enviado para ${to} — ID: ${result.data.id}`);
  } catch (err) {
    console.error('Erro ao enviar e-mail:', err.message);
    throw err;
  }
};