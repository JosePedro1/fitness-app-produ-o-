import React from 'react';
import { Play, Dumbbell } from 'lucide-react';
import { useWorkoutTimer } from '../../context/WorkoutTimerContext';

/**
 * Botão reutilizável para iniciar/retomar o cronômetro de treino geral.
 *
 * Props:
 *   variant   'primary' | 'compact'   (default: 'primary')
 *   className  classes extras Tailwind
 */
const StartWorkoutButton = ({ variant = 'primary', className = '' }) => {
  const { isVisible, isRunning, start, resume, setIsMinimized } = useWorkoutTimer();

  const handleClick = () => {
    if (isVisible) {
      setIsMinimized(false);
      if (!isRunning) resume();
    } else {
      start();
    }
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 text-sm hover:bg-indigo-600/30 transition-all ${className}`}
      >
        <Dumbbell className="w-4 h-4 -rotate-45" />
        {isVisible ? 'Treino ativo' : 'Iniciar treino'}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-900/40 transition-all hover:-translate-y-0.5 active:translate-y-0 ${className}`}
    >
      <Play className="w-4 h-4 ml-0.5" />
      {isVisible ? 'Ver treino ativo' : 'Iniciar treino'}
    </button>
  );
};

export default StartWorkoutButton;
