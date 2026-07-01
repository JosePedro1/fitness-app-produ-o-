/**
 * ShareCardFrame.jsx
 * Moldura comum aos 3 cards de compartilhamento: formato 9:16 (ideal pra
 * Stories/WhatsApp Status), fundo em gradiente escuro consistente com o
 * resto do app, e rodapé de marca (FitTrack) — é o rodapé que transforma
 * cada compartilhamento em divulgação do produto.
 *
 * Evitamos <img> de fontes externas (avatar do Supabase, logo remota) aqui
 * de propósito: imagens sem cabeçalho CORS liberado "sujam" o canvas do
 * html2canvas e fazem a exportação falhar silenciosamente. Por isso os
 * cards usam iniciais, emojis e ícones (lucide, SVG inline) no lugar de
 * fotos reais.
 */

import React, { forwardRef } from 'react';
import { BRAND } from './shareCardTheme';

const ShareCardFrame = forwardRef(({ eyebrow, eyebrowIcon: EyebrowIcon, children, ctaLabel }, ref) => {
  return (
    <div
      ref={ref}
      style={{ width: 380, height: 676, fontFamily: "'Inter', sans-serif" }}
      className="relative overflow-hidden flex flex-col"
    >
      {/* Fundo em gradiente + auras desfocadas, no mesmo espírito visual do resto do app */}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(160deg, ${BRAND.bgFrom} 0%, ${BRAND.bgTo} 65%)` }}
      />
      <div
        className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-40"
        style={{ background: BRAND.indigo, filter: 'blur(70px)' }}
      />
      <div
        className="absolute bottom-24 -left-20 w-56 h-56 rounded-full opacity-25"
        style={{ background: '#22c55e', filter: 'blur(80px)' }}
      />

      {/* Conteúdo */}
      <div className="relative z-10 flex flex-col h-full px-7 pt-7 pb-6">
        {/* Cabeçalho: selo do tipo de card */}
        <div className="flex items-center justify-between">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider"
            style={{ background: 'rgba(91,79,255,0.18)', color: '#b4acff', border: '1px solid rgba(91,79,255,0.35)' }}
          >
            {EyebrowIcon && <EyebrowIcon size={12} />}
            {eyebrow}
          </div>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm"
            style={{ background: BRAND.indigo, color: 'white', fontFamily: BRAND.displayFont }}
          >
            F
          </div>
        </div>

        {/* Conteúdo específico de cada card */}
        <div className="flex-1 flex flex-col justify-center mt-2">
          {children}
        </div>

        {/* Rodapé de marca — o motor da divulgação */}
        <div className="pt-4 mt-2 border-t border-white/10 flex items-center justify-between">
          <div>
            <p
              className="text-white font-black text-base leading-none"
              style={{ fontFamily: BRAND.displayFont }}
            >
              {BRAND.name}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">{BRAND.tagline}</p>
          </div>
          {ctaLabel && (
            <div
              className="px-3 py-1.5 rounded-full text-[11px] font-semibold"
              style={{ background: 'rgba(255,255,255,0.08)', color: '#d4d0ff' }}
            >
              {ctaLabel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

ShareCardFrame.displayName = 'ShareCardFrame';

export default ShareCardFrame;
