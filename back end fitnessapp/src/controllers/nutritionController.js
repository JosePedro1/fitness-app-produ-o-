import { supabaseAdmin as supabase } from '../config/supabase.js';

const DAILY_FREE_LIMIT = 3;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ── Modelos Groq ───────────────────────────────────────────
// Free:    llama-3.1-8b-instant   — rápido, rate limit menor
// Premium: llama-3.3-70b-versatile — qualidade, JSON mais estável
const GROQ_MODEL_FREE    = 'llama-3.1-8b-instant';
const GROQ_MODEL_PREMIUM = 'llama-3.3-70b-versatile';

// Tokens garantidos por número de refeições (free usa modelo menor, precisa de margem maior)
// Fórmula: ~400 tokens por refeição + 800 de overhead (macros, dicas, lista de compras)
// Free multiplica por 1.4 (modelo 8b é menos eficiente na geração de JSON denso)
function calcTokens(numMeals, isPremium) {
  const base = numMeals * 400 + 800;
  return isPremium ? base : Math.ceil(base * 1.4);
}

// ── Sanitização de ingredientes ────────────────────────────
// Remove nomes próprios (ex: "Yasmin") antes de passar para a IA.
// Retorna { safe: string, suspects: string[] }
function parseIngredients(raw) {
  if (!raw?.trim()) return { safe: '', suspects: [] };

  const tokens = raw.split(/[,;\n]+/).map(t => t.trim()).filter(t => t.length >= 2);
  const suspects = [];
  const safe = [];

  for (const token of tokens) {
    // Nome próprio: começa com maiúscula, só letras (com ou sem acentos), sem dígitos
    const isProperNoun = /^[A-ZÁÀÃÂÉÊÍÓÔÕÚÇ][a-záàãâéêíóôõúç]{2,}$/.test(token) && !/\d/.test(token);
    if (isProperNoun) {
      suspects.push(token);
    } else {
      safe.push(token);
    }
  }

  return { safe: safe.join(', '), suspects };
}

// ── Validação de perfil físico ─────────────────────────────
// Retorna null se válido, ou string de erro se inválido.
function validateProfile(profile) {
  const { weight, height, age } = profile || {};
  const w = parseFloat(weight);
  const h = parseFloat(height);
  const a = parseInt(age);

  if (!weight || isNaN(w) || w < 30 || w > 300)
    return 'Peso inválido. Informe entre 30 e 300 kg.';
  if (!height || isNaN(h) || h < 100 || h > 250)
    return 'Altura inválida. Informe entre 100 e 250 cm.';
  if (!age || isNaN(a) || a < 10 || a > 100)
    return 'Idade inválida. Informe entre 10 e 100 anos.';

  return null;
}

// ── Prompts ────────────────────────────────────────────────

function buildFreePrompt({ goal, ingredients, restrictions, meals }) {
  const goalMap = {
    emagrecer:  'Emagrecimento — déficit calórico, proteína alta',
    massa:      'Ganho de massa — superávit calórico, carboidratos e proteína altos',
    manutencao: 'Manutenção — equilíbrio calórico',
    saude:      'Saúde geral — alimentação balanceada',
  };

  const numMeals = Math.min(Math.max(parseInt(meals) || 3, 2), 6);
  const { safe: safeIngredients } = parseIngredients(ingredients);

  // Prompt compacto: menos tokens de input = mais tokens disponíveis para output
  return `Nutricionista fitness. Plano diário em JSON puro, sem markdown.
Objetivo: ${goalMap[goal]}.
${safeIngredients ? `Ingredientes: ${safeIngredients}.` : 'Alimentos comuns do Brasil.'}
${restrictions?.trim() ? `Restrições: ${restrictions.trim()}.` : ''}
Gere ${numMeals} refeições.

Regras: JSON somente. Números reais (nunca strings). "itens" = array de strings simples ("200g frango grelhado").

{"objetivo":"...kcal/dia","macros":{"proteina_g":0,"carbo_g":0,"gordura_g":0,"calorias":0},"refeicoes":[{"nome":"...","horario":"00:00","itens":["..."],"calorias_aprox":0,"dica":"..."}],"dicas_gerais":["..."],"lista_compras":["..."]}`;
}

function buildPremiumPrompt({ goal, biotype, workout, cardio, ingredients, restrictions, profile, selectedMeals }) {
  const goalMap = {
    emagrecer:  'Emagrecimento — déficit calórico, preservar massa muscular',
    massa:      'Ganho de massa — superávit calórico, proteína alta',
    manutencao: 'Manutenção — equilíbrio calórico e composição corporal',
    saude:      'Saúde geral — alimentação balanceada e energia',
  };

  const biotypeMap = {
    ectomorfo:  'Ectomorfo (metabolismo acelerado, +carboidratos)',
    mesomorfo:  'Mesomorfo (metabolismo equilibrado)',
    endomorfo:  'Endomorfo (metabolismo lento, -carboidratos, +proteína)',
  };

  // Perfil físico e TDEE
  const { weight, height, age, gender, activityLevel } = profile || {};
  let profileDesc = '';
  let tdee = 2000;
  if (weight && height && age) {
    const w = parseFloat(weight), h = parseFloat(height), a = parseInt(age);
    const tmb = gender === 'f'
      ? 655 + (9.563 * w) + (1.85 * h) - (4.676 * a)
      : 66 + (13.756 * w) + (5.003 * h) - (6.755 * a);
    const actFactor = { sedentario: 1.2, leve: 1.375, moderado: 1.55, intenso: 1.725 }[activityLevel] || 1.55;
    tdee = Math.round(tmb * actFactor);
    const genderStr = gender === 'f' ? 'Feminino' : 'Masculino';
    profileDesc = `Perfil: ${genderStr}, ${a} anos, ${w}kg, ${h}cm. TDEE: ${tdee} kcal.`;
  }

  // Refeições selecionadas
  const mealsArr = selectedMeals?.length > 0 ? selectedMeals : ['Café da manhã', 'Almoço', 'Jantar'];
  const numMeals = mealsArr.length;
  const mealsToGenerate = mealsArr.join(', ');

  // Treino
  let workoutDesc = '';
  if (workout?.routinesDone?.length > 0) {
    workoutDesc += 'Rotinas hoje:\n';
    workout.routinesDone.forEach(r => {
      workoutDesc += `- ${r.name}\n`;
      r.exercises?.forEach(e => {
        const d = [e.sets && `${e.sets}x`, e.weight && `${e.weight}kg`, e.rest && `${e.rest}s`].filter(Boolean);
        workoutDesc += `  • ${e.name}${d.length ? ` (${d.join(' ')})` : ''}\n`;
      });
    });
  }
  if (workout?.manualExercises?.length > 0) {
    workoutDesc += 'Exercícios avulsos:\n';
    workout.manualExercises.forEach(e => {
      const d = [e.sets && `${e.sets}x`, e.weight && `${e.weight}kg`, e.rest && `${e.rest}s`].filter(Boolean);
      workoutDesc += `- ${e.name}${d.length ? ` (${d.join(' ')})` : ''}\n`;
    });
  }
  if (!workoutDesc) workoutDesc = 'Dia de descanso.';

  const cardioDesc = (() => {
    if (!cardio?.value || cardio.value <= 0) return 'Sem cardio.';
    if (cardio.type === 'km') return `Cardio: ${cardio.value}km (~${Math.round(cardio.value * 60)}kcal).`;
    return `Cardio: ${cardio.value}min (~${Math.round(cardio.value * 8)}kcal).`;
  })();

  const { safe: safeIngredients } = parseIngredients(ingredients);

  return `Nutricionista fitness especializado em periodização nutricional. Plano alimentar PERSONALIZADO para HOJE. JSON puro, sem markdown.

${profileDesc}
Biótipo: ${biotypeMap[biotype]}.
Objetivo: ${goalMap[goal]}.
${safeIngredients ? `Ingredientes: ${safeIngredients}.` : 'Alimentos comuns do Brasil.'}
${restrictions?.trim() ? `Restrições: ${restrictions.trim()}.` : ''}

TREINO: ${workoutDesc}${cardioDesc}

REFEIÇÕES (gere EXATAMENTE estas ${numMeals}, nesta ordem): ${mealsToGenerate}

Instruções:
- Calcule gasto calórico do treino pelo volume (séries×peso). Registre em gasto_treino_kcal.
- Distribua calorias proporcionalmente entre as refeições.
- Biótipo: ectomorfo +carbo, endomorfo -carbo +proteína, mesomorfo equilibrado.
- Treino intenso: +15% carbo, proteína alta. Descanso: -10% calorias.
- Hidratação: 35ml/kg + 500ml/hora de treino.
- Cada refeição: ao menos 3 itens com porções precisas.
- Lista de compras diária com quantidades exatas.

Regras: JSON somente. Números inteiros reais. "itens" = array de strings simples.

{"objetivo":"TDEE + gasto treino + meta kcal","macros":{"proteina_g":0,"carbo_g":0,"gordura_g":0,"calorias":0},"gasto_treino_kcal":0,"agua":{"ml":0,"copos":0,"obs":"..."},"lista_compras_diaria":[{"item":"...","quantidade":"..."}],"refeicoes":[{"nome":"...","horario":"00:00","itens":["..."],"calorias_aprox":0,"dica":"..."}],"dicas_gerais":["..."]}

Gere exatamente ${numMeals} refeições no array refeicoes.`;
}

// ── POST /nutrition/generate (FREE) ───────────────────────
export const generate = async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json().catch(() => ({}));
    const { goal, ingredients, restrictions, meals } = body;

    // ── Validações de entrada ──────────────────────────────
    if (!goal) return c.json({ error: 'Informe o objetivo.' }, 400);

    const validGoals = ['emagrecer', 'massa', 'manutencao', 'saude'];
    if (!validGoals.includes(goal)) return c.json({ error: 'Objetivo inválido.' }, 400);

    const numMeals = Math.min(Math.max(parseInt(meals) || 3, 2), 6);

    // Bloqueia se ainda houver ingredientes suspeitos (segunda barreira — frontend já avisa)
    const { suspects } = parseIngredients(ingredients);
    if (suspects.length > 0) {
      return c.json({
        error: `"${suspects.join(', ')}" não parece${suspects.length > 1 ? 'm' : ''} ser ${suspects.length > 1 ? 'alimentos' : 'um alimento'}. Corrija o campo "O que você tem em casa".`,
      }, 400);
    }

    // ── Verificação de limite e premium ───────────────────
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

    // ── Geração com tokens calculados dinamicamente ────────
    // Só grava o log DEPOIS de validar o plano — usuário não perde tentativa por erro da IA
    const maxTokens = calcTokens(numMeals, false);
    const plan = await callGroq(buildFreePrompt({ goal, ingredients, restrictions, meals: numMeals }), maxTokens, false);

    if (!plan) {
      return c.json({ error: 'A IA não conseguiu gerar o plano. Tente novamente.' }, 500);
    }
    if (!plan.refeicoes?.length) {
      console.error('[generate] Plano retornado sem refeições:', JSON.stringify(plan).slice(0, 200));
      return c.json({ error: 'Plano gerado incompleto. Tente novamente.' }, 500);
    }
    if (plan.refeicoes.length < numMeals) {
      console.warn(`[generate] Esperava ${numMeals} refeições, IA gerou ${plan.refeicoes.length}`);
      // Aceita plano parcial (pelo menos metade das refeições esperadas)
      if (plan.refeicoes.length < Math.ceil(numMeals / 2)) {
        return c.json({ error: 'Plano gerado incompleto. Tente novamente.' }, 500);
      }
    }

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

    // ── Validações de entrada ──────────────────────────────
    if (!goal)    return c.json({ error: 'Informe o objetivo.' }, 400);
    if (!biotype) return c.json({ error: 'Informe o biótipo.' }, 400);

    const validGoals    = ['emagrecer', 'massa', 'manutencao', 'saude'];
    const validBiotypes = ['ectomorfo', 'mesomorfo', 'endomorfo'];
    if (!validGoals.includes(goal))       return c.json({ error: 'Objetivo inválido.' }, 400);
    if (!validBiotypes.includes(biotype)) return c.json({ error: 'Biótipo inválido.' }, 400);

    // Valida perfil físico
    const profileError = validateProfile(profile);
    if (profileError) return c.json({ error: profileError }, 400);

    // Valida refeições selecionadas
    if (!selectedMeals?.length) return c.json({ error: 'Selecione ao menos uma refeição.' }, 400);

    // Bloqueia ingredientes suspeitos
    const { suspects } = parseIngredients(ingredients);
    if (suspects.length > 0) {
      return c.json({
        error: `"${suspects.join(', ')}" não parece${suspects.length > 1 ? 'm' : ''} ser ${suspects.length > 1 ? 'alimentos' : 'um alimento'}. Corrija o campo "O que você tem em casa".`,
      }, 400);
    }

    // ── Validação premium via banco ────────────────────────
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

    // ── Geração com tokens calculados dinamicamente ────────
    const numMeals = selectedMeals.length;
    const maxTokens = calcTokens(numMeals, true);
    const plan = await callGroq(
      buildPremiumPrompt({ goal, biotype, workout, cardio, ingredients, restrictions, profile, selectedMeals }),
      maxTokens,
      true
    );

    if (!plan) {
      return c.json({ error: 'A IA não conseguiu gerar o plano. Tente novamente.' }, 500);
    }
    if (!plan.refeicoes?.length) {
      console.error('[generatePremium] Plano retornado sem refeições:', JSON.stringify(plan).slice(0, 200));
      return c.json({ error: 'Plano gerado incompleto. Tente novamente.' }, 500);
    }
    if (plan.refeicoes.length < Math.ceil(numMeals / 2)) {
      console.warn(`[generatePremium] Esperava ${numMeals} refeições, IA gerou ${plan.refeicoes.length}`);
      return c.json({ error: 'Plano gerado incompleto. Tente novamente.' }, 500);
    }

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

    // Busca programa ativo do usuário
    const { data: program } = await supabase
      .from('training_programs')
      .select('id')
      .eq('user_id', user.user_id)
      .eq('is_active', true)
      .single();

    if (!program) return c.json({ error: 'Nenhum programa de treino ativo encontrado.' }, 404);

    // Descobre o week_day de hoje
    const todayName = new Date().toLocaleDateString('pt-BR', { weekday: 'long' });
    const { data: weekDay } = await supabase
      .from('week_days')
      .select('id, is_rest')
      .eq('program_id', program.id)
      .ilike('name', `%${todayName}%`)
      .single();

    if (!weekDay) return c.json({ error: 'Dia da semana não encontrado no programa.' }, 404);

    // Descobre o próximo sort_order disponível
    const { count: currentCount } = await supabase
      .from('week_day_exercises')
      .select('*', { count: 'exact', head: true })
      .eq('week_day_id', weekDay.id);

    const exercisesToInsert = exercises.map((e, i) => ({
      week_day_id: weekDay.id,
      name: e.name,
      sets: e.sets || null,
      weight: e.weight || null,
      rest: e.rest || null,
      sort_order: (currentCount || 0) + i + 1,
      user_id: user.user_id,
    }));

    const { error: exError } = await supabase.from('week_day_exercises').insert(exercisesToInsert);
    if (exError) return c.json({ error: exError.message }, 500);

    // Marca o dia como não-descanso se era rest day
    if (weekDay.is_rest) {
      await supabase.from('week_days').update({ is_rest: false }).eq('id', weekDay.id);
    }

    return c.json({ message: `${exercises.length} exercício(s) adicionado(s) ao treino de ${todayName}.` });
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
function repairTruncatedJSON(raw) {
  let text = raw.replace(/```json/gi, '').replace(/```/g, '').trim();

  const start = text.indexOf('{');
  if (start === -1) return null;
  text = text.slice(start);

  try { return JSON.parse(text); } catch (_) {}

  // Remove vírgulas antes de fechar
  text = text.replace(/,\s*([}\]])/g, '$1');

  // Fecha strings abertas
  const quoteCount = (text.match(/(?<!\\)"/g) || []).length;
  if (quoteCount % 2 !== 0) text += '"';

  // Conta chaves e colchetes abertos
  let openBraces = 0, openBrackets = 0, inString = false, escape = false;
  for (const ch of text) {
    if (escape)        { escape = false; continue; }
    if (ch === '\\')   { escape = true;  continue; }
    if (ch === '"')    { inString = !inString; continue; }
    if (inString)      continue;
    if (ch === '{')      openBraces++;
    else if (ch === '}') openBraces--;
    else if (ch === '[') openBrackets++;
    else if (ch === ']') openBrackets--;
  }

  text = text.replace(/,\s*$/, '');
  text += ']'.repeat(Math.max(0, openBrackets));
  text += '}'.repeat(Math.max(0, openBraces));

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('repairTruncatedJSON falhou:', e.message, '| tail:', text.slice(-150));
    return null;
  }
}

// ── Helper: chama Groq (com 1 retry automático) ────────────
async function callGroq(prompt, maxTokens, isPremium) {
  const result = await callGroqOnce(prompt, maxTokens, isPremium);
  if (result) return result;

  console.warn(`[callGroq] 1ª tentativa retornou null. Retentando (maxTokens=${maxTokens})…`);
  await new Promise(r => setTimeout(r, 800));
  return callGroqOnce(prompt, maxTokens, isPremium);
}

async function callGroqOnce(prompt, maxTokens, isPremium) {
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
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: 'Você é nutricionista fitness. Responda SOMENTE com JSON puro válido, sem markdown, sem texto adicional. Use linguagem concisa para não truncar.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!aiRes.ok) {
    const err = await aiRes.json().catch(() => ({}));
    console.error('[callGroqOnce] Groq API error:', JSON.stringify(err));
    return null;
  }

  const aiData = await aiRes.json();
  const finishReason = aiData.choices?.[0]?.finish_reason;
  const rawText = aiData.choices?.[0]?.message?.content || '';

  if (finishReason === 'length') {
    console.warn(`[callGroqOnce] Truncado (finish_reason=length, maxTokens=${maxTokens}). Tentando reparar…`);
  }

  const parsed = repairTruncatedJSON(rawText);
  if (!parsed) {
    console.error('[callGroqOnce] JSON inválido após reparo. Raw:', rawText.slice(0, 200));
  }
  return parsed;
}