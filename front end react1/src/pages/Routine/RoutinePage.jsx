import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Dumbbell, Calendar, ChevronRight, ChevronDown, Edit2,
  Moon, Sun, Zap, Save, Plus, Trash2, X, Loader2, CheckCircle2,
  Info, RotateCcw
} from 'lucide-react';
import { useConfirm } from '../../hooks/useConfirm';
import ConfirmModal from '../../components/Confirm/ConfirmModal';
import { getWeeklyProgram, saveDay } from '../../services/api-routines';
import DayEditor from './DayEditor';

// ─── Constantes ───────────────────────────────────────────────────────────────

const WEEKDAYS = [
  { key: 'segunda', label: 'Segunda-feira',  short: 'SEG' },
  { key: 'terca',   label: 'Terça-feira',    short: 'TER' },
  { key: 'quarta',  label: 'Quarta-feira',   short: 'QUA' },
  { key: 'quinta',  label: 'Quinta-feira',   short: 'QUI' },
  { key: 'sexta',   label: 'Sexta-feira',    short: 'SEX' },
  { key: 'sabado',  label: 'Sábado',         short: 'SÁB' },
  { key: 'domingo', label: 'Domingo',        short: 'DOM' },
];

const getTodayWeekday = () => {
  const map = ['domingo','segunda','terca','quarta','quinta','sexta','sabado'];
  return map[new Date().getDay()];
};

// ─── Componente principal ─────────────────────────────────────────────────────

const RoutinePage = () => {
  const [program,        setProgram]        = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [editingDay,     setEditingDay]     = useState(null);  // weekday key em edição
  const [expandedDay,    setExpandedDay]    = useState(null);  // para accordion mobile
  const [imcBanner,      setImcBanner]      = useState(null);  // dados vindos da IMC
  const { confirm, confirmProps }           = useConfirm();
  const location = useLocation();
  const navigate = useNavigate();
  const todayKey = getTodayWeekday();

  // ── Carrega programa ────────────────────────────────────────────────────────
  const fetchProgram = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getWeeklyProgram();
      setProgram(data);
    } catch (err) {
      console.error('Erro ao carregar programa:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProgram(); }, [fetchProgram]);

  // ── Detecta redirecionamento da IMC ────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const nome    = params.get('nome');
    const treinos = params.get('treinos');
    if (nome && treinos) {
      try {
        const exercises = JSON.parse(treinos);
        setImcBanner({
          nome,
          exercises,
          imc:          params.get('imc'),
          classificacao:params.get('classificacao'),
          sexo:         params.get('sexo'),
          objetivo:     params.get('objetivo'),
        });
        // Abre editor do dia de hoje automaticamente com o treino IMC pré-preenchido
        setEditingDay(todayKey);
        navigate('/routines', { replace: true });
      } catch (e) {
        console.error('Erro ao ler parâmetros do IMC:', e);
      }
    }
  }, [location.search, todayKey, navigate]);

  // ── Callback: salvar dia (vindo do DayEditor) ───────────────────────────────
  const handleSaveDay = async (weekday, dayData) => {
    try {
      await saveDay(weekday, dayData);
      await fetchProgram();
      setEditingDay(null);
      setImcBanner(null);
    } catch (err) {
      console.error('Erro ao salvar dia:', err.message);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  const days = program?.days || [];

  return (
    <>
      <ConfirmModal {...confirmProps} />

      <div className="w-full min-h-screen lg:py-16 md:py-14 py-10 lg:px-24 md:px-16 sm:px-6 px-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-xl font-semibold text-gray-200 flex items-center gap-x-2 bg-black/20 rounded-md py-2 px-4">
            <Calendar className="w-5 h-5 text-indigo-400" />
            Minha Semana de Treinos
          </h1>
          <div className="flex gap-2">
            <a
              href="/exercises-library"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-700 text-gray-400 hover:border-indigo-500/50 hover:text-indigo-300 text-sm transition-all"
            >
              <Dumbbell className="w-4 h-4" /> Biblioteca
            </a>
            <a
              href="/calendar"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-700 text-gray-400 hover:border-indigo-500/50 hover:text-indigo-300 text-sm transition-all"
            >
              <Calendar className="w-4 h-4" /> Histórico
            </a>
          </div>
        </div>

        {/* Banner IMC */}
        {imcBanner && (
          <div className="w-full mb-4 bg-indigo-600/10 border border-indigo-500/30 rounded-xl px-5 py-4 flex items-start gap-x-3">
            <Dumbbell className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0 -rotate-45" />
            <div className="flex-1">
              <p className="text-indigo-300 font-semibold text-sm">
                Treino personalizado com base no seu IMC ({imcBanner.imc} — {imcBanner.classificacao})
              </p>
              <p className="text-gray-400 text-xs mt-0.5">
                O treino do dia está pré-preenchido abaixo. Edite à vontade antes de salvar!
              </p>
            </div>
            <button onClick={() => setImcBanner(null)} className="text-gray-500 hover:text-gray-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Grid dos 7 dias */}
        <div className="flex flex-col gap-y-3">
          {WEEKDAYS.map(({ key, label, short }) => {
            const dayData = days.find(d => d.weekday === key);
            const isToday = key === todayKey;
            const exercises = dayData?.week_day_exercises || [];
            const isRest = dayData?.is_rest_day ?? true;
            const isEditing = editingDay === key;
            const isExpanded = expandedDay === key || isToday;

            return (
              <div
                key={key}
                className={`rounded-xl border overflow-hidden transition-all ${
                  isToday
                    ? 'border-indigo-500/50 bg-indigo-950/30 shadow-md shadow-indigo-900/20'
                    : 'border-gray-800/60 bg-black/20'
                }`}
              >
                {/* Header do dia */}
                <div
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer select-none ${
                    isToday ? 'bg-indigo-600/10' : 'hover:bg-white/5'
                  }`}
                  onClick={() => setExpandedDay(isExpanded ? null : key)}
                >
                  {/* Dia label */}
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 text-xs font-bold ${
                    isToday
                      ? 'bg-indigo-600 text-white'
                      : isRest
                        ? 'bg-gray-800 text-gray-500'
                        : 'bg-indigo-600/20 text-indigo-300 border border-indigo-600/40'
                  }`}>
                    {short}
                    {isToday && <span className="text-[9px] font-normal mt-0.5 opacity-80">HOJE</span>}
                  </div>

                  {/* Nome e info */}
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <p className={`font-semibold text-sm shrink-0 ${isToday ? 'text-indigo-200' : 'text-gray-300'}`}>
                        {label}
                      </p>
                      {!isRest && dayData?.workout_name && (
                        <span className="text-xs bg-indigo-600/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-600/30 truncate min-w-0 block max-w-[140px]">
                          {dayData.workout_name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {isRest
                        ? '🛌 Descanso'
                        : `${exercises.length} exercício${exercises.length !== 1 ? 's' : ''}${dayData?.estimated_duration_min ? ` · ~${dayData.estimated_duration_min}min` : ''}`
                      }
                    </p>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setEditingDay(isEditing ? null : key)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isEditing
                          ? 'bg-red-600/20 border border-red-500/40 text-red-300'
                          : 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30'
                      }`}
                    >
                      {isEditing ? <><X className="w-3.5 h-3.5" /> Cancelar</> : <><Edit2 className="w-3.5 h-3.5" /> Editar</>}
                    </button>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Conteúdo expandido */}
                {isExpanded && !isEditing && (
                  <div className="px-4 pb-4 pt-2">
                    {isRest ? (
                      <div className="flex items-center gap-2 text-gray-600 text-sm py-2">
                        <Moon className="w-4 h-4" /> Dia de descanso e recuperação
                      </div>
                    ) : exercises.length === 0 ? (
                      <div className="text-gray-500 text-sm py-2 flex items-center gap-2">
                        <Info className="w-4 h-4" /> Nenhum exercício cadastrado. Clique em Editar para adicionar.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {dayData?.goal && (
                          <p className="text-indigo-300 text-xs bg-indigo-600/10 border border-indigo-600/20 rounded-lg px-3 py-2">
                            🎯 {dayData.goal}
                          </p>
                        )}
                        {exercises.map((ex, idx) => (
                          <ExerciseRow key={ex.id} exercise={ex} index={idx} />
                        ))}
                        {dayData?.observations && (
                          <p className="text-gray-500 text-xs mt-1 italic">{dayData.observations}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Editor do dia */}
                {isEditing && (
                  <div className="border-t border-gray-800/60">
                    <DayEditor
                      weekday={key}
                      weekdayLabel={label}
                      initialData={dayData}
                      imcPrefill={key === todayKey ? imcBanner : null}
                      onSave={(data) => handleSaveDay(key, data)}
                      onCancel={() => { setEditingDay(null); setImcBanner(null); }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

// ─── Sub-componente: linha de exercício ───────────────────────────────────────
const ExerciseRow = ({ exercise, index }) => {
  const parts = [];
  if (exercise.sets)         parts.push(`${exercise.sets} séries`);
  if (exercise.reps)         parts.push(exercise.reps === 'até falha' ? 'até falha' : `${exercise.reps} reps`);
  if (exercise.weight_kg)    parts.push(`${exercise.weight_kg}kg`);
  if (exercise.rest_seconds) parts.push(`${exercise.rest_seconds}s desc`);
  if (exercise.rpe)          parts.push(`RPE ${exercise.rpe}`);

  return (
    <div className={`flex items-start gap-3 px-3 py-2.5 rounded-lg ${
      exercise.completed ? 'bg-green-600/10 border border-green-600/20' : 'bg-black/30'
    }`}>
      <span className="text-xs text-gray-600 font-bold w-5 shrink-0 pt-0.5">{index + 1}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${exercise.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
          {exercise.exercise_name}
          {exercise.muscle_group && (
            <span className="ml-2 text-xs text-gray-600 font-normal">{exercise.muscle_group}</span>
          )}
        </p>
        {parts.length > 0 && (
          <p className="text-xs text-gray-500 mt-0.5">{parts.join(' · ')}</p>
        )}
        {exercise.observations && (
          <p className="text-xs text-gray-600 mt-0.5 italic">{exercise.observations}</p>
        )}
      </div>
      {exercise.completed && <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />}
    </div>
  );
};

export default RoutinePage;