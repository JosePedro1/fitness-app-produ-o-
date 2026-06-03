import React, { useState, useEffect } from 'react';
import {
  Play, Pause, Square, Minimize2, Maximize2,
  Dumbbell, Clock, CheckCircle2, X,
  TrendingUp, AlertCircle, Star, Plus, BookOpen,
} from 'lucide-react';
import { useWorkoutTimer } from '../../context/WorkoutTimerContext';
import { getWeeklyProgram, addExerciseToDay } from '../../services/api-routines';
import {
  getTodayWeekday,
  WEEKDAY_LABELS_PT,
} from '../../utils/exerciseCatalog';
import ExercisePicker from './ExercisePicker';

// ─── Modal de Finalização ─────────────────────────────────────────────────────
const FinishModal = () => {
  const {
    elapsed, elapsedFormatted,
    finishAndSave, discardSession, cancelFinish,
    saving, saveError,
  } = useWorkoutTimer();

  const [label,       setLabel]       = useState('');
  const [notes,       setNotes]       = useState('');
  const [todayDay,    setTodayDay]    = useState(null);   // week_day do dia atual
  const [loadingR,    setLoadingR]    = useState(true);

  const [newExercise,   setNewExercise]   = useState('');
  const [addingEx,      setAddingEx]      = useState(false);
  const [exerciseAdded, setExerciseAdded] = useState(false);
  const [exerciseErr,   setExerciseErr]   = useState(null);

  const [goToProgress, setGoToProgress] = useState(false);

  const todayWeekday = getTodayWeekday();
  const totalMin     = Math.round(elapsed / 60);

  // Carrega o programa semanal ao abrir o modal
  useEffect(() => {
    getWeeklyProgram()
      .then((program) => {
        const today = (program.days || []).find(d => d.weekday === todayWeekday);
        setTodayDay(today || null);
        if (today && !today.is_rest_day && today.workout_name !== 'Descanso') {
          setLabel(today.workout_name || '');
        }
      })
      .catch(() => {})
      .finally(() => setLoadingR(false));
  }, [todayWeekday]);

  // Adiciona exercício novo ao dia de hoje via nova API
  const handleAddExercise = async () => {
    if (!newExercise.trim()) return;
    setAddingEx(true);
    setExerciseErr(null);
    try {
      await addExerciseToDay(todayWeekday, {
        exercise_name: newExercise.trim(),
        is_custom: false,
      });
      setExerciseAdded(true);
      setNewExercise('');
    } catch {
      setExerciseErr('Não foi possível adicionar. Tente novamente.');
    } finally {
      setAddingEx(false);
    }
  };

  const handleSave = async () => {
    const saved = await finishAndSave(label, notes);
    if (saved && goToProgress) {
      setTimeout(() => { window.location.href = '/progress'; }, 150);
    }
  };

  const hasTodayWorkout = todayDay && !todayDay.is_rest_day && todayDay.workout_name !== 'Descanso';
  const dayLabel        = WEEKDAY_LABELS_PT[todayWeekday] || 'hoje';

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={cancelFinish} />

      <div className="relative w-full max-w-md bg-[#1c1c1c] border border-gray-700/60 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600/20 to-violet-600/20 px-5 py-4 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-gray-100 font-bold text-base">Treino finalizado! 🔥</h2>
              <p className="text-gray-400 text-xs mt-0.5">
                Duração: <span className="text-indigo-300 font-semibold">{elapsedFormatted}</span>
                {totalMin > 0 && <span className="text-gray-600"> ({totalMin} min)</span>}
              </p>
            </div>
            <button onClick={cancelFinish} className="text-gray-600 hover:text-gray-400 transition-colors" title="Retomar">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-4">

          {/* Status do treino do dia */}
          {!loadingR && (
            hasTodayWorkout ? (
              <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-xl px-4 py-3 flex items-start gap-3">
                <Star className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-indigo-300 font-semibold text-sm">
                    Parabéns pelo treino de {dayLabel}!
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Rotina: <span className="text-gray-300 font-medium">{todayDay.workout_name}</span>
                    {todayDay.week_day_exercises?.length > 0 && (
                      <span className="text-gray-600"> · {todayDay.week_day_exercises.length} exercícios</span>
                    )}
                  </p>
                </div>
              </div>
            ) : !todayDay ? (
              <div className="bg-amber-600/10 border border-amber-500/30 rounded-xl px-4 py-3 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-amber-300 font-semibold text-sm">Você ainda não tem rotina!</p>
                  <p className="text-gray-400 text-xs mt-1">
                    <a href="/routines" className="text-indigo-400 underline underline-offset-2 hover:text-indigo-300 transition-colors">
                      Criar minha primeira rotina
                    </a>
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl px-4 py-3 flex items-start gap-3">
                <Dumbbell className="w-4 h-4 text-gray-400 mt-0.5 shrink-0 -rotate-45" />
                <div>
                  <p className="text-gray-300 font-semibold text-sm">Treino livre registrado</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    <a href="/routines" className="text-indigo-400 underline underline-offset-2 hover:text-indigo-300 transition-colors">
                      Adicionar rotina para {dayLabel}?
                    </a>
                  </p>
                </div>
              </div>
            )
          )}

          {/* Nome do treino */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">
              Nome do treino
            </label>
            <ExercisePicker
              value={label}
              onChange={setLabel}
              placeholder="Nome do treino ou buscar exercício…"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">
              Observações <span className="text-gray-700 normal-case">(opcional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Como foi o treino?"
              rows={2}
              maxLength={200}
              className="w-full bg-[#252525] border border-gray-700 rounded-xl px-4 py-2.5 text-gray-200 text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          {/* Adicionar exercício novo ao dia de hoje — nova API */}
          <div className="bg-black/30 border border-gray-800 rounded-xl px-4 py-3 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400 shrink-0" />
              <p className="text-sm text-gray-300 font-medium">Treinou algo novo hoje?</p>
            </div>
            <p className="text-xs text-gray-500 -mt-1">
              Adicione o exercício à sua rotina de {dayLabel}.
            </p>

            <div className="flex items-center gap-2 bg-indigo-600/10 border border-indigo-600/20 rounded-lg px-3 py-2">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <p className="text-xs text-gray-400">
                Ou explore a{' '}
                <a href="/exercises-library" className="text-indigo-400 underline underline-offset-2 hover:text-indigo-300 transition-colors">
                  Biblioteca de Exercícios
                </a>
              </p>
            </div>

            <ExercisePicker
              value={newExercise}
              onChange={setNewExercise}
              placeholder="Buscar exercício na biblioteca…"
            />

            {exerciseAdded && (
              <p className="text-green-400 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Exercício adicionado à sua rotina!
              </p>
            )}
            {exerciseErr && <p className="text-red-400 text-xs">{exerciseErr}</p>}

            <button
              type="button"
              onClick={handleAddExercise}
              disabled={!newExercise.trim() || addingEx || exerciseAdded}
              className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 text-xs font-medium hover:bg-indigo-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {addingEx
                ? <span className="w-3.5 h-3.5 border-2 border-indigo-300/30 border-t-indigo-300 rounded-full animate-spin" />
                : <Plus className="w-3.5 h-3.5" />
              }
              {exerciseAdded ? 'Adicionado!' : 'Adicionar à rotina'}
            </button>
          </div>

          {/* Progresso corporal */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">
              Registrar progresso corporal? <span className="text-gray-700 normal-case">(opcional)</span>
            </label>
            <button
              type="button"
              onClick={() => setGoToProgress(!goToProgress)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left text-sm transition-all ${
                goToProgress
                  ? 'bg-indigo-600/20 border-indigo-500/60 text-indigo-300'
                  : 'bg-black/20 border-gray-800 text-gray-400 hover:border-gray-700'
              }`}
            >
              <TrendingUp className={`w-4 h-4 shrink-0 ${goToProgress ? 'text-indigo-400' : 'text-gray-600'}`} />
              <div>
                <span className="font-medium">Registrar medidas corporais</span>
                <p className="text-xs text-gray-500 mt-0.5 font-normal">Acompanhe seu progresso após o treino</p>
              </div>
              {goToProgress && <CheckCircle2 className="w-4 h-4 ml-auto text-indigo-400 shrink-0" />}
            </button>
          </div>

          {saveError && (
            <p className="text-red-400 text-xs bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
              Erro ao salvar: {saveError}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 flex gap-2 border-t border-gray-800/60 shrink-0 bg-[#1c1c1c]">
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
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            {saving ? 'Salvando…' : 'Salvar treino'}
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
        <div className={`px-4 py-3 flex items-center gap-2 border-b ${isRunning ? 'border-indigo-500/20' : 'border-gray-800'}`}>
          <Dumbbell className="w-4 h-4 text-indigo-400 -rotate-45 shrink-0" />
          <span className="text-gray-300 text-xs font-semibold uppercase tracking-wider flex-1">
            Treino em andamento
          </span>
          <button onClick={() => setIsMinimized(true)} className="text-gray-600 hover:text-gray-400 transition-colors" title="Minimizar">
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="px-4 py-4 flex flex-col items-center gap-3">
          <div className="relative flex items-center justify-center">
            {isRunning && <span className="absolute w-20 h-20 rounded-full bg-indigo-500/10 animate-ping" />}
            <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center ${
              isRunning ? 'border-indigo-500/60 bg-indigo-600/10' : 'border-gray-700 bg-gray-800/30'
            }`}>
              <span className={`text-xl font-bold tabular-nums ${isRunning ? 'text-indigo-300' : 'text-gray-400'}`}>
                {elapsedFormatted}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-yellow-500'}`} />
            <span className="text-xs text-gray-500">{isRunning ? 'Treino ativo' : 'Pausado'}</span>
          </div>

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
                : <><Play  className="w-3.5 h-3.5 ml-0.5" /> Retomar</>
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