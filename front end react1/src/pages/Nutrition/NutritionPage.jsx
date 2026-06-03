// src/pages/Nutrition/NutritionPage.jsx
import React, { useState, useEffect } from 'react';
import { Salad, Sparkles, Zap, Target, ArrowRight, ArrowLeft, Plus, Trash2, CheckCircle, Circle, Dumbbell } from 'lucide-react';
import { getRoutines } from '../../services/api-routines';
import { getNutritionMe, generateFreePlan, generatePremiumPlan, addExercisesToRoutine } from '../../services/api-nutrition';
import {
  DAILY_LIMIT, GOALS, BIOTYPES, ALL_MEALS, MEAL_ICONS, ACTIVITY_OPTS,
  OptionCard, StepIndicator, UsageBar, PremiumBanner, PlanResult,
} from './NutritionComponents';

// ── Formulário Free ────────────────────────────────────────
function FreeForm({ onGenerate, loading, error, usage }) {
  const [goal, setGoal]               = useState('');
  const [ingredients, setIngredients] = useState('');
  const [restrictions, setRestrictions] = useState('');
  const [meals, setMeals]             = useState('3');
  const limitReached = usage.used >= DAILY_LIMIT;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-1.5">
          <Target className="w-4 h-4 text-[#5B4FFF]" /> Qual é o seu objetivo?
        </p>
        <div className="grid grid-cols-2 gap-2">
          {GOALS.map(g => (
            <OptionCard
              key={g.value}
              selected={goal === g.value}
              onClick={() => setGoal(g.value)}
              emoji={g.emoji} label={g.label} desc={g.desc}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-300 mb-2 block">
          🥦 O que você tem em casa? <span className="text-gray-600 font-normal">(opcional)</span>
        </label>
        <textarea
          value={ingredients} onChange={e => setIngredients(e.target.value)}
          placeholder="Ex: frango, arroz, ovo, brócolis…" rows={2}
          className="w-full bg-black/30 border border-white/10 rounded-xl text-gray-300 placeholder-gray-600 text-sm px-4 py-3 outline-none focus:border-[#5B4FFF]/50 transition-colors resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-semibold text-gray-300 mb-2 block">🚫 Restrições</label>
          <input
            type="text" value={restrictions} onChange={e => setRestrictions(e.target.value)}
            placeholder="sem glúten…"
            className="w-full bg-black/30 border border-white/10 rounded-xl text-gray-300 placeholder-gray-600 text-sm px-3 py-2.5 outline-none focus:border-[#5B4FFF]/50 transition-colors"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-300 mb-2 block">🍽️ Refeições/dia</label>
          <select
            value={meals} onChange={e => setMeals(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-xl text-gray-300 text-sm px-3 py-2.5 outline-none focus:border-[#5B4FFF]/50 transition-colors"
          >
            {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} refeições</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      {limitReached ? (
        <PremiumBanner />
      ) : (
        <button
          onClick={() => onGenerate({ goal, ingredients, restrictions, meals })}
          disabled={loading || !goal}
          className="w-full flex items-center justify-center gap-2 h-12 bg-[#5B4FFF] hover:bg-[#5B4FFF]/85 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all text-sm"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Gerando…</>
          ) : (
            <>
              <Zap className="w-4 h-4" />Gerar plano alimentar
              <span className="text-xs text-white/60 font-normal">
                ({DAILY_LIMIT - usage.used} restante{DAILY_LIMIT - usage.used !== 1 ? 's' : ''})
              </span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

// ── Wizard Premium ─────────────────────────────────────────
function PremiumWizard({ onGenerate, loading, error }) {
  const [step, setStep]                   = useState(0);
  const [goal, setGoal]                   = useState('');
  const [biotype, setBiotype]             = useState('');
  const [profile, setProfile]             = useState({ weight: '', height: '', age: '', gender: 'm', activityLevel: 'moderado' });
  const [selectedMeals, setSelectedMeals] = useState([...ALL_MEALS]);
  const [routines, setRoutines]           = useState([]);
  const [selectedRoutines, setSelectedRoutines] = useState({});
  const [manualExercises, setManualExercises]   = useState([]);
  const [newExercise, setNewExercise]     = useState({ name: '', sets: '', weight: '', rest: '' });
  const [cardio, setCardio]               = useState({ type: 'min', value: '' });
  const [ingredients, setIngredients]     = useState('');
  const [restrictions, setRestrictions]   = useState('');

  useEffect(() => {
    getRoutines().then(setRoutines).catch(() => {});
  }, []);

  function toggleRoutine(id) {
    setSelectedRoutines(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleMeal(meal) {
    setSelectedMeals(prev =>
      prev.includes(meal) ? prev.filter(m => m !== meal) : [...prev, meal]
    );
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
      .map(r => ({ name: r.name, exercises: (r.exercises || []) }));

    const orderedMeals = ALL_MEALS.filter(m => selectedMeals.includes(m));

    onGenerate({
      goal, biotype, profile,
      selectedMeals: orderedMeals,
      workout: { routinesDone, manualExercises },
      cardio: { type: cardio.type, value: parseInt(cardio.value) || 0 },
      ingredients, restrictions,
    });
  }

  const canNext0 = goal && biotype;
  const canNext1 = selectedMeals.length >= 1;

  return (
    <div>
      <StepIndicator current={step} total={4} />

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
          <button
            onClick={() => setStep(1)} disabled={!canNext0}
            className="w-full h-11 bg-[#5B4FFF] hover:bg-[#5B4FFF]/85 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Próximo <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 1: Perfil físico + refeições */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-1.5">
              📊 Seu perfil físico <span className="text-gray-600 font-normal">(para cálculo preciso)</span>
            </p>
            <div className="bg-black/20 border border-white/5 rounded-xl p-4 grid grid-cols-2 gap-3">
              {[
                { key: 'weight', label: 'Peso (kg)',   placeholder: '70' },
                { key: 'height', label: 'Altura (cm)', placeholder: '175' },
                { key: 'age',    label: 'Idade',       placeholder: '25' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                  <input
                    type="number" value={profile[key]} placeholder={placeholder}
                    onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full bg-black/30 border border-white/10 rounded-lg text-gray-300 placeholder-gray-600 text-sm px-3 py-2 outline-none focus:border-[#5B4FFF]/50 transition-colors"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Sexo</label>
                <select
                  value={profile.gender} onChange={e => setProfile(p => ({ ...p, gender: e.target.value }))}
                  className="w-full bg-black/30 border border-white/10 rounded-lg text-gray-300 text-sm px-3 py-2 outline-none focus:border-[#5B4FFF]/50 transition-colors"
                >
                  <option value="m">Masculino</option>
                  <option value="f">Feminino</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 mb-2 block">Nível de atividade</label>
                <div className="grid grid-cols-2 gap-2">
                  {ACTIVITY_OPTS.map(a => (
                    <button
                      key={a.value} onClick={() => setProfile(p => ({ ...p, activityLevel: a.value }))}
                      className={`text-left px-3 py-2 rounded-lg border text-xs transition-all ${
                        profile.activityLevel === a.value
                          ? 'bg-[#5B4FFF]/15 border-[#5B4FFF]/40 text-[#7B6FFF]'
                          : 'border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <p className="font-semibold">{a.label}</p>
                      <p className="text-gray-600 mt-0.5">{a.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
              🍽️ Quais refeições você fará hoje?
            </p>
            <p className="text-xs text-gray-500 mb-3">Selecione as refeições que você conseguirá fazer</p>
            <div className="grid grid-cols-2 gap-2">
              {ALL_MEALS.map(meal => {
                const selected = selectedMeals.includes(meal);
                return (
                  <button
                    key={meal} onClick={() => toggleMeal(meal)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm transition-all ${
                      selected
                        ? 'bg-[#5B4FFF]/15 border-[#5B4FFF]/40 text-[#7B6FFF]'
                        : 'bg-black/20 border-white/5 text-gray-400 hover:border-white/15'
                    }`}
                  >
                    <span className="text-base">{MEAL_ICONS[meal]}</span>
                    <span className="font-medium text-xs">{meal}</span>
                    {selected && <CheckCircle className="w-3.5 h-3.5 ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-600 mt-2">{selectedMeals.length} refeição(ões) selecionada(s)</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStep(0)}
              className="flex items-center gap-1.5 px-4 h-11 border border-white/10 text-gray-400 text-sm rounded-xl hover:border-white/20 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <button
              onClick={() => setStep(2)} disabled={!canNext1}
              className="flex-1 h-11 bg-[#5B4FFF] hover:bg-[#5B4FFF]/85 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              Próximo <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Treino do dia */}
      {step === 2 && (
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
                  <button
                    key={r.id} onClick={() => toggleRoutine(r.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all ${
                      selectedRoutines[r.id]
                        ? 'bg-[#5B4FFF]/15 border-[#5B4FFF]/40 text-[#7B6FFF]'
                        : 'bg-black/20 border-white/5 text-gray-300 hover:border-white/15'
                    }`}
                  >
                    {selectedRoutines[r.id]
                      ? <CheckCircle className="w-4 h-4 shrink-0" />
                      : <Circle className="w-4 h-4 shrink-0 text-gray-600" />}
                    {r.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-300 mb-3">➕ Adicionar exercício avulso</p>
            <div className="bg-black/20 border border-white/5 rounded-xl p-4 space-y-3">
              <input
                type="text" placeholder="Nome do exercício (ex: Supino reto)"
                value={newExercise.name} onChange={e => setNewExercise(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-black/30 border border-white/10 rounded-lg text-gray-300 placeholder-gray-600 text-sm px-3 py-2.5 outline-none focus:border-[#5B4FFF]/50 transition-colors"
              />
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'sets',   label: 'Séries',       placeholder: '4' },
                  { key: 'weight', label: 'Peso (kg)',     placeholder: '80' },
                  { key: 'rest',   label: 'Descanso (s)',  placeholder: '60' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                    <input
                      type="number" placeholder={placeholder} value={newExercise[key]}
                      onChange={e => setNewExercise(p => ({ ...p, [key]: e.target.value }))}
                      className="w-full bg-black/30 border border-white/10 rounded-lg text-gray-300 placeholder-gray-600 text-sm px-3 py-2 outline-none focus:border-[#5B4FFF]/50 transition-colors"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={addManualExercise} disabled={!newExercise.name.trim()}
                className="flex items-center gap-2 text-sm text-[#7B6FFF] border border-[#5B4FFF]/30 px-4 py-2 rounded-lg hover:bg-[#5B4FFF]/10 transition-colors disabled:opacity-40"
              >
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
            <button onClick={() => setStep(1)} className="flex items-center gap-1.5 px-4 h-11 border border-white/10 text-gray-400 text-sm rounded-xl hover:border-white/20 transition-all">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 h-11 bg-[#5B4FFF] hover:bg-[#5B4FFF]/85 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              Próximo <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Cardio + extras + gerar */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-1.5">
              🏃 Cardio hoje? <span className="text-gray-600 font-normal">(opcional)</span>
            </p>
            <div className="bg-black/20 border border-white/5 rounded-xl p-4">
              <div className="flex gap-2 mb-3">
                {[{ value: 'min', label: 'Minutos' }, { value: 'km', label: 'Quilômetros' }].map(t => (
                  <button
                    key={t.value} onClick={() => setCardio(p => ({ ...p, type: t.value }))}
                    className={`flex-1 py-2 rounded-lg text-sm border transition-all ${
                      cardio.type === t.value ? 'bg-[#5B4FFF]/15 border-[#5B4FFF]/40 text-[#7B6FFF] font-semibold' : 'border-white/10 text-gray-400'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <input
                type="number" placeholder={cardio.type === 'km' ? 'Ex: 5' : 'Ex: 30'}
                value={cardio.value} onChange={e => setCardio(p => ({ ...p, value: e.target.value }))}
                className="w-full bg-black/30 border border-white/10 rounded-lg text-gray-300 placeholder-gray-600 text-sm px-3 py-2.5 outline-none focus:border-[#5B4FFF]/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-300 mb-2 block">
              🥦 O que você tem em casa? <span className="text-gray-600 font-normal">(opcional)</span>
            </label>
            <textarea
              value={ingredients} onChange={e => setIngredients(e.target.value)}
              placeholder="Ex: frango, arroz, ovo, brócolis…" rows={2}
              className="w-full bg-black/30 border border-white/10 rounded-xl text-gray-300 placeholder-gray-600 text-sm px-4 py-3 outline-none focus:border-[#5B4FFF]/50 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-300 mb-2 block">
              🚫 Restrições alimentares <span className="text-gray-600 font-normal">(opcional)</span>
            </label>
            <input
              type="text" value={restrictions} onChange={e => setRestrictions(e.target.value)}
              placeholder="Ex: sem glúten, sem lactose…"
              className="w-full bg-black/30 border border-white/10 rounded-xl text-gray-300 placeholder-gray-600 text-sm px-4 py-2.5 outline-none focus:border-[#5B4FFF]/50 transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">{error}</div>
          )}

          <div className="flex gap-2">
            <button onClick={() => setStep(2)} className="flex items-center gap-1.5 px-4 h-12 border border-white/10 text-gray-400 text-sm rounded-xl hover:border-white/20 transition-all">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <button
              onClick={handleGenerate} disabled={loading}
              className="flex-1 h-12 bg-[#5B4FFF] hover:bg-[#5B4FFF]/85 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
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

// ── Página principal ───────────────────────────────────────
const NutritionPage = () => {
  const [isPremium, setIsPremium]     = useState(false);
  const [usage, setUsage]             = useState({ used: 0, limit: DAILY_LIMIT });
  const [loadingMe, setLoadingMe]     = useState(true);
  const [plan, setPlan]               = useState(null);
  const [planIsPremium, setPlanIsPremium] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [routines, setRoutines]       = useState([]);
  const [allExercises, setAllExercises] = useState([]);

  useEffect(() => {
    // Usa getNutritionMe: o backend valida o premium via banco de dados,
    // não mais via localStorage (mais seguro e coerente).
    getNutritionMe()
      .then(data => {
        setIsPremium(data.isPremium);
        setUsage({ used: data.used, limit: data.limit });
        if (data.isPremium) {
          getRoutines().then(setRoutines).catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoadingMe(false));
  }, []);

  async function handleFreeGenerate(params) {
    if (!params.goal) { setError('Selecione um objetivo.'); return; }
    setLoading(true); setError(''); setPlan(null);
    try {
      const data = await generateFreePlan(params);
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
      const data = await generatePremiumPlan(params);
      setPlan(data.plan);
      setPlanIsPremium(true);
      // Coleta exercícios para o botão "Adicionar à rotina"
      const exs = [];
      params.workout?.routinesDone?.forEach(r => r.exercises?.forEach(e => exs.push(e)));
      params.workout?.manualExercises?.forEach(e => exs.push(e));
      setAllExercises(exs);
    } catch (err) {
      const d = err.response?.data;
      // 403 = não é premium (backend rejeitou)
      if (err.response?.status === 403) {
        setError('Este recurso é exclusivo para assinantes Premium.');
      } else {
        setError(d?.message || 'Erro ao gerar plano.');
      }
    }
    setLoading(false);
  }

  async function handleAddToRoutine(routineId) {
    try {
      await addExercisesToRoutine({ exercises: allExercises, routineId });
    } catch (err) {
      console.error('addToRoutine error:', err.message);
    }
  }

  if (loadingMe) {
    return (
      <div className="w-full min-h-screen bg-[#171717] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          {/* border-[3px] em vez de border-3 (inválido no Tailwind) */}
          <div className="w-8 h-8 border-[3px] border-[#5B4FFF]/30 border-t-[#5B4FFF] rounded-full animate-spin" />
          <span className="text-gray-500 text-sm">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#171717] pb-16">
      <div className="lg:px-24 md:px-16 px-4 pt-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1
              className="text-2xl font-bold text-gray-100 flex items-center gap-2"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
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