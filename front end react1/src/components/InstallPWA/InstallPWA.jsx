/**
 * InstallPWA.jsx
 *
 * Banner flutuante de instalação do app.
 * — Android/Chrome: detecta o evento `beforeinstallprompt` e exibe o banner.
 * — iOS/Safari: exibe instruções manuais (Compartilhar → Adicionar à Tela Inicial).
 * — Já instalado ou descartado: não aparece mais.
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DISMISSED_KEY = 'pwa_banner_dismissed';

/* Ícone dumbbell inline */
const DumbbellIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5B4FFF" strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 5v14M18 5v14M6 9H2v6h4M18 9h4v6h-4M6 8h12v8H6z" />
  </svg>
);

/* Ícone seta-share do iOS */
const ShareIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

const AUTH_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password', '/'];

export default function InstallPWA() {
  const location = useLocation();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow]   = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [visible, setVisible] = useState(false); /* controla animação */

  const isAuthPage = AUTH_ROUTES.includes(location.pathname);

  useEffect(() => {
    /* Já descartou antes */
    if (sessionStorage.getItem(DISMISSED_KEY)) return;

    /* Já instalado como app standalone */
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    ) return;

    /* iOS Safari — não suporta beforeinstallprompt */
    const ua = navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua);
    const isSafari = /safari/.test(ua) && !/chrome|crios|fxios/.test(ua);

    if (ios && isSafari) {
      setIsIOS(true);
      /* Mostra após 2s para não incomodar na entrada */
      const t = setTimeout(() => { setShow(true); setTimeout(() => setVisible(true), 50); }, 2000);
      return () => clearTimeout(t);
    }

    /* Android / Chrome Desktop */
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const t = setTimeout(() => { setShow(true); setTimeout(() => setVisible(true), 50); }, 1500);
      return () => clearTimeout(t);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') handleClose();
    setDeferredPrompt(null);
  }

  function handleClose() {
    setVisible(false);
    setTimeout(() => setShow(false), 300);
    sessionStorage.setItem(DISMISSED_KEY, '1');
  }

  if (!show) return null;

  /* Quanto subir acima do BottomNav (só em rotas protegidas que têm BottomNav) */
  const bottomOffset = isAuthPage ? 20 : 80;

  return (
    <>
      <style>{`
        .pwa-banner {
          position: fixed;
          left: 50%;
          transform: translateX(-50%) translateY(${visible ? '0' : '120px'});
          z-index: 999;
          width: calc(100% - 32px);
          max-width: 400px;
          background: #18181f;
          border: 1px solid rgba(91,79,255,0.35);
          border-radius: 20px;
          padding: 16px 16px 16px 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(91,79,255,0.1);
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), bottom 0.2s;
          font-family: 'DM Sans', sans-serif;
          bottom: ${bottomOffset}px;
        }
        .pwa-icon-wrap {
          width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
          background: rgba(91,79,255,0.12);
          border: 1px solid rgba(91,79,255,0.25);
          display: flex; align-items: center; justify-content: center;
        }
        .pwa-text { flex: 1; min-width: 0; }
        .pwa-title { font-size: 14px; font-weight: 600; color: #f0f0f8; line-height: 1.2; }
        .pwa-sub   { font-size: 12px; color: rgba(240,240,248,0.5); margin-top: 2px; line-height: 1.3; }
        .pwa-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .pwa-install-btn {
          height: 34px; padding: 0 14px; background: #5B4FFF;
          color: #fff; border: none; border-radius: 10px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background .2s, transform .1s;
          white-space: nowrap;
        }
        .pwa-install-btn:hover  { background: #7B6FFF; }
        .pwa-install-btn:active { transform: scale(0.96); }
        .pwa-close-btn {
          width: 28px; height: 28px; border-radius: 50%;
          background: rgba(255,255,255,0.07); border: none; cursor: pointer;
          color: rgba(240,240,248,0.4); font-size: 16px; line-height: 1;
          display: flex; align-items: center; justify-content: center;
          transition: background .2s, color .2s;
        }
        .pwa-close-btn:hover { background: rgba(255,255,255,0.14); color: #f0f0f8; }
        .pwa-ios-row {
          font-size: 12px; color: rgba(240,240,248,0.55);
          display: flex; align-items: center; gap: 4px; margin-top: 3px;
        }
        .pwa-ios-row svg { flex-shrink: 0; }
      `}</style>

      <div className="pwa-banner" role="banner" aria-label="Instalar FitTrack">
        <div className="pwa-icon-wrap">
          <DumbbellIcon />
        </div>

        <div className="pwa-text">
          <div className="pwa-title">FitTrack no seu celular</div>
          {isIOS ? (
            <div className="pwa-ios-row">
              Toque em <ShareIcon /> depois "Adicionar à Tela Inicial"
            </div>
          ) : (
            <div className="pwa-sub">Acesso rápido, funciona offline</div>
          )}
        </div>

        <div className="pwa-actions">
          {!isIOS && (
            <button className="pwa-install-btn" onClick={handleInstall}>
              Instalar
            </button>
          )}
          <button className="pwa-close-btn" onClick={handleClose} aria-label="Fechar">
            ✕
          </button>
        </div>
      </div>
    </>
  );
}