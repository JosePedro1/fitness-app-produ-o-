import React, { useState, useEffect } from 'react';
import { Salad, Zap, ShoppingCart, ChevronDown, ChevronUp, Lock, Sparkles, RotateCcw, Clock, Target, Flame } from 'lucide-react';
import { generateNutritionPlan, getNutritionUsage } from '../../services/api-nutrition';

const DAILY_LIMIT = 3;

// ── Constantes ─────────────────────────────────────────────
const GOALS = [
  { value: 'emagrecer',   label: 'Emagrecer',        emoji: '🔥', desc: 'Déficit calórico' },
  { value: 'massa',       label: 'Ganhar massa',      emoji: '💪', desc: 'Superávit + proteína' },
  { value: 'manutencao',  label: 'Manter peso',       emoji: '⚖️', desc: 'Equilíbrio calórico' },
  { value: 'saude',       label: 'Saúde geral',       emoji: '🥗', desc: 'Alimentação balanceada' },
];

const ACTIVITY = [
  { value: 'sedentario',  label: 'Sedentário' },
  { value: 'leve',        label: 'Levemente ativo' },
  { value: 'moderado',    label: 'Moderadamente ativo' },
  { value: 'intenso',     label: 'Muito ativo' },
];

// ── Componentes auxiliares ──────────────────────────────────

function UsageBar({ used, limit, isPremium }) {
  if (isPremium) return (
    <div className="flex items-center gap-2 text-sm text-[#7B6FFF] bg-[#5B4FFF]/10 border border-[#5B4FFF]/20 rounded-lg px-4 py-2">
      <Sparkles className="w-4 h-4" />
      <span>Premium ativo — gerações ilimitadas</span>
    </div>
  );

  const remaining = limit - used;
  const pct = Math.min((used / limit) * 100, 100);
  const color = remaining === 0 ? '#ef4444' : remaining === 1 ? '#f59e0b' : '#22c55e';

  return (
    <div className="bg-black/20 border border-white/5 rounded-lg px-4 py-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-400 font-medium">Usos hoje</span>
        <span className="text-xs font-bold" style={{ color }}>
          {remaining === 0 ? 'Limite atingido' : `${remaining} restante${remaining > 1 ? 's' : ''}`}
        </span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
      <p className="text-xs text-gray-600 mt-1.5">{used}/{limit} usos gratuitos diários</p>
    </div>
  );
}

function GoalCard({ goal, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 ${
        selected
          ? 'bg-[#5B4FFF]/15 border-[#5B4FFF]/50 shadow-lg shadow-[#5B4FFF]/5'
          : 'bg-black/20 border-white/5 hover:border-white/15'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{goal.emoji}</span>
        <div>
          <p className={`text-sm font-semibold ${selected ? 'text-[#7B6FFF]' : 'text-gray-200'}`}>{goal.label}</p>
          <p className="text-xs text-gray-500">{goal.desc}</p>
        </div>
      </div>
    </button>
  );
}

function MacroCard({ label, value, unit, color, icon }) {
  return (
    <div className="bg-black/20 border border-white/5 rounded-xl p-4 text-center">
      <p className="text-2xl mb-1">{icon}</p>
      <p className="text-xl font-bold" style={{ color, fontFamily: 'Syne, sans-serif' }}>{value}<span className="text-sm font-normal text-gray-500 ml-1">{unit}</span></p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function MealCard({ meal, index }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#5B4FFF]/15 flex items-center justify-center">
            <span className="text-sm">{index === 0 ? '🌅' : index === 1 ? '☀️' : index === 2 ? '🥗' : index === 3 ? '🌆' : '🌙'}</span>
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

function PlanResult({ plan, onReset }) {
  const [showShopping, setShowShopping] = useState(false);

  return (
    <div className="space-y-5 animate-[fadeUp_0.3s_ease]">
      {/* Header do plano */}
      <div className="bg-gradient-to-r from-[#5B4FFF]/20 to-[#8B5CF6]/10 border border-[#5B4FFF]/25 rounded-xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#7B6FFF]" />
              <span className="text-xs font-semibold text-[#7B6FFF] uppercase tracking-wider">Plano gerado pela IA</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{plan.objetivo}</p>
          </div>
          <button onClick={onReset} className="shrink-0 flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-200 border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5 transition-all">
            <RotateCcw className="w-3 h-3" /> Novo plano
          </button>
        </div>
      </div>

      {/* Macros */}
      <div>
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5" /> Metas diárias
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
          <Salad className="w-3.5 h-3.5" /> Suas refeições
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
        <div className="flex-1">
          <p className="font-semibold text-gray-100" style={{ fontFamily: 'Syne, sans-serif' }}>Limite diário atingido</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">Você usou seus 3 planos gratuitos de hoje. Assine o <strong className="text-[#7B6FFF]">Premium</strong> e gere planos ilimitados, personalizados e salvos no histórico.</p>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-[#5B4FFF] hover:bg-[#5B4FFF]/80 text-white text-sm font-semibold px-5 py-2 rounded-lg cursor-pointer transition-colors" style={{ fontFamily: 'Syne, sans-serif' }}>
              🚀 Assinar Premium — R$9,90/mês
            </div>
            <p className="text-xs text-gray-500">Cancele quando quiser</p>
          </div>
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            {['Gerações ilimitadas', 'Histórico completo', 'Planos salvos', 'Suporte prioritário'].map((f) => (
              <span key={f} className="text-xs text-gray-400 flex items-center gap-1">
                <span className="text-[#22c55e]">✓</span> {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ────────────────────────────────────────
const NutritionPage = () => {
  const isPremium = localStorage.getItem('is_premium') === 'true';

  const [usage, setUsage] = useState({ used: 0, limit: DAILY_LIMIT });
  const [goal, setGoal] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [restrictions, setRestrictions] = useState('');
  const [meals, setMeals] = useState('3');
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState({ weight: '', height: '', age: '', gender: 'm', activityLevel: 'moderado' });
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getNutritionUsage().then(setUsage).catch(() => {});
  }, []);

  const limitReached = !isPremium && usage.used >= DAILY_LIMIT;

  async function handleGenerate() {
    if (!goal) { setError('Selecione um objetivo.'); return; }
    setLoading(true); setError(''); setPlan(null);
    try {
      const res = await generateNutritionPlan({ goal, ingredients, restrictions, meals: parseInt(meals), profile, isPremium });
      setPlan(res.plan);
      if (!isPremium) setUsage((u) => ({ ...u, used: u.used + 1 }));
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Erro ao gerar plano.';
      if (err.response?.data?.error === 'limite_atingido') {
        setUsage((u) => ({ ...u, used: DAILY_LIMIT }));
      }
      setError(msg);
    }
    setLoading(false);
  }

  function handleReset() { setPlan(null); setError(''); }

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
            <p className="text-sm text-gray-500 mt-1">Plano alimentar personalizado gerado em segundos</p>
          </div>
          {isPremium && (
            <div className="flex items-center gap-1.5 bg-[#5B4FFF]/15 border border-[#5B4FFF]/25 text-[#7B6FFF] text-xs font-semibold px-3 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5" /> Premium
            </div>
          )}
        </div>

        <div className="max-w-2xl">
          {/* Usage bar */}
          <div className="mb-5">
            <UsageBar used={usage.used} limit={DAILY_LIMIT} isPremium={isPremium} />
          </div>

          {/* Se já tem plano, mostra o resultado */}
          {plan ? (
            <PlanResult plan={plan} onReset={handleReset} />
          ) : (
            <>
              {/* Formulário */}
              <div className="space-y-5">

                {/* Objetivo */}
                <div>
                  <p className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-[#5B4FFF]" /> Qual é o seu objetivo?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {GOALS.map((g) => (
                      <GoalCard key={g.value} goal={g} selected={goal === g.value} onClick={() => setGoal(g.value)} />
                    ))}
                  </div>
                </div>

                {/* Ingredientes */}
                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 block flex items-center gap-1.5">
                    🥦 O que você tem em casa? <span className="text-gray-600 font-normal">(opcional)</span>
                  </label>
                  <textarea
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    placeholder="Ex: frango, arroz, ovo, brócolis, batata doce, azeite…"
                    rows={3}
                    className="w-full bg-black/30 border border-white/10 rounded-xl text-gray-300 placeholder-gray-600 text-sm px-4 py-3 outline-none focus:border-[#5B4FFF]/50 transition-colors resize-none"
                  />
                  <p className="text-xs text-gray-600 mt-1">Deixe em branco para usar alimentos comuns e acessíveis</p>
                </div>

                {/* Restrições + Refeições lado a lado */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-gray-300 mb-2 block">
                      🚫 Restrições <span className="text-gray-600 font-normal">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={restrictions}
                      onChange={(e) => setRestrictions(e.target.value)}
                      placeholder="Ex: sem glúten, lactose…"
                      className="w-full bg-black/30 border border-white/10 rounded-xl text-gray-300 placeholder-gray-600 text-sm px-4 py-2.5 outline-none focus:border-[#5B4FFF]/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-300 mb-2 block">🍽️ Refeições/dia</label>
                    <select
                      value={meals}
                      onChange={(e) => setMeals(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-xl text-gray-300 text-sm px-4 py-2.5 outline-none focus:border-[#5B4FFF]/50 transition-colors"
                    >
                      {[2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} refeições</option>)}
                    </select>
                  </div>
                </div>

                {/* Perfil (expansível) */}
                <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setShowProfile(!showProfile)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                      <Flame className="w-4 h-4 text-[#5B4FFF]" />
                      Personalizar com seu perfil <span className="text-xs text-gray-600 font-normal">(calorias mais precisas)</span>
                    </span>
                    {showProfile ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                  </button>
                  {showProfile && (
                    <div className="px-4 pb-4 border-t border-white/5 grid grid-cols-2 gap-3 mt-3">
                      {[
                        { key: 'weight', label: 'Peso (kg)', placeholder: '70' },
                        { key: 'height', label: 'Altura (cm)', placeholder: '175' },
                        { key: 'age',    label: 'Idade',      placeholder: '25' },
                      ].map(({ key, label, placeholder }) => (
                        <div key={key}>
                          <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                          <input
                            type="number"
                            value={profile[key]}
                            onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}
                            placeholder={placeholder}
                            className="w-full bg-black/30 border border-white/10 rounded-lg text-gray-300 text-sm px-3 py-2 outline-none focus:border-[#5B4FFF]/50 transition-colors"
                          />
                        </div>
                      ))}
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Sexo</label>
                        <select value={profile.gender} onChange={(e) => setProfile((p) => ({ ...p, gender: e.target.value }))}
                          className="w-full bg-black/30 border border-white/10 rounded-lg text-gray-300 text-sm px-3 py-2 outline-none focus:border-[#5B4FFF]/50 transition-colors">
                          <option value="m">Masculino</option>
                          <option value="f">Feminino</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-gray-500 mb-1 block">Nível de atividade</label>
                        <select value={profile.activityLevel} onChange={(e) => setProfile((p) => ({ ...p, activityLevel: e.target.value }))}
                          className="w-full bg-black/30 border border-white/10 rounded-lg text-gray-300 text-sm px-3 py-2 outline-none focus:border-[#5B4FFF]/50 transition-colors">
                          {ACTIVITY.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Erro */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">{error}</div>
                )}

                {/* Limite atingido */}
                {limitReached ? (
                  <PremiumBanner />
                ) : (
                  <button
                    onClick={handleGenerate}
                    disabled={loading || !goal}
                    className="w-full flex items-center justify-center gap-2 h-12 bg-[#5B4FFF] hover:bg-[#5B4FFF]/85 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 text-sm"
                    style={{ fontFamily: 'Syne, sans-serif' }}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Gerando seu plano…
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Gerar plano com IA
                        {!isPremium && <span className="text-xs text-white/60 font-normal">({DAILY_LIMIT - usage.used} restante{DAILY_LIMIT - usage.used !== 1 ? 's' : ''} hoje)</span>}
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default NutritionPage;