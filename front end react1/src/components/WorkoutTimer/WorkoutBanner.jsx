import React from 'react';
import { Play, Clock, ChevronRight, Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWorkoutTimer } from '../../context/WorkoutTimerContext';

/**
 * Banner de início / status de treino para usar na Home.
 * Mostra o tempo ativo se houver sessão em andamento.
 */
const WorkoutBanner = () => {
  const { isVisible, isRunning, elapsedFormatted, start, resume, setIsMinimized } = useWorkoutTimer();

  const handleStart = () => {
    if (isVisible) {
      setIsMinimized(false);
      if (!isRunning) resume();
    } else {
      start();
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-indigo-600/10 to-violet-600/10 border border-indigo-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      {/* Ícone */}
      <div className="w-11 h-11 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
        <Dumbbell className="w-5 h-5 text-indigo-400 -rotate-45" />
      </div>

      {/* Texto */}
      <div className="flex-1">
        {isVisible ? (
          <>
            <p className="text-gray-200 font-semibold text-sm">
              {isRunning ? 'Treino em andamento! 🔥' : 'Treino pausado'}
            </p>
            <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span className="tabular-nums text-indigo-300 font-semibold">{elapsedFormatted}</span>
              <span>{isRunning ? '— cronômetro ativo' : '— pausado'}</span>
            </p>
          </>
        ) : (
          <>
            <p className="text-gray-200 font-semibold text-sm">Pronto para treinar?</p>
            <p className="text-gray-400 text-xs mt-0.5">
              Inicie o cronômetro — ele continua ativo enquanto você navega pelo app.
            </p>
          </>
        )}
      </div>

      {/* Botões */}
      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
        <button
          onClick={handleStart}
          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all"
        >
          <Play className="w-3.5 h-3.5 ml-0.5" />
          {isVisible ? (isRunning ? 'Ver treino' : 'Retomar') : 'Iniciar treino'}
        </button>

        <Link
          to="/calendar"
          className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300 text-sm transition-all whitespace-nowrap"
        >
          Calendário <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default WorkoutBanner;
