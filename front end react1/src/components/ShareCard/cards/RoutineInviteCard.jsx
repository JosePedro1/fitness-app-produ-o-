import React, { forwardRef } from 'react';
import { CalendarCheck2 } from 'lucide-react';
import ShareCardFrame from '../ShareCardFrame';
import StatRing from '../StatRing';

const SHORT = { segunda: 'SEG', terca: 'TER', quarta: 'QUA', quinta: 'QUI', sexta: 'SEX', sabado: 'SÁB', domingo: 'DOM' };

/**
 * RoutineInviteCard
 * Card "treina comigo" — convite social pra rotina semanal montada no app.
 * Mais voltado a puxar amigos direto pro cadastro do que a exposição de
 * marca ampla (por isso o CTA aqui é mais direto: "Monte a sua também").
 *
 * props:
 *  - ownerLabel     string  ex: "Minha semana de treino" ou nome do usuário
 *  - trainingDays   number  quantos dias da semana têm treino
 *  - days           [{ key, hasWorkout }]  7 entradas, na ordem seg→dom
 *  - highlightNames string[]  até 3 nomes de treino em destaque (ex: "Pernas", "Costas")
 */
const RoutineInviteCard = forwardRef(({ ownerLabel, trainingDays, days, highlightNames }, ref) => {
  return (
    <ShareCardFrame ref={ref} eyebrow="Minha rotina semanal" eyebrowIcon={CalendarCheck2} ctaLabel="Monte a sua →">
      <p className="text-[13px] text-gray-500 text-center mb-1">Semana de treino</p>
      <h2 className="text-white text-xl font-black text-center leading-snug mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
        {ownerLabel}
      </h2>

      <StatRing value={`${trainingDays}/7`} label="dias treinando" percent={trainingDays / 7} color="#22c55e" />

      {/* Semana em mini-badges, mesma linguagem visual da RoutinePage */}
      <div className="flex justify-center gap-1.5 mt-7">
        {days.map((d) => (
          <div
            key={d.key}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-bold"
            style={{
              background: d.hasWorkout ? 'rgba(91,79,255,0.25)' : 'rgba(255,255,255,0.05)',
              color: d.hasWorkout ? '#b4acff' : '#4b5563',
              border: d.hasWorkout ? '1px solid rgba(91,79,255,0.4)' : '1px solid transparent',
            }}
          >
            {SHORT[d.key]}
          </div>
        ))}
      </div>

      {highlightNames?.length > 0 && (
        <p className="text-center text-xs text-gray-500 mt-4 px-4">
          {highlightNames.join(' · ')}
        </p>
      )}
    </ShareCardFrame>
  );
});

RoutineInviteCard.displayName = 'RoutineInviteCard';

export default RoutineInviteCard;
