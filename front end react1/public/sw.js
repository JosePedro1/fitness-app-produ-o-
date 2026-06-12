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