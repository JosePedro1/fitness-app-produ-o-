import React, { useEffect, useState, useCallback } from 'react';
import { Calendar, Plus, Flame, Clock, BarChart2, Trash2 } from 'lucide-react';
import ConfirmModal from '../../components/Confirm/ConfirmModal';
import { useConfirm } from '../../hooks/useConfirm';
import {
  getCalendarSessions,
  saveCalendarSession,
  deleteCalendarSession,
  sessionsToMap,
  totalSecForDate,
} from '../../services/api-calendar';

// ── Helpers ──
const fmtDur = (sec) => {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}h ${m}min` : m > 0 ? `${m}min` : `${sec}s`;
};
const fmtDate = (dateStr) => {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
};

// ── Heatmap ──
const HeatmapGrid = ({ sessionsMap }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const days = [];
  const start = new Date(); start.setMonth(start.getMonth() - 6); start.setHours(0,0,0,0);
  let cur = new Date(start);
  const today = new Date(); today.setHours(0,0,0,0);
  while (cur <= today) { days.push(new Date(cur).toISOString().split('T')[0]); cur.setDate(cur.getDate() + 1); }

  const firstDow = new Date(days[0]).getDay();
  const padded   = [...Array(firstDow).fill(null), ...days];
  const weeks    = [];
  for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));

  const getLevel = (d) => {
    if (!d || !sessionsMap[d]) return 0;
    const sec = totalSecForDate(sessionsMap[d]);
    if (sec < 20 * 60) return 1;
    if (sec < 40 * 60) return 2;
    if (sec < 60 * 60) return 3;
    return 4;
  };

  const colors = ['bg-gray-800','bg-indigo-900','bg-indigo-700','bg-indigo-500','bg-indigo-400'];

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-1 min-w-max">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((d, di) => {
              if (!d) return <div key={di} className="w-3.5 h-3.5" />;
              const lvl = getLevel(d);
              const isToday = d === todayStr;
              const sec  = sessionsMap[d] ? totalSecForDate(sessionsMap[d]) : 0;
              return (
                <div
                  key={d}
                  title={`${d}${sec ? ': ' + fmtDur(sec) : ': Sem treino'}`}
                  className={`w-3.5 h-3.5 rounded-[3px] cursor-pointer transition-transform hover:scale-125 ${colors[lvl]} ${isToday ? 'ring-1 ring-indigo-400 ring-offset-1 ring-offset-[#1c1c1c]' : ''}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Modal de sessão manual ──
const SessionModal = ({ onClose, onSaved }) => {
  const [date,  setDate]  = useState(new Date().toISOString().split('T')[0]);
  const [label, setLabel] = useState('');
  const [min,   setMin]   = useState('60');
  const [saving,setSaving]= useState(false);

  const handleSave = async () => {
    if (!date || !label.trim() || !min) return;
    setSaving(true);
    try {
      await saveCalendarSession({ date, label: label.trim(), duration_sec: parseInt(min) * 60, notes: '' });
      onSaved();
    } catch { /* erro silencioso */ }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[#1c1c1c] border border-gray-700/60 rounded-2xl shadow-2xl p-6">
        <h3 className="text-base font-bold text-gray-100 mb-4">Registrar treino</h3>
        <div className="flex flex-col gap-3 mb-5">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Data</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full h-10 bg-[#252525] border border-gray-700 rounded-xl px-4 text-gray-200 text-sm outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Nome do treino</label>
            <input type="text" value={label} onChange={e => setLabel(e.target.value)} placeholder="Ex: Treino A — Peito"
              className="w-full h-10 bg-[#252525] border border-gray-700 rounded-xl px-4 text-gray-200 text-sm outline-none focus:border-indigo-500 placeholder-gray-600" />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Duração (minutos)</label>
            <input type="number" value={min} onChange={e => setMin(e.target.value)} min="1" placeholder="60"
              className="w-full h-10 bg-[#252525] border border-gray-700 rounded-xl px-4 text-gray-200 text-sm outline-none focus:border-indigo-500" />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-700 text-gray-400 text-sm rounded-xl hover:border-gray-600 transition-colors">Cancelar</button>
          <button onClick={handleSave} disabled={saving || !label.trim() || !date}
            className="flex-1 py-2.5 bg-[#5B4FFF] hover:bg-[#7B6FFF] text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-colors">
            {saving ? 'Salvando…' : 'Registrar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Page principal ──
const CalendarPage = () => {
  const [sessionsMap, setSessMap] = useState({});
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast]         = useState(null);
  const { confirm, confirmProps } = useConfirm();

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const sessions = await getCalendarSessions();
      setSessMap(sessionsToMap(sessions));
    } catch { showToast('Erro ao carregar calendário', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Estatísticas ──
  const allDays   = Object.keys(sessionsMap);
  const totalSec  = allDays.reduce((a, d) => a + totalSecForDate(sessionsMap[d]), 0);
  const avgMin    = allDays.length ? Math.round(totalSec / 60 / allDays.length) : 0;

  let streak = 0;
  const todayStr = new Date().toISOString().split('T')[0];
  let curD = new Date(); curD.setHours(0,0,0,0);
  if (!sessionsMap[todayStr]) curD.setDate(curD.getDate() - 1);
  while (true) {
    const k = curD.toISOString().split('T')[0];
    if (sessionsMap[k]?.length) { streak++; curD.setDate(curD.getDate() - 1); } else break;
  }

  const handleDeleteSession = async (id, date) => {
    const ok = await confirm({
      title: 'Remover treino',
      message: `Remover o treino registrado em ${date}?`,
      confirmLabel: 'Remover',
    });
    if (!ok) return;
    try { await deleteCalendarSession(id); showToast('Treino removido'); loadData(); }
    catch { showToast('Erro ao remover', 'error'); }
  };

  const sortedDays = [...allDays].sort((a, b) => b.localeCompare(a));

  return (
    <div className="w-full min-h-screen bg-[#171717] lg:px-24 md:px-16 sm:px-6 px-4 py-8">
      <ConfirmModal {...confirmProps} />
      {showModal && (
        <SessionModal
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); loadData(); showToast('Treino registrado! 💪'); }}
        />
      )}

      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-[#5B4FFF]'
        }`}>{toast.msg}</div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif' }}>
          <Calendar className="w-6 h-6 text-[#5B4FFF]" /> Calendário de Treinos
        </h1>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#5B4FFF] hover:bg-[#7B6FFF] text-white text-sm font-semibold rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Registrar treino
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-[#1c1c1c] rounded-xl animate-pulse border border-white/5" />)}
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { icon: <Flame className="w-4 h-4" />, val: `${streak}d`, label: 'Streak' },
              { icon: <Calendar className="w-4 h-4" />, val: allDays.length, label: 'Dias treinados' },
              { icon: <Clock className="w-4 h-4" />, val: Math.floor(totalSec/3600)+'h', label: 'Horas totais' },
              { icon: <BarChart2 className="w-4 h-4" />, val: avgMin+'min', label: 'Média/dia' },
            ].map(({ icon, val, label }) => (
              <div key={label} className="bg-[#1c1c1c] border border-white/5 rounded-xl p-4 text-center">
                <div className="text-indigo-400 flex justify-center mb-1">{icon}</div>
                <div className="text-2xl font-black text-indigo-300" style={{ fontFamily: 'Syne, sans-serif' }}>{val}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Heatmap */}
          <div className="bg-[#1c1c1c] border border-white/5 rounded-2xl p-5 mb-5">
            <p className="text-sm font-medium text-gray-400 mb-4">Últimos 6 meses</p>
            <HeatmapGrid sessionsMap={sessionsMap} />
            <div className="flex items-center gap-2 mt-4 justify-end">
              <span className="text-xs text-gray-600">Menos</span>
              {['bg-gray-800','bg-indigo-900','bg-indigo-700','bg-indigo-500','bg-indigo-400'].map((c,i) => (
                <div key={i} className={`w-3 h-3 rounded-[2px] ${c}`} />
              ))}
              <span className="text-xs text-gray-600">Mais</span>
            </div>
          </div>

          {/* Histórico */}
          <div className="bg-[#1c1c1c] border border-white/5 rounded-2xl p-5">
            <p className="text-sm font-medium text-gray-400 mb-4">Histórico</p>
            {sortedDays.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 text-sm">Nenhum treino registrado ainda.</p>
                <p className="text-gray-600 text-xs mt-1">Use o cronômetro de treino ou registre manualmente.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {sortedDays.slice(0, 30).map(date => {
                  const sessions  = sessionsMap[date];
                  const totalDur  = totalSecForDate(sessions);
                  const mainLabel = sessions.length === 1 ? sessions[0].label : `${sessions.length} treinos`;
                  return (
                    <div key={date} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#252525] hover:bg-[#2a2a2a] transition-colors">
                      <div>
                        <p className="text-sm font-medium text-gray-200">{mainLabel}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{fmtDate(date)}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-bold text-indigo-300 tabular-nums">{fmtDur(totalDur)}</span>
                        <button
                          onClick={() => handleDeleteSession(sessions[0].id, date)}
                          className="text-gray-600 hover:text-red-400 transition-colors p-1"
                          title="Remover"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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