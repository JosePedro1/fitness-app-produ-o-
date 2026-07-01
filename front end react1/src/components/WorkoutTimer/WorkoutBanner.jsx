import React, { useEffect, useState, useCallback } from 'react';
import {
  Play, Clock, ChevronRight, Dumbbell,
  Pause, CheckCircle2, Moon, Loader2,
  BarChart2, Share2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWorkoutTimer } from '../../context/WorkoutTimerContext';
import { getWeeklyProgram, completeDay } from '../../services/api-routines';
import { getCalendarSessions } from '../../services/api-calendar';
import { calculateStreak } from '../../utils/streak';
import ShareCardModal from '../ShareCard/ShareCardModal';
import WorkoutCompletedCard from '../ShareCard/cards/WorkoutCompletedCard';

// ── Helpers ──
const getTodayWeekday = () => {
  const map = ['domingo','segunda','terca','quarta','quinta','sexta','sabado'];
  return map[new Date().getDay()];
};

const WEEKDAY_LABELS = {
  segunda: 'Segunda-feira', terca: 'Terça-feira', quarta: 'Quarta-feira',
  quinta:  'Quinta-feira',  sexta: 'Sexta-feira',  sabado: 'Sábado', domingo: 'Domingo',
};

// ── WorkoutBanner ─────────────────────────────────────────────────────────────
const WorkoutBanner = () => {
  const {
    isVisible, isRunning, elapsed, elapsedFormatted,
    start, pause, resume, reset, setIsMinimized,
  } = useWorkoutTimer();

  const [todayDay,     setTodayDay]     = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [completing,   setCompleting]   = useState(false);
  const [completed,    setCompleted]    = useState(false);
  const [finishedInfo, setFinishedInfo] = useState(null); // snapshot do treino p/ o card (elapsed zera após reset)
  const [streakDays,   setStreakDays]   = useState(0);
  const [shareOpen,    setShareOpen]    = useState(false);

  const weekday = getTodayWeekday();

  const loadToday = useCallback(async () => {
    try {
      const program = await getWeeklyProgram();
      const day = (program?.days || []).find(d => d.weekday === weekday);
      setTodayDay(day || null);
    } catch {
      setTodayDay(null);
    } finally {
      setLoading(false);
    }
  }, [weekday]);

  useEffect(() => { loadToday(); }, [loadToday]);

  const handleStart = () => {
    if (isVisible) {
      setIsMinimized(false);
      if (!isRunning) resume();
    } else {
      start();
    }
  };

  const handlePause = () => {
    if (isRunning) pause(); else resume();
  };

  const handleFinish = async () => {
    if (!todayDay || todayDay.is_rest_day) return;
    setCompleting(true);
    try {
      const exerciseNames = (todayDay.week_day_exercises || []).map(e => e.exercise_name);
      await completeDay(weekday, {
        duration_sec:   elapsed,
        exercises_done: exerciseNames,
        notes:          '',
      });

      // Guarda um snapshot ANTES do reset() zerar o cronômetro — é o que
      // alimenta o card de compartilhamento.
      setFinishedInfo({ workoutName: todayDay.workout_name, durationSec: elapsed, exercisesCount: exerciseNames.length });
      reset();
      setCompleted(true);

      // Sequência de dias treinados (streak) — busca o histórico em segundo
      // plano só pra exibir no card; não bloqueia a tela de "concluído".
      getCalendarSessions()
        .then((sessions) => setStreakDays(calculateStreak(sessions)))
        .catch(() => setStreakDays(0));
    } catch (err) {
      console.error('Erro ao finalizar treino:', err);
    } finally {
      setCompleting(false);
    }
  };

  const formatDuration = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.round((sec % 3600) / 60);
    if (h > 0) return `${h}h ${m}min`;
    if (m > 0) return `${m} min`;
    return `${sec}s`;
  };

  const todayDateLabel = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
    .format(new Date())
    .replace(/^\w/, (c) => c.toUpperCase());

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-black/30 border border-white/10 rounded-2xl p-4 flex items-center justify-center min-h-[80px]">
        <Loader2 className="w-5 h-5 text-[#5B4FFF] animate-spin" />
      </div>
    );
  }

  // ── Treino concluído ───────────────────────────────────────────────────────
  if (completed) {
    return (
      <>
        <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/20 border border-green-500/30 rounded-2xl p-4 flex items-center gap-4 flex-wrap">
          <div className="w-11 h-11 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-green-300 font-semibold text-sm">Treino concluído! 🎉</p>
            <p className="text-green-500/70 text-xs mt-0.5">
              {WEEKDAY_LABELS[weekday]} · {elapsedFormatted} de duração
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShareOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 text-green-300 text-xs font-semibold transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" /> Compartilhar
            </button>
            <Link to="/calendar"
              className="text-green-400 text-xs font-medium hover:text-green-300 flex items-center gap-1">
              Ver histórico <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {finishedInfo && (
          <ShareCardModal
            open={shareOpen}
            onClose={() => setShareOpen(false)}
            fileName="meu-treino-fittrack.png"
            shareTitle="Meu treino de hoje no FitTrack"
            shareText="Treino de hoje batido no FitTrack 💪"
            renderCard={(cardRef) => (
              <WorkoutCompletedCard
                ref={cardRef}
                workoutName={finishedInfo.workoutName}
                durationLabel={formatDuration(finishedInfo.durationSec)}
                exercisesDone={finishedInfo.exercisesCount}
                streakDays={streakDays}
                dateLabel={todayDateLabel}
              />
            )}
          />
        )}
      </>
    );
  }

  // ── Dia de descanso ────────────────────────────────────────────────────────
  if (!todayDay || todayDay.is_rest_day) {
    return (
      <div className="bg-black/20 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
          <Moon className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gray-300 font-semibold text-sm">Dia de descanso</p>
          <p className="text-gray-600 text-xs mt-0.5">{WEEKDAY_LABELS[weekday]} · Recuperação ativa</p>
        </div>
        <Link to="/routines"
          className="text-[#5B4FFF] text-xs font-medium hover:text-[#5B4FFF]/80 flex items-center gap-1 shrink-0">
          Ver semana <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  // ── Treino disponível (com cronômetro ativo ou não) ────────────────────────
  const exercises   = todayDay.week_day_exercises || [];
  const exCount     = exercises.length;
  const totalSets   = exercises.reduce((a, e) => a + (parseInt(e.sets) || 0), 0);
  const duration    = todayDay.estimated_duration_min;

  // Timer ativo
  if (isVisible) {
    return (
      <div className="bg-gradient-to-r from-[#5B4FFF]/20 to-purple-900/20 border border-[#5B4FFF]/30 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          {/* Pulsating dot */}
          <div className="w-11 h-11 rounded-xl bg-[#5B4FFF]/20 flex items-center justify-center shrink-0 relative">
            {isRunning && (
              <span className="absolute inset-0 rounded-xl bg-[#5B4FFF]/30 animate-ping" />
            )}
            <Dumbbell className="w-5 h-5 text-[#5B4FFF]" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{todayDay.workout_name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-[#5B4FFF]" />
              <span className="text-[#5B4FFF] text-xs font-mono font-bold">{elapsedFormatted}</span>
              {!isRunning && <span className="text-gray-600 text-xs">· pausado</span>}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handlePause}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all text-gray-300">
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button onClick={handleFinish} disabled={completing}
              className="w-9 h-9 rounded-xl bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 flex items-center justify-center transition-all text-green-400">
              {completing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Exercises mini list */}
        {exCount > 0 && (
          <div className="mt-3 pt-3 border-t border-white/5 flex gap-2 overflow-x-auto no-scrollbar">
            {exercises.slice(0, 5).map((e, i) => (
              <span key={i} className="shrink-0 px-2.5 py-1 bg-black/30 rounded-lg text-xs text-gray-400 whitespace-nowrap">
                {e.exercise_name}
              </span>
            ))}
            {exCount > 5 && (
              <span className="shrink-0 px-2.5 py-1 bg-black/30 rounded-lg text-xs text-gray-600 whitespace-nowrap">
                +{exCount - 5}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Treino disponível, timer não iniciado
  return (
    <div className="bg-black/20 border border-white/10 hover:border-[#5B4FFF]/30 rounded-2xl p-4 transition-all group">
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className="w-11 h-11 rounded-xl bg-[#5B4FFF]/10 group-hover:bg-[#5B4FFF]/20 flex items-center justify-center shrink-0 transition-all">
          <Dumbbell className="w-5 h-5 text-[#5B4FFF]" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">{todayDay.workout_name}</p>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
            {exCount > 0 && <span>{exCount} exercícios · {totalSets} séries</span>}
            {duration > 0 && <span>~{duration} min</span>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Link to="/routines"
            className="p-2 text-gray-600 hover:text-gray-300 transition-colors">
            <BarChart2 className="w-4 h-4" />
          </Link>
          <button onClick={handleStart}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#5B4FFF] hover:bg-[#5B4FFF]/85 text-white rounded-xl text-xs font-semibold transition-all">
            <Play className="w-3.5 h-3.5" /> Iniciar
          </button>
        </div>
      </div>

      {/* Exercises preview */}
      {exCount > 0 && (
        <div className="mt-3 pt-3 border-t border-white/5 flex gap-2 overflow-x-auto no-scrollbar">
          {exercises.slice(0, 4).map((e, i) => (
            <div key={i} className="shrink-0 px-2.5 py-1 bg-white/5 rounded-lg">
              <p className="text-xs text-gray-400 whitespace-nowrap">{e.exercise_name}</p>
              {(e.sets || e.reps) && (
                <p className="text-xs text-gray-600 mt-0.5">
                  {e.sets && `${e.sets}x`}{e.reps && `${e.reps}`}
                  {e.weight_kg > 0 && ` · ${e.weight_kg}kg`}
                </p>
              )}
            </div>
          ))}
          {exCount > 4 && (
            <div className="shrink-0 px-2.5 py-1 bg-white/5 rounded-lg flex items-center">
              <p className="text-xs text-gray-600">+{exCount - 4} mais</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkoutBanner;