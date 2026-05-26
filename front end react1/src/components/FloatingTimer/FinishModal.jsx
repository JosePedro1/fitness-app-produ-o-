import React, { useState } from 'react';
import { useTimer } from '../../context/TimerContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, X, TrendingUp, Calendar, Dumbbell, Flame, Trophy } from 'lucide-react';

const FinishModal = () => {
  const { showFinishModal, setShowFinishModal, elapsedSec, sessionLabel, sessionStartTime, fmt, resetSession } = useTimer();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState([]);

  if (!showFinishModal) return null;

  const duration = fmt(elapsedSec);
  const durationMin = Math.round(elapsedSec / 60);

  const saveToCalendar = () => {
    const today = new Date().toISOString().split('T')[0];
    const existing = JSON.parse(localStorage.getItem('gym_calendar') || '{}');
    existing[today] = {
      date: today,
      label: sessionLabel,
      durationSec: elapsedSec,
      durationMin,
    };
    localStorage.setItem('gym_calendar', JSON.stringify(existing));
    setDismissed(d => [...d, 'calendar']);
  };

  const actions = [
    {
      id: 'progress',
      icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
      title: 'Registrar Progresso Corporal',
      desc: 'Aproveite e anote suas medidas de hoje.',
      color: 'emerald',
      onClick: () => { resetSession(); navigate('/progress'); },
    },
    {
      id: 'routines',
      icon: <Dumbbell className="w-5 h-5 text-indigo-400" />,
      title: 'Marcar Exercícios da Rotina',
      desc: 'Veja quais exercícios do dia foram concluídos.',
      color: 'indigo',
      onClick: () => { resetSession(); navigate('/routines'); },
    },
    {
      id: 'calendar',
      icon: <Calendar className="w-5 h-5 text-violet-400" />,
      title: 'Salvar no Calendário',
      desc: `Marcar ${durationMin}min de treino para hoje.`,
      color: 'violet',
      onClick: saveToCalendar,
      done: dismissed.includes('calendar'),
      doneText: 'Salvo! ✓',
    },
  ];

  const colorMap = {
    emerald: 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-400/60 hover:bg-emerald-500/15',
    indigo:  'bg-indigo-500/10 border-indigo-500/30 hover:border-indigo-400/60 hover:bg-indigo-500/15',
    violet:  'bg-violet-500/10 border-violet-500/30 hover:border-violet-400/60 hover:bg-violet-500/15',
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
      <div className="bg-[#171717] border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="relative bg-gradient-to-br from-indigo-600/30 to-violet-600/20 px-6 py-6 text-center border-b border-gray-800">
          <button
            onClick={() => { resetSession(); setShowFinishModal(false); }}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex items-center justify-center mb-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Trophy className="w-8 h-8 text-white" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mb-1">Treino Concluído!</h2>
          <p className="text-gray-400 text-sm">Você foi incrível hoje 🔥</p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-400 tabular-nums">{duration}</p>
              <p className="text-xs text-gray-500 mt-0.5">Duração</p>
            </div>
            <div className="w-px h-10 bg-gray-700" />
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-400">{Math.round(durationMin * 5.5)}</p>
              <p className="text-xs text-gray-500 mt-0.5">Cal estimadas</p>
            </div>
            <div className="w-px h-10 bg-gray-700" />
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center">
                <Flame className="w-4 h-4 text-red-400" />
                <p className="text-2xl font-bold text-red-400">{sessionLabel.length > 8 ? '🏋️' : sessionLabel.slice(0,2)}</p>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{sessionLabel}</p>
            </div>
          </div>
        </div>

        {/* Sugestões */}
        <div className="px-6 py-5 flex flex-col gap-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">O que você quer fazer agora?</p>

          {actions.map(action => (
            <button
              key={action.id}
              onClick={action.done ? undefined : action.onClick}
              disabled={action.done}
              className={`w-full flex items-center gap-4 p-3.5 rounded-xl border transition-all duration-200 text-left ${
                action.done
                  ? 'bg-green-500/10 border-green-500/30 cursor-default'
                  : colorMap[action.color]
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                action.done ? 'bg-green-500/20' : 'bg-black/30'
              }`}>
                {action.done ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : action.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${action.done ? 'text-green-400' : 'text-gray-200'}`}>
                  {action.done ? action.doneText : action.title}
                </p>
                {!action.done && <p className="text-xs text-gray-500 mt-0.5">{action.desc}</p>}
              </div>
            </button>
          ))}
        </div>

        {/* Fechar */}
        <div className="px-6 pb-5">
          <button
            onClick={() => { resetSession(); setShowFinishModal(false); }}
            className="w-full py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 text-sm font-medium transition-all duration-200"
          >
            Fechar sem salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinishModal;
