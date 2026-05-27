import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Calendar, Flame, Clock, TrendingUp,
  Dumbbell, Plus, X, Trash2, Edit3, ChevronDown,
  CheckCircle2, BarChart2,
} from 'lucide-react';
import {
  getCalendarSessions,
  saveCalendarSession,
  updateCalendarSession,
  deleteCalendarSession,
  sessionsToMap,
} from '../../services/api-calendar';

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

const WEEKDAY_LABELS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const MONTH_NAMES    = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

const fmtSec = (s) => {
  const h   = Math.floor(s / 3600);
  const m   = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}min`;
  if (m > 0) return `${m}min${sec > 0 ? ` ${sec}s` : ''}`;
  return `${sec}s`;
};

const INTENSITY_COLORS = [
  'bg-gray-800 border-gray-700/50',
  'bg-indigo-900/60 border-indigo-700/40',
  'bg-indigo-700/70 border-indigo-500/50',
  'bg-indigo-600   border-indigo-400/60',
  'bg-indigo-400   border-indigo-300/80',
];

// ─── Modal de criação / edição ─────────────────────────────────────────────────
/**
 * Props:
 *   onClose()      — fecha o modal
 *   onSaved()      — recarrega os dados
 *   prefillDate    — string 'YYYY-MM-DD' para pré-preencher a data (criação)
 *   editSession    — objeto { id, label, durationSec, notes } para edição
 */
const SessionModal = ({ onClose, onSaved, prefillDate, editSession }) => {
  const isEditing = Boolean(editSession);
  const today     = new Date().toISOString().split('T')[0];

  const [date,       setDate]       = useState(prefillDate || today);
  const [label,      setLabel]      = useState(editSession?.label      || '');
  const [durationMin,setDurationMin]= useState(
    editSession ? Math.round(editSession.durationSec / 60) : ''
  );
  const [notes,      setNotes]      = useState(editSession?.notes || '');
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!label.trim())                           return setError('Informe o nome do treino.');
    if (!durationMin || Number(durationMin) < 1) return setError('Informe uma duração válida (mínimo 1 min).');

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

        {/* Form */}
        <form onSubmit={handleSave} className="px-5 py-4 flex flex-col gap-4">
          {/* Data — só aparece na criação */}
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

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Nome do treino</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="ex: Peito e Tríceps, Leg Day…"
              maxLength={60}
              className="w-full bg-[#252525] border border-gray-700 rounded-xl px-4 py-2.5 text-gray-200 text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
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
              Observações&nbsp;<span className="text-gray-700 normal-case">(opcional)</span>
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
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvando…
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {isEditing ? 'Salvar alterações' : 'Registrar treino'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── CalendarPage ─────────────────────────────────────────────────────────────
const CalendarPage = () => {
  const [calendarData, setCalendarData] = useState({});
  const [loading,      setLoading]      = useState(true);
  const [apiError,     setApiError]     = useState(null);
  const [tooltip,      setTooltip]      = useState(null); // { dateStr, data, x, y }
  const [selectedDay,  setSelectedDay]  = useState(null);
  const [modal,        setModal]        = useState(null); // null | { mode: 'create'|'edit', date?, session? }
  const [deletingId,   setDeletingId]   = useState(null);
  const [showAllRecent,setShowAllRecent]= useState(false);

  const heatmapRef = useRef(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const sessions = await getCalendarSessions();
      setCalendarData(sessionsToMap(sessions));
    } catch (err) {
      setApiError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Heatmap ─────────────────────────────────────────────────────────────────
  const days  = generateDays(6);
  const today = new Date().toISOString().split('T')[0];

  const buildWeeks = () => {
    if (!days.length) return [];
    const firstDow = new Date(days[0]).getDay();
    const padded   = Array(firstDow).fill(null).concat(days);
    const weeks    = [];
    for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));
    return weeks;
  };
  const weeks = buildWeeks();

  const getIntensity = (dateStr) => {
    if (!dateStr || !calendarData[dateStr]) return 0;
    const sec = calendarData[dateStr].durationSec || 0;
    if (sec < 20 * 60) return 1;
    if (sec < 40 * 60) return 2;
    if (sec < 60 * 60) return 3;
    return 4;
  };

  const monthLabels = [];
  weeks.forEach((week, wi) => {
    const firstValid = week.find(Boolean);
    if (firstValid) {
      const m        = new Date(firstValid).getMonth();
      const prevValid = wi > 0 ? weeks[wi - 1].find(Boolean) : null;
      if (!prevValid || new Date(prevValid).getMonth() !== m) {
        monthLabels.push({ wi, label: MONTH_NAMES[m] });
      }
    }
  });

  // ── Estatísticas ─────────────────────────────────────────────────────────────
  const trainedDays = Object.keys(calendarData).sort((a, b) => b.localeCompare(a));
  const totalDays   = trainedDays.length;
  const totalSec    = trainedDays.reduce((acc, d) => acc + (calendarData[d]?.durationSec || 0), 0);
  const totalHours  = Math.floor(totalSec / 3600);
  const totalRemMin = Math.floor((totalSec % 3600) / 60);
  const avgMin      = totalDays ? Math.round(totalSec / 60 / totalDays) : 0;

  // Streak: conta dias consecutivos com treino até ontem ou hoje
  const calcStreak = () => {
    let streak = 0;
    const cur  = new Date();
    cur.setHours(0, 0, 0, 0);
    // Se treinou hoje, começa de hoje; senão começa de ontem
    if (!calendarData[today]) cur.setDate(cur.getDate() - 1);
    while (true) {
      const key = cur.toISOString().split('T')[0];
      if (calendarData[key]) { streak++; cur.setDate(cur.getDate() - 1); }
      else break;
    }
    return streak;
  };
  const streak = calcStreak();

  // ── Tooltip via mouse ────────────────────────────────────────────────────────
  const handleCellEnter = (e, dateStr) => {
    const rect      = e.currentTarget.getBoundingClientRect();
    const heatRect  = heatmapRef.current?.getBoundingClientRect();
    setTooltip({
      dateStr,
      data: calendarData[dateStr],
      // posição relativa ao container do heatmap
      x: rect.left - (heatRect?.left || 0) + rect.width / 2,
      y: rect.top  - (heatRect?.top  || 0),
    });
  };

  // ── Ações ────────────────────────────────────────────────────────────────────
  const openCreate = (prefillDate) =>
    setModal({ mode: 'create', date: prefillDate });

  const openEdit = (dateStr) => {
    const session = calendarData[dateStr];
    if (!session) return;
    setModal({ mode: 'edit', session: { ...session, date: dateStr } });
  };

  const handleDelete = async (id, dateStr) => {
    if (!window.confirm('Remover este treino do calendário?')) return;
    setDeletingId(id);
    try {
      await deleteCalendarSession(id);
      await loadData();
      if (selectedDay === dateStr) setSelectedDay(null);
    } catch (err) {
      alert('Erro ao remover: ' + (err.response?.data?.error || err.message));
    } finally {
      setDeletingId(null);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  const recentVisible = showAllRecent ? trainedDays : trainedDays.slice(0, 8);

  return (
    <div className="w-full min-h-screen bg-[#171717] lg:py-16 md:py-14 sm:py-12 py-10 lg:px-24 md:px-16 sm:px-6 px-4">

      {/* Modal */}
      {modal && (
        <SessionModal
          onClose={() => setModal(null)}
          onSaved={loadData}
          prefillDate={modal.mode === 'create' ? (modal.date || undefined) : undefined}
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
          onClick={() => openCreate(today)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 text-sm hover:bg-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Registrar manualmente</span>
          <span className="sm:hidden">Registrar</span>
        </button>
      </div>

      {/* Erro de API */}
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
          {/* ── Destaque do treino de hoje ─────────────────────────────────── */}
          {calendarData[today] ? (
            <div className="mb-6 bg-indigo-600/10 border border-indigo-500/30 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-indigo-300 font-semibold text-sm">Treino de hoje concluído! 🔥</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {calendarData[today].label}
                    <span className="text-gray-600 mx-1.5">·</span>
                    {fmtSec(calendarData[today].durationSec)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(today)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 text-xs hover:bg-indigo-600/30 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Editar
                </button>
                <button
                  onClick={() => handleDelete(calendarData[today].id, today)}
                  disabled={deletingId === calendarData[today].id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/10 border border-red-500/30 text-red-400 text-xs hover:bg-red-600/20 transition-all disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {deletingId === calendarData[today].id ? 'Removendo…' : 'Remover'}
                </button>
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
                  <p className="text-gray-500 text-xs mt-0.5">Use o cronômetro flutuante ou registre manualmente.</p>
                </div>
              </div>
              <button
                onClick={() => openCreate(today)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 text-xs hover:bg-indigo-600/30 transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Registrar hoje
              </button>
            </div>
          )}

          {/* ── Stats Cards ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { icon: <Flame     className="w-5 h-5 text-orange-400" />,            label: 'Streak atual',     value: `${streak} dia${streak !== 1 ? 's' : ''}` },
              { icon: <Dumbbell  className="w-5 h-5 text-indigo-400 -rotate-45" />, label: 'Treinos totais',   value: totalDays },
              { icon: <Clock     className="w-5 h-5 text-emerald-400" />,           label: 'Horas treinadas',  value: `${totalHours}h ${totalRemMin}min` },
              { icon: <BarChart2 className="w-5 h-5 text-violet-400" />,            label: 'Média por treino', value: `${avgMin}min` },
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

          {/* ── Heatmap ───────────────────────────────────────────────────── */}
          <div className="bg-[#1d1d1d] border border-gray-800 rounded-2xl p-5 mb-6 overflow-x-auto">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Últimos 6 meses
            </h2>

            {/* Tooltip posicionado relativamente ao heatmap */}
            <div ref={heatmapRef} className="relative">
              {tooltip?.data && (
                <div
                  className="absolute z-50 bg-[#252525] border border-gray-700 rounded-xl px-3 py-2.5 shadow-2xl pointer-events-none whitespace-nowrap -translate-x-1/2 -translate-y-full"
                  style={{ left: tooltip.x, top: tooltip.y - 8 }}
                >
                  <p className="text-xs font-semibold text-indigo-300 mb-0.5">
                    {new Date(tooltip.dateStr + 'T12:00:00').toLocaleDateString('pt-BR', {
                      weekday: 'short', day: 'numeric', month: 'short',
                    })}
                  </p>
                  <p className="text-sm font-bold text-gray-100">{tooltip.data.label}</p>
                  <p className="text-xs text-gray-400">{fmtSec(tooltip.data.durationSec)}</p>
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
                        const intensity  = dateStr ? getIntensity(dateStr) : -1;
                        const isToday    = dateStr === today;
                        const isSelected = dateStr === selectedDay;
                        return (
                          <div
                            key={di}
                            style={{ width: 14, height: 14 }}
                            className={`rounded-sm border transition-all duration-150 cursor-pointer hover:scale-125 ${
                              !dateStr ? 'opacity-0 pointer-events-none' : INTENSITY_COLORS[intensity]
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
                {INTENSITY_COLORS.map((c, i) => (
                  <div key={i} className={`w-3.5 h-3.5 rounded-sm border ${c}`} />
                ))}
                <span className="text-xs text-gray-600">Mais</span>
              </div>
            </div>
          </div>

          {/* ── Painel do dia selecionado ──────────────────────────────────── */}
          {selectedDay && (
            <div className="bg-[#1d1d1d] border border-indigo-500/30 rounded-2xl p-5 mb-6">
              <div className="flex items-start justify-between mb-4 gap-2">
                <h3 className="text-sm font-semibold text-indigo-300 capitalize">
                  {new Date(selectedDay + 'T12:00:00').toLocaleDateString('pt-BR', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </h3>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="text-gray-600 hover:text-gray-400 text-xs transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {calendarData[selectedDay] ? (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/20 rounded-xl px-4 py-3">
                      <p className="text-xs text-gray-500 mb-1">Treino</p>
                      <p className="text-base font-bold text-gray-200 leading-tight">{calendarData[selectedDay].label}</p>
                    </div>
                    <div className="bg-black/20 rounded-xl px-4 py-3">
                      <p className="text-xs text-gray-500 mb-1">Duração</p>
                      <p className="text-base font-bold text-gray-200">{fmtSec(calendarData[selectedDay].durationSec)}</p>
                    </div>
                  </div>

                  {calendarData[selectedDay].notes && (
                    <div className="bg-black/20 rounded-xl px-4 py-3">
                      <p className="text-xs text-gray-500 mb-1">Observações</p>
                      <p className="text-sm text-gray-400">{calendarData[selectedDay].notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => openEdit(selectedDay)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 text-xs hover:bg-indigo-600/30 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(calendarData[selectedDay].id, selectedDay)}
                      disabled={deletingId === calendarData[selectedDay].id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/10 border border-red-500/30 text-red-400 text-xs hover:bg-red-600/20 transition-all disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {deletingId === calendarData[selectedDay].id ? 'Removendo…' : 'Remover'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-gray-500 text-sm">Nenhum treino registrado neste dia.</p>
                  <button
                    onClick={() => openCreate(selectedDay)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 text-xs hover:bg-indigo-600/30 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Registrar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Treinos Recentes ───────────────────────────────────────────── */}
          <div className="bg-[#1d1d1d] border border-gray-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              Treinos Recentes
            </h2>

            {trainedDays.length === 0 ? (
              <div className="text-center py-8">
                <Dumbbell className="w-12 h-12 text-gray-700 -rotate-45 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Nenhum treino registrado ainda.</p>
                <p className="text-gray-600 text-xs mt-1">
                  Inicie um treino com o cronômetro flutuante ou clique em "Registrar manualmente".
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  {recentVisible.map((dateStr) => {
                    const d          = calendarData[dateStr];
                    const isSelected = dateStr === selectedDay;
                    const isTodayRow = dateStr === today;
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
                            isTodayRow
                              ? 'bg-indigo-600/30 border-indigo-500/50'
                              : 'bg-indigo-600/20 border-indigo-500/30'
                          }`}>
                            <Dumbbell className="w-4 h-4 text-indigo-400 -rotate-45" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-gray-200">{d.label}</p>
                              {isTodayRow && (
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
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-indigo-400 tabular-nums">
                            {fmtSec(d.durationSec)}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); openEdit(dateStr); }}
                            className="text-gray-600 hover:text-indigo-400 transition-colors"
                            title="Editar"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Ver mais / menos */}
                {trainedDays.length > 8 && (
                  <button
                    onClick={() => setShowAllRecent(!showAllRecent)}
                    className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-800 text-gray-500 text-xs hover:border-gray-700 hover:text-gray-400 transition-colors"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllRecent ? 'rotate-180' : ''}`} />
                    {showAllRecent
                      ? 'Ver menos'
                      : `Ver mais ${trainedDays.length - 8} treino${trainedDays.length - 8 !== 1 ? 's' : ''}`}
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
