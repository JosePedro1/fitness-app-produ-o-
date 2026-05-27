import React, { useState } from 'react';
import {
  Play, Pause, Square, Minimize2, Maximize2,
  Dumbbell, Clock, CheckCircle2, X, TrendingUp,
} from 'lucide-react';
import { useWorkoutTimer } from '../../context/WorkoutTimerContext';

// ─── Modal de Finalização ─────────────────────────────────────────────────────
const FinishModal = () => {
  const {
    elapsed, elapsedFormatted,
    finishAndSave, discardSession, cancelFinish,
    saving, saveError,
  } = useWorkoutTimer();

  const [label, setLabel]           = useState('');
  const [notes, setNotes]           = useState('');
  const [postAction, setPostAction] = useState(null); // 'routine' | 'measures' | null

  const totalMin = Math.round(elapsed / 60);

  const handleSave = async () => {
    const saved = await finishAndSave(label, notes);
    if (saved && postAction) {
      setTimeout(() => {
        window.location.href = postAction === 'routine' ? '/routines' : '/progress';
      }, 150);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={cancelFinish}
      />

      <div className="relative w-full max-w-md bg-[#1c1c1c] border border-gray-700/60 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600/20 to-violet-600/20 px-5 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-gray-100 font-bold text-base">Treino finalizado! 🔥</h2>
              <p className="text-gray-400 text-xs mt-0.5">
                Duração:&nbsp;
                <span className="text-indigo-300 font-semibold">{elapsedFormatted}</span>
                {totalMin > 0 && <span className="text-gray-600"> ({totalMin} min)</span>}
              </p>
            </div>
            <button
              onClick={cancelFinish}
              className="text-gray-600 hover:text-gray-400 transition-colors"
              title="Retomar treino"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex flex-col gap-4">

          {/* Nome */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">
              Nome do treino
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="ex: Peito e Tríceps, Leg Day, Full Body…"
              maxLength={60}
              className="w-full bg-[#252525] border border-gray-700 rounded-xl px-4 py-2.5 text-gray-200 text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">
              Observações&nbsp;<span className="text-gray-700 normal-case">(opcional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Como foi o treino? Alguma observação?"
              rows={2}
              maxLength={200}
              className="w-full bg-[#252525] border border-gray-700 rounded-xl px-4 py-2.5 text-gray-200 text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          {/* Ação pós-save */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              O que deseja fazer depois?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  id: 'routine',
                  icon: <Dumbbell className="w-4 h-4 -rotate-45" />,
                  label: 'Adicionar à rotina de treino',
                },
                {
                  id: 'measures',
                  icon: <TrendingUp className="w-4 h-4" />,
                  label: 'Registrar medidas corporais',
                },
              ].map(({ id, icon, label: lbl }) => (
                <button
                  key={id}
                  onClick={() => setPostAction(postAction === id ? null : id)}
                  className={`flex items-start gap-2 p-3 rounded-xl border text-left text-xs transition-all ${
                    postAction === id
                      ? 'bg-indigo-600/20 border-indigo-500/60 text-indigo-300'
                      : 'bg-black/20 border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <span className={postAction === id ? 'text-indigo-400 mt-0.5 shrink-0' : 'text-gray-600 mt-0.5 shrink-0'}>
                    {icon}
                  </span>
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          {saveError && (
            <p className="text-red-400 text-xs bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
              Erro ao salvar: {saveError}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex gap-2">
          <button
            onClick={discardSession}
            className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 text-sm hover:border-gray-600 hover:text-gray-300 transition-colors"
          >
            Descartar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Salvando…
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Salvar treino
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Widget Flutuante ─────────────────────────────────────────────────────────
const FloatingWorkoutTimer = () => {
  const {
    isRunning, isVisible, isMinimized,
    elapsedFormatted, finishModal,
    pause, resume, openFinishDialog,
    setIsMinimized,
  } = useWorkoutTimer();

  if (!isVisible) return null;

  // ── Pill minimizado ──────────────────────────────────────────────────────
  if (isMinimized) {
    return (
      <>
        {finishModal && <FinishModal />}
        <button
          onClick={() => setIsMinimized(false)}
          className={`fixed bottom-5 right-5 z-[999] flex items-center gap-2 pl-3 pr-4 py-2 rounded-full shadow-2xl border transition-all duration-300 ${
            isRunning
              ? 'bg-indigo-600 border-indigo-500/60 shadow-indigo-900/50'
              : 'bg-[#252525] border-gray-700 shadow-black/50'
          }`}
        >
          <span className={`w-2 h-2 rounded-full shrink-0 ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-yellow-500'}`} />
          <Clock className="w-4 h-4 text-white/80" />
          <span className="text-white font-bold text-sm tabular-nums">{elapsedFormatted}</span>
          <Maximize2 className="w-3 h-3 text-white/50 ml-0.5" />
        </button>
      </>
    );
  }

  // ── Widget expandido ─────────────────────────────────────────────────────
  return (
    <>
      {finishModal && <FinishModal />}

      <div
        className={`fixed bottom-5 right-5 z-[999] w-64 rounded-2xl shadow-2xl border overflow-hidden transition-all duration-300 ${
          isRunning
            ? 'bg-[#1a1a2e] border-indigo-500/40 shadow-indigo-900/40'
            : 'bg-[#1c1c1c] border-gray-700/60 shadow-black/60'
        }`}
      >
        {/* Header */}
        <div className={`px-4 py-3 flex items-center gap-2 border-b ${isRunning ? 'border-indigo-500/20' : 'border-gray-800'}`}>
          <Dumbbell className="w-4 h-4 text-indigo-400 -rotate-45 shrink-0" />
          <span className="text-gray-300 text-xs font-semibold uppercase tracking-wider flex-1">
            Treino em andamento
          </span>
          <button
            onClick={() => setIsMinimized(true)}
            className="text-gray-600 hover:text-gray-400 transition-colors"
            title="Minimizar"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Timer */}
        <div className="px-4 py-4 flex flex-col items-center gap-3">
          <div className="relative flex items-center justify-center">
            {isRunning && (
              <span className="absolute w-20 h-20 rounded-full bg-indigo-500/10 animate-ping" />
            )}
            <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center ${
              isRunning
                ? 'border-indigo-500/60 bg-indigo-600/10'
                : 'border-gray-700 bg-gray-800/30'
            }`}>
              <span className={`text-xl font-bold tabular-nums ${isRunning ? 'text-indigo-300' : 'text-gray-400'}`}>
                {elapsedFormatted}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-yellow-500'}`} />
            <span className="text-xs text-gray-500">
              {isRunning ? 'Treino ativo' : 'Pausado'}
            </span>
          </div>

          {/* Controles */}
          <div className="flex items-center gap-2 w-full">
            <button
              onClick={isRunning ? pause : resume}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isRunning
                  ? 'bg-yellow-600/20 border border-yellow-600/40 text-yellow-300 hover:bg-yellow-600/30'
                  : 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30'
              }`}
            >
              {isRunning
                ? <><Pause className="w-3.5 h-3.5" /> Pausar</>
                : <><Play className="w-3.5 h-3.5 ml-0.5" /> Retomar</>
              }
            </button>

            <button
              onClick={openFinishDialog}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-green-600/20 border border-green-500/40 text-green-300 hover:bg-green-600/30 transition-all"
            >
              <Square className="w-3.5 h-3.5" />
              Finalizar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FloatingWorkoutTimer;
