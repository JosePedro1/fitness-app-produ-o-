import supabase from '../config/supabase.js';

const DAILY_FREE_LIMIT = 3;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ── Prompts ────────────────────────────────────────────────

function buildFreePrompt({ goal, ingredients, restrictions, meals }) {
  const goalMap = {
    emagrecer:  'Emagrecimento com déficit calórico e alto teor de proteína',
    massa:      'Ganho de massa com superávit calórico, proteína e carboidratos altos',
    manutencao: 'Manutenção do peso com equilíbrio calórico',
    saude:      'Alimentação saudável e balanceada',
  };

  const numMeals = parseInt(meals) || 3;

  return `Você é nutricionista fitness. Crie um plano alimentar diário em JSON.
Objetivo: ${goalMap[goal] || 'Alimentação saudável'}.
${ingredients?.trim() ? `Ingredientes disponíveis: ${ingredients}.` : 'Use alimentos comuns do Brasil.'}
${restrictions?.trim() ? `Restrições: ${restrictions}.` : ''}
Refeições por dia: ${numMeals}.

REGRAS: JSON puro apenas, sem markdown. Valores numéricos REAIS (nunca strings).

{"objetivo":"descrição + estimativa calórica","macros":{"proteina_g":150,"carbo_g":200,"gordura_g":60,"calorias":2000},"refeicoes":[{"nome":"Café da manhã","horario":"07:00","itens":["2 ovos mexidos","1 fatia de pão integral","1 banana"],"calorias_aprox":350,"dica":"dica prática"}],"dicas_gerais":["dica 1","dica 2","dica 3"],"lista_compras":["item 1","item 2"]}

Gere exatamente ${numMeals} refeições com itens detalhados e porções precisas.`;
}

function buildPremiumPrompt({ goal, biotype, workout, cardio, ingredients, restrictions, profile, selectedMeals }) {
  const goalMap = {
    emagrecer:  'Emagrecimento — perder gordura preservando massa muscular',
    massa:      'Ganho de massa muscular — superávit calórico com proteína alta',
    manutencao: 'Manutenção — equilíbrio calórico e composição corporal',
    saude:      'Saúde geral — alimentação balanceada e energia',
  };

  const biotypeMap = {
    ectomorfo:  'Ectomorfo (metabolismo acelerado, precisa de mais carboidratos)',
    mesomorfo:  'Mesomorfo (metabolismo equilibrado, proteína moderada-alta)',
    endomorfo:  'Endomorfo (metabolismo lento, carboidratos controlados, proteína alta)',
  };

  const activityMap = {
    sedentario: 'Sedentário',
    leve:       'Levemente ativo (1-3x/semana)',
    moderado:   'Moderadamente ativo (3-5x/semana)',
    intenso:    'Muito ativo (6-7x/semana)',
  };

  // Perfil físico e cálculo TMB
  const { weight, height, age, gender, activityLevel } = profile || {};
  let profileDesc = '';
  let tdee = 2000;
  if (weight && height && age) {
    const genderStr = gender === 'f' ? 'Feminino' : 'Masculino';
    const w = parseFloat(weight), h = parseFloat(height), a = parseInt(age);
    const tmb = gender === 'f'
      ? 655 + (9.563 * w) + (1.85 * h) - (4.676 * a)
      : 66 + (13.756 * w) + (5.003 * h) - (6.755 * a);
    const actFactor = { sedentario: 1.2, leve: 1.375, moderado: 1.55, intenso: 1.725 }[activityLevel] || 1.55;
    tdee = Math.round(tmb * actFactor);
    profileDesc = `Perfil: ${genderStr}, ${a} anos, ${w}kg, ${h}cm. TDEE: ${tdee} kcal.`;
  }

  // Refeições escolhidas
  const mealsToGenerate = selectedMeals?.length > 0
    ? selectedMeals.join(', ')
    : 'Café da manhã, Lanche da manhã, Almoço, Lanche da tarde, Jantar, Ceia';

  const numMeals = selectedMeals?.length || 6;

  // Treino detalhado
  let workoutDesc = '';
  if (workout?.routinesDone?.length > 0) {
    workoutDesc += 'Rotinas realizadas hoje:\n';
    workout.routinesDone.forEach(r => {
      workoutDesc += `- ${r.name}\n`;
      if (r.exercises?.length > 0) {
        r.exercises.forEach(e => {
          const d = [];
          if (e.sets)   d.push(`${e.sets} séries`);
          if (e.weight) d.push(`${e.weight}kg`);
          if (e.rest)   d.push(`descanso ${e.rest}s`);
          workoutDesc += `  • ${e.name}${d.length ? ` (${d.join(', ')})` : ''}\n`;
        });
      }
    });
  }
  if (workout?.manualExercises?.length > 0) {
    workoutDesc += 'Exercícios avulsos:\n';
    workout.manualExercises.forEach(e => {
      const d = [];
      if (e.sets)   d.push(`${e.sets} séries`);
      if (e.weight) d.push(`${e.weight}kg`);
      if (e.rest)   d.push(`descanso ${e.rest}s`);
      workoutDesc += `- ${e.name}${d.length ? ` (${d.join(', ')})` : ''}\n`;
    });
  }
  if (!workoutDesc) workoutDesc = 'Dia de descanso (sem treino registrado).';

  const cardioDesc = (() => {
    if (!cardio || !cardio.value || cardio.value <= 0) {
      return 'Sem cardio hoje — dia de treino de força apenas.';
    }
    if (cardio.type === 'km') {
      const kcal = Math.round(cardio.value * 60); // ~60 kcal/km correndo
      return `Cardio: ${cardio.value} km corridos (gasto estimado: ~${kcal} kcal). Inclua este gasto no cálculo calórico total do dia.`;
    } else {
      const kcal = Math.round(cardio.value * 8); // ~8 kcal/min cardio moderado
      return `Cardio: ${cardio.value} minutos de atividade cardiovascular (gasto estimado: ~${kcal} kcal). Inclua este gasto no cálculo calórico total do dia.`;
    }
  })();

  return `Você é nutricionista fitness especializado em periodização nutricional. Crie um plano alimentar PERSONALIZADO e PRECISO para HOJE.

${profileDesc}
Biótipo: ${biotypeMap[biotype] || 'Mesomorfo'}
Objetivo: ${goalMap[goal] || 'Saúde geral'}
${ingredients?.trim() ? `Ingredientes disponíveis: ${ingredients}.` : 'Use alimentos comuns e acessíveis do Brasil.'}
${restrictions?.trim() ? `Restrições alimentares: ${restrictions}.` : ''}

TREINO DE HOJE:
${workoutDesc}
${cardioDesc}

REFEIÇÕES DO DIA (gere EXATAMENTE estas ${numMeals} refeições, nesta ordem):
${mealsToGenerate}

INSTRUÇÕES OBRIGATÓRIAS:
- Calcule o gasto calórico do treino baseado nos exercícios listados: pesos, séries, repetições e descanso determinam a intensidade. Quanto maior o volume (séries × peso × reps), maior o gasto estimado. Registre em gasto_treino_kcal o valor calculado.
- Distribua as calorias proporcionalmente entre as refeições escolhidas
- Ajuste os macros pelo biótipo: ectomorfo (+carbo), endomorfo (-carbo +proteína), mesomorfo (equilibrado)
- Em treino pesado: +15-20% carboidratos, proteína alta pós-treino
- Em descanso: -10% calorias, manter proteína
- Calcule a hidratação: 35ml por kg de peso + 500ml por hora de treino
- Lista de compras DIÁRIA com quantidades exatas para 1 dia (ex: "Frango — 200g", "Ovos — 3 unidades")
- Cada refeição deve ter ao menos 3 itens detalhados com porções (ex: "3 ovos mexidos", "200g de frango grelhado")
- As dicas devem ser específicas para o treino e objetivo do usuário

REGRAS: JSON puro apenas, sem markdown. Todos os valores numéricos devem ser números inteiros reais.

{"objetivo":"descrição com TDEE, gasto do treino e meta calórica do dia","macros":{"proteina_g":180,"carbo_g":250,"gordura_g":65,"calorias":2400},"gasto_treino_kcal":450,"lista_compras_diaria":[{"item":"Peito de frango","quantidade":"200g"},{"item":"Ovos","quantidade":"3 unidades"},{"item":"Arroz integral","quantidade":"100g cru"},{"item":"Brócolis","quantidade":"150g"},{"item":"Azeite","quantidade":"30ml"},{"item":"Banana","quantidade":"2 unidades"}],"agua":{"ml":3200,"copos":13,"obs":"Beba 1 copo extra a cada 30min de treino"},"refeicoes":[{"nome":"Café da manhã","horario":"07:00","itens":["3 ovos mexidos","2 fatias de pão integral com pasta de amendoim","1 banana média","1 copo de leite desnatado (200ml)"],"calorias_aprox":520,"dica":"Refeição pré-treino: carboidratos de baixo IG + proteína"}],"dicas_gerais":["dica específica baseada no treino de hoje","dica sobre timing de nutrientes","dica sobre recuperação muscular"]}

Gere exatamente ${numMeals} refeições no array refeicoes.`;
}

// ── POST /nutrition/generate (FREE) ───────────────────────
export const generate = async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json().catch(() => ({}));
    const { goal, ingredients, restrictions, meals } = body;

    if (!goal) return c.json({ error: 'Informe o objetivo.' }, 400);

    const { data: userData } = await supabase
      .from('users')
      .select('is_premium, premium_expires_at')
      .eq('user_id', user.user_id)
      .single();

    const isPremium = userData?.is_premium &&
      (!userData.premium_expires_at || new Date(userData.premium_expires_at) > new Date());

    if (!isPremium) {
      const { count } = await supabase
        .from('nutrition_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.user_id)
        .eq('date', todayStr());

      if ((count || 0) >= DAILY_FREE_LIMIT) {
        return c.json({
          error: 'limite_atingido',
          message: `Você usou seus ${DAILY_FREE_LIMIT} planos gratuitos de hoje. Assine o Premium para uso ilimitado.`,
          used: count,
          limit: DAILY_FREE_LIMIT,
        }, 429);
      }
    }

    const plan = await callGroq(buildFreePrompt({ goal, ingredients, restrictions, meals }), 1500, false);
    if (!plan) return c.json({ error: 'Erro ao gerar plano. Tente novamente.' }, 500);

    const { error: logError } = await supabase.from('nutrition_logs').insert({
      user_id: user.user_id,
      date: todayStr(),
      goal,
      is_premium: false,
      plan: JSON.stringify(plan),
    });
    if (logError) console.error('Erro ao salvar nutrition_log:', logError.message);

    return c.json({ plan, isPremium: false });
  } catch (error) {
    console.error('generate error:', error);
    return c.json({ error: error.message }, 500);
  }
};

// ── POST /nutrition/generate-premium ──────────────────────
export const generatePremium = async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json().catch(() => ({}));
    const { goal, biotype, workout, cardio, ingredients, restrictions, profile, selectedMeals } = body;

    if (!goal)    return c.json({ error: 'Informe o objetivo.' }, 400);
    if (!biotype) return c.json({ error: 'Informe o biótipo.' }, 400);

    // Validação premium via banco de dados
    const { data: userData } = await supabase
      .from('users')
      .select('is_premium, premium_expires_at')
      .eq('user_id', user.user_id)
      .single();

    const isPremium = userData?.is_premium === true &&
      (!userData.premium_expires_at || new Date(userData.premium_expires_at) > new Date());

    if (!isPremium) {
      return c.json({ error: 'Recurso exclusivo para assinantes Premium.', upgrade: true }, 403);
    }

    const plan = await callGroq(
      buildPremiumPrompt({ goal, biotype, workout, cardio, ingredients, restrictions, profile, selectedMeals }),
      6000, // tokens suficientes para plano completo com lista de compras
      true   // usa llama-3.3-70b-versatile
    );
    if (!plan) return c.json({ error: 'Erro ao gerar plano. Tente novamente.' }, 500);

    const { error: logError } = await supabase.from('nutrition_logs').insert({
      user_id: user.user_id,
      date: todayStr(),
      goal,
      is_premium: true,
      plan: JSON.stringify(plan),
    });
    if (logError) console.error('Erro ao salvar nutrition_log:', logError.message);

    return c.json({ plan, isPremium: true });
  } catch (error) {
    console.error('generatePremium error:', error);
    return c.json({ error: error.message }, 500);
  }
};

// ── POST /nutrition/add-to-routine ────────────────────────
export const addToRoutine = async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json().catch(() => ({}));
    const { exercises, routineId } = body;

    if (!exercises?.length) return c.json({ error: 'Nenhum exercício informado.' }, 400);

    if (routineId) {
      const exercisesToInsert = exercises.map(e => ({
        exercise: e.name,
        completed: true,
        user_id: user.user_id,
        routine_id: routineId,
      }));
      const { error } = await supabase.from('exercises').insert(exercisesToInsert);
      if (error) return c.json({ error: error.message }, 500);
      return c.json({ message: 'Exercícios adicionados à rotina.' });
    }

    const today = new Date();
    const weekDay = today.toLocaleDateString('pt-BR', { weekday: 'long' });
    const { data: routine, error: routineError } = await supabase
      .from('routines')
      .insert([{ name: `Treino de hoje (${weekDay})`, user_id: user.user_id, week_days: [], reminder_time: null }])
      .select()
      .single();

    if (routineError) return c.json({ error: routineError.message }, 500);

    const exercisesToInsert = exercises.map(e => ({
      exercise: e.name,
      completed: true,
      user_id: user.user_id,
      routine_id: routine.id,
    }));
    const { error: exError } = await supabase.from('exercises').insert(exercisesToInsert);
    if (exError) return c.json({ error: exError.message }, 500);

    return c.json({ message: 'Rotina criada com os exercícios de hoje.', routine });
  } catch (error) {
    console.error('addToRoutine error:', error);
    return c.json({ error: error.message }, 500);
  }
};

// ── GET /nutrition/usage ───────────────────────────────────
export const getUsage = async (c) => {
  try {
    const user = c.get('user');
    const { count } = await supabase
      .from('nutrition_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.user_id)
      .eq('date', todayStr());

    return c.json({ used: count || 0, limit: DAILY_FREE_LIMIT });
  } catch (error) {
    console.error('getUsage error:', error);
    return c.json({ error: error.message }, 500);
  }
};

// ── GET /nutrition/history ─────────────────────────────────
export const getHistory = async (c) => {
  try {
    const user = c.get('user');
    const { data } = await supabase
      .from('nutrition_logs')
      .select('id, date, goal, created_at, plan')
      .eq('user_id', user.user_id)
      .order('created_at', { ascending: false })
      .limit(10);

    return c.json({ history: data || [] });
  } catch (error) {
    console.error('getHistory error:', error);
    return c.json({ error: error.message }, 500);
  }
};

// ── GET /nutrition/me ──────────────────────────────────────
export const getMe = async (c) => {
  try {
    const user = c.get('user');

    const { data: userData } = await supabase
      .from('users')
      .select('is_premium, premium_expires_at')
      .eq('user_id', user.user_id)
      .single();

    const isPremium = userData?.is_premium === true &&
      (!userData.premium_expires_at || new Date(userData.premium_expires_at) > new Date());

    const { count: usedToday } = await supabase
      .from('nutrition_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.user_id)
      .eq('date', todayStr());

    return c.json({
      isPremium,
      premiumExpiresAt: userData?.premium_expires_at || null,
      used: usedToday || 0,
      limit: DAILY_FREE_LIMIT,
    });
  } catch (error) {
    console.error('getMe error:', error);
    return c.json({ error: error.message }, 500);
  }
};

// ── Helper: repara JSON truncado ───────────────────────────
/**
 * Tenta reparar JSON cortado pelo limite de tokens do Groq.
 * Estratégia: fecha arrays e objetos abertos na ordem inversa.
 */
function repairTruncatedJSON(raw) {
  // Remove markdown e espaços
  let text = raw.replace(/```json/gi, '').replace(/```/g, '').trim();

  // Extrai o primeiro bloco JSON encontrado (mesmo que incompleto)
  const start = text.indexOf('{');
  if (start === -1) return null;
  text = text.slice(start);

  // Tenta parse direto primeiro
  try {
    return JSON.parse(text);
  } catch (_) {
    // Continua para reparação
  }

  // Remove vírgulas soltas antes de fechar (ex: ,"} ou ,])
  text = text.replace(/,\s*([}\]])/g, '$1');

  // Fecha strings abertas: se termina com " sem fechar
  const quoteCount = (text.match(/(?<!\\)"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    text += '"';
  }

  // Conta abre/fecha para completar
  let openBraces   = 0;
  let openBrackets = 0;
  let inString     = false;
  let escape       = false;

  for (const ch of text) {
    if (escape)          { escape = false; continue; }
    if (ch === '\\')     { escape = true;  continue; }
    if (ch === '"')      { inString = !inString; continue; }
    if (inString)        continue;
    if (ch === '{')      openBraces++;
    else if (ch === '}') openBraces--;
    else if (ch === '[') openBrackets++;
    else if (ch === ']') openBrackets--;
  }

  // Remove vírgula solta no final antes de fechar
  text = text.replace(/,\s*$/, '');

  // Fecha o que ficou aberto
  text += ']'.repeat(Math.max(0, openBrackets));
  text += '}'.repeat(Math.max(0, openBraces));

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('repairTruncatedJSON falhou:', e.message, text.slice(-200));
    return null;
  }
}

// Modelos Groq ativos (junho 2026)
// Free:    llama-3.1-8b-instant   — rápido, leve, rate limit menor
// Premium: llama-3.3-70b-versatile — qualidade, JSON mais estável
const GROQ_MODEL_FREE    = 'llama-3.1-8b-instant';
const GROQ_MODEL_PREMIUM = 'llama-3.3-70b-versatile';

// ── Helper: chama Groq ────────────────────────────────────
async function callGroq(prompt, maxTokens = 2000, isPremium = false) {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) throw new Error('Chave da IA não configurada.');

  const model = isPremium ? GROQ_MODEL_PREMIUM : GROQ_MODEL_FREE;

  const aiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${groqKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature: 0.2,                   // menos criatividade = JSON mais previsível
      messages: [
        {
          role: 'system',
          content: 'Você é nutricionista fitness. Responda SEMPRE e SOMENTE com JSON puro válido, sem markdown, sem texto adicional. Seja conciso para não truncar o JSON.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!aiRes.ok) {
    const err = await aiRes.json().catch(() => ({}));
    console.error('Groq error:', JSON.stringify(err));
    return null;
  }

  const aiData = await aiRes.json();
  const finishReason = aiData.choices?.[0]?.finish_reason;
  const rawText = aiData.choices?.[0]?.message?.content || '';

  if (finishReason === 'length') {
    console.warn('Groq truncou a resposta (finish_reason: length). Tentando reparar JSON…');
  }

  const parsed = repairTruncatedJSON(rawText);
  if (!parsed) {
    console.error('Sem JSON válido após reparo. Raw (200 chars):', rawText.slice(0, 200));
  }
  return parsed;
}