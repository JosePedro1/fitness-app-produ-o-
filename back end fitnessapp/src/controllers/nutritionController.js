
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

REGRAS: JSON puro apenas, sem markdown. Valores numéricos REAIS (nunca strings).

{"objetivo":"descrição + estimativa calórica","macros":{"proteina_g":150,"carbo_g":200,"gordura_g":60,"calorias":2000},"refeicoes":[{"nome":"Café da manhã","horario":"07:00","itens":["2 ovos mexidos","1 fatia de pão integral","1 banana"],"calorias_aprox":350,"dica":"dica prática"}],"dicas_gerais":["dica 1","dica 2","dica 3"],"lista_compras":["item 1","item 2"]}

Gere exatamente ${numMeals} refeições.`;
}

function buildPremiumPrompt({ goal, biotype, workout, cardio, ingredients, restrictions }) {
  const goalMap = {
    emagrecer:  'Emagrecimento — perder gordura preservando massa muscular',
    massa:      'Ganho de massa muscular — superávit calórico com proteína alta',
    manutencao: 'Manutenção — equilíbrio calórico e composição corporal',
    saude:      'Saúde geral — alimentação balanceada e energia',
  };

  const biotypeMap = {
    ectomorfo:  'Ectomorfo (metabolismo acelerado, dificuldade em ganhar peso — precisa de mais carboidratos e calorias)',
    mesomorfo:  'Mesomorfo (metabolismo equilibrado, ganha músculo com facilidade — proteína moderada-alta)',
    endomorfo:  'Endomorfo (metabolismo lento, tende a acumular gordura — carboidratos controlados, proteína alta)',
  };

  // Monta descrição do treino
  let workoutDesc = '';
  if (workout?.routinesDone?.length > 0) {
    workoutDesc += 'Rotinas realizadas hoje:\n';
    workout.routinesDone.forEach(r => {
      workoutDesc += `- ${r.name}\n`;
      if (r.exercises?.length > 0) {
        r.exercises.forEach(e => {
          const details = [];
          if (e.sets)  details.push(`${e.sets} séries`);
          if (e.weight) details.push(`${e.weight}kg`);
          if (e.rest)  details.push(`descanso ${e.rest}s`);
          workoutDesc += `  • ${e.name}${details.length ? ` (${details.join(', ')})` : ''}\n`;
        });
      }
    });
  }

  if (workout?.manualExercises?.length > 0) {
    workoutDesc += 'Exercícios avulsos:\n';
    workout.manualExercises.forEach(e => {
      const details = [];
      if (e.sets)   details.push(`${e.sets} séries`);
      if (e.weight) details.push(`${e.weight}kg`);
      if (e.rest)   details.push(`descanso ${e.rest}s`);
      workoutDesc += `- ${e.name}${details.length ? ` (${details.join(', ')})` : ''}\n`;
    });
  }

  if (!workoutDesc) workoutDesc = 'Dia de descanso (sem treino registrado).';

  let cardioDesc = '';
  if (cardio?.type && (cardio?.value > 0)) {
    cardioDesc = `Cardio: ${cardio.value} ${cardio.type === 'km' ? 'km percorridos' : 'minutos de cardio'}.`;
  }

  return `Você é nutricionista fitness especializado em periodização nutricional. Crie um plano alimentar PERSONALIZADO para HOJE baseado no treino realizado.

Biótipo: ${biotypeMap[biotype] || 'Mesomorfo'}
Objetivo: ${goalMap[goal] || 'Saúde geral'}
${ingredients?.trim() ? `Ingredientes disponíveis: ${ingredients}.` : 'Use alimentos comuns do Brasil.'}
${restrictions?.trim() ? `Restrições alimentares: ${restrictions}.` : ''}

TREINO DE HOJE:
${workoutDesc}
${cardioDesc}

INSTRUÇÕES:
- Calcule o gasto calórico aproximado do treino e ajuste a ingestão calórica do dia
- Ajuste os macros considerando o biótipo e o treino realizado
- Em dias de treino pesado: aumente carboidratos pós-treino
- Em dias de descanso: reduza calorias e carboidratos
- Para ectomorfo: priorize carboidratos mesmo no déficit
- Para endomorfo: priorize proteína, carboidratos moderados
- Sugira timing das refeições em relação ao treino

REGRAS: JSON puro apenas, sem markdown. Valores numéricos REAIS.

{"objetivo":"descrição personalizada com gasto calórico estimado do treino e meta do dia","macros":{"proteina_g":180,"carbo_g":250,"gordura_g":65,"calorias":2400},"gasto_treino_kcal":450,"refeicoes":[{"nome":"Café da manhã","horario":"07:00","itens":["3 ovos mexidos","2 fatias de pão integral","1 banana","1 copo de leite"],"calorias_aprox":480,"dica":"Refeição pré-treino: priorize carboidratos de baixo IG"}],"dicas_gerais":["dica específica para o treino de hoje","dica 2","dica 3"],"lista_compras":["item 1","item 2"]}

Gere 6 refeições (café, lanche manhã, almoço, lanche tarde, jantar, ceia) com timing relacionado ao treino.`;
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

    const plan = await callGroq(buildFreePrompt({ goal, ingredients, restrictions, meals }));
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
    const { goal, biotype, workout, cardio, ingredients, restrictions } = body;

    if (!goal)    return c.json({ error: 'Informe o objetivo.' }, 400);
    if (!biotype) return c.json({ error: 'Informe o biótipo.' }, 400);

    // Valida premium no banco
    // const { data: userData } = await supabase
    //   .from('users')
    //   .select('is_premium, premium_expires_at')
    //   .eq('user_id', user.user_id)
    //   .single();

    // const isPremium = userData?.is_premium &&
    //   (!userData.premium_expires_at || new Date(userData.premium_expires_at) > new Date());

const isPremium = true;

    if (!isPremium) {
      return c.json({ error: 'Recurso exclusivo para assinantes Premium.', upgrade: true }, 403);
    }

    const plan = await callGroq(buildPremiumPrompt({ goal, biotype, workout, cardio, ingredients, restrictions }), 3000);
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

    // Se routineId informado, adiciona na rotina existente
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

    // Cria nova rotina com o dia de hoje
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

// ── Helper: chama Groq ────────────────────────────────────
async function callGroq(prompt, maxTokens = 2000) {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) throw new Error('Chave da IA não configurada.');

  const aiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${groqKey}` },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      max_tokens: maxTokens,
      temperature: 0.3,
      messages: [
        { role: 'system', content: 'Você é nutricionista fitness. Responda SEMPRE e SOMENTE com JSON puro válido, sem markdown, sem texto adicional.' },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!aiRes.ok) {
    const err = await aiRes.json().catch(() => ({}));
    console.error('Groq error:', err);
    return null;
  }

  const aiData = await aiRes.json();
  let rawText = (aiData.choices?.[0]?.message?.content || '')
    .replace(/```json/gi, '').replace(/```/g, '').trim();

  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) { console.error('Sem JSON válido:', rawText.slice(0, 200)); return null; }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error('JSON parse error:', e.message, rawText.slice(0, 200));
    return null;
  }
}
