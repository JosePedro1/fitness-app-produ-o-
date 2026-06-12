/**
 * QuickActions.jsx
 *
 * Grid 2x2 com os 4 atalhos mais usados (regra de Pareto: cobrem ~80%
 * dos casos de uso diário). Substitui os 7 cards de h-[60vh] que
 * ocupavam ~4.200px de scroll na Home.
 *
 * Os demais serviços (Timer HIIT, Biblioteca, Calendário) ficam
 * acessíveis via "Ver todas as funções" → /features.
 */

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutTimer } from '../../context/WorkoutTimerContext';
import { services, QUICK_ACTION_IDS } from './servicesData';

const QuickActions = () => {
  const navigate = useNavigate();
  const { isVisible, isRunning, resume, start, setIsMinimized } = useWorkoutTimer();

  const quickServices = services.filter((s) => QUICK_ACTION_IDS.includes(s.id));

  const handleCardClick = (service) => {
    if (service.isWorkoutTimer) {
      if (isVisible) { setIsMinimized(false); if (!isRunning) resume(); }
      else start();
      return;
    }
    navigate(service.link);
  };

  return (
    <section aria-labelledby="quick-actions-heading">
      <div className="flex items-center justify-between mb-3">
        <h2 id="quick-actions-heading" className="text-sm font-medium text-gray-300">
          Acesso rápido
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {quickServices.map((service) => (
          <button
            key={service.id}
            type="button"
            onClick={() => handleCardClick(service)}
            className="flex flex-col items-start gap-2.5 min-h-[88px] bg-black/20 border border-white/10 hover:border-[#5B4FFF]/40 rounded-xl p-3.5 text-left transition-colors"
          >
            <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${service.accent}`}>
              {service.icon}
            </span>
            <span className="text-sm font-medium text-gray-100 leading-snug">
              {service.title}
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => navigate('/features')}
        className="w-full flex items-center justify-center gap-1.5 mt-3 py-2.5 text-sm font-medium text-[#7B6FFF] hover:text-[#9B92FF] transition-colors"
      >
        Ver todas as funções <ArrowRight className="w-4 h-4" />
      </button>
    </section>
  );
};

export default QuickActions;
