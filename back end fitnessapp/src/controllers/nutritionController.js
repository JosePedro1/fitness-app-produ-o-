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

  return `Você é nutricionista fitness. Crie um plano alimentar semanal genérico em JSON.
Objetivo: ${goalMap[goal] || 'Alimentação saudável'}.
${ingredients?.trim() ? `Ingredientes disponíveis: ${ingredients}.` : 'Use alimentos comuns do Brasil.'}
${restrictions?.trim() ? `Restrições: ${restrictions}.` : ''}
Refeições por dia: ${numMeals}.

REGRAS CRÍTICAS:
- Responda APENAS com JSON puro válido, sem markdown, sem texto antes ou depois
- Valores numéricos REAIS (nunca strings como "150g", use apenas 150)
- Mantenha cada campo curto para não truncar o JSON
- Use nomes de itens curtos (máx 50 chars cada)

{"objetivo":"descrição breve","macros":{"proteina_g":150,"carbo_g":200,"gordura_g":60,"calorias":2000},"refeicoes":[{"nome":"Café da manhã","horario":"07:00","itens":["2 ovos mexidos","1 pão integral","1 banana"],"calorias_aprox":350,"dica":"dica curta"}],"dicas_gerais":["dica 1","dica 2","dica 3"],"lista_compras":["item 1","item 2"]}

Gere exatamente ${numMeals} refeições. Seja conciso nos textos.`;
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
    : 'Café da manhã, Almoço, Lanche da tarde, Jantar';

  const numMeals = selectedMeals?.length || 4;

  // Treino (resumido para economizar tokens)
  let workoutDesc = 'Descanso.';
  const routineNames = workout?.routinesDone?.map(r => r.name) || [];
  const manualNames  = workout?.manualExercises?.map(e => e.name) || [];
  const allExNames   = [...routineNames, ...manualNames];
  if (allExNames.length > 0) {
    workoutDesc = allExNames.join(', ');
  }

  const cardioDesc = (cardio?.value > 0)
    ? `Cardio: ${cardio.value}${cardio.type === 'km' ? 'km' : 'min'}.`
    : '';

  // Cálculo de hidratação
  const waterMl = weight ? Math.round(parseFloat(weight) * 35 + (cardio?.value > 0 ? 500 : 0)) : 2500;
  const waterCopos = Math.round(waterMl / 250);

  return `Nutricionista fitness. Plano alimentar PERSONALIZADO para hoje. Responda SOMENTE JSON puro válido.

${profileDesc}
Biótipo: ${biotypeMap[biotype] || 'Mesomorfo'}
Objetivo: ${goalMap[goal] || 'Saúde geral'}
${ingredients?.trim() ? `Ingredientes: ${ingredients}.` : ''}
${restrictions?.trim() ? `Restrições: ${restrictions}.` : ''}
Treino hoje: ${workoutDesc}
${cardioDesc}
Refeições (gere EXATAMENTE ${numMeals}, nesta ordem): ${mealsToGenerate}

REGRAS CRÍTICAS:
- JSON puro apenas, sem markdown, sem texto adicional
- Todos os valores numéricos devem ser inteiros reais (nunca strings)
- Textos CURTOS: objetivo máx 100 chars, dicas máx 80 chars cada, itens máx 40 chars cada
- Gere exatamente ${numMeals} refeições no array refeicoes

{"objetivo":"descrição curta com TDEE ${tdee}kcal e meta do dia","macros":{"proteina_g":180,"carbo_g":250,"gordura_g":65,"calorias":${tdee}},"gasto_treino_kcal":400,"agua":{"ml":${waterMl},"copos":${waterCopos},"obs":"obs curta"},"refeicoes":[{"nome":"Café da manhã","horario":"07:00","itens":["item curto","item curto"],"calorias_aprox":500,"dica":"dica curta"}],"dicas_gerais":["dica 1","dica 2"],"lista_compras_diaria":[{"item":"Frango","quantidade":"200g"}]}`;
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

    const plan = await callGroq(buildFreePrompt({ goal, ingredients, restrictions, meals }), 1500);
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
      4000  // ← aumentado: plano premium tem mais campos
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

// ── Helper: chama Groq ────────────────────────────────────
async function callGroq(prompt, maxTokens = 2000) {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) throw new Error('Chave da IA não configurada.');

  const aiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${groqKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-70b-versatile',  // modelo maior = JSON mais estável
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