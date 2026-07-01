import React, { forwardRef } from 'react';
import { Trophy, Users } from 'lucide-react';
import ShareCardFrame from '../ShareCardFrame';

const MEDAL = ['🥇', '🥈', '🥉'];

/**
 * RankingCard
 * Card do pódio da academia — pensado pra ser postado pela própria
 * academia (Instagram/Status) ou pelo aluno que ficou no top 3.
 * Como a página /ranking/:slug já é pública, este é o card com maior
 * potencial de alcançar gente de fora do app.
 *
 * props:
 *  - academyName  string
 *  - city         string | null
 *  - top3         [{ name, days }]   já ordenado, no máx. 3 posições
 *  - totalMembers number
 */
const RankingCard = forwardRef(({ academyName, city, top3, totalMembers }, ref) => {
  return (
    <ShareCardFrame ref={ref} eyebrow="Ranking do mês" eyebrowIcon={Trophy} ctaLabel="Ver ranking →">
      <p className="text-[13px] text-gray-500 text-center mb-1">{city || 'Ranking de treinos'}</p>
      <h2 className="text-white text-xl font-black text-center leading-snug mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
        {academyName}
      </h2>

      <div className="flex flex-col gap-2.5">
        {top3.map((member, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{
              background: i === 0 ? 'rgba(91,79,255,0.16)' : 'rgba(255,255,255,0.05)',
              border: i === 0 ? '1px solid rgba(91,79,255,0.4)' : '1px solid transparent',
            }}
          >
            <span className="text-xl w-7 text-center shrink-0">{MEDAL[i]}</span>
            <span className="flex-1 text-white text-sm font-semibold truncate">{member.name}</span>
            <span className="text-indigo-300 text-sm font-black shrink-0" style={{ fontFamily: "'Syne', sans-serif" }}>
              {member.days}<span className="text-[10px] text-gray-500 font-normal ml-1">dias</span>
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-6 text-gray-500 text-xs">
        <Users className="w-3.5 h-3.5" />
        {totalMembers} {totalMembers === 1 ? 'membro treinando' : 'membros treinando'}
      </div>
    </ShareCardFrame>
  );
});

RankingCard.displayName = 'RankingCard';

export default RankingCard;
