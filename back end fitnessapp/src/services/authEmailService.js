import { supabaseAdmin as supabase } from '../config/supabase.js';
import { sendEmail } from './emailService.js';

export const sendRegisterEmail = async (email) => {
  await sendEmail(
    email,
    'Bem-vindo ao Fitness App!',
    `Olá!\n\nSeu cadastro foi realizado com sucesso.\n\nAcesse: https://fitness-app-produ-o.vercel.app\n\nBons treinos!\nEquipe Fitness App`
  );
};

// Envia e-mail de novo acesso apenas se o User-Agent (aparelho/navegador) for diferente do último login.
// IP é ignorado pois muda entre casa, academia, dados móveis etc.
export const sendLoginEmail = async (email, user_id, userAgent) => {
  const { data: user } = await supabase
    .from('users')
    .select('last_user_agent')
    .eq('user_id', user_id)
    .single();

  const knownDevice = user?.last_user_agent === userAgent;

  // Dispositivo diferente → avisa por e-mail
  if (!knownDevice) {
    const when = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    // Resumo legível do aparelho (ex: "Chrome no Android")
    const deviceHint = summarizeUA(userAgent);

    await sendEmail(
      email,
      '🔐 Novo acesso à sua conta',
      `Olá!\n\nDetectamos um acesso em um dispositivo novo:\n\n` +
      `  Dispositivo: ${deviceHint}\n` +
      `  Horário: ${when}\n\n` +
      `Se foi você, pode ignorar este e-mail.\n` +
      `Se NÃO foi você, troque sua senha imediatamente:\n` +
      `https://fitness-app-produ-o.vercel.app/forgot-password\n\n` +
      `Equipe Fitness App`
    );
  }

  // Atualiza o User-Agent conhecido (seja novo ou não)
  await supabase
    .from('users')
    .update({ last_user_agent: userAgent })
    .eq('user_id', user_id);
};

// Transforma o User-Agent bruto num texto legível para o e-mail
function summarizeUA(ua = '') {
  if (!ua) return 'Dispositivo desconhecido';

  let browser = 'Navegador desconhecido';
  let os      = '';

  if (/Chrome\//.test(ua) && !/Chromium|Edg|OPR/.test(ua)) browser = 'Chrome';
  else if (/Firefox\//.test(ua))  browser = 'Firefox';
  else if (/Edg\//.test(ua))      browser = 'Edge';
  else if (/OPR\//.test(ua))      browser = 'Opera';
  else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browser = 'Safari';

  if (/Android/.test(ua))      os = 'Android';
  else if (/iPhone|iPad/.test(ua)) os = 'iOS';
  else if (/Windows/.test(ua)) os = 'Windows';
  else if (/Mac OS/.test(ua))  os = 'Mac';
  else if (/Linux/.test(ua))   os = 'Linux';

  return os ? `${browser} no ${os}` : browser;
}