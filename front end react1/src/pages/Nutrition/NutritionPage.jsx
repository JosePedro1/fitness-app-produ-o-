import React, { useState, useRef } from 'react';
import {
  Utensils, ChefHat, Plus, X, Loader2,
  TrendingUp, TrendingDown, ChevronDown, ChevronUp,
  Beef, Flame, Leaf, Droplets, AlertCircle
} from 'lucide-react';

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Café da Manhã', emoji: '🌅' },
  { id: 'lunch',     label: 'Almoço',        emoji: '☀️' },
  { id: 'snack',     label: 'Café da Tarde',  emoji: '🍵' },
  { id: 'dinner',    label: 'Jantar',         emoji: '🌙' },
];

const GOALS = [
  { id: 'lose',    label: 'Emagrecer',  emoji: '📉', color: 'emerald' },
  { id: 'gain',    label: 'Engordar',   emoji: '📈', color: 'orange' },
  { id: 'maintain',label: 'Manter',    emoji: '⚖️', color: 'indigo' },
];

const INGREDIENT_SUGGESTIONS = [
  'frango', 'arroz', 'feijão', 'batata-doce', 'ovos', 'atum', 'aveia',
  'brócolis', 'espinafre', 'banana', 'maçã', 'leite', 'queijo', 'tomate',
  'alho', 'cebola', 'azeite', 'abobrinha', 'cenoura', 'carne moída',
  'peixe', 'camarão', 'lentilha', 'grão-de-bico', 'quinoa', 'iogurte',
];

const goalColorMap = {
  lose:     { ring: 'ring-emerald-500/40', bg: 'bg-emerald-500/15', border: 'border-emerald-500/40', text: 'text-emerald-300' },
  gain:     { ring: 'ring-orange-500/40',  bg: 'bg-orange-500/15',  border: 'border-orange-500/40',  text: 'text-orange-300' },
  maintain: { ring: 'ring-indigo-500/40',  bg: 'bg-indigo-500/15',  border: 'border-indigo-500/40',  text: 'text-indigo-300' },
};

const NutritionPage = () => {
  const [ingredients, setIngredients] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [goal, setGoal] = useState('lose');
  const [mealType, setMealType] = useState('lunch');
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState(null);
  const [expandNutrition, setExpandNutrition] = useState(false);
  const inputRef = useRef(null);

  const handleInputChange = (v) => {
    setInputValue(v);
    if (v.trim().length >= 2) {
      const f = INGREDIENT_SUGGESTIONS.filter(s =>
        s.toLowerCase().includes(v.toLowerCase()) && !ingredients.includes(s)
      );
      setFilteredSuggestions(f.slice(0, 6));
    } else {
      setFilteredSuggestions([]);
    }
  };

  const addIngredient = (name) => {
    const clean = name.trim().toLowerCase();
    if (clean && !ingredients.includes(clean)) {
      setIngredients(prev => [...prev, clean]);
    }
    setInputValue('');
    setFilteredSuggestions([]);
    inputRef.current?.focus();
  };

  const removeIngredient = (name) => {
    setIngredients(prev => prev.filter(i => i !== name));
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault();
      addIngredient(inputValue);
    }
    if (e.key === 'Backspace' && !inputValue && ingredients.length) {
      setIngredients(prev => prev.slice(0, -1));
    }
  };

  const mealLabel = MEAL_TYPES.find(m => m.id === mealType)?.label;
  const goalLabel = GOALS.find(g => g.id === goal)?.label;

  const generateRecipe = async () => {
    if (ingredients.length < 2) {
      setError('Adicione pelo menos 2 ingredientes para gerar uma receita.');
      return;
    }
    setError(null);
    setRecipe(null);
    setLoading(true);

    const prompt = `Você é um nutricionista e chef especializado em alimentação fitness. 
Crie uma receita de ${mealLabel} para alguém que quer ${goalLabel.toLowerCase()}.

Ingredientes disponíveis: ${ingredients.join(', ')}.

Responda APENAS em JSON válido, sem texto fora do JSON, sem markdown, sem backticks. O JSON deve seguir exatamente este formato:
{
  "name": "Nome criativo da receita",
  "servings": "X porção(ões)",
  "prep_time": "X minutos",
  "description": "Breve descrição apetitosa (2 frases)",
  "ingredients_used": ["ingrediente1 - quantidade", "ingrediente2 - quantidade"],
  "steps": ["Passo 1", "Passo 2", "Passo 3"],
  "tip": "Dica nutricional para quem quer ${goalLabel.toLowerCase()}",
  "nutrition_summary": {
    "calories": "XXX kcal",
    "protein": "XXg",
    "carbs": "XXg",
    "fat": "XXg"
  },
  "nutrition_detail": [
    { "ingredient": "nome", "calories": "XXX kcal", "protein": "XXg", "carbs": "XXg", "fat": "XXg" }
  ]
}`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Erro na API');
      }

      const text = data.content?.map(b => b.text || '').join('').trim();
      const cleaned = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      setRecipe(parsed);
      setExpandNutrition(false);
    } catch (e) {
      setError('Erro ao gerar a receita. Tente novamente.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const goalColors = goalColorMap[goal];
  const currentGoal = GOALS.find(g => g.id === goal);

  return (
    <div className="w-full min-h-screen bg-[#171717] lg:py-16 md:py-14 sm:py-12 py-10 lg:px-24 md:px-16 sm:px-6 px-4">

      {/* Header */}
      <div className="w-full flex justify-between items-center mb-8">
        <h1 className="lg:text-2xl md:text-xl text-lg font-semibold text-gray-200 flex items-center gap-x-2 bg-black/20 rounded-md py-2 px-4">
          <Utensils className="w-5 h-5 text-indigo-500" />
          Plano de Refeição com IA
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Coluna esquerda: formulário ── */}
        <div className="w-full lg:w-[420px] flex flex-col gap-5 shrink-0">

          {/* Objetivo */}
          <div className="bg-[#1d1d1d] border border-gray-800 rounded-2xl p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Meu objetivo</p>
            <div className="grid grid-cols-3 gap-2">
              {GOALS.map(g => {
                const isSelected = goal === g.id;
                const c = goalColorMap[g.id];
                return (
                  <button
                    key={g.id}
                    onClick={() => setGoal(g.id)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all duration-200 ${
                      isSelected ? `${c.bg} ${c.border} ring-1 ${c.ring}` : 'bg-black/20 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <span className="text-2xl">{g.emoji}</span>
                    <span className={`text-xs font-semibold ${isSelected ? c.text : 'text-gray-500'}`}>{g.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Refeição */}
          <div className="bg-[#1d1d1d] border border-gray-800 rounded-2xl p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Tipo de refeição</p>
            <div className="grid grid-cols-2 gap-2">
              {MEAL_TYPES.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMealType(m.id)}
                  className={`flex items-center gap-2 py-2.5 px-4 rounded-xl border transition-all duration-200 ${
                    mealType === m.id
                      ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                      : 'bg-black/20 border-gray-800 text-gray-500 hover:border-gray-700'
                  }`}
                >
                  <span>{m.emoji}</span>
                  <span className="text-sm font-medium">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Ingredientes */}
          <div className="bg-[#1d1d1d] border border-gray-800 rounded-2xl p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">
              Ingredientes que você tem em casa
            </p>

            {/* Campo de input com tags */}
            <div
              className="min-h-[52px] bg-black/30 border border-gray-700 rounded-xl px-3 py-2 flex flex-wrap gap-1.5 cursor-text focus-within:border-indigo-500/60 transition-colors duration-200"
              onClick={() => inputRef.current?.focus()}
            >
              {ingredients.map(ing => (
                <span key={ing} className="flex items-center gap-1 bg-indigo-600/25 border border-indigo-500/30 text-indigo-300 text-xs font-medium px-2.5 py-1 rounded-lg">
                  {ing}
                  <button onClick={(e) => { e.stopPropagation(); removeIngredient(ing); }} className="hover:text-red-400 transition-colors">
                    <X size={11} />
                  </button>
                </span>
              ))}
              <input
                ref={inputRef}
                value={inputValue}
                onChange={e => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={ingredients.length === 0 ? 'Digite um ingrediente e pressione Enter...' : ''}
                className="flex-1 min-w-[120px] bg-transparent text-sm text-gray-300 placeholder-gray-600 outline-none py-0.5"
              />
            </div>

            {/* Sugestões autocomplete */}
            {filteredSuggestions.length > 0 && (
              <div className="mt-1 bg-[#252525] border border-gray-700 rounded-xl overflow-hidden">
                {filteredSuggestions.map(s => (
                  <button
                    key={s}
                    onClick={() => addIngredient(s)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-indigo-600/20 hover:text-indigo-300 transition-colors flex items-center gap-2"
                  >
                    <Plus size={12} className="text-gray-600" />
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Sugestões rápidas */}
            <div className="mt-3">
              <p className="text-xs text-gray-600 mb-2">Sugestões rápidas:</p>
              <div className="flex flex-wrap gap-1.5">
                {INGREDIENT_SUGGESTIONS.filter(s => !ingredients.includes(s)).slice(0, 8).map(s => (
                  <button
                    key={s}
                    onClick={() => addIngredient(s)}
                    className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 px-2.5 py-1 rounded-lg border border-gray-700 transition-all duration-150"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Erro */}
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Botão gerar */}
          <button
            onClick={generateRecipe}
            disabled={loading || ingredients.length < 2}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
              loading || ingredients.length < 2
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/35 hover:-translate-y-0.5'
            }`}
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Gerando receita...</>
            ) : (
              <><ChefHat size={18} /> Gerar Receita com IA</>
            )}
          </button>
        </div>

        {/* ── Coluna direita: resultado ── */}
        <div className="flex-1 w-full">
          {!recipe && !loading && (
            <div className="h-full flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border border-indigo-500/20 flex items-center justify-center mb-5">
                <ChefHat className="w-10 h-10 text-indigo-400" />
              </div>
              <p className="text-gray-400 font-medium mb-2">Sua receita aparecerá aqui</p>
              <p className="text-gray-600 text-sm max-w-xs">Adicione pelo menos 2 ingredientes, escolha seu objetivo e clique em Gerar Receita.</p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center py-20 text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
              </div>
              <div>
                <p className="text-gray-300 font-medium">Criando sua receita personalizada...</p>
                <p className="text-gray-600 text-sm mt-1">A IA está considerando seu objetivo de {goalLabel?.toLowerCase()}</p>
              </div>
            </div>
          )}

          {recipe && !loading && (
            <div className="flex flex-col gap-5">
              {/* Card principal */}
              <div className={`bg-[#1d1d1d] border ${goalColors.border} rounded-2xl overflow-hidden`}>
                {/* Header da receita */}
                <div className={`px-6 py-5 ${goalColors.bg} border-b border-gray-800`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{currentGoal?.emoji}</span>
                        <span className={`text-xs font-semibold uppercase tracking-wider ${goalColors.text}`}>
                          {goalLabel} · {mealLabel}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-white">{recipe.name}</h2>
                      <p className="text-gray-400 text-sm mt-1">{recipe.description}</p>
                    </div>
                    <div className="flex flex-col gap-1 text-right shrink-0">
                      <span className="text-xs text-gray-500">{recipe.servings}</span>
                      <span className="text-xs text-gray-500">⏱ {recipe.prep_time}</span>
                    </div>
                  </div>
                </div>

                {/* Nutrição resumida */}
                <div className="px-6 py-4 grid grid-cols-4 gap-3 border-b border-gray-800">
                  {[
                    { icon: <Flame size={15} className="text-orange-400" />, label: 'Calorias', value: recipe.nutrition_summary?.calories },
                    { icon: <Beef size={15} className="text-red-400" />,    label: 'Proteína', value: recipe.nutrition_summary?.protein },
                    { icon: <Leaf size={15} className="text-emerald-400" />,label: 'Carbs',    value: recipe.nutrition_summary?.carbs },
                    { icon: <Droplets size={15} className="text-blue-400" />,label: 'Gordura', value: recipe.nutrition_summary?.fat },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="flex flex-col items-center gap-1 py-2 bg-black/20 rounded-xl">
                      {icon}
                      <span className="text-sm font-bold text-gray-100 tabular-nums">{value || '—'}</span>
                      <span className="text-xs text-gray-600">{label}</span>
                    </div>
                  ))}
                </div>

                <div className="px-6 py-5 flex flex-col gap-5">
                  {/* Ingredientes */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Leaf size={14} className="text-emerald-400" />
                      Ingredientes
                    </h3>
                    <ul className="flex flex-col gap-1.5">
                      {recipe.ingredients_used?.map((ing, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                          {ing}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Modo de preparo */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <ChefHat size={14} className="text-indigo-400" />
                      Modo de Preparo
                    </h3>
                    <ol className="flex flex-col gap-3">
                      {recipe.steps?.map((step, i) => (
                        <li key={i} className="flex gap-3 text-sm text-gray-300">
                          <span className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Dica */}
                  {recipe.tip && (
                    <div className={`${goalColors.bg} border ${goalColors.border} rounded-xl px-4 py-3 flex gap-3`}>
                      {goal === 'lose' ? <TrendingDown size={16} className="text-emerald-400 shrink-0 mt-0.5" /> : <TrendingUp size={16} className="text-orange-400 shrink-0 mt-0.5" />}
                      <p className="text-sm text-gray-300">{recipe.tip}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tabela nutricional expandível */}
              {recipe.nutrition_detail?.length > 0 && (
                <div className="bg-[#1d1d1d] border border-gray-800 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setExpandNutrition(e => !e)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-black/20 transition-colors duration-200"
                  >
                    <span className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                      <Flame size={15} className="text-orange-400" />
                      Tabela Nutricional Completa por Ingrediente
                    </span>
                    {expandNutrition ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                  </button>

                  {expandNutrition && (
                    <div className="px-6 pb-5 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-800">
                            {['Ingrediente', 'Calorias', 'Proteína', 'Carbs', 'Gordura'].map(h => (
                              <th key={h} className="text-left py-2 px-3 text-xs text-gray-500 uppercase tracking-wider font-semibold first:pl-0 last:pr-0">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {recipe.nutrition_detail.map((row, i) => (
                            <tr key={i} className={`border-b border-gray-800/50 ${i % 2 === 0 ? '' : 'bg-black/10'}`}>
                              <td className="py-2.5 px-3 text-gray-300 font-medium first:pl-0 capitalize">{row.ingredient}</td>
                              <td className="py-2.5 px-3 text-orange-300 tabular-nums">{row.calories}</td>
                              <td className="py-2.5 px-3 text-red-300 tabular-nums">{row.protein}</td>
                              <td className="py-2.5 px-3 text-emerald-300 tabular-nums">{row.carbs}</td>
                              <td className="py-2.5 px-3 text-blue-300 tabular-nums last:pr-0">{row.fat}</td>
                            </tr>
                          ))}
                          {/* Total */}
                          <tr className="bg-indigo-600/10">
                            <td className="py-2.5 pl-0 text-indigo-300 font-bold text-xs uppercase tracking-wider">Total</td>
                            <td className="py-2.5 px-3 text-orange-200 font-bold tabular-nums">{recipe.nutrition_summary?.calories}</td>
                            <td className="py-2.5 px-3 text-red-200 font-bold tabular-nums">{recipe.nutrition_summary?.protein}</td>
                            <td className="py-2.5 px-3 text-emerald-200 font-bold tabular-nums">{recipe.nutrition_summary?.carbs}</td>
                            <td className="py-2.5 pr-0 px-3 text-blue-200 font-bold tabular-nums">{recipe.nutrition_summary?.fat}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Gerar outra */}
              <button
                onClick={generateRecipe}
                disabled={loading}
                className="w-full py-3 rounded-xl border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/10 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <ChefHat size={16} />
                Gerar outra receita com os mesmos ingredientes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NutritionPage;
