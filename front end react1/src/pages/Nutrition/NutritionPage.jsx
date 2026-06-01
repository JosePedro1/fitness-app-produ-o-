
import React, { useState, useEffect } from 'react';
import {
  Salad, Zap, ShoppingCart, ChevronDown, ChevronUp,
  Lock, Sparkles, RotateCcw, Clock, Target, Flame,
  Plus, Trash2, Dumbbell, CheckCircle, Circle, ArrowRight, ArrowLeft
} from 'lucide-react';
import axios from 'axios';
import { getRoutines } from '../../services/api-routines';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://fitness-app-produ-o.onrender.com';
const api = axios.create({ baseURL: BASE_URL });
api.interceptors.request.use((c) => {
  const t = localStorage.getItem('auth_token');
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

const DAILY_LIMIT = 3;

const GOALS = [
  { value: 'emagrecer',  label: 'Emagrecer',      emoji: '🔥', desc: 'Déficit calórico' },
  { value: 'massa',      label: 'Ganhar massa',    emoji: '💪', desc: 'Superávit + proteína' },
  { value: 'manutencao', label: 'Manter peso',     emoji: '⚖️', desc: 'Equilíbrio' },
  { value: 'saude',      label: 'Saúde geral',     emoji: '🥗', desc: 'Balanceado' },
];

const BIOTYPES = [
  { value: 'ectomorfo',  label: 'Ectomorfo',  emoji: '🦴', desc: 'Metabolismo acelerado, dificuldade em ganhar peso' },
  { value: 'mesomorfo',  label: 'Mesomorfo',  emoji: '💪', desc: 'Metabolismo equilibrado, ganha músculo com facilidade' },
  { value: 'endomorfo',  label: 'Endomorfo',  emoji: '🧱', desc: 'Metabolismo lento, tende a acumular gordura' },
];

const MEAL_EMOJIS = ['🌅', '☀️', '🥗', '🌆', '🌙', '🌙'];

// ── Componentes visuais ────────────────────────────────────

function OptionCard({ selected, onClick, emoji, label, desc, full }) {
  return (
    <button onClick={onClick}
      className={`${full ? 'w-full' : ''} text-left p-3.5 rounded-xl border transition-all duration-200 ${
        selected ? 'bg-[#5B4FFF]/15 border-[#5B4FFF]/50' : 'bg-black/20 border-white/5 hover:border-white/15'
      }`}>
      <div className="flex items-center gap-3">
        <span className="text-xl">{emoji}</span>
        <div>
          <p className={`text-sm font-semibold ${selected ? 'text-[#7B6FFF]' : 'text-gray-200'}`}>{label}</p>
          {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
        </div>
        {selected && <CheckCircle className="w-4 h-4 text-[#5B4FFF] ml-auto shrink-0" />}
      </div>
    </button>
  );
}

function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
          i < current ? 'bg-[#5B4FFF] flex-1' : i === current ? 'bg-[#5B4FFF]/60 flex-1' : 'bg-white/10 flex-1'
        }`} />
      ))}
    </div>
  );
}

function UsageBar({ used, limit, isPremium }) {
  if (isPremium) return (
    <div className="flex items-center gap-2 text-sm text-[#7B6FFF] bg-[#5B4FFF]/10 border border-[#5B4FFF]/20 rounded-lg px-4 py-2 mb-5">
      <Sparkles className="w-4 h-4" /><span>Premium ativo — acesso ilimitado e personalizado</span>
    </div>
  );
  const remaining = limit - used;
  const pct = Math.min((used / limit) * 100, 100);
  const color = remaining === 0 ? '#ef4444' : remaining === 1 ? '#f59e0b' : '#22c55e';
  return (
    <div className="bg-black/20 border border-white/5 rounded-lg px-4 py-3 mb-5">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-400 font-medium">Planos gratuitos hoje</span>
        <span className="text-xs font-bold" style={{ color }}>
          {remaining === 0 ? 'Limite atingido' : `${remaining} restante${remaining > 1 ? 's' : ''}`}
        </span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function MacroCard({ label, value, unit, color, icon }) {
  return (
    <div className="bg-black/20 border border-white/5 rounded-xl p-4 text-center">
      <p className="text-xl mb-1">{icon}</p>
      <p className="text-xl font-bold" style={{ color, fontFamily: 'Syne, sans-serif' }}>
        {value}<span className="text-xs font-normal text-gray-500 ml-1">{unit}</span>
      </p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function MealCard({ meal, index }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.02] transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#5B4FFF]/15 flex items-center justify-center">
            <span className="text-sm">{MEAL_EMOJIS[index] || '🍽️'}</span>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-200">{meal.nome}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {meal.horario} · {meal.calorias_aprox} kcal
            </p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-white/5">
          <ul className="mt-3 space-y-1.5">
            {meal.itens?.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-[#5B4FFF] mt-0.5">•</span>{item}
              </li>
            ))}
          </ul>
          {meal.dica && (
            <div className="mt-3 bg-[#5B4FFF]/10 border border-[#5B4FFF]/20 rounded-lg px-3 py-2">
              <p className="text-xs text-[#7B6FFF]">💡 {meal.dica}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PremiumBanner() {
  return (
    <div className="bg-gradient-to-r from-[#5B4FFF]/20 to-[#8B5CF6]/15 border border-[#5B4FFF]/30 rounded-xl p-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-[#5B4FFF]/25 rounded-xl flex items-center justify-center shrink-0">
          <Lock className="w-5 h-5 text-[#7B6FFF]" />
        </div>
        <div>
          <p className="font-semibold text-gray-100" style={{ fontFamily: 'Syne, sans-serif' }}>Limite diário atingido</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">Assine o <strong className="text-[#7B6FFF]">Premium</strong> para planos ilimitados e personalizados pelo seu treino do dia.</p>
          <div className="bg-[#5B4FFF] text-white text-sm font-semibold px-5 py-2 rounded-lg inline-block cursor-pointer" style={{ fontFamily: 'Syne, sans-serif' }}>
             Assinar Premium — R$9,90/mês
          </div>
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            {['Ilimitado', 'Personalizado por treino', 'Biótipo', 'Histórico'].map(f => (
              <span key={f} className="text-xs text-gray-400 flex items-center gap-1">
                <span className="text-[#22c55e]">✓</span>{f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Resultado do plano ─────────────────────────────────────
function PlanResult({ plan, isPremium, allExercises, routines, onReset, onAddToRoutine }) {
  const [showShopping, setShowShopping] = useState(false);
  const [addRoutineOpen, setAddRoutineOpen] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState('new');
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  async function handleAdd() {
    setAdding(true);
    await onAddToRoutine(selectedRoutine === 'new' ? null : selectedRoutine);
    setAdding(false);
    setAdded(true);
    setAddRoutineOpen(false);
  }

  return (
    <div className="space-y-5 animate-[fadeUp_0.3s_ease]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#5B4FFF]/20 to-[#8B5CF6]/10 border border-[#5B4FFF]/25 rounded-xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {isPremium ? <Sparkles className="w-4 h-4 text-[#7B6FFF]" /> : <Zap className="w-4 h-4 text-[#7B6FFF]" />}
              <span className="text-xs font-semibold text-[#7B6FFF] uppercase tracking-wider">
                {isPremium ? 'Plano Premium · Personalizado pelo treino' : 'Plano gerado pela IA'}
              </span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{plan.objetivo}</p>
            {plan.gasto_treino_kcal > 0 && (
              <p className="text-xs text-[#f59e0b] mt-1.5">🔥 Gasto estimado no treino: {plan.gasto_treino_kcal} kcal</p>
            )}
          </div>
          <button onClick={onReset}
            className="shrink-0 flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-200 border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5 transition-all">
            <RotateCcw className="w-3 h-3" /> Novo
          </button>
        </div>
      </div>

      {/* Macros */}
      <div>
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5" /> Metas do dia
        </p>
        <div className="grid grid-cols-4 gap-2">
          <MacroCard label="Calorias" value={plan.macros?.calorias} unit="kcal" color="#f59e0b" icon="🔥" />
          <MacroCard label="Proteína" value={plan.macros?.proteina_g} unit="g" color="#5B4FFF" icon="💪" />
          <MacroCard label="Carboidratos" value={plan.macros?.carbo_g} unit="g" color="#22c55e" icon="🌾" />
          <MacroCard label="Gorduras" value={plan.macros?.gordura_g} unit="g" color="#06b6d4" icon="🥑" />
        </div>
      </div>

      {/* Refeições */}
      <div>
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Salad className="w-3.5 h-3.5" /> Refeições de hoje
        </p>
        <div className="space-y-2">
          {plan.refeicoes?.map((meal, i) => <MealCard key={i} meal={meal} index={i} />)}
        </div>
      </div>

      {/* Dicas */}
      {plan.dicas_gerais?.length > 0 && (
        <div className="bg-black/20 border border-white/5 rounded-xl p-4">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">✨ Dicas do nutricionista</p>
          <ul className="space-y-2">
            {plan.dicas_gerais.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-[#7B6FFF] shrink-0">→</span>{d}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Lista de compras */}
      {plan.lista_compras?.length > 0 && (
        <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden">
          <button onClick={() => setShowShopping(!showShopping)}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
              <ShoppingCart className="w-4 h-4 text-[#7B6FFF]" /> Lista de compras
            </div>
            {showShopping ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
          </button>
          {showShopping && (
            <div className="px-4 pb-4 border-t border-white/5">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3">
                {plan.lista_compras.map((item, i) => (
                  <p key={i} className="text-sm text-gray-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5B4FFF] shrink-0" />{item}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Adicionar à rotina */}
      {isPremium && allExercises?.length > 0 && !added && (
        <div className="bg-black/20 border border-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-200 flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-[#5B4FFF]" />
              Adicionar treino de hoje na rotina?
            </p>
            {!addRoutineOpen && (
              <button onClick={() => setAddRoutineOpen(true)}
                className="text-xs text-[#7B6FFF] border border-[#5B4FFF]/30 px-3 py-1.5 rounded-lg hover:bg-[#5B4FFF]/10 transition-colors">
                Sim, adicionar
              </button>
            )}
          </div>
          {addRoutineOpen && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">Onde salvar os exercícios?</p>
              <div className="space-y-2">
                <button onClick={() => setSelectedRoutine('new')}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${selectedRoutine === 'new' ? 'border-[#5B4FFF]/50 bg-[#5B4FFF]/10 text-[#7B6FFF]' : 'border-white/10 text-gray-400'}`}>
                  ✨ Criar nova rotina "Treino de hoje"
                </button>
                {routines?.map(r => (
                  <button key={r.id} onClick={() => setSelectedRoutine(r.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${selectedRoutine === r.id ? 'border-[#5B4FFF]/50 bg-[#5B4FFF]/10 text-[#7B6FFF]' : 'border-white/10 text-gray-400'}`}>
                    {r.name}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={handleAdd} disabled={adding}
                  className="flex-1 h-9 bg-[#5B4FFF] hover:bg-[#5B4FFF]/85 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-all">
                  {adding ? 'Salvando…' : 'Salvar exercícios'}
                </button>
                <button onClick={() => setAddRoutineOpen(false)}
                  className="px-4 h-9 border border-white/10 text-gray-400 text-sm rounded-lg hover:border-white/20 transition-all">
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {added && (
        <div className="flex items-center gap-2 text-sm text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-xl px-4 py-3">
          <CheckCircle className="w-4 h-4" /> Exercícios salvos na rotina com sucesso!
        </div>
      )}
    </div>
  );
}

// ── Wizard Premium ─────────────────────────────────────────
function PremiumWizard({ onGenerate, loading, error }) {
  const [step, setStep] = useState(0); // 0=biótipo+objetivo, 1=treino, 2=cardio+extras
  const [goal, setGoal] = useState('');
  const [biotype, setBiotype] = useState('');
  const [routines, setRoutines] = useState([]);
  const [selectedRoutines, setSelectedRoutines] = useState({}); // { id: true/false }
  const [manualExercises, setManualExercises] = useState([]);
  const [newExercise, setNewExercise] = useState({ name: '', sets: '', weight: '', rest: '' });
  const [cardio, setCardio] = useState({ type: 'min', value: '' });
  const [ingredients, setIngredients] = useState('');
  const [restrictions, setRestrictions] = useState('');

  useEffect(() => {
    getRoutines().then(setRoutines).catch(() => {});
  }, []);

  function toggleRoutine(id) {
    setSelectedRoutines(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function addManualExercise() {
    if (!newExercise.name.trim()) return;
    setManualExercises(prev => [...prev, { ...newExercise, id: Date.now() }]);
    setNewExercise({ name: '', sets: '', weight: '', rest: '' });
  }

  function removeManualExercise(id) {
    setManualExercises(prev => prev.filter(e => e.id !== id));
  }

  function handleGenerate() {
    const routinesDone = routines
      .filter(r => selectedRoutines[r.id])
      .map(r => ({ name: r.name, exercises: [] }));

    onGenerate({
      goal, biotype,
      workout: { routinesDone, manualExercises },
      cardio: { type: cardio.type, value: parseInt(cardio.value) || 0 },
      ingredients, restrictions,
    });
  }

  const canNext0 = goal && biotype;
  const canGenerate = canNext0;

  return (
    <div>
      <StepIndicator current={step} total={3} />

      {/* Step 0: Objetivo + Biótipo */}
      {step === 0 && (
        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-[#5B4FFF]" /> Qual é o seu objetivo?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {GOALS.map(g => (
                <OptionCard key={g.value} selected={goal === g.value} onClick={() => setGoal(g.value)}
                  emoji={g.emoji} label={g.label} desc={g.desc} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-1.5">
              🧬 Qual é o seu biótipo?
            </p>
            <div className="space-y-2">
              {BIOTYPES.map(b => (
                <OptionCard key={b.value} selected={biotype === b.value} onClick={() => setBiotype(b.value)}
                  emoji={b.emoji} label={b.label} desc={b.desc} full />
              ))}
            </div>
          </div>
          <button onClick={() => setStep(1)} disabled={!canNext0}
            className="w-full h-11 bg-[#5B4FFF] hover:bg-[#5B4FFF]/85 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
            style={{ fontFamily: 'Syne, sans-serif' }}>
            Próximo <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 1: Treino do dia */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4 text-[#5B4FFF]" /> Quais rotinas você fez hoje?
            </p>
            <p className="text-xs text-gray-500 mb-3">Selecione as que você realizou</p>
            {routines.length === 0 ? (
              <p className="text-sm text-gray-500 bg-black/20 border border-white/5 rounded-xl px-4 py-3">
                Você não tem rotinas cadastradas. Adicione exercícios manualmente abaixo.
              </p>
            ) : (
              <div className="space-y-2">
                {routines.map(r => (
                  <button key={r.id} onClick={() => toggleRoutine(r.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all ${
                      selectedRoutines[r.id] ? 'bg-[#5B4FFF]/15 border-[#5B4FFF]/40 text-[#7B6FFF]' : 'bg-black/20 border-white/5 text-gray-300 hover:border-white/15'
                    }`}>
                    {selectedRoutines[r.id] ? <CheckCircle className="w-4 h-4 shrink-0" /> : <Circle className="w-4 h-4 shrink-0 text-gray-600" />}
                    {r.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Exercícios manuais */}
          <div>
            <p className="text-sm font-semibold text-gray-300 mb-3">➕ Adicionar exercício avulso</p>
            <div className="bg-black/20 border border-white/5 rounded-xl p-4 space-y-3">
              <input type="text" placeholder="Nome do exercício (ex: Supino reto)"
                value={newExercise.name} onChange={e => setNewExercise(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-black/30 border border-white/10 rounded-lg text-gray-300 placeholder-gray-600 text-sm px-3 py-2.5 outline-none focus:border-[#5B4FFF]/50 transition-colors" />
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Séries</label>
                  <input type="number" placeholder="4" value={newExercise.sets}
                    onChange={e => setNewExercise(p => ({ ...p, sets: e.target.value }))}
                    className="w-full bg-black/30 border border-white/10 rounded-lg text-gray-300 placeholder-gray-600 text-sm px-3 py-2 outline-none focus:border-[#5B4FFF]/50 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Peso (kg)</label>
                  <input type="number" placeholder="80" value={newExercise.weight}
                    onChange={e => setNewExercise(p => ({ ...p, weight: e.target.value }))}
                    className="w-full bg-black/30 border border-white/10 rounded-lg text-gray-300 placeholder-gray-600 text-sm px-3 py-2 outline-none focus:border-[#5B4FFF]/50 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Descanso (s)</label>
                  <input type="number" placeholder="60" value={newExercise.rest}
                    onChange={e => setNewExercise(p => ({ ...p, rest: e.target.value }))}
                    className="w-full bg-black/30 border border-white/10 rounded-lg text-gray-300 placeholder-gray-600 text-sm px-3 py-2 outline-none focus:border-[#5B4FFF]/50 transition-colors" />
                </div>
              </div>
              <button onClick={addManualExercise} disabled={!newExercise.name.trim()}
                className="flex items-center gap-2 text-sm text-[#7B6FFF] border border-[#5B4FFF]/30 px-4 py-2 rounded-lg hover:bg-[#5B4FFF]/10 transition-colors disabled:opacity-40">
                <Plus className="w-4 h-4" /> Adicionar exercício
              </button>
            </div>
            {manualExercises.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {manualExercises.map(e => (
                  <div key={e.id} className="flex items-center justify-between bg-black/20 border border-white/5 rounded-lg px-3 py-2">
                    <div>
                      <p className="text-sm text-gray-200">{e.name}</p>
                      <p className="text-xs text-gray-500">
                        {[e.sets && `${e.sets} séries`, e.weight && `${e.weight}kg`, e.rest && `${e.rest}s descanso`].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <button onClick={() => removeManualExercise(e.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button onClick={() => setStep(0)}
              className="flex items-center gap-1.5 px-4 h-11 border border-white/10 text-gray-400 text-sm rounded-xl hover:border-white/20 transition-all">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <button onClick={() => setStep(2)}
              className="flex-1 h-11 bg-[#5B4FFF] hover:bg-[#5B4FFF]/85 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
              style={{ fontFamily: 'Syne, sans-serif' }}>
              Próximo <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Cardio + extras */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-1.5">
              🏃 Cardio hoje? <span className="text-gray-600 font-normal">(opcional)</span>
            </p>
            <div className="bg-black/20 border border-white/5 rounded-xl p-4">
              <div className="flex gap-2 mb-3">
                {[{ value: 'min', label: 'Minutos' }, { value: 'km', label: 'Quilômetros' }].map(t => (
                  <button key={t.value} onClick={() => setCardio(p => ({ ...p, type: t.value }))}
                    className={`flex-1 py-2 rounded-lg text-sm border transition-all ${cardio.type === t.value ? 'bg-[#5B4FFF]/15 border-[#5B4FFF]/40 text-[#7B6FFF] font-semibold' : 'border-white/10 text-gray-400'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
              <input type="number" placeholder={cardio.type === 'km' ? 'Ex: 5' : 'Ex: 30'}
                value={cardio.value} onChange={e => setCardio(p => ({ ...p, value: e.target.value }))}
                className="w-full bg-black/30 border border-white/10 rounded-lg text-gray-300 placeholder-gray-600 text-sm px-3 py-2.5 outline-none focus:border-[#5B4FFF]/50 transition-colors" />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-300 mb-2 block">
              🥦 O que você tem em casa? <span className="text-gray-600 font-normal">(opcional)</span>
            </label>
            <textarea value={ingredients} onChange={e => setIngredients(e.target.value)}
              placeholder="Ex: frango, arroz, ovo, brócolis…" rows={2}
              className="w-full bg-black/30 border border-white/10 rounded-xl text-gray-300 placeholder-gray-600 text-sm px-4 py-3 outline-none focus:border-[#5B4FFF]/50 transition-colors resize-none" />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-300 mb-2 block">
              🚫 Restrições alimentares <span className="text-gray-600 font-normal">(opcional)</span>
            </label>
            <input type="text" value={restrictions} onChange={e => setRestrictions(e.target.value)}
              placeholder="Ex: sem glúten, sem lactose…"
              className="w-full bg-black/30 border border-white/10 rounded-xl text-gray-300 placeholder-gray-600 text-sm px-4 py-2.5 outline-none focus:border-[#5B4FFF]/50 transition-colors" />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">{error}</div>
          )}

          <div className="flex gap-2">
            <button onClick={() => setStep(1)}
              className="flex items-center gap-1.5 px-4 h-12 border border-white/10 text-gray-400 text-sm rounded-xl hover:border-white/20 transition-all">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <button onClick={handleGenerate} disabled={loading || !canGenerate}
              className="flex-1 h-12 bg-[#5B4FFF] hover:bg-[#5B4FFF]/85 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
              style={{ fontFamily: 'Syne, sans-serif' }}>
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Gerando plano…</>
              ) : (
                <><Sparkles className="w-4 h-4" />Gerar meu plano de hoje</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Formulário Free ────────────────────────────────────────
function FreeForm({ onGenerate, loading, error, usage }) {
  const [goal, setGoal] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [restrictions, setRestrictions] = useState('');
  const [meals, setMeals] = useState('3');
  const limitReached = usage.used >= DAILY_LIMIT;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-1.5">
          <Target className="w-4 h-4 text-[#5B4FFF]" /> Qual é o seu objetivo?
        </p>
        <div className="grid grid-cols-2 gap-2">
          {GOALS.map(g => (
            <OptionCard key={g.value} selected={goal === g.value} onClick={() => setGoal(g.value)}
              emoji={g.emoji} label={g.label} desc={g.desc} />
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold text-gray-300 mb-2 block">
          🥦 O que você tem em casa? <span className="text-gray-600 font-normal">(opcional)</span>
        </label>
        <textarea value={ingredients} onChange={e => setIngredients(e.target.value)}
          placeholder="Ex: frango, arroz, ovo, brócolis…" rows={2}
          className="w-full bg-black/30 border border-white/10 rounded-xl text-gray-300 placeholder-gray-600 text-sm px-4 py-3 outline-none focus:border-[#5B4FFF]/50 transition-colors resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-semibold text-gray-300 mb-2 block">🚫 Restrições</label>
          <input type="text" value={restrictions} onChange={e => setRestrictions(e.target.value)}
            placeholder="sem glúten…"
            className="w-full bg-black/30 border border-white/10 rounded-xl text-gray-300 placeholder-gray-600 text-sm px-3 py-2.5 outline-none focus:border-[#5B4FFF]/50 transition-colors" />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-300 mb-2 block">🍽️ Refeições/dia</label>
          <select value={meals} onChange={e => setMeals(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-xl text-gray-300 text-sm px-3 py-2.5 outline-none focus:border-[#5B4FFF]/50 transition-colors">
            {[2,3,4,5,6].map(n => <option key={n} value={n}>{n} refeições</option>)}
          </select>
        </div>
      </div>
      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">{error}</div>}
      {limitReached ? <PremiumBanner /> : (
        <button onClick={() => onGenerate({ goal, ingredients, restrictions, meals })}
          disabled={loading || !goal}
          className="w-full flex items-center justify-center gap-2 h-12 bg-[#5B4FFF] hover:bg-[#5B4FFF]/85 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all text-sm"
          style={{ fontFamily: 'Syne, sans-serif' }}>
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Gerando…</>
          ) : (
            <><Zap className="w-4 h-4" />Gerar plano alimentar
              <span className="text-xs text-white/60 font-normal">({DAILY_LIMIT - usage.used} restante{DAILY_LIMIT - usage.used !== 1 ? 's' : ''})</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

// ── Página principal ───────────────────────────────────────
const NutritionPage = () => {
  const isPremium = localStorage.getItem('is_premium') === 'true';
  const [usage, setUsage] = useState({ used: 0, limit: DAILY_LIMIT });
  const [plan, setPlan] = useState(null);
  const [planIsPremium, setPlanIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [routines, setRoutines] = useState([]);
  const [allExercises, setAllExercises] = useState([]);

  useEffect(() => {
    api.get('/nutrition/usage').then(r => setUsage(r.data)).catch(() => {});
    if (isPremium) getRoutines().then(setRoutines).catch(() => {});
  }, []);

  async function handleFreeGenerate(params) {
    if (!params.goal) { setError('Selecione um objetivo.'); return; }
    setLoading(true); setError(''); setPlan(null);
    try {
      const { data } = await api.post('/nutrition/generate', params);
      setPlan(data.plan);
      setPlanIsPremium(false);
      setUsage(u => ({ ...u, used: u.used + 1 }));
    } catch (err) {
      const d = err.response?.data;
      if (d?.error === 'limite_atingido') setUsage(u => ({ ...u, used: DAILY_LIMIT }));
      setError(d?.message || 'Erro ao gerar plano.');
    }
    setLoading(false);
  }

  async function handlePremiumGenerate(params) {
    setLoading(true); setError(''); setPlan(null);
    try {
      const { data } = await api.post('/nutrition/generate-premium', params);
      setPlan(data.plan);
      setPlanIsPremium(true);
      // Coleta todos exercícios para oferecer "adicionar à rotina"
      const exs = [];
      params.workout?.routinesDone?.forEach(r => r.exercises?.forEach(e => exs.push(e)));
      params.workout?.manualExercises?.forEach(e => exs.push(e));
      setAllExercises(exs);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao gerar plano.');
    }
    setLoading(false);
  }

  async function handleAddToRoutine(routineId) {
    try {
      await api.post('/nutrition/add-to-routine', { exercises: allExercises, routineId });
    } catch (err) {
      console.error('addToRoutine error:', err.message);
    }
  }

  return (
    <div className="w-full min-h-screen bg-[#171717] pb-16">
      <div className="lg:px-24 md:px-16 px-4 pt-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif' }}>
              <Salad className="w-6 h-6 text-[#5B4FFF]" />
              Nutrição <span className="text-[#7B6FFF]">com IA</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isPremium ? 'Plano personalizado pelo seu treino do dia' : 'Plano alimentar gerado em segundos'}
            </p>
          </div>
          {isPremium && (
            <div className="flex items-center gap-1.5 bg-[#5B4FFF]/15 border border-[#5B4FFF]/25 text-[#7B6FFF] text-xs font-semibold px-3 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5" /> Premium
            </div>
          )}
        </div>

        <div className="max-w-2xl">
          <UsageBar used={usage.used} limit={DAILY_LIMIT} isPremium={isPremium} />

          {plan ? (
            <PlanResult
              plan={plan}
              isPremium={planIsPremium}
              allExercises={allExercises}
              routines={routines}
              onReset={() => { setPlan(null); setError(''); setAllExercises([]); }}
              onAddToRoutine={handleAddToRoutine}
            />
          ) : isPremium ? (
            <PremiumWizard onGenerate={handlePremiumGenerate} loading={loading} error={error} />
          ) : (
            <FreeForm onGenerate={handleFreeGenerate} loading={loading} error={error} usage={usage} />
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
};

export default NutritionPage;
