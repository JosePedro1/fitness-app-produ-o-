/**
 * StatRing.jsx
 * Anel de progresso estático usado como "assinatura visual" dos cards de
 * compartilhamento — é a mesma forma do timer circular do treino
 * (CircularProgress em TimerPage.jsx), só que parada, exibindo o número
 * principal do card. A recorrência do anel entre o app e o card reforça
 * a identidade visual em quem já usa o FitTrack e vê o card sendo postado.
 */

import React from 'react';

const StatRing = ({ value, label, percent = 0.78, color = '#5B4FFF', size = 168 }) => {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - percent);
  const c = size / 2;

  return (
    <div className="relative flex items-center justify-center mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute -rotate-90">
        <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
        <circle
          cx={c} cy={c} r={r} fill="none"
          stroke={color} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
        />
      </svg>
      <div className="flex flex-col items-center z-10">
        <span className="text-3xl font-black text-white leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>
          {value}
        </span>
        <span className="text-[11px] text-gray-400 mt-1.5 uppercase tracking-wider text-center px-2">{label}</span>
      </div>
    </div>
  );
};

export default StatRing;
