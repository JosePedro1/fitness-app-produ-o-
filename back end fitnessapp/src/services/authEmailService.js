import { supabaseAdmin as supabase } from '../config/supabase.js';
import { sendEmail } from './emailService.js';

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://fitness-app-produ-o.vercel.app';

// ── Bem-vindo após verificação do e-mail ──────────────────────────────────────
export const sendRegisterEmail = async (email) => {
  await sendEmail(
    email,
    'Bem-vindo ao Fitness App! 🎉',
    `Olá!\n\nSeu e-mail foi verificado e sua conta está ativa.\n\nAcesse: ${FRONTEND_URL}\n\nBons treinos!\nEquipe Fitness App`
  );
};

// ── Link de verificação de e-mail (enviado no cadastro) ───────────────────────
export const sendVerificationEmail = async (email, token) => {
  const url = `${FRONTEND_URL}/verify-email?token=${token}`;
  await sendEmail(
    email,
    '✅ Verifique seu e-mail — Fitness App',
    `Olá!\n\nObrigado por se cadastrar no Fitness App!\n\n` +
    `Para ativar sua conta, clique no link abaixo (válido por 24 horas):\n\n` +
    `${url}\n\n` +
    `Se você não criou esta conta, ignore este e-mail com segurança.\n\n` +
    `Equipe Fitness App`
  );
};

// ── Alerta de novo dispositivo no login ───────────────────────────────────────
// Compara o User-Agent atual com o último registrado no banco.
// Se for diferente (novo aparelho/navegador), avisa por e-mail e atualiza o registro.
// IP é ignorado pois muda entre casa, academia, dados móveis etc.
export const sendLoginEmail = async (email, user_id, userAgent) => {
  // Lê o último User-Agent ANTES de qualquer update (feito aqui, não no controller)
  const { data: user } = await supabase
    .from('users')
    .select('last_user_agent')
    .eq('user_id', user_id)
    .single();

  const knownDevice = user?.last_user_agent === userAgent;

  if (!knownDevice) {
    const when       = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const deviceHint = summarizeUA(userAgent);

    await sendEmail(
      email,
      '🔐 Novo acesso à sua conta — Fitness App',
      `Olá!\n\nDetectamos um acesso em um dispositivo novo:\n\n` +
      `  Dispositivo: ${deviceHint}\n` +
      `  Horário: ${when}\n\n` +
      `Se foi você, pode ignorar este e-mail.\n` +
      `Se NÃO foi você, troque sua senha imediatamente:\n` +
      `${FRONTEND_URL}/forgot-password\n\n` +
      `Equipe Fitness App`
    );
  }

  // Atualiza o User-Agent conhecido (aqui, não no controller)
  await supabase
    .from('users')
    .update({ last_user_agent: userAgent })
    .eq('user_id', user_id);
};


// ── Aviso de sessão substituída (login em outro dispositivo) ─────────────────
export const sendSessionReplacedEmail = async (email) => {
  await sendEmail(
    email,
    '⚠️ Sua sessão foi encerrada — Fitness App',
    `Olá!\n\nDetectamos um novo login na sua conta, e por isso sua sessão anterior foi encerrada.\n\n` +
    `Se foi você, pode ignorar este e-mail.\n` +
    `Se NÃO foi você, troque sua senha imediatamente:\n` +
    `${FRONTEND_URL}/forgot-password\n\n` +
    `Equipe Fitness App`
  );
};

// ── Utilitário: resume o User-Agent em texto legível ─────────────────────────
function summarizeUA(ua = '') {
  if (!ua) return 'Dispositivo desconhecido';

  let browser = 'Navegador desconhecido';
  let os      = '';

  if (/Chrome\//.test(ua) && !/Chromium|Edg|OPR/.test(ua)) browser = 'Chrome';
  else if (/Firefox\//.test(ua))                             browser = 'Firefox';
  else if (/Edg\//.test(ua))                                 browser = 'Edge';
  else if (/OPR\//.test(ua))                                 browser = 'Opera';
  else if (/Safari\//.test(ua) && !/Chrome/.test(ua))        browser = 'Safari';

  if (/Android/.test(ua))          os = 'Android';
  else if (/iPhone|iPad/.test(ua)) os = 'iOS';
  else if (/Windows/.test(ua))     os = 'Windows';
  else if (/Mac OS/.test(ua))      os = 'Mac';
  else if (/Linux/.test(ua))       os = 'Linux';

  return os ? `${browser} no ${os}` : browser;
}