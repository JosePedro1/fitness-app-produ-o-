import React, { useState, useEffect } from 'react';
import { Calendar, Flame, Clock, TrendingUp, Dumbbell, ChevronLeft, ChevronRight } from 'lucide-react';

// Gera os últimos N dias a partir de hoje
const generateDays = (months = 6) => {
  const days = [];
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

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTH_NAMES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

const CalendarPage = () => {
  const [calendarData, setCalendarData] = useState({});
  const [tooltip, setTooltip] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem('gym_calendar') || '{}';
    setCalendarData(JSON.parse(raw));
  }, []);

  const days = generateDays(6);
  const today = new Date().toISOString().split('T')[0];

  // Agrupa dias por semana
  const buildWeeks = () => {
    if (!days.length) return [];
    const firstDate = new Date(days[0]);
    const firstDow = firstDate.getDay(); // 0=Dom
    const padded = Array(firstDow).fill(null).concat(days);
    const weeks = [];
    for (let i = 0; i < padded.length; i += 7) {
      weeks.push(padded.slice(i, i + 7));
    }
    return weeks;
  };

  const weeks = buildWeeks();

  // Estatísticas
  const trainedDays = Object.keys(calendarData);
  const totalDays = trainedDays.length;
  const totalMin = trainedDays.reduce((acc, d) => acc + (calendarData[d]?.durationMin || 0), 0);
  const totalHours = Math.floor(totalMin / 60);
  const avgMin = totalDays ? Math.round(totalMin / totalDays) : 0;

  // Streak
  let streak = 0;
  let cur = new Date(today);
  while (true) {
    const key = cur.toISOString().split('T')[0];
    if (calendarData[key]) { streak++; cur.setDate(cur.getDate() - 1); }
    else break;
  }

  // Meses para label no topo
  const monthLabels = [];
  weeks.forEach((week, wi) => {
    const firstValid = week.find(Boolean);
    if (firstValid) {
      const d = new Date(firstValid);
      const m = d.getMonth();
      if (wi === 0 || new Date(weeks[wi-1].find(Boolean) || firstValid).getMonth() !== m) {
        monthLabels.push({ wi, label: MONTH_NAMES[m] });
      }
    }
  });

  const getIntensity = (dateStr) => {
    if (!dateStr || !calendarData[dateStr]) return 0;
    const min = calendarData[dateStr].durationMin || 0;
    if (min < 20) return 1;
    if (min < 40) return 2;
    if (min < 60) return 3;
    return 4;
  };

  const intensityColors = [
    'bg-gray-800 border-gray-700/50',
    'bg-indigo-900/60 border-indigo-700/40',
    'bg-indigo-700/70 border-indigo-500/50',
    'bg-indigo-600 border-indigo-400/60',
    'bg-indigo-400 border-indigo-300/80',
  ];

  const fmt = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}h ${m}min`;
    return `${m}min ${sec}s`;
  };

  return (
    <div className="w-full min-h-screen bg-[#171717] lg:py-16 md:py-14 sm:py-12 py-10 lg:px-24 md:px-16 sm:px-6 px-4">

      {/* Header */}
      <div className="w-full flex justify-between items-center mb-8">
        <h1 className="lg:text-2xl md:text-xl text-lg font-semibold text-gray-200 flex items-center gap-x-2 bg-black/20 rounded-md py-2 px-4">
          <Calendar className="w-5 h-5 text-indigo-500" />
          Calendário de Treinos
        </h1>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: <Flame className="w-5 h-5 text-orange-400" />, label: 'Streak atual', value: `${streak} dias`, color: 'orange' },
          { icon: <Dumbbell className="w-5 h-5 text-indigo-400 -rotate-45" />, label: 'Treinos totais', value: totalDays, color: 'indigo' },
          { icon: <Clock className="w-5 h-5 text-emerald-400" />, label: 'Horas treinadas', value: `${totalHours}h ${totalMin % 60}min`, color: 'emerald' },
          { icon: <TrendingUp className="w-5 h-5 text-violet-400" />, label: 'Média por treino', value: `${avgMin}min`, color: 'violet' },
        ].map(({ icon, label, value, color }) => (
          <div key={label} className="bg-[#1d1d1d] border border-gray-800 rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {icon}
              <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-100 tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      {/* Contribution Graph */}
      <div className="bg-[#1d1d1d] border border-gray-800 rounded-2xl p-5 mb-6 overflow-x-auto">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Últimos 6 meses
        </h2>

        {/* Month labels */}
        <div className="flex mb-1 pl-8" style={{ gap: '2px' }}>
          {weeks.map((_, wi) => {
            const ml = monthLabels.find(m => m.wi === wi);
            return (
              <div key={wi} className="flex-shrink-0" style={{ width: 14 }}>
                {ml && <span className="text-xs text-gray-600 whitespace-nowrap">{ml.label}</span>}
              </div>
            );
          })}
        </div>

        <div className="flex gap-1">
          {/* Weekday labels */}
          <div className="flex flex-col gap-0.5 mr-1 shrink-0">
            {WEEKDAY_LABELS.map((d, i) => (
              <div key={d} className="text-xs text-gray-700 flex items-center" style={{ height: 14, lineHeight: '14px' }}>
                {i % 2 === 1 ? d : ''}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-0.5">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((dateStr, di) => {
                  const intensity = dateStr ? getIntensity(dateStr) : -1;
                  const isToday = dateStr === today;
                  const hasData = dateStr && calendarData[dateStr];

                  return (
                    <div
                      key={di}
                      className={`rounded-sm border transition-all duration-150 cursor-pointer hover:scale-125 ${
                        dateStr === null
                          ? 'opacity-0 pointer-events-none'
                          : intensity === -1
                          ? 'opacity-0 pointer-events-none'
                          : intensityColors[intensity]
                      } ${isToday ? 'ring-1 ring-indigo-400 ring-offset-1 ring-offset-[#1d1d1d]' : ''}`}
                      style={{ width: 14, height: 14 }}
                      onMouseEnter={(e) => {
                        if (dateStr) {
                          const rect = e.target.getBoundingClientRect();
                          setTooltip({
                            dateStr,
                            data: calendarData[dateStr],
                            x: rect.left,
                            y: rect.top,
                          });
                        }
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

        {/* Legenda intensidade */}
        <div className="flex items-center gap-1.5 mt-4 justify-end">
          <span className="text-xs text-gray-600">Menos</span>
          {intensityColors.map((c, i) => (
            <div key={i} className={`w-3.5 h-3.5 rounded-sm border ${c}`} />
          ))}
          <span className="text-xs text-gray-600">Mais</span>
        </div>
      </div>

      {/* Tooltip global (posição fixa no canto) */}
      {tooltip && tooltip.data && (
        <div className="fixed bottom-24 right-6 z-50 bg-[#252525] border border-gray-700 rounded-xl p-3 shadow-2xl pointer-events-none max-w-[200px]">
          <p className="text-xs font-semibold text-indigo-300 mb-1">
            {new Date(tooltip.dateStr + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
          </p>
          <p className="text-sm font-bold text-gray-100">{tooltip.data.label}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {tooltip.data.durationSec ? fmt(tooltip.data.durationSec) : `${tooltip.data.durationMin}min`}
          </p>
        </div>
      )}

      {/* Painel do dia selecionado */}
      {selectedDay && (
        <div className="bg-[#1d1d1d] border border-indigo-500/30 rounded-2xl p-5 mb-6 animate-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-indigo-300">
              {new Date(selectedDay + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </h3>
            <button onClick={() => setSelectedDay(null)} className="text-gray-600 hover:text-gray-400 text-xs">fechar</button>
          </div>
          {calendarData[selectedDay] ? (
            <div className="flex flex-wrap gap-4">
              <div>
                <p className="text-xs text-gray-500">Treino</p>
                <p className="text-lg font-bold text-gray-200">{calendarData[selectedDay].label}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Duração</p>
                <p className="text-lg font-bold text-gray-200">
                  {calendarData[selectedDay].durationSec
                    ? fmt(calendarData[selectedDay].durationSec)
                    : `${calendarData[selectedDay].durationMin}min`}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Nenhum treino registrado neste dia.</p>
          )}
        </div>
      )}

      {/* Lista dos treinos recentes */}
      <div className="bg-[#1d1d1d] border border-gray-800 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400" />
          Treinos Recentes
        </h2>
        {trainedDays.length === 0 ? (
          <div className="text-center py-8">
            <Dumbbell className="w-12 h-12 text-gray-700 -rotate-45 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Nenhum treino registrado ainda.</p>
            <p className="text-gray-600 text-xs mt-1">Inicie um treino com o cronômetro para registrar aqui!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {trainedDays.sort((a, b) => b.localeCompare(a)).slice(0, 10).map(dateStr => {
              const d = calendarData[dateStr];
              return (
                <div key={dateStr} className="flex items-center justify-between py-2.5 px-4 bg-black/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                      <Dumbbell className="w-4 h-4 text-indigo-400 -rotate-45" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-200">{d.label}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-indigo-400 tabular-nums">
                    {d.durationSec ? fmt(d.durationSec) : `${d.durationMin}min`}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;
