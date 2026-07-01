import React, { forwardRef } from 'react';
import { Flame, Dumbbell } from 'lucide-react';
import ShareCardFrame from '../ShareCardFrame';
import StatRing from '../StatRing';

/**
 * WorkoutCompletedCard
 * Disparado no momento em que o usuário termina o treino do dia
 * (WorkoutBanner → estado "concluído"). É o pico emocional certo pra
 * pedir compartilhamento — a pessoa acabou de treinar.
 *
 * props:
 *  - workoutName   string  ex: "Treino de pernas"
 *  - durationLabel string  ex: "48 min"
 *  - exercisesDone number
 *  - streakDays    number  dias seguidos treinando (0 = não mostra selo)
 *  - dateLabel     string  ex: "Segunda-feira · 1 de julho"
 */
const WorkoutCompletedCard = forwardRef(({ workoutName, durationLabel, exercisesDone, streakDays, dateLabel }, ref) => {
  return (
    <ShareCardFrame ref={ref} eyebrow="Treino concluído" eyebrowIcon={Dumbbell} ctaLabel="Treine comigo →">
      <p className="text-[13px] text-gray-500 text-center mb-1">{dateLabel}</p>
      <h2 className="text-white text-xl font-black text-center leading-snug mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
        {workoutName}
      </h2>

      <StatRing value={durationLabel} label="de treino" percent={0.82} />

      <div className="flex justify-center gap-3 mt-7">
        <div className="flex-1 max-w-[140px] rounded-2xl px-4 py-3 text-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <Dumbbell className="w-4 h-4 text-indigo-300 mx-auto mb-1.5" />
          <p className="text-white font-bold text-lg leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>{exercisesDone}</p>
          <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wide">exercícios</p>
        </div>
        <div className="flex-1 max-w-[140px] rounded-2xl px-4 py-3 text-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1.5" />
          <p className="text-white font-bold text-lg leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>
            {streakDays > 0 ? streakDays : '—'}
          </p>
          <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wide">dias seguidos</p>
        </div>
      </div>
    </ShareCardFrame>
  );
});

WorkoutCompletedCard.displayName = 'WorkoutCompletedCard';

export default WorkoutCompletedCard;
