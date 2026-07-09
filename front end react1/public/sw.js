/* sw.js — service worker mínimo para habilitar o prompt de instalação PWA */

const CACHE = 'fittrack-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

/* fetch handler obrigatório para o Chrome aceitar o beforeinstallprompt */
self.addEventListener('fetch', e => {
  /* estratégia network-first simples */
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

/**
 * notificationclick — trata cliques nas notificações locais (cronômetro,
 * timer de descanso, etc). Não depende de push/servidor: essas notificações
 * são criadas pelo próprio app via registration.showNotification().
 *
 * Se o clique foi num botão de ação (Pausar/Retomar/Finalizar), repassa
 * a ação para as abas abertas via postMessage; a lógica de verdade mora
 * no WorkoutTimerContext.jsx, que já tem o estado do cronômetro.
 */
self.addEventListener('notificationclick', (event) => {
  const action = event.action || '';
  const tag = event.notification?.tag || '';
  event.notification.close();

  event.waitUntil((async () => {
    const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });

    if (action) {
      allClients.forEach((client) => client.postMessage({ type: 'TIMER_ACTION', action, tag }));
    }

    if (allClients.length > 0) {
      allClients[0].focus();
    } else {
      await clients.openWindow('/');
    }
  })());
});