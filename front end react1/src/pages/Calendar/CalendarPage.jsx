import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Calendar, Flame, Clock, BarChart2,
  Dumbbell, Plus, X, Trash2, Edit3,
  CheckCircle2, ChevronDown, Search,
} from 'lucide-react';
import {
  getCalendarSessions,
  saveCalendarSession,
  updateCalendarSession,
  deleteCalendarSession,
  sessionsToMap,
  totalSecForDate,
} from '../../services/api-calendar';
import { getRoutines } from '../../services/api-routines';
import { CATALOG, ALL_EXERCISES } from '../../utils/exerciseCatalog';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const WEEKDAY_LABELS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const MONTH_NAMES    = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

const fmtSec = (s) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  if (m > 0) return `${m}min`;
  return `${s}s`;
};

const generateDays = (months = 6) => {
  const days  = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setMonth(start.getMonth() - months);
  let cur = new Date(start);
  while (cur <= today) {
    days.push(new Date(cur).toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return days;
};

const INTENSITY = [
  'bg-gray-800 border-gray-700/50',
  'bg-indigo-900/60 border-indigo-700/40',
  'bg-indigo-700/70 border-indigo-500/50',
  'bg-indigo-600   border-indigo-400/60',
  'bg-indigo-400   border-indigo-300/80',
];

const intensityFor = (sec) => {
  if (!sec) return 0;
  if (sec < 20 * 60) return 1;
  if (sec < 40 * 60) return 2;
  if (sec < 60 * 60) return 3;
  return 4;
};

// ─── ExercisePicker (autocomplete compartilhado) ──────────────────────────────
const ExercisePicker = ({ value, onChange, placeholder }) => {
  const [query, setQuery] = useState(value || '');
  const [open,  setOpen]  = useState(false);
  const ref = useRef(null);

  useEffect(() => { setQuery(value || ''); }, [value]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = query.trim()
    ? ALL_EXERCISES.filter(e => e.name.toLowerCase().includes(query.toLowerCase()))
    : ALL_EXERCISES;

  return (
    <div ref={ref} className="relative w-full">
      <div className="flex items-center bg-[#252525] rounded-xl border border-gray-700 focus-within:border-indigo-500 transition-colors">
        <Search className="w-4 h-4 text-gray-500 ml-3 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder || 'Buscar na biblioteca de exercícios…'}
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
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-2xl max-h-52 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-gray-500 text-xs px-3 py-2">Nenhum exercício encontrado.</p>
          ) : (
            Object.entries(CATALOG).map(([group, exercises]) => {
              const list = exercises.filter(n => n.toLowerCase().includes(query.toLowerCase()));
              if (!list.length) return null;
              return (
                <div key={group}>
                  <p className="text-gray-500 text-xs px-3 pt-2 pb-1 uppercase tracking-wider">{group}</p>
                  {list.map(name => (
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

// ─── Modal de criação / edição ─────────────────────────────────────────────────
/**
 * prefillDate  — string 'YYYY-MM-DD'  (só na criação)
 * prefillLabel — string               (nome pré-preenchido, ex: vindo de uma rotina)
 * editSession  — { id, label, durationSec, notes } (só na edição)
 */
const SessionModal = ({ onClose, onSaved, prefillDate, prefillLabel, editSession, routines = [] }) => {
  const isEditing = Boolean(editSession);
  const today     = new Date().toISOString().split('T')[0];

  const [date,        setDate]        = useState(prefillDate || today);
  const [label,       setLabel]       = useState(editSession?.label ?? prefillLabel ?? '');
  const [durationMin, setDurationMin] = useState(
    editSession ? Math.round(editSession.durationSec / 60) : ''
  );
  const [notes,   setNotes]   = useState(editSession?.notes || '');
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);

  // Sugere rotinas do dia para preencher o nome rapidamente
  const todayWeekday = ['domingo','segunda','terca','quarta','quinta','sexta','sabado'][new Date().getDay()];
  const todayRoutines = routines.filter(r => Array.isArray(r.week_days) && r.week_days.includes(todayWeekday));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!label.trim())                            return setError('Informe o nome do treino.');
    if (!durationMin || Number(durationMin) < 1)  return setError('Informe uma duração válida (mínimo 1 min).');

    setSaving(true);
    setError(null);
    try {
      if (isEditing) {
        await updateCalendarSession(editSession.id, {
          label:        label.trim(),
          duration_sec: Number(durationMin) * 60,
          notes:        notes.trim(),
        });
      } else {
        await saveCalendarSession({
          date,
          label:        label.trim(),
          duration_sec: Number(durationMin) * 60,
          notes:        notes.trim(),
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#1c1c1c] border border-gray-700/60 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-gray-100 font-bold text-base flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-indigo-400" />
            {isEditing ? 'Editar treino' : 'Registrar treino'}
          </h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="px-5 py-4 flex flex-col gap-4">
          {/* Data — só na criação */}
          {!isEditing && (
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Data</label>
              <input
                type="date"
                value={date}
                max={today}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#252525] border border-gray-700 rounded-xl px-4 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          )}

          {/* Nome — com autocomplete da biblioteca + atalhos de rotina */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">
              Nome do treino
            </label>

            {/* Atalhos: rotinas do dia */}
            {!isEditing && todayRoutines.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {todayRoutines.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setLabel(r.name)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      label === r.name
                        ? 'bg-indigo-600/30 border-indigo-500/60 text-indigo-300'
                        : 'bg-black/20 border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            )}

            <ExercisePicker
              value={label}
              onChange={setLabel}
              placeholder="Nome do treino ou buscar exercício…"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">
              Duração (minutos)
            </label>
            <input
              type="number"
              min={1}
              max={600}
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              placeholder="ex: 60"
              className="w-full bg-[#252525] border border-gray-700 rounded-xl px-4 py-2.5 text-gray-200 text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

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

          {error && (
            <p className="text-red-400 text-xs bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 text-sm hover:border-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              {saving ? 'Salvando…' : isEditing ? 'Salvar' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── CalendarPage ─────────────────────────────────────────────────────────────
const CalendarPage = () => {
  const [calendarData, setCalendarData] = useState({}); // { date: [session, ...] }
  const [routines,     setRoutines]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [apiError,     setApiError]     = useState(null);
  const [selectedDay,  setSelectedDay]  = useState(null);
  const [tooltip,      setTooltip]      = useState(null);
  const [modal,        setModal]        = useState(null); // { mode:'create'|'edit', date?, session? }
  const [deletingId,   setDeletingId]   = useState(null);
  const [showAll,      setShowAll]      = useState(false);

  const heatmapRef = useRef(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const [sessions, routinesData] = await Promise.all([
        getCalendarSessions(),
        getRoutines().catch(() => []),
      ]);
      setCalendarData(sessionsToMap(sessions));
      setRoutines(routinesData);
    } catch (err) {
      setApiError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Heatmap ──────────────────────────────────────────────────────────────────
  const days  = generateDays(6);
  const today = new Date().toISOString().split('T')[0];

  const buildWeeks = () => {
    const firstDow = new Date(days[0]).getDay();
    const padded   = Array(firstDow).fill(null).concat(days);
    const weeks    = [];
    for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));
    return weeks;
  };
  const weeks = buildWeeks();

  const monthLabels = [];
  weeks.forEach((week, wi) => {
    const first = week.find(Boolean);
    if (first) {
      const m    = new Date(first).getMonth();
      const prev = wi > 0 ? weeks[wi - 1].find(Boolean) : null;
      if (!prev || new Date(prev).getMonth() !== m)
        monthLabels.push({ wi, label: MONTH_NAMES[m] });
    }
  });

  // ── Estatísticas ─────────────────────────────────────────────────────────────
  const trainedDays = Object.keys(calendarData).sort((a, b) => b.localeCompare(a));
  const totalDays   = trainedDays.length;
  const totalSec    = trainedDays.reduce((acc, d) => acc + totalSecForDate(calendarData[d]), 0);
  const totalHours  = Math.floor(totalSec / 3600);
  const totalRemMin = Math.floor((totalSec % 3600) / 60);
  const avgMin      = totalDays ? Math.round(totalSec / 60 / totalDays) : 0;

  const calcStreak = () => {
    let streak = 0;
    const cur  = new Date();
    cur.setHours(0, 0, 0, 0);
    if (!calendarData[today]) cur.setDate(cur.getDate() - 1);
    while (true) {
      const key = cur.toISOString().split('T')[0];
      if (calendarData[key]?.length) { streak++; cur.setDate(cur.getDate() - 1); }
      else break;
    }
    return streak;
  };
  const streak = calcStreak();

  // ── Tooltip ──────────────────────────────────────────────────────────────────
  const handleCellEnter = (e, dateStr) => {
    const rect     = e.currentTarget.getBoundingClientRect();
    const heatRect = heatmapRef.current?.getBoundingClientRect();
    setTooltip({
      dateStr,
      sessions: calendarData[dateStr] || [],
      x: rect.left - (heatRect?.left || 0) + rect.width / 2,
      y: rect.top  - (heatRect?.top  || 0),
    });
  };

  // ── Ações ────────────────────────────────────────────────────────────────────
  const handleDelete = async (id, dateStr) => {
    if (!window.confirm('Remover este treino do calendário?')) return;
    setDeletingId(id);
    try {
      await deleteCalendarSession(id);
      await loadData();
      // Mantém dia selecionado se ainda tiver sessões após deletar
    } catch (err) {
      alert('Erro ao remover: ' + (err.response?.data?.error || err.message));
    } finally {
      setDeletingId(null);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  const visibleDays = showAll ? trainedDays : trainedDays.slice(0, 8);

  return (
    <div className="w-full min-h-screen bg-[#171717] lg:py-16 md:py-14 sm:py-12 py-10 lg:px-24 md:px-16 sm:px-6 px-4">

      {modal && (
        <SessionModal
          onClose={() => setModal(null)}
          onSaved={loadData}
          routines={routines}
          prefillDate={modal.mode === 'create' ? (modal.date || today) : undefined}
          prefillLabel={modal.prefillLabel}
          editSession={modal.mode === 'edit' ? modal.session : undefined}
        />
      )}

      {/* Cabeçalho */}
      <div className="w-full flex justify-between items-center mb-8">
        <h1 className="lg:text-2xl md:text-xl text-lg font-semibold text-gray-200 flex items-center gap-x-2 bg-black/20 rounded-md py-2 px-4">
          <Calendar className="w-5 h-5 text-indigo-500" />
          Calendário de Treinos
        </h1>
        <button
          onClick={() => setModal({ mode: 'create', date: today })}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 text-sm hover:bg-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Registrar manualmente</span>
          <span className="sm:hidden">Registrar</span>
        </button>
      </div>

      {apiError && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-800/40 rounded-2xl text-red-400 text-sm">
          Erro ao carregar dados: {apiError}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* ── Banner do dia ───────────────────────────────────────────────── */}
          {calendarData[today]?.length ? (
            <div className="mb-6 bg-indigo-600/10 border border-indigo-500/30 rounded-2xl px-5 py-4">
              <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-indigo-300 font-semibold text-sm">
                      {calendarData[today].length === 1
                        ? 'Treino de hoje concluído! 🔥'
                        : `${calendarData[today].length} treinos hoje! 🔥`}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Total: {fmtSec(totalSecForDate(calendarData[today]))}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModal({ mode: 'create', date: today })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 text-xs hover:bg-indigo-600/30 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar treino
                </button>
              </div>

              {/* Lista compacta das sessões de hoje */}
              <div className="flex flex-col gap-2">
                {calendarData[today].map((s) => (
                  <div key={s.id} className="flex items-center justify-between bg-black/20 rounded-xl px-4 py-2.5">
                    <div>
                      <p className="text-sm font-semibold text-gray-200">{s.label}</p>
                      <p className="text-xs text-gray-500">{fmtSec(s.durationSec)}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setModal({ mode: 'edit', session: { ...s, date: today } })}
                        className="p-1.5 rounded-lg text-gray-600 hover:text-indigo-400 hover:bg-indigo-600/10 transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id, today)}
                        disabled={deletingId === s.id}
                        className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-600/10 transition-all disabled:opacity-40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-6 bg-gray-800/40 border border-gray-700/50 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-700/30 border border-gray-700 flex items-center justify-center shrink-0">
                  <Dumbbell className="w-5 h-5 text-gray-500 -rotate-45" />
                </div>
                <div>
                  <p className="text-gray-300 font-semibold text-sm">Sem treino registrado hoje</p>
                  <p className="text-gray-500 text-xs mt-0.5">Use o cronômetro ou registre manualmente.</p>
                </div>
              </div>
              <button
                onClick={() => setModal({ mode: 'create', date: today })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 text-xs hover:bg-indigo-600/30 transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Registrar hoje
              </button>
            </div>
          )}

          {/* ── Stats ───────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { icon: <Flame    className="w-5 h-5 text-orange-400" />,            label: 'Streak atual',     value: `${streak} dia${streak !== 1 ? 's' : ''}` },
              { icon: <Dumbbell className="w-5 h-5 text-indigo-400 -rotate-45" />, label: 'Dias treinados',   value: totalDays },
              { icon: <Clock    className="w-5 h-5 text-emerald-400" />,           label: 'Horas treinadas',  value: `${totalHours}h ${totalRemMin}min` },
              { icon: <BarChart2 className="w-5 h-5 text-violet-400" />,           label: 'Média por dia',    value: `${avgMin}min` },
            ].map(({ icon, label, value }) => (
              <div key={label} className="bg-[#1d1d1d] border border-gray-800 rounded-2xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  {icon}
                  <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
                </div>
                <p className="text-2xl font-bold text-gray-100 tabular-nums">{value}</p>
              </div>
            ))}
          </div>

          {/* ── Heatmap ─────────────────────────────────────────────────────── */}
          <div className="bg-[#1d1d1d] border border-gray-800 rounded-2xl p-5 mb-6 overflow-x-auto">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Últimos 6 meses</h2>

            <div ref={heatmapRef} className="relative">
              {/* Tooltip */}
              {tooltip?.sessions?.length > 0 && (
                <div
                  className="absolute z-50 bg-[#252525] border border-gray-700 rounded-xl px-3 py-2.5 shadow-2xl pointer-events-none whitespace-nowrap -translate-x-1/2 -translate-y-full"
                  style={{ left: tooltip.x, top: tooltip.y - 8 }}
                >
                  <p className="text-xs font-semibold text-indigo-300 mb-1">
                    {new Date(tooltip.dateStr + 'T12:00:00').toLocaleDateString('pt-BR', {
                      weekday: 'short', day: 'numeric', month: 'short',
                    })}
                  </p>
                  {tooltip.sessions.map(s => (
                    <div key={s.id} className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-100">{s.label}</span>
                      <span className="text-xs text-gray-400">{fmtSec(s.durationSec)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Rótulos de mês */}
              <div className="flex mb-1 pl-8" style={{ gap: '2px' }}>
                {weeks.map((_, wi) => {
                  const ml = monthLabels.find(m => m.wi === wi);
                  return (
                    <div key={wi} className="shrink-0" style={{ width: 14 }}>
                      {ml && <span className="text-xs text-gray-600 whitespace-nowrap">{ml.label}</span>}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-1">
                {/* Labels dia da semana */}
                <div className="flex flex-col gap-0.5 mr-1 shrink-0">
                  {WEEKDAY_LABELS.map((d, i) => (
                    <div key={d} className="text-xs text-gray-700 flex items-center" style={{ height: 14 }}>
                      {i % 2 === 1 ? d : ''}
                    </div>
                  ))}
                </div>

                {/* Células */}
                <div className="flex gap-0.5">
                  {weeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-0.5">
                      {week.map((dateStr, di) => {
                        const sec        = dateStr ? totalSecForDate(calendarData[dateStr] || []) : 0;
                        const intensity  = dateStr ? intensityFor(sec) : -1;
                        const isToday    = dateStr === today;
                        const isSelected = dateStr === selectedDay;
                        return (
                          <div
                            key={di}
                            style={{ width: 14, height: 14 }}
                            className={`rounded-sm border transition-all duration-150 cursor-pointer hover:scale-125 ${
                              !dateStr ? 'opacity-0 pointer-events-none' : INTENSITY[intensity]
                            } ${isToday    ? 'ring-1 ring-indigo-400 ring-offset-1 ring-offset-[#1d1d1d]' : ''}
                              ${isSelected ? 'ring-2 ring-white/50' : ''}`}
                            onMouseEnter={(e) => { if (dateStr) handleCellEnter(e, dateStr); }}
                            onMouseLeave={() => setTooltip(null)}
                            onClick={() => dateStr && setSelectedDay(dateStr === selectedDay ? null : dateStr)}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legenda */}
              <div className="flex items-center gap-1.5 mt-4 justify-end">
                <span className="text-xs text-gray-600">Menos</span>
                {INTENSITY.map((c, i) => (
                  <div key={i} className={`w-3.5 h-3.5 rounded-sm border ${c}`} />
                ))}
                <span className="text-xs text-gray-600">Mais</span>
              </div>
            </div>
          </div>

          {/* ── Painel do dia selecionado ────────────────────────────────────── */}
          {selectedDay && (
            <div className="bg-[#1d1d1d] border border-indigo-500/30 rounded-2xl p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-indigo-300 capitalize">
                  {new Date(selectedDay + 'T12:00:00').toLocaleDateString('pt-BR', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setModal({ mode: 'create', date: selectedDay })}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 text-xs hover:bg-indigo-600/30 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                  <button onClick={() => setSelectedDay(null)} className="text-gray-600 hover:text-gray-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {calendarData[selectedDay]?.length ? (
                <div className="flex flex-col gap-2">
                  {calendarData[selectedDay].map((s) => (
                    <div key={s.id} className="flex items-center justify-between bg-black/20 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm font-bold text-gray-200">{s.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{fmtSec(s.durationSec)}</p>
                        {s.notes && <p className="text-xs text-gray-600 mt-0.5">{s.notes}</p>}
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setModal({ mode: 'edit', session: { ...s, date: selectedDay } })}
                          className="p-1.5 rounded-lg text-gray-600 hover:text-indigo-400 hover:bg-indigo-600/10 transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, selectedDay)}
                          disabled={deletingId === s.id}
                          className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-600/10 transition-all disabled:opacity-40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Nenhum treino registrado neste dia.</p>
              )}
            </div>
          )}

          {/* ── Histórico ───────────────────────────────────────────────────── */}
          <div className="bg-[#1d1d1d] border border-gray-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              Histórico
            </h2>

            {trainedDays.length === 0 ? (
              <div className="text-center py-8">
                <Dumbbell className="w-12 h-12 text-gray-700 -rotate-45 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Nenhum treino registrado ainda.</p>
                <p className="text-gray-600 text-xs mt-1">
                  Inicie um treino com o cronômetro ou registre manualmente.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  {visibleDays.map((dateStr) => {
                    const sessions   = calendarData[dateStr];
                    const isSelected = dateStr === selectedDay;
                    const isToday    = dateStr === today;
                    const secTotal   = totalSecForDate(sessions);

                    return (
                      <div
                        key={dateStr}
                        onClick={() => setSelectedDay(dateStr === selectedDay ? null : dateStr)}
                        className={`flex items-center justify-between py-2.5 px-4 rounded-xl cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-indigo-600/15 border border-indigo-500/30'
                            : 'bg-black/20 border border-transparent hover:bg-black/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
                            isToday ? 'bg-indigo-600/30 border-indigo-500/50' : 'bg-indigo-600/20 border-indigo-500/30'
                          }`}>
                            <Dumbbell className="w-4 h-4 text-indigo-400 -rotate-45" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-gray-200">
                                {sessions.length === 1
                                  ? sessions[0].label
                                  : `${sessions.length} treinos`}
                              </p>
                              {isToday && (
                                <span className="text-xs text-indigo-400 bg-indigo-600/20 border border-indigo-500/30 px-1.5 py-0.5 rounded-full">
                                  hoje
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              {new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', {
                                weekday: 'short', day: 'numeric', month: 'short',
                              })}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-indigo-400 tabular-nums">
                          {fmtSec(secTotal)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {trainedDays.length > 8 && (
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-800 text-gray-500 text-xs hover:border-gray-700 hover:text-gray-400 transition-colors"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAll ? 'rotate-180' : ''}`} />
                    {showAll ? 'Ver menos' : `Ver mais ${trainedDays.length - 8} dias`}
                  </button>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CalendarPage;
