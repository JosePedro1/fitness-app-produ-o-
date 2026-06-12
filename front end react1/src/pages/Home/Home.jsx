import React, { useState, useEffect, useMemo } from 'react';
import { Flame, Calculator } from 'lucide-react';
import Accordion from '../../components/Accordion/Accordion';
import IMC from './IMC';
import QuickActions from './QuickActions';
import WorkoutBanner from '../../components/WorkoutTimer/WorkoutBanner';
import FeedbackWidget from '../../components/FeedbackWidget/FeedbackWidget';
import { getProfile } from '../../services/api-profile';
import { getCalendarSessions, sessionsToMap } from '../../services/api-calendar';

/**
 * Home — dashboard interno do app (rota /home, protegida).
 * A landing pública está em /pages/Landing/LandingPage.jsx (rota /).
 *
 * Redesenhada para mobile-first: ~480px de scroll (antes ~6.700px).
 *  1. Saudação contextual + streak
 *  2. Progresso semanal (Seg–Dom)
 *  3. WorkoutBanner — treino de hoje (ação primária)
 *  4. Quick Actions — grid 2x2 com os 4 atalhos mais usados
 *  5. Calculadora IMC — accordion recolhido (uso eventual)
 *
 * Itens removidos da Home (não fazem sentido para usuário autenticado):
 *  - <About />    → conteúdo de marketing, vive na LandingPage
 *  - <Footer />   → landing page, ruído em dashboard privado
 *  - <Services /> → os 7 cards de 60vh viraram /features ("Ver tudo")
 */

const WEEKDAY_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

/** Converte getDay() (0=Dom..6=Sáb) para índice de semana iniciando na segunda (0=Seg..6=Dom). */
const toMondayIndex = (jsDay) => (jsDay === 0 ? 6 : jsDay - 1);

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12)  return { saudacao: 'Bom dia',   emoji: '🌅', sub: 'Energia para o treino de hoje!' };
  if (hour >= 12 && hour < 18) return { saudacao: 'Boa tarde', emoji: '💪', sub: 'Hora de treinar?' };
  return                              { saudacao: 'Boa noite', emoji: '🌙', sub: 'Treino noturno? Vamos lá.' };
};

const Home = () => {
  const [name, setName] = useState('Atleta');
  const [sessionsMap, setSessionsMap] = useState({});

  useEffect(() => {
    getProfile()
      .then((data) => {
        if (data?.display_name?.trim()) setName(data.display_name.trim());
      })
      .catch(() => {});

    getCalendarSessions()
      .then((sessions) => setSessionsMap(sessionsToMap(sessions)))
      .catch(() => {});
  }, []);

  const { saudacao, emoji, sub } = getGreeting();

  // ── Streak: dias consecutivos de treino até hoje (ou até ontem, se hoje ainda não treinou) ──
  const streak = useMemo(() => {
    let count = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const cur = new Date(); cur.setHours(0, 0, 0, 0);
    if (!sessionsMap[todayStr]) cur.setDate(cur.getDate() - 1);
    while (true) {
      const k = cur.toISOString().split('T')[0];
      if (sessionsMap[k]?.length) { count++; cur.setDate(cur.getDate() - 1); } else break;
    }
    return count;
  }, [sessionsMap]);

  // ── Progresso semanal: Seg–Dom da semana atual ──
  const weekProgress = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayIdx = toMondayIndex(today.getDay());
    const monday = new Date(today);
    monday.setDate(today.getDate() - todayIdx);

    return WEEKDAY_SHORT.map((label, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const key = d.toISOString().split('T')[0];
      return {
        label,
        done: !!sessionsMap[key]?.length,
        isToday: i === todayIdx,
        isFuture: d > today,
      };
    });
  }, [sessionsMap]);

  return (
    <div className="bg-[#171717] min-h-screen pb-24 md:pb-10">
      <div className="lg:px-24 md:px-16 px-4 pt-6 pb-4 flex flex-col gap-4 max-w-3xl mx-auto">

        {/* Saudação + streak */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-100" style={{ fontFamily: 'Syne, sans-serif' }}>
              {saudacao}, <span className="text-[#7B6FFF]">{name}</span> {emoji}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{sub}</p>
          </div>

          {streak > 0 && (
            <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full px-3 py-1.5 shrink-0">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-400 whitespace-nowrap">{streak} dia{streak !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Progresso semanal */}
        <div className="flex gap-1.5">
          {weekProgress.map(({ label, done, isToday, isFuture }) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className={`h-1.5 w-full rounded-full ${
                  done ? 'bg-[#5B4FFF]' : isFuture ? 'bg-white/5' : 'bg-white/10'
                }`}
              />
              <span className={`text-xs ${isToday ? 'text-[#7B6FFF] font-medium' : 'text-gray-500'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Banner de treino — ação primária do dia */}
        <WorkoutBanner />

        {/* Acesso rápido — 4 atalhos mais usados (grid 2x2) */}
        <QuickActions />

        {/* Calculadora IMC — recolhida por padrão (uso eventual, não diário) */}
        <Accordion title="Calculadora IMC" icon={<Calculator className="w-4 h-4 text-[#7B6FFF]" />}>
          <IMC />
        </Accordion>
      </div>

      {/* Widget flutuante de feedback — aparece em todas as páginas via /home */}
      <FeedbackWidget />
    </div>
  );
};

export default Home;
