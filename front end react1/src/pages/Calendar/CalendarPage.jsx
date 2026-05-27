import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar, Flame, Clock, TrendingUp,
  Dumbbell, Plus, X, Trash2, Edit3,
} from 'lucide-react';
import {
  getCalendarSessions,
  saveCalendarSession,
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
  'bg-indigo-600 border-indigo-400/60',
  'bg-indigo-400 border-indigo-300/80',
];

// ─── Modal de registro manual ─────────────────────────────────────────────────
const ManualEntryModal = ({ onClose, onSaved, prefillDate }) => {
  const today = new Date().toISOString().split('T')[0];

  const [date,       setDate]       = useState(prefillDate || today);
  const [label,      setLabel]      = useState('');
  const [durationMin,setDurationMin]= useState('');
  const [notes,      setNotes]      = useState('');
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!label.trim())                          return setError('Informe o nome do treino.');
    if (!durationMin || Number(durationMin) < 1) return setError('Informe uma duração válida (mínimo 1 min).');

    setSaving(true);
    setError(null);
    try {
      await saveCalendarSession({
        date,
        label:        label.trim(),
        duration_sec: Number(durationMin) * 60,
        notes:        notes.trim(),
      });
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
            Registrar treino manualmente
          </h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="px-5 py-4 flex flex-col gap-4">
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
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {saving ? 'Salvando…' : 'Salvar treino'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── CalendarPage ─────────────────────────────────────────────────────────────
const CalendarPage = () => {
  const [calendarData,   setCalendarData]   = useState({});  // { 'YYYY-MM-DD': { id, label, durationSec, ... } }
  const [loading,        setLoading]        = useState(true);
  const [apiError,       setApiError]       = useState(null);
  const [tooltip,        setTooltip]        = useState(null);
  const [selectedDay,    setSelectedDay]    = useState(null);
  const [showModal,      setShowModal]      = useState(false);
  const [deletingId,     setDeletingId]     = useState(null);

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

  // ── Cálculos de heatmap ─────────────────────────────────────────────────────
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

  // Rótulos de mês no topo do heatmap
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

  // ── Estatísticas ────────────────────────────────────────────────────────────
  const trainedDays = Object.keys(calendarData);
  const totalDays   = trainedDays.length;
  const totalSec    = trainedDays.reduce((acc, d) => acc + (calendarData[d]?.durationSec || 0), 0);
  const totalHours  = Math.floor(totalSec / 3600);
  const totalRemMin = Math.floor((totalSec % 3600) / 60);
  const avgMin      = totalDays ? Math.round(totalSec / 60 / totalDays) : 0;

  let streak = 0;
  let strCur = new Date(today);
  while (true) {
    const key = strCur.toISOString().split('T')[0];
    if (calendarData[key]) { streak++; strCur.setDate(strCur.getDate() - 1); }
    else break;
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Remover este treino do calendário?')) return;
    setDeletingId(id);
    try {
      await deleteCalendarSession(id);
      await loadData();
      setSelectedDay(null);
    } catch (err) {
      alert('Erro ao remover: ' + (err.response?.data?.error || err.message));
    } finally {
      setDeletingId(null);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="w-full min-h-screen bg-[#171717] lg:py-16 md:py-14 sm:py-12 py-10 lg:px-24 md:px-16 sm:px-6 px-4">

      {showModal && (
        <ManualEntryModal
          onClose={() => setShowModal(false)}
          onSaved={loadData}
          prefillDate={selectedDay || undefined}
        />
      )}

      {/* Cabeçalho */}
      <div className="w-full flex justify-between items-center mb-8">
        <h1 className="lg:text-2xl md:text-xl text-lg font-semibold text-gray-200 flex items-center gap-x-2 bg-black/20 rounded-md py-2 px-4">
          <Calendar className="w-5 h-5 text-indigo-500" />
          Calendário de Treinos
        </h1>
        <button
          onClick={() => setShowModal(true)}
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
          {/* ── Stats Cards ─────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { icon: <Flame    className="w-5 h-5 text-orange-400" />,           label: 'Streak atual',     value: `${streak} dias`             },
              { icon: <Dumbbell className="w-5 h-5 text-indigo-400 -rotate-45" />, label: 'Treinos totais',   value: totalDays                    },
              { icon: <Clock    className="w-5 h-5 text-emerald-400" />,           label: 'Horas treinadas',  value: `${totalHours}h ${totalRemMin}min` },
              { icon: <TrendingUp className="w-5 h-5 text-violet-400" />,          label: 'Média por treino', value: `${avgMin}min`                },
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
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Últimos 6 meses
            </h2>

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
              {/* Labels de dia da semana */}
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
                      const intensity = dateStr ? getIntensity(dateStr) : -1;
                      const isToday   = dateStr === today;
                      const isSelected = dateStr === selectedDay;
                      return (
                        <div
                          key={di}
                          style={{ width: 14, height: 14 }}
                          className={`rounded-sm border transition-all duration-150 cursor-pointer hover:scale-125 ${
                            !dateStr ? 'opacity-0 pointer-events-none' : INTENSITY_COLORS[intensity]
                          } ${isToday    ? 'ring-1 ring-indigo-400 ring-offset-1 ring-offset-[#1d1d1d]' : ''}
                            ${isSelected ? 'ring-2 ring-white/50' : ''}`}
                          onMouseEnter={(e) => {
                            if (!dateStr) return;
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTooltip({ dateStr, data: calendarData[dateStr], rect });
                          }}
                          onMouseLeave={() => setTooltip(null)}
                          onClick={() => setSelectedDay(dateStr === selectedDay ? null : dateStr)}
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

          {/* ── Tooltip ─────────────────────────────────────────────────────── */}
          {tooltip?.data && (
            <div
              className="fixed z-50 bg-[#252525] border border-gray-700 rounded-xl p-3 shadow-2xl pointer-events-none max-w-[200px]"
              style={{ bottom: '6rem', right: '1.5rem' }}
            >
              <p className="text-xs font-semibold text-indigo-300 mb-1">
                {new Date(tooltip.dateStr + 'T12:00:00').toLocaleDateString('pt-BR', {
                  weekday: 'short', day: 'numeric', month: 'short',
                })}
              </p>
              <p className="text-sm font-bold text-gray-100">{tooltip.data.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{fmtSec(tooltip.data.durationSec)}</p>
            </div>
          )}

          {/* ── Painel do dia selecionado ────────────────────────────────────── */}
          {selectedDay && (
            <div className="bg-[#1d1d1d] border border-indigo-500/30 rounded-2xl p-5 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-indigo-300">
                  {new Date(selectedDay + 'T12:00:00').toLocaleDateString('pt-BR', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </h3>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="text-gray-600 hover:text-gray-400 text-xs transition-colors"
                >
                  fechar
                </button>
              </div>

              {calendarData[selectedDay] ? (
                <div className="flex flex-wrap items-start gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Treino</p>
                    <p className="text-lg font-bold text-gray-200">{calendarData[selectedDay].label}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Duração</p>
                    <p className="text-lg font-bold text-gray-200">{fmtSec(calendarData[selectedDay].durationSec)}</p>
                  </div>
                  {calendarData[selectedDay].notes && (
                    <div className="w-full">
                      <p className="text-xs text-gray-500">Observações</p>
                      <p className="text-sm text-gray-400 mt-0.5">{calendarData[selectedDay].notes}</p>
                    </div>
                  )}
                  <div className="flex gap-3 mt-1">
                    <button
                      onClick={() => setShowModal(true)}
                      className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(calendarData[selectedDay].id)}
                      disabled={deletingId === calendarData[selectedDay].id}
                      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-400 transition-colors disabled:opacity-50"
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
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 text-xs hover:bg-indigo-600/30 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Registrar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Lista de treinos recentes ────────────────────────────────────── */}
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
              <div className="flex flex-col gap-2">
                {[...trainedDays]
                  .sort((a, b) => b.localeCompare(a))
                  .slice(0, 10)
                  .map((dateStr) => {
                    const d = calendarData[dateStr];
                    return (
                      <div
                        key={dateStr}
                        onClick={() => setSelectedDay(dateStr === selectedDay ? null : dateStr)}
                        className="flex items-center justify-between py-2.5 px-4 bg-black/20 rounded-xl cursor-pointer hover:bg-black/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                            <Dumbbell className="w-4 h-4 text-indigo-400 -rotate-45" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-200">{d.label}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', {
                                weekday: 'short', day: 'numeric', month: 'short',
                              })}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-indigo-400 tabular-nums">
                          {fmtSec(d.durationSec)}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CalendarPage;
