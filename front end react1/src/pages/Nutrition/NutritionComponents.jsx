// src/pages/Nutrition/NutritionComponents.jsx
// Componentes visuais compartilhados da página de Nutrição

import React, { useState } from 'react';
import {
  Salad, Zap, ShoppingCart, ChevronDown, ChevronUp,
  Lock, Sparkles, RotateCcw, Clock, Target,
  Dumbbell, CheckCircle,
} from 'lucide-react';

export const DAILY_LIMIT = 3;

export const GOALS = [
  { value: 'emagrecer',  label: 'Emagrecer',      emoji: '🔥', desc: 'Déficit calórico' },
  { value: 'massa',      label: 'Ganhar massa',    emoji: '💪', desc: 'Superávit + proteína' },
  { value: 'manutencao', label: 'Manter peso',     emoji: '⚖️', desc: 'Equilíbrio' },
  { value: 'saude',      label: 'Saúde geral',     emoji: '🥗', desc: 'Balanceado' },
];

export const BIOTYPES = [
  { value: 'ectomorfo', label: 'Ectomorfo', emoji: '🦴', desc: 'Metabolismo acelerado, dificuldade em ganhar peso' },
  { value: 'mesomorfo', label: 'Mesomorfo', emoji: '💪', desc: 'Metabolismo equilibrado, ganha músculo com facilidade' },
  { value: 'endomorfo', label: 'Endomorfo', emoji: '🧱', desc: 'Metabolismo lento, tende a acumular gordura' },
];

export const ALL_MEALS = ['Café da manhã', 'Lanche da manhã', 'Almoço', 'Lanche da tarde', 'Jantar', 'Ceia'];

export const MEAL_ICONS = {
  'Café da manhã':   '🌅',
  'Lanche da manhã': '🍎',
  'Almoço':          '🥗',
  'Lanche da tarde': '☕',
  'Jantar':          '🌆',
  'Ceia':            '🌙',
};

export const MEAL_EMOJIS = ['🌅', '☀️', '🥗', '🌆', '🌙', '🌙'];

export const ACTIVITY_OPTS = [
  { value: 'sedentario', label: 'Sedentário',          desc: 'Pouco ou nenhum exercício' },
  { value: 'leve',       label: 'Levemente ativo',     desc: '1–3x por semana' },
  { value: 'moderado',   label: 'Moderadamente ativo', desc: '3–5x por semana' },
  { value: 'intenso',    label: 'Muito ativo',         desc: '6–7x por semana' },
];

// ── OptionCard ─────────────────────────────────────────────
export function OptionCard({ selected, onClick, emoji, label, desc, full }) {
  return (
    <button
      onClick={onClick}
      className={`${full ? 'w-full' : ''} text-left p-3.5 rounded-xl border transition-all duration-200 ${
        selected ? 'bg-[#5B4FFF]/15 border-[#5B4FFF]/50' : 'bg-black/20 border-white/5 hover:border-white/15'
      }`}
    >
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

// ── StepIndicator ──────────────────────────────────────────
export function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 flex-1 ${
            i < current ? 'bg-[#5B4FFF]' : i === current ? 'bg-[#5B4FFF]/60' : 'bg-white/10'
          }`}
        />
      ))}
    </div>
  );
}

// ── UsageBar ───────────────────────────────────────────────
export function UsageBar({ used, limit, isPremium }) {
  if (isPremium) {
    return (
      <div className="flex items-center gap-2 text-sm text-[#7B6FFF] bg-[#5B4FFF]/10 border border-[#5B4FFF]/20 rounded-lg px-4 py-2 mb-5">
        <Sparkles className="w-4 h-4" />
        <span>Premium ativo — acesso ilimitado e personalizado</span>
      </div>
    );
  }

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
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

// ── MacroCard ──────────────────────────────────────────────
export function MacroCard({ label, value, unit, color, icon }) {
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

// ── MealCard ───────────────────────────────────────────────
export function MealCard({ meal, index }) {
  const [open, setOpen] = useState(index === 0);

  return (
    <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.02] transition-colors"
      >
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

// ── PremiumBanner ──────────────────────────────────────────
export function PremiumBanner() {
  return (
    <div className="bg-gradient-to-r from-[#5B4FFF]/20 to-[#8B5CF6]/15 border border-[#5B4FFF]/30 rounded-xl p-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-[#5B4FFF]/25 rounded-xl flex items-center justify-center shrink-0">
          <Lock className="w-5 h-5 text-[#7B6FFF]" />
        </div>
        <div>
          <p className="font-semibold text-gray-100" style={{ fontFamily: 'Syne, sans-serif' }}>
            Limite diário atingido
          </p>
          <p className="text-sm text-gray-400 mt-1 mb-4">
            Assine o <strong className="text-[#7B6FFF]">Premium</strong> para planos ilimitados e personalizados pelo seu treino do dia.
          </p>
          <div
            className="bg-[#5B4FFF] text-white text-sm font-semibold px-5 py-2 rounded-lg inline-block cursor-pointer"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
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

// ── PlanResult ─────────────────────────────────────────────
export function PlanResult({ plan, isPremium, allExercises, routines, onReset, onAddToRoutine }) {
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
          <button
            onClick={onReset}
            className="shrink-0 flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-200 border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5 transition-all"
          >
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
          <MacroCard label="Calorias"     value={plan.macros?.calorias}    unit="kcal" color="#f59e0b" icon="🔥" />
          <MacroCard label="Proteína"     value={plan.macros?.proteina_g}  unit="g"    color="#5B4FFF" icon="💪" />
          <MacroCard label="Carboidratos" value={plan.macros?.carbo_g}     unit="g"    color="#22c55e" icon="🌾" />
          <MacroCard label="Gorduras"     value={plan.macros?.gordura_g}   unit="g"    color="#06b6d4" icon="🥑" />
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

      {/* Água */}
      {plan.agua && (
        <div className="bg-[#06b6d4]/10 border border-[#06b6d4]/20 rounded-xl p-4">
          <p className="text-xs text-[#06b6d4] font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
            💧 Hidratação do dia
          </p>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#06b6d4]" style={{ fontFamily: 'Syne, sans-serif' }}>
                {plan.agua.ml}<span className="text-sm font-normal ml-1">ml</span>
              </p>
              <p className="text-xs text-gray-500 mt-0.5">total diário</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#06b6d4]" style={{ fontFamily: 'Syne, sans-serif' }}>
                {plan.agua.copos}<span className="text-sm font-normal ml-1">copos</span>
              </p>
              <p className="text-xs text-gray-500 mt-0.5">de 250ml</p>
            </div>
            {plan.agua.obs && (
              <p className="text-xs text-gray-400 flex-1 border-l border-white/10 pl-4">{plan.agua.obs}</p>
            )}
          </div>
        </div>
      )}

      {/* Lista de compras */}
      {(plan.lista_compras_diaria?.length > 0 || plan.lista_compras?.length > 0) && (
        <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowShopping(!showShopping)}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
              <ShoppingCart className="w-4 h-4 text-[#7B6FFF]" /> Lista de compras
            </div>
            {showShopping ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
          </button>
          {showShopping && (
            <div className="px-4 pb-4 border-t border-white/5">
              {plan.lista_compras_diaria?.length > 0 ? (
                <div className="mt-3 space-y-1.5">
                  {plan.lista_compras_diaria.map((it, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5B4FFF] shrink-0" />
                        {it.item || it}
                      </span>
                      {it.quantidade && (
                        <span className="text-[#7B6FFF] font-semibold text-xs bg-[#5B4FFF]/10 px-2 py-0.5 rounded-md">
                          {it.quantidade}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3">
                  {plan.lista_compras.map((item, i) => (
                    <p key={i} className="text-sm text-gray-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5B4FFF] shrink-0" />{item}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Adicionar exercícios à rotina (só premium) */}
      {isPremium && allExercises?.length > 0 && !added && (
        <div className="bg-black/20 border border-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-200 flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-[#5B4FFF]" />
              Adicionar treino de hoje na rotina?
            </p>
            {!addRoutineOpen && (
              <button
                onClick={() => setAddRoutineOpen(true)}
                className="text-xs text-[#7B6FFF] border border-[#5B4FFF]/30 px-3 py-1.5 rounded-lg hover:bg-[#5B4FFF]/10 transition-colors"
              >
                Sim, adicionar
              </button>
            )}
          </div>
          {addRoutineOpen && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">Onde salvar os exercícios?</p>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedRoutine('new')}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
                    selectedRoutine === 'new'
                      ? 'border-[#5B4FFF]/50 bg-[#5B4FFF]/10 text-[#7B6FFF]'
                      : 'border-white/10 text-gray-400'
                  }`}
                >
                  ✨ Criar nova rotina "Treino de hoje"
                </button>
                {routines?.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRoutine(r.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
                      selectedRoutine === r.id
                        ? 'border-[#5B4FFF]/50 bg-[#5B4FFF]/10 text-[#7B6FFF]'
                        : 'border-white/10 text-gray-400'
                    }`}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  disabled={adding}
                  className="flex-1 h-9 bg-[#5B4FFF] hover:bg-[#5B4FFF]/85 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-all"
                >
                  {adding ? 'Salvando…' : 'Salvar exercícios'}
                </button>
                <button
                  onClick={() => setAddRoutineOpen(false)}
                  className="px-4 h-9 border border-white/10 text-gray-400 text-sm rounded-lg hover:border-white/20 transition-all"
                >
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