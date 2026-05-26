import React, { useState } from 'react';
import { useTimer } from '../../context/TimerContext';
import { Play, Pause, Square, ChevronDown, ChevronUp, Timer } from 'lucide-react';
import FinishModal from './FinishModal';

const FloatingTimer = () => {
  const { isActive, isRunning, isPaused, elapsedSec, sessionLabel, fmt, pauseSession, resumeSession, finishSession } = useTimer();
  const [collapsed, setCollapsed] = useState(false);

  if (!isActive) return null;

  return (
    <>
      {/* Widget flutuante */}
      <div
        className="fixed bottom-6 right-6 z-[999] select-none"
        style={{ filter: 'drop-shadow(0 8px 32px rgba(99,102,241,0.35))' }}
      >
        <div className="bg-[#1a1a2e] border border-indigo-500/40 rounded-2xl overflow-hidden"
          style={{ minWidth: collapsed ? 'auto' : 220 }}>

          {/* Barra de topo */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-indigo-600/20 border-b border-indigo-500/20">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
              <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider truncate max-w-[120px]">
                {sessionLabel}
              </span>
            </div>
            <button
              onClick={() => setCollapsed(c => !c)}
              className="text-gray-500 hover:text-gray-300 transition-colors ml-2"
            >
              {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {!collapsed && (
            <div className="px-4 py-3 flex flex-col gap-3">
              {/* Display do tempo */}
              <div className="flex items-center justify-center">
                <span
                  className="text-3xl font-bold tabular-nums tracking-tight"
                  style={{
                    color: isRunning ? '#a5b4fc' : '#fbbf24',
                    fontVariantNumeric: 'tabular-nums',
                    textShadow: isRunning ? '0 0 20px rgba(165,180,252,0.4)' : '0 0 20px rgba(251,191,36,0.4)',
                  }}
                >
                  {fmt(elapsedSec)}
                </span>
              </div>

              {/* Botões de controle */}
              <div className="flex items-center justify-center gap-2">
                {/* Pause / Resume */}
                {isRunning ? (
                  <button
                    onClick={pauseSession}
                    className="flex items-center gap-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 text-yellow-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200"
                  >
                    <Pause size={12} />
                    Pausar
                  </button>
                ) : (
                  <button
                    onClick={resumeSession}
                    className="flex items-center gap-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200"
                  >
                    <Play size={12} className="ml-0.5" />
                    Retomar
                  </button>
                )}

                {/* Finalizar */}
                <button
                  onClick={finishSession}
                  className="flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200"
                >
                  <Square size={12} />
                  Finalizar
                </button>
              </div>
            </div>
          )}

          {/* Colapsado: só mostra o tempo */}
          {collapsed && (
            <div className="px-4 py-2 flex items-center gap-2">
              <Timer size={13} className="text-indigo-400" />
              <span className="text-sm font-bold tabular-nums text-indigo-300">{fmt(elapsedSec)}</span>
              <button
                onClick={finishSession}
                className="ml-1 text-red-400 hover:text-red-300 transition-colors"
                title="Finalizar treino"
              >
                <Square size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de finalização */}
      <FinishModal />
    </>
  );
};

export default FloatingTimer;
