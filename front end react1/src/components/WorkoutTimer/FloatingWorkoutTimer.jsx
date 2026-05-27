import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, Square, Minimize2, Maximize2,
  Dumbbell, Clock, CheckCircle2, X, TrendingUp,
  BookOpen, Search, ChevronDown, Plus, Star, AlertCircle,
} from 'lucide-react';
import { useWorkoutTimer } from '../../context/WorkoutTimerContext';
import { getRoutines } from '../../services/api-routines';
import { postExerciseToRoutine } from '../../services/api-exercises';

// ─── Catálogo de exercícios (mesmo do RoutineForm) ────────────────────────────
const CATALOG = {
  Peito:   ['Supino Reto','Supino Inclinado','Supino Declinado','Crucifixo','Crossover','Flexão de Braços'],
  Costas:  ['Barra Fixa','Remada Curvada','Remada Unilateral','Puxada Frontal','Remada Cavalinho','Levantamento Terra'],
  Pernas:  ['Agachamento Livre','Leg Press','Cadeira Extensora','Mesa Flexora','Avanço','Panturrilha em Pé'],
  Ombros:  ['Desenvolvimento com Barra','Desenvolvimento Halteres','Elevação Lateral','Elevação Frontal','Remada Alta','Face Pull'],
  Bíceps:  ['Rosca Direta','Rosca Alternada','Rosca Martelo','Rosca Concentrada','Rosca Scott','Rosca no Cabo'],
  Tríceps: ['Tríceps Testa','Tríceps Corda','Tríceps Francês','Mergulho no Banco','Tríceps Coice','Tríceps Testa Unilateral'],
  Abdômen: ['Abdominal Crunch','Prancha','Abdominal Infra','Russian Twist','Abdominal no Cabo','Elevação de Pernas'],
  Glúteos: ['Hip Thrust','Agachamento Sumô','Stiff','Abdução no Cabo','Glúteo no Cabo','Avanço Reverso'],
};

const ALL_EXERCISES = Object.entries(CATALOG).flatMap(([group, exercises]) =>
  exercises.map(name => ({ name, group }))
);

const TODAY_WEEKDAY = (() => {
  const map = ['domingo','segunda','terca','quarta','quinta','sexta','sabado'];
  return map[new Date().getDay()];
})();

// ─── Mini ExercisePicker (autocomplete da biblioteca) ─────────────────────────
const ExercisePicker = ({ value, onChange, placeholder }) => {
  const [query, setQuery] = useState(value || '');
  const [open, setOpen]   = useState(false);
  const ref = useRef(null);

  useEffect(() => { setQuery(value || ''); }, [value]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = query.length > 0
    ? ALL_EXERCISES.filter(e => e.name.toLowerCase().includes(query.toLowerCase()))
    : ALL_EXERCISES;

  return (
    <div ref={ref} className="relative w-full">
      <div className="flex items-center bg-black/40 rounded-xl border border-gray-700 focus-within:border-indigo-500/60 transition-colors">
        <Search className="w-4 h-4 text-gray-500 ml-3 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder || 'Buscar exercício na biblioteca…'}
          className="flex-1 px-3 py-2.5 bg-transparent text-gray-200 text-sm focus:outline-none placeholder-gray-600"
        />
        {query && (
          <button type="button" onClick={() => { setQuery(''); onChange(''); }} className="mr-2 text-gray-500 hover:text-gray-300">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <button type="button" onClick={() => setOpen(!open)} className="mr-3 text-gray-500 hover:text-gray-300">
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-gray-500 text-xs px-3 py-2">Nenhum exercício encontrado.</p>
          ) : (
            Object.entries(CATALOG).map(([group, exercises]) => {
              const filteredGroup = exercises.filter(n => n.toLowerCase().includes(query.toLowerCase()));
              if (filteredGroup.length === 0) return null;
              return (
                <div key={group}>
                  <p className="text-gray-500 text-xs px-3 pt-2 pb-1 uppercase tracking-wider">{group}</p>
                  {filteredGroup.map(name => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => { setQuery(name); onChange(name); setOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-indigo-600/30 transition-colors"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

// ─── Modal de Finalização ─────────────────────────────────────────────────────
const FinishModal = () => {
  const {
    elapsed, elapsedFormatted,
    finishAndSave, discardSession, cancelFinish,
    saving, saveError,
  } = useWorkoutTimer();

  const [label, setLabel]                   = useState('');
  const [notes, setNotes]                   = useState('');

  // Rotinas
  const [routines, setRoutines]             = useState([]);
  const [loadingRoutines, setLoadingRoutines] = useState(true);
  const [todayRoutine, setTodayRoutine]     = useState(null); // rotina do dia ou null

  // Exercício novo
  const [newExercise, setNewExercise]       = useState('');
  const [addingExercise, setAddingExercise] = useState(false);
  const [exerciseAdded, setExerciseAdded]   = useState(false);
  const [exerciseError, setExerciseError]   = useState(null);

  // Progresso corporal
  const [goToProgress, setGoToProgress]     = useState(false);

  const totalMin = Math.round(elapsed / 60);

  // Carrega rotinas do usuário ao abrir o modal
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getRoutines();
        setRoutines(data);
        // Encontra rotina que contém o dia de hoje
        const routine = data.find(r =>
          Array.isArray(r.week_days) && r.week_days.includes(TODAY_WEEKDAY)
        );
        setTodayRoutine(routine || null);
        // Pré-preenche o label com o nome da rotina do dia
        if (routine) setLabel(routine.name);
      } catch (e) {
        console.error('Erro ao buscar rotinas:', e);
      } finally {
        setLoadingRoutines(false);
      }
    };
    load();
  }, []);

  const handleAddExercise = async () => {
    if (!newExercise.trim() || !todayRoutine) return;
    setAddingExercise(true);
    setExerciseError(null);
    try {
      await postExerciseToRoutine({ routine_id: todayRoutine.id, exercise: newExercise.trim() });
      setExerciseAdded(true);
      setNewExercise('');
    } catch (e) {
      setExerciseError('Não foi possível adicionar o exercício. Tente novamente.');
    } finally {
      setAddingExercise(false);
    }
  };

  const handleSave = async () => {
    const saved = await finishAndSave(label, notes);
    if (saved && goToProgress) {
      setTimeout(() => { window.location.href = '/progress'; }, 150);
    }
  };

  const dayLabel = {
    segunda: 'segunda-feira', terca: 'terça-feira', quarta: 'quarta-feira',
    quinta: 'quinta-feira', sexta: 'sexta-feira', sabado: 'sábado', domingo: 'domingo',
  }[TODAY_WEEKDAY] || 'hoje';

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={cancelFinish} />

      <div className="relative w-full max-w-md bg-[#1c1c1c] border border-gray-700/60 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-indigo-600/20 to-violet-600/20 px-5 py-4 border-b border-gray-800 shrink-0">
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
            <button onClick={cancelFinish} className="text-gray-600 hover:text-gray-400 transition-colors" title="Retomar treino">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Body (scrollável) ───────────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-4">

          {/* ── Parabéns / Convite para rotina ─────────────────────────────── */}
          {!loadingRoutines && (
            todayRoutine ? (
              /* Tem rotina para hoje */
              <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-xl px-4 py-3 flex items-start gap-3">
                <Star className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-indigo-300 font-semibold text-sm">
                    Parabéns por concluir o treino de {dayLabel}!
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Rotina: <span className="text-gray-300 font-medium">{todayRoutine.name}</span>
                  </p>
                </div>
              </div>
            ) : routines.length === 0 ? (
              /* Sem nenhuma rotina */
              <div className="bg-amber-600/10 border border-amber-500/30 rounded-xl px-4 py-3 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-amber-300 font-semibold text-sm">Você ainda não tem uma rotina!</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Que tal criar sua primeira rotina de treino?{' '}
                    <a href="/routines" className="text-indigo-400 underline underline-offset-2 hover:text-indigo-300 transition-colors">
                      Criar rotina
                    </a>
                  </p>
                </div>
              </div>
            ) : (
              /* Tem rotinas mas nenhuma para hoje */
              <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl px-4 py-3 flex items-start gap-3">
                <Dumbbell className="w-4 h-4 text-gray-400 mt-0.5 shrink-0 -rotate-45" />
                <div>
                  <p className="text-gray-300 font-semibold text-sm">Sem rotina programada para hoje</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Você não tem rotina para {dayLabel}.{' '}
                    <a href="/routines" className="text-indigo-400 underline underline-offset-2 hover:text-indigo-300 transition-colors">
                      Adicionar rotina para este dia?
                    </a>
                  </p>
                </div>
              </div>
            )
          )}

          {/* ── Nome do treino ──────────────────────────────────────────────── */}
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

          {/* ── Observações ────────────────────────────────────────────────── */}
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

          {/* ── Adicionar exercício novo à rotina (só aparece se tem rotina hoje) */}
          {todayRoutine && (
            <div className="bg-black/30 border border-gray-800 rounded-xl px-4 py-3 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400 shrink-0" />
                <p className="text-sm text-gray-300 font-medium">
                  Treinou um exercício novo hoje?
                </p>
              </div>
              <p className="text-xs text-gray-500 -mt-1">
                Adicione-o à sua rotina de <span className="text-gray-400 font-medium">{todayRoutine.name}</span>.
              </p>

              {/* Hint da biblioteca */}
              <div className="flex items-center gap-2 bg-indigo-600/10 border border-indigo-600/20 rounded-lg px-3 py-2">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <p className="text-xs text-gray-400">
                  Busque na{' '}
                  <a href="/exercises-library" className="text-indigo-400 underline underline-offset-2 hover:text-indigo-300 transition-colors">
                    Biblioteca de Exercícios
                  </a>
                  {' '}para descobrir novos movimentos.
                </p>
              </div>

              <ExercisePicker
                value={newExercise}
                onChange={setNewExercise}
                placeholder="Buscar exercício na biblioteca…"
              />

              {exerciseAdded && (
                <p className="text-green-400 text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Exercício adicionado à rotina!
                </p>
              )}
              {exerciseError && (
                <p className="text-red-400 text-xs">{exerciseError}</p>
              )}

              <button
                type="button"
                onClick={handleAddExercise}
                disabled={!newExercise.trim() || addingExercise || exerciseAdded}
                className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 text-xs font-medium hover:bg-indigo-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {addingExercise ? (
                  <span className="w-3.5 h-3.5 border-2 border-indigo-300/30 border-t-indigo-300 rounded-full animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                {exerciseAdded ? 'Adicionado!' : 'Adicionar à rotina'}
              </button>
            </div>
          )}

          {/* ── Progresso corporal (opcional) ──────────────────────────────── */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Registrar progresso corporal?&nbsp;
              <span className="text-gray-700 normal-case">(opcional)</span>
            </p>
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
                <p className="text-xs text-gray-500 mt-0.5 font-normal">
                  Acompanhe seu progresso após o treino
                </p>
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

        {/* ── Footer fixo ─────────────────────────────────────────────────────── */}
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
