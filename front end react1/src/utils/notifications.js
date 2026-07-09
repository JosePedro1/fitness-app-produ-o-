/**
 * notifications.js — notificações locais do PWA (sem servidor).
 *
 * Tudo aqui roda 100% no navegador: usa a Notification API do próprio
 * dispositivo. Não depende de nenhuma variável de ambiente, chave VAPID
 * ou tabela nova no banco — só funciona enquanto o app/aba está aberto
 * (ou o Service Worker ainda está vivo em segundo plano), o que é
 * suficiente para o cronômetro de treino e o timer de descanso.
 */

const STORAGE_KEY = 'ft_notifications_enabled';

export const isNotificationSupported = () =>
  typeof window !== 'undefined' && 'Notification' in window;

export const getNotificationPermission = () =>
  isNotificationSupported() ? Notification.permission : 'unsupported';

/** true somente se o navegador suporta, o usuário permitiu no SO/navegador
 *  E optou por ativar dentro do app. */
export const isNotificationsEnabled = () =>
  isNotificationSupported() &&
  Notification.permission === 'granted' &&
  localStorage.getItem(STORAGE_KEY) === '1';

/**
 * Pede permissão ao navegador (deve ser chamada a partir de um gesto do
 * usuário — clique em botão/toggle). Marca a preferência local em caso
 * de sucesso.
 * @returns {Promise<'granted'|'denied'|'default'|'unsupported'>}
 */
export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) return 'unsupported';

  let perm = Notification.permission;
  if (perm === 'default') {
    try {
      perm = await Notification.requestPermission();
    } catch {
      perm = Notification.permission;
    }
  }

  if (perm === 'granted') {
    localStorage.setItem(STORAGE_KEY, '1');
  }
  return perm;
};

/** Desativa notificações (sem revogar a permissão do navegador — só para de usar). */
export const disableNotifications = () => {
  localStorage.setItem(STORAGE_KEY, '0');
};

/**
 * Exibe uma notificação local. Usa o Service Worker quando disponível
 * (necessário para os botões de ação como "Pausar"/"Finalizar"); cai
 * para a API Notification simples quando não há SW ativo.
 */
export const showLocalNotification = async (title, options = {}) => {
  if (!isNotificationsEnabled()) return null;

  const opts = {
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    silent: false,
    ...options,
  };

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg?.showNotification) {
        await reg.showNotification(title, opts);
        return true;
      }
    }
  } catch {
    /* segue para o fallback abaixo */
  }

  try {
    if (Notification.permission === 'granted') {
      // Notification "crua" não suporta `actions` — remove para não quebrar.
      const { actions, ...simpleOpts } = opts;
      // eslint-disable-next-line no-new
      new Notification(title, simpleOpts);
      return true;
    }
  } catch {
    /* ambiente não suporta — falha silenciosa, não deve travar o app */
  }
  return null;
};

/** Fecha notificações locais ativas com uma determinada tag. */
export const closeLocalNotification = async (tag) => {
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      const notifs = await reg.getNotifications({ tag });
      notifs.forEach((n) => n.close());
    }
  } catch {
    /* nada a fazer */
  }
};
