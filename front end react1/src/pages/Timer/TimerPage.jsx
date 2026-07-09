import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Plus,
  Minus,
  Dumbbell,
  Flame,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Bell,
} from 'lucide-react';
import { showLocalNotification } from '../../utils/notifications';

// ─── Presets ──────────────────────────────────────────────────────────────────
const PRESETS = [
  { label: 'Aquecimento', work: 30, rest: 10, rounds: 3, color: '#f59e0b' },
  { label: 'HIIT', work: 45, rest: 15, rounds: 8, color: '#ef4444' },
  { label: 'Força', work: 60, rest: 90, rounds: 5, color: '#6366f1' },
  { label: 'Tabata', work: 20, rest: 10, rounds: 8, color: '#10b981' },
  { label: 'Descanso ativo', work: 40, rest: 20, rounds: 4, color: '#8b5cf6' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (s) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

// ─── NumberStepper ────────────────────────────────────────────────────────────
const Stepper = ({ label, value, onDec, onInc, unit }) => (
  <div className="flex flex-col items-center gap-1">
    <span className="text-xs text-gray-500 uppercase tracking-widest">{label}</span>
    <div className="flex items-center gap-2">
      <button
        onClick={onDec}
        className="w-7 h-7 rounded-full bg-gray-800 hover:bg-indigo-600 text-gray-300 flex items-center justify-center transition-colors duration-200"
      >
        <Minus size={13} />
      </button>
      <span className="w-14 text-center text-gray-100 font-semibold text-lg tabular-nums">
        {value}
        <span className="text-xs text-gray-500 ml-0.5">{unit}</span>
      </span>
      <button
        onClick={onInc}
        className="w-7 h-7 rounded-full bg-gray-800 hover:bg-indigo-600 text-gray-300 flex items-center justify-center transition-colors duration-200"
      >
        <Plus size={13} />
      </button>
    </div>
  </div>
);

// ─── CircularProgress ─────────────────────────────────────────────────────────
const CircularProgress = ({ progress, phase, timeLeft, isRunning }) => {
  const r = 90;
  const circ = 2 * Math.PI * r;
  const strokeDashoffset = circ * (1 - progress);
  const phaseColor = phase === 'work' ? '#6366f1' : phase === 'rest' ? '#10b981' : '#f59e0b';

  return (
    <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
      {/* background ring */}
      <svg className="absolute" width="220" height="220">
        <circle cx="110" cy="110" r={r} fill="none" stroke="#2a2a2a" strokeWidth="10" />
      </svg>
      {/* progress ring */}
      <svg className="absolute -rotate-90" width="220" height="220">
        <circle
          cx="110"
          cy="110"
          r={r}
          fill="none"
          stroke={phaseColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.4s linear, stroke 0.4s ease' }}
        />
      </svg>
      {/* inner glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: 160,
          height: 160,
          background: `radial-gradient(circle, ${phaseColor}18 0%, transparent 70%)`,
          transition: 'background 0.4s ease',
        }}
      />
      {/* time */}
      <div className="flex flex-col items-center z-10 select-none">
        <span
          className="text-5xl font-bold tabular-nums"
          style={{ color: phaseColor, transition: 'color 0.4s ease', fontVariantNumeric: 'tabular-nums' }}
        >
          {fmt(timeLeft)}
        </span>
        <span
          className="text-xs uppercase tracking-widest mt-1 font-semibold"
          style={{ color: phaseColor, opacity: 0.75, transition: 'color 0.4s ease' }}
        >
          {phase === 'work' ? 'Trabalho' : phase === 'rest' ? 'Descanso' : 'Pronto'}
        </span>
      </div>
    </div>
  );
};

// ─── Main TimerPage ───────────────────────────────────────────────────────────
const TimerPage = () => {
  const [workSec, setWorkSec] = useState(45);
  const [restSec, setRestSec] = useState(15);
  const [totalRounds, setTotalRounds] = useState(5);

  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState('idle'); // 'idle' | 'work' | 'rest' | 'done'
  const [timeLeft, setTimeLeft] = useState(workSec);
  const [currentRound, setCurrentRound] = useState(1);
  const [completedRounds, setCompletedRounds] = useState([]);
  const [showPresets, setShowPresets] = useState(false);

  const intervalRef = useRef(null);
  const beepCtxRef = useRef(null);

  // Total session time
  const totalSessionSec = totalRounds * (workSec + restSec) - restSec;

  // Progress for the ring
  const phaseDuration = phase === 'work' ? workSec : phase === 'rest' ? restSec : 1;
  const progress = phase === 'idle' || phase === 'done' ? 1 : timeLeft / phaseDuration;

  // ── Beep ──
  const beep = useCallback((freq = 880, dur = 0.12) => {
    try {
      if (!beepCtxRef.current) beepCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = beepCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + dur);
    } catch (_) {}
  }, []);

  // ── Tick ──
  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          beep(phase === 'work' ? 660 : 440, 0.15);
          return 0;
        }
        if (prev <= 4) beep(440, 0.08);
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [isRunning, phase, beep]);

  // ── Phase transitions ──
  useEffect(() => {
    if (!isRunning || timeLeft > 0) return;
    clearInterval(intervalRef.current);

    if (phase === 'work') {
      if (currentRound >= totalRounds) {
        // Finished!
        setCompletedRounds((prev) => [...prev, currentRound]);
        setPhase('done');
        setIsRunning(false);
        beep(880, 0.3);
        setTimeout(() => beep(1100, 0.3), 350);
      } else {
        setPhase('rest');
        setTimeLeft(restSec);
      }
    } else if (phase === 'rest') {
      const nextRound = currentRound + 1;
      setCompletedRounds((prev) => [...prev, currentRound]);
      setCurrentRound(nextRound);
      setPhase('work');
      setTimeLeft(workSec);
    }
  }, [timeLeft, isRunning, phase, currentRound, totalRounds, workSec, restSec, beep]);

  // ── Notificação local ao trocar de fase (só quando a aba está em segundo
  //    plano — se o usuário está olhando a tela, o círculo já mostra tudo).
  //    Não depende de servidor, só da permissão local do navegador. ──
  const prevPhaseRef = useRef(phase);
  useEffect(() => {
    if (prevPhaseRef.current === phase) return;
    const prevPhase = prevPhaseRef.current;
    prevPhaseRef.current = phase;

    if (!document.hidden) return;

    if (phase === 'work' && prevPhase === 'rest') {
      showLocalNotification('Descanso finalizado ⏱️', {
        tag: 'interval-timer',
        body: `Hora da série ${currentRound} de ${totalRounds}!`,
      });
    } else if (phase === 'rest') {
      showLocalNotification('Série concluída 💪', {
        tag: 'interval-timer',
        body: `Descanse ${restSec}s antes da próxima série.`,
      });
    } else if (phase === 'done') {
      showLocalNotification('Treino do timer concluído! 🎉', {
        tag: 'interval-timer',
        body: `${totalRounds} séries finalizadas.`,
      });
    }
  }, [phase, currentRound, totalRounds, restSec]);

  // ── Controls ──
  const handleStart = () => {
    if (phase === 'idle' || phase === 'done') {
      setCompletedRounds([]);
      setCurrentRound(1);
      setPhase('work');
      setTimeLeft(workSec);
    }
    setIsRunning(true);
    beep(660, 0.1);
  };

  const handlePause = () => setIsRunning(false);

  const handleReset = () => {
    setIsRunning(false);
    setPhase('idle');
    setTimeLeft(workSec);
    setCurrentRound(1);
    setCompletedRounds([]);
    clearInterval(intervalRef.current);
  };

  const handleSkip = () => {
    clearInterval(intervalRef.current);
    if (phase === 'work') {
      if (currentRound >= totalRounds) {
        setCompletedRounds((prev) => [...prev, currentRound]);
        setPhase('done');
        setIsRunning(false);
      } else {
        setPhase('rest');
        setTimeLeft(restSec);
      }
    } else if (phase === 'rest') {
      const nextRound = currentRound + 1;
      setCompletedRounds((prev) => [...prev, currentRound]);
      setCurrentRound(nextRound);
      setPhase('work');
      setTimeLeft(workSec);
    }
  };

  const applyPreset = (p) => {
    handleReset();
    setWorkSec(p.work);
    setRestSec(p.rest);
    setTotalRounds(p.rounds);
    setTimeLeft(p.work);
    setShowPresets(false);
  };

  const isActive = phase !== 'idle' && phase !== 'done';

  return (
    <div className="w-full min-h-screen bg-[#171717] lg:py-16 md:py-14 sm:py-12 py-10 lg:px-24 md:px-16 sm:px-6 px-4">
      {/* Header */}
      <div className="w-full flex flex-wrap justify-between items-center gap-3 mb-8">
        <h1 className="lg:text-2xl md:text-xl text-base font-semibold text-gray-200 flex items-center gap-x-2 bg-black/20 rounded-md py-2 px-4">
          <Timer className="w-5 h-5 text-indigo-500" />
          Cronômetro de Treino
        </h1>
        {/* Presets toggle */}
        <button
          onClick={() => setShowPresets((v) => !v)}
          disabled={isActive && isRunning}
          className="shrink-0 flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-400 bg-black/20 rounded-md py-2 px-3 transition-colors duration-200 disabled:opacity-40"
        >
          <Dumbbell className="w-4 h-4 -rotate-45" />
          Presets
          {showPresets ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Presets drawer */}
      {showPresets && (
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8 animate-pulse-once">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className="flex flex-col items-start gap-1 bg-[#1d1d1d] border border-gray-800 hover:border-indigo-600 rounded-xl p-3 transition-all duration-200 hover:-translate-y-0.5 group"
            >
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: p.color }}
              >
                {p.label}
              </span>
              <span className="text-gray-500 text-xs">
                {p.work}s trabalho · {p.rest}s descanso
              </span>
              <span className="text-gray-500 text-xs">{p.rounds} séries</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
        {/* ── Left: Timer + Controls ── */}
        <div className="w-full lg:w-auto flex flex-col items-center gap-6">
          {/* Config (only when idle or done) */}
          {!isActive && (
            <div className="bg-[#1d1d1d] rounded-2xl border border-gray-800 p-5 flex flex-wrap gap-6 justify-center">
              <Stepper
                label="Trabalho"
                value={`${workSec}s`}
                unit=""
                onDec={() => { if (workSec > 5) { setWorkSec(w => w - 5); if (phase === 'idle') setTimeLeft(w => w - 5); } }}
                onInc={() => { setWorkSec(w => w + 5); if (phase === 'idle') setTimeLeft(w => w + 5); }}
              />
              <Stepper
                label="Descanso"
                value={`${restSec}s`}
                unit=""
                onDec={() => { if (restSec > 5) setRestSec(r => r - 5); }}
                onInc={() => setRestSec(r => r + 5)}
              />
              <Stepper
                label="Séries"
                value={totalRounds}
                unit=""
                onDec={() => { if (totalRounds > 1) setTotalRounds(r => r - 1); }}
                onInc={() => setTotalRounds(r => r + 1)}
              />
            </div>
          )}

          {/* Circular timer */}
          <CircularProgress
            progress={progress}
            phase={phase === 'idle' ? 'work' : phase}
            timeLeft={phase === 'idle' ? workSec : timeLeft}
            isRunning={isRunning}
          />

          {/* Round info */}
          {isActive && (
            <div className="text-center">
              <p className="text-gray-500 text-sm">
                Série <span className="text-gray-200 font-semibold">{currentRound}</span> de{' '}
                <span className="text-gray-200 font-semibold">{totalRounds}</span>
              </p>
              {phase === 'rest' && currentRound < totalRounds && (
                <p className="text-gray-600 text-xs mt-0.5">
                  Próxima série em {timeLeft}s…
                </p>
              )}
            </div>
          )}

          {phase === 'done' && (
            <div className="flex flex-col items-center gap-1">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
              <p className="text-green-400 font-semibold text-lg">Treino Concluído!</p>
              <p className="text-gray-500 text-sm">{totalRounds} séries finalizadas 🔥</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="w-11 h-11 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 flex items-center justify-center transition-colors duration-200"
              title="Resetar"
            >
              <RotateCcw size={18} />
            </button>

            {!isRunning ? (
              <button
                onClick={handleStart}
                className="w-16 h-16 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-all duration-200 hover:scale-105"
                title="Iniciar"
              >
                <Play size={26} className="ml-1" />
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="w-16 h-16 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-all duration-200"
                title="Pausar"
              >
                <Pause size={26} />
              </button>
            )}

            <button
              onClick={handleSkip}
              disabled={!isActive}
              className="w-11 h-11 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 flex items-center justify-center transition-colors duration-200 disabled:opacity-30"
              title="Pular fase"
            >
              <SkipForward size={18} />
            </button>
          </div>

          {/* Session info */}
          <p className="text-gray-600 text-xs">
            Sessão total estimada: <span className="text-gray-500">{fmt(totalSessionSec)}</span>
          </p>
        </div>

        {/* ── Right: Rounds tracker ── */}
        <div className="w-full lg:w-72 flex flex-col gap-4">
          {/* Rounds list */}
          <div className="bg-[#1d1d1d] rounded-2xl border border-gray-800 p-5">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Progresso das Séries
            </h2>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: totalRounds }, (_, i) => {
                const roundNum = i + 1;
                const done = completedRounds.includes(roundNum);
                const active = isActive && currentRound === roundNum;
                return (
                  <div
                    key={roundNum}
                    className={`flex flex-col items-center gap-1 rounded-xl py-2 transition-all duration-300 ${
                      active
                        ? 'bg-indigo-600/20 border border-indigo-600/50 scale-105'
                        : done
                        ? 'bg-green-500/10 border border-green-500/20'
                        : 'bg-gray-800/40 border border-gray-800'
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 size={16} className="text-green-400" />
                    ) : active ? (
                      <Circle size={16} className="text-indigo-400 animate-pulse" />
                    ) : (
                      <Circle size={16} className="text-gray-700" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        done ? 'text-green-400' : active ? 'text-indigo-300' : 'text-gray-600'
                      }`}
                    >
                      {roundNum}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-[#1d1d1d] rounded-2xl border border-gray-800 p-5">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-400" />
              Configuração Atual
            </h2>
            <div className="space-y-3">
              {[
                { label: 'Trabalho por série', value: `${workSec}s` },
                { label: 'Descanso por série', value: `${restSec}s` },
                { label: 'Total de séries', value: totalRounds },
                { label: 'Séries concluídas', value: completedRounds.length },
                { label: 'Tempo total', value: fmt(totalSessionSec) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{label}</span>
                  <span className="text-sm text-gray-200 font-medium tabular-nums">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Phase legend */}
          <div className="bg-[#1d1d1d] rounded-2xl border border-gray-800 p-4 flex justify-around">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span className="text-xs text-gray-500">Trabalho</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-gray-500">Descanso</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-xs text-gray-500">Preparo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimerPage;