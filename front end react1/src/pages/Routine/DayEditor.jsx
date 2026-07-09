import React, { useState, useEffect, useCallback } from 'react';
import {
  Save, X, Plus, Trash2, ChevronDown, ChevronUp,
  Dumbbell, Moon, Search, BookOpen, PenLine,
  GripVertical, CheckCircle2, Loader2,
} from 'lucide-react';
import { CATALOG, ALL_EXERCISES } from '../../utils/exerciseCatalog';
import { getCustomExercises, createCustomExercise } from '../../services/api-routines';

// ─── Constantes ───────────────────────────────────────────────────────────────

const MUSCLE_GROUPS = [
  'Peito','Costas','Pernas','Ombros','Bíceps','Tríceps',
  'Abdômen','Glúteos','Panturrilha','Antebraço','Trapézio','Cardio','Funcional',
];

const RPE_DESC = {
  1:'Muito leve',2:'Leve',3:'Moderado leve',4:'Moderado',
  5:'Moderado intenso',6:'Intenso',7:'Muito intenso',
  8:'Difícil',9:'Quase máximo',10:'Máximo esforço',
};

const WEEKDAY_LABELS = {
  segunda: 'Segunda-feira', terca: 'Terça-feira', quarta: 'Quarta-feira',
  quinta: 'Quinta-feira',   sexta: 'Sexta-feira',  sabado: 'Sábado', domingo: 'Domingo',
};

// ─── ExerciseLibraryModal ─────────────────────────────────────────────────────

const ExerciseLibraryModal = ({ open, onClose, onSelect, customExercises }) => {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('library');
  const [newEx, setNewEx] = useState({ name: '', muscle_group: '', description: '', observations: '' });
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState('');

  const filtered = query.trim()
    ? ALL_EXERCISES.filter(e => e.name.toLowerCase().includes(query.toLowerCase()))
    : ALL_EXERCISES;

  const filteredCustom = query.trim()
    ? (customExercises || []).filter(e => e.name.toLowerCase().includes(query.toLowerCase()))
    : (customExercises || []);

  const handleSaveCustom = async () => {
    if (!newEx.name.trim()) { setSaveErr('Nome é obrigatório.'); return; }
    setSaving(true); setSaveErr('');
    try {
      const created = await createCustomExercise(newEx);
      onSelect({ exercise_name: created.name, muscle_group: created.muscle_group, is_custom: true, custom_id: created.id });
      onClose();
    } catch (e) {
      setSaveErr(e.message || 'Erro ao criar exercício.');
    } finally { setSaving(false); }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#0f0f1a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="font-bold text-white text-base" style={{ fontFamily: 'Syne, sans-serif' }}>
            Selecionar Exercício
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {[{ id:'library', label:'Biblioteca', icon: BookOpen },
            { id:'custom',  label:'Personalizado', icon: PenLine }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors ${
                tab === t.id ? 'text-[#5B4FFF] border-b-2 border-[#5B4FFF]' : 'text-gray-400 hover:text-gray-200'
              }`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Search (biblioteca) */}
        {tab === 'library' && (
          <div className="px-4 py-3 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar exercício..."
                className="w-full bg-black/30 border border-white/10 rounded-xl text-gray-300 placeholder-gray-600 text-sm pl-9 pr-3 py-2.5 outline-none focus:border-[#5B4FFF]/50" />
            </div>
          </div>
        )}

        {/* Conteúdo */}
        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {tab === 'library' ? (
            query.trim() ? (
              filtered.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-6">Nenhum exercício encontrado.</p>
              ) : (
                filtered.map(e => (
                  <button key={e.name} onClick={() => { onSelect({ exercise_name: e.name, muscle_group: e.group, is_custom: false }); onClose(); }}
                    className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#5B4FFF]/40 rounded-xl text-left transition-all group">
                    <Dumbbell className="w-4 h-4 text-[#5B4FFF] shrink-0" />
                    <div>
                      <p className="text-white text-sm font-medium group-hover:text-[#5B4FFF] transition-colors">{e.name}</p>
                      <p className="text-gray-500 text-xs">{e.group}</p>
                    </div>
                  </button>
                ))
              )
            ) : (
              Object.entries(CATALOG).map(([group, exercises]) => (
                <div key={group}>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{group}</p>
                  <div className="space-y-1.5">
                    {exercises.map(ex => (
                      <button key={ex} onClick={() => { onSelect({ exercise_name: ex, muscle_group: group, is_custom: false }); onClose(); }}
                        className="w-full flex items-center gap-3 p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#5B4FFF]/30 rounded-lg text-left transition-all text-sm text-gray-300 hover:text-white">
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )
          ) : (
            <div className="space-y-4">
              {/* Exercícios customizados existentes */}
              {filteredCustom.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Meus Exercícios</p>
                  {filteredCustom.map(e => (
                    <button key={e.id} onClick={() => { onSelect({ exercise_name: e.name, muscle_group: e.muscle_group, is_custom: true, custom_id: e.id }); onClose(); }}
                      className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#5B4FFF]/40 rounded-xl text-left transition-all group mb-2">
                      <PenLine className="w-4 h-4 text-purple-400 shrink-0" />
                      <div>
                        <p className="text-white text-sm font-medium">{e.name}</p>
                        {e.muscle_group && <p className="text-gray-500 text-xs">{e.muscle_group}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Criar novo exercício */}
              <div className="bg-black/20 border border-white/10 rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Criar Novo Exercício</p>

                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Nome *</label>
                  <input value={newEx.name} onChange={e => setNewEx(p => ({ ...p, name: e.target.value }))}
                    placeholder="Ex: Rosca Concentrada no Cabo"
                    className="w-full bg-black/30 border border-white/10 rounded-xl text-gray-300 placeholder-gray-600 text-sm px-3 py-2.5 outline-none focus:border-[#5B4FFF]/50" />
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Grupo muscular</label>
                  <select value={newEx.muscle_group} onChange={e => setNewEx(p => ({ ...p, muscle_group: e.target.value }))}
                    className="w-full bg-black/30 border border-white/10 rounded-xl text-gray-300 text-sm px-3 py-2.5 outline-none focus:border-[#5B4FFF]/50">
                    <option value="">Selecionar...</option>
                    {MUSCLE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Descrição</label>
                  <textarea value={newEx.description} onChange={e => setNewEx(p => ({ ...p, description: e.target.value }))}
                    placeholder="Descreva como executar..."
                    className="w-full bg-black/30 border border-white/10 rounded-xl text-gray-300 placeholder-gray-600 text-sm px-3 py-2.5 outline-none focus:border-[#5B4FFF]/50 resize-none" rows={2} />
                </div>

                {saveErr && <p className="text-red-400 text-xs">{saveErr}</p>}

                <button onClick={handleSaveCustom} disabled={saving || !newEx.name.trim()}
                  className="w-full h-10 bg-[#5B4FFF] hover:bg-[#5B4FFF]/85 disabled:opacity-40 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Criar e Adicionar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── ExerciseCard ─────────────────────────────────────────────────────────────

const ExerciseCard = ({ exercise, index, onChange, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  const field = (key, label, placeholder, type = 'text', suffix = '') => (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      <div className="relative">
        <input type={type} value={exercise[key] ?? ''} placeholder={placeholder}
          onChange={e => onChange(index, key, type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
          className="w-full bg-black/30 border border-white/10 rounded-lg text-gray-300 placeholder-gray-600 text-sm px-3 py-2 outline-none focus:border-[#5B4FFF]/50 transition-colors"
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600">{suffix}</span>}
      </div>
    </div>
  );

  return (
    <div className="bg-black/20 border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-3">
        <GripVertical className="w-4 h-4 text-gray-600 shrink-0 cursor-grab" />
        <div className="flex-1 min-w-0">
          <input value={exercise.exercise_name || ''} placeholder="Nome do exercício"
            onChange={e => onChange(index, 'exercise_name', e.target.value)}
            className="w-full bg-transparent text-white text-sm font-medium outline-none placeholder-gray-600" />
          {exercise.muscle_group && (
            <p className="text-xs text-gray-500 mt-0.5">{exercise.muscle_group}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setExpanded(v => !v)}
            className="p-1.5 text-gray-500 hover:text-[#5B4FFF] transition-colors">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button onClick={() => onDelete(index)}
            className="p-1.5 text-gray-600 hover:text-red-400 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-px bg-white/5">
        {[
          { key: 'sets',      label: 'Séries',    placeholder: '4' },
          { key: 'reps',      label: 'Reps',      placeholder: '12' },
          { key: 'weight_kg', label: 'Peso (kg)', placeholder: '0' },
        ].map(f => (
          <div key={f.key} className="bg-[#0f0f1a] px-3 py-2">
            <label className="text-xs text-gray-600 block">{f.label}</label>
            <input type="number" value={exercise[f.key] ?? ''} placeholder={f.placeholder}
              onChange={e => onChange(index, f.key, e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-transparent text-white text-sm font-semibold outline-none placeholder-gray-700 mt-0.5" />
          </div>
        ))}
      </div>

      {/* Expanded fields */}
      {expanded && (
        <div className="px-3 pb-3 pt-3 grid grid-cols-2 gap-3 border-t border-white/5">
          {field('rest_seconds',       'Descanso (s)',      '90',  'number', 's')}
          {field('execution_time_sec', 'Tempo exec. (s)',   '30',  'number', 's')}

          <div>
            <label className="text-xs text-gray-500 mb-1 block">RPE (1–10)</label>
            <select value={exercise.rpe ?? ''} onChange={e => onChange(index, 'rpe', e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-black/30 border border-white/10 rounded-lg text-gray-300 text-sm px-3 py-2 outline-none focus:border-[#5B4FFF]/50">
              <option value="">—</option>
              {Object.entries(RPE_DESC).map(([n, d]) => (
                <option key={n} value={n}>{n} – {d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Grupo muscular</label>
            <select value={exercise.muscle_group ?? ''} onChange={e => onChange(index, 'muscle_group', e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg text-gray-300 text-sm px-3 py-2 outline-none focus:border-[#5B4FFF]/50">
              <option value="">—</option>
              {MUSCLE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="col-span-2">
            <label className="text-xs text-gray-500 mb-1 block">Observações</label>
            <textarea value={exercise.observations ?? ''} placeholder="Dicas de execução, variações..."
              onChange={e => onChange(index, 'observations', e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg text-gray-300 placeholder-gray-600 text-sm px-3 py-2 outline-none focus:border-[#5B4FFF]/50 resize-none" rows={2} />
          </div>
        </div>
      )}
    </div>
  );
};

// ─── DayEditor (principal) ────────────────────────────────────────────────────

/**
 * DayEditor — drawer/modal para editar um dia da semana.
 *
 * Props:
 *   weekday    {string}   'segunda' | 'terca' | ... | 'domingo'
 *   dayData    {object}   dados atuais do dia (week_days row + week_day_exercises[])
 *   onSave     {fn}       callback({ updatedDay, exercises })
 *   onClose    {fn}       fechar sem salvar
 */
const DayEditor = ({ weekday, initialData: dayData, imcPrefill, onSave, onClose, onCancel }) => {
  // support both onClose and onCancel prop names
  onClose = onClose || onCancel;
  const [workoutName,          setWorkoutName]          = useState('');
  const [goal,                 setGoal]                 = useState('');
  const [observations,         setObservations]         = useState('');
  const [estimatedDuration,    setEstimatedDuration]    = useState('');
  const [isRestDay,            setIsRestDay]            = useState(false);
  const [exercises,            setExercises]            = useState([]);
  const [saving,               setSaving]               = useState(false);
  const [showLibrary,          setShowLibrary]          = useState(false);
  const [customExercises,      setCustomExercises]      = useState([]);
  const [loadingCustom,        setLoadingCustom]        = useState(false);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!dayData) return;
    setWorkoutName(dayData.workout_name || '');
    setGoal(dayData.goal || '');
    setObservations(dayData.observations || '');
    setEstimatedDuration(dayData.estimated_duration_min || '');
    setIsRestDay(dayData.is_rest_day || false);
    setExercises(
      (dayData.week_day_exercises || []).map(e => ({ ...e }))
    );
  }, [dayData]);

  // Carrega exercícios customizados
  useEffect(() => {
    setLoadingCustom(true);
    getCustomExercises()
      .then(setCustomExercises)
      .catch(() => {})
      .finally(() => setLoadingCustom(false));
  }, []);

  // ── Aplica dados do IMC quando recebidos ──────────────────────────────────
  useEffect(() => {
    if (!imcPrefill) return;

    // imcPrefill.exercises é array de strings (nomes de exercícios)
    const rawExercises = imcPrefill.exercises || [];

    // Determina grupo muscular pelo nome do exercício a partir do catálogo
    const getGroup = (name) => {
      for (const [group, exList] of Object.entries(CATALOG)) {
        if (exList.some(ex => ex.toLowerCase() === name.toLowerCase())) return group;
      }
      return '';
    };

    const converted = rawExercises.map(ex => {
      const name = typeof ex === 'string' ? ex : (ex.exercise_name || ex.name || '');
      return {
        exercise_name:       name,
        muscle_group:        getGroup(name),
        is_custom:           false,
        library_exercise_id: null,
        sets:                4,
        reps:                '12',
        weight_kg:           0,
        rest_seconds:        60,
        execution_time_sec:  null,
        observations:        '',
        rpe:                 null,
        completed:           false,
      };
    });

    setWorkoutName(imcPrefill.nome || '');
    setGoal(imcPrefill.objetivo || '');
    setObservations('');
    setEstimatedDuration('');
    setIsRestDay(false);
    setExercises(converted);
  }, [imcPrefill]);

  // ── Handlers exercícios ───────────────────────────────────────────────────
  const handleAddExercise = (picked) => {
    setExercises(prev => [...prev, {
      exercise_name:      picked.exercise_name,
      muscle_group:       picked.muscle_group || '',
      is_custom:          picked.is_custom || false,
      library_exercise_id: picked.library_exercise_id || null,
      sets:               4,
      reps:               '12',
      weight_kg:          0,
      rest_seconds:       90,
      execution_time_sec: null,
      observations:       '',
      rpe:                null,
      completed:          false,
    }]);
    setIsRestDay(false);
  };

  const handleExerciseChange = useCallback((index, key, value) => {
    setExercises(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  }, []);

  const handleDeleteExercise = useCallback((index) => {
    setExercises(prev => prev.filter((_, i) => i !== index));
  }, []);

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        workout_name:            workoutName || (isRestDay ? 'Descanso' : 'Treino'),
        goal:                    goal || null,
        observations:            observations || null,
        estimated_duration_min:  estimatedDuration ? Number(estimatedDuration) : 0,
        is_rest_day:             isRestDay,
        exercises:               isRestDay ? [] : exercises.map((e, i) => ({ ...e, sort_order: i })),
      });
    } finally {
      setSaving(false);
    }
  };

  const totalVolume = exercises.reduce((acc, e) => {
    const s = parseInt(e.sets || 0);
    const w = parseFloat(e.weight_kg || 0);
    return acc + s * w;
  }, 0);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-[105] w-full max-w-lg bg-[#0b0b12] border-l border-white/10 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">{WEEKDAY_LABELS[weekday] || weekday}</p>
            <h2 className="text-white font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>
              Editar Treino
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Dia de descanso toggle */}
          <div className="flex items-center justify-between bg-black/20 border border-white/10 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2.5">
              <Moon className={`w-4 h-4 ${isRestDay ? 'text-indigo-400' : 'text-gray-500'}`} />
              <div>
                <p className="text-sm font-medium text-white">Dia de descanso</p>
                <p className="text-xs text-gray-500">Sem exercícios planejados</p>
              </div>
            </div>
            <button onClick={() => { setIsRestDay(v => !v); if (!isRestDay) setExercises([]); }}
              className={`relative w-12 h-6 rounded-full transition-all ${isRestDay ? 'bg-[#5B4FFF]' : 'bg-white/10'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isRestDay ? 'right-1' : 'left-1'}`} />
            </button>
          </div>

          {!isRestDay && (
            <>
              {/* Informações do treino */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Nome do treino</label>
                  <input value={workoutName} onChange={e => setWorkoutName(e.target.value)}
                    placeholder="Ex: Treino A – Peito e Tríceps"
                    className="w-full bg-black/30 border border-white/10 rounded-xl text-gray-300 placeholder-gray-600 text-sm px-4 py-2.5 outline-none focus:border-[#5B4FFF]/50 transition-colors" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block">Objetivo</label>
                    <input value={goal} onChange={e => setGoal(e.target.value)}
                      placeholder="Ex: Hipertrofia"
                      className="w-full bg-black/30 border border-white/10 rounded-xl text-gray-300 placeholder-gray-600 text-sm px-3 py-2.5 outline-none focus:border-[#5B4FFF]/50 transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block">Duração estimada (min)</label>
                    <input type="number" value={estimatedDuration} onChange={e => setEstimatedDuration(e.target.value)}
                      placeholder="60"
                      className="w-full bg-black/30 border border-white/10 rounded-xl text-gray-300 placeholder-gray-600 text-sm px-3 py-2.5 outline-none focus:border-[#5B4FFF]/50 transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Observações do treino</label>
                  <textarea value={observations} onChange={e => setObservations(e.target.value)}
                    placeholder="Notas sobre o treino, foco da sessão..."
                    className="w-full bg-black/30 border border-white/10 rounded-xl text-gray-300 placeholder-gray-600 text-sm px-4 py-2.5 outline-none focus:border-[#5B4FFF]/50 transition-colors resize-none" rows={2} />
                </div>
              </div>

              {/* Stats rápidos */}
              {exercises.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Exercícios', value: exercises.length },
                    { label: 'Volume total', value: `${totalVolume.toFixed(0)} kg` },
                    { label: 'Séries tot.', value: exercises.reduce((a, e) => a + (parseInt(e.sets) || 0), 0) },
                  ].map(s => (
                    <div key={s.label} className="bg-black/20 border border-white/5 rounded-xl px-3 py-2.5 text-center">
                      <p className="text-[#5B4FFF] font-bold text-base">{s.value}</p>
                      <p className="text-gray-600 text-xs mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Exercícios */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-300">
                    Exercícios <span className="text-gray-600 font-normal">({exercises.length})</span>
                  </p>
                  <button onClick={() => setShowLibrary(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5B4FFF]/15 hover:bg-[#5B4FFF]/25 border border-[#5B4FFF]/30 text-[#5B4FFF] rounded-lg text-xs font-medium transition-all">
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>

                {exercises.length === 0 ? (
                  <div className="border border-dashed border-white/15 rounded-xl py-8 text-center">
                    <Dumbbell className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">Nenhum exercício ainda</p>
                    <p className="text-gray-700 text-xs mt-1">Clique em "Adicionar" para começar</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {exercises.map((ex, i) => (
                      <ExerciseCard key={i} exercise={ex} index={i}
                        onChange={handleExerciseChange}
                        onDelete={handleDeleteExercise} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {isRestDay && (
            <div className="border border-dashed border-white/10 rounded-xl py-10 text-center">
              <Moon className="w-10 h-10 text-indigo-400/40 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Dia de descanso configurado</p>
              <p className="text-gray-700 text-xs mt-1">Recuperação é parte do treino!</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-white/10 flex gap-3 shrink-0">
          <button onClick={onClose}
            className="flex-1 h-11 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-semibold rounded-xl text-sm transition-all">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 h-11 bg-[#5B4FFF] hover:bg-[#5B4FFF]/85 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            style={{ fontFamily: 'Syne, sans-serif' }}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Salvando...' : 'Salvar Treino'}
          </button>
        </div>
      </div>

      {/* Library modal */}
      <ExerciseLibraryModal
        open={showLibrary}
        onClose={() => setShowLibrary(false)}
        onSelect={handleAddExercise}
        customExercises={customExercises}
      />
    </>
  );
};

export default DayEditor;