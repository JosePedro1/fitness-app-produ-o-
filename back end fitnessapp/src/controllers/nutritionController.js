// src/controllers/nutritionController.js
import supabase from '../config/supabase.js';

const DAILY_FREE_LIMIT = 3;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function buildPrompt({ goal, ingredients, restrictions, meals, profile }) {
  const { weight, height, age, gender, activityLevel } = profile || {};

  const profileInfo = weight && height && age
    ? `Perfil do usuário: ${gender === 'f' ? 'Mulher' : 'Homem'}, ${age} anos, ${weight}kg, ${height}cm, nível de atividade: ${activityLevel || 'moderado'}.`
    : '';

  const ingredientsList = ingredients?.trim()
    ? `Ingredientes disponíveis: ${ingredients}.`
    : 'Ingredientes: use alimentos comuns e acessíveis.';

  const restrictionInfo = restrictions?.trim()
    ? `Restrições alimentares: ${restrictions}.`
    : '';

  const mealsInfo = meals ? `Refeições por dia: ${meals}.` : 'Refeições por dia: 3.';

  const goalMap = {
    emagrecer:   'Emagrecimento (déficit calórico, rico em proteína)',
    massa:       'Ganho de massa muscular (superávit calórico, alto em proteína e carboidratos)',
    manutencao:  'Manutenção do peso atual (equilíbrio calórico)',
    saude:       'Alimentação saudável e balanceada',
  };

  return `Você é um nutricionista especializado em fitness. Crie um plano alimentar COMPLETO e PERSONALIZADO.

${profileInfo}
Objetivo: ${goalMap[goal] || 'Alimentação saudável'}.
${ingredientsList}
${restrictionInfo}
${mealsInfo}

Responda SOMENTE em JSON válido, sem markdown, sem texto fora do JSON, neste formato exato:
{
  "objetivo": "string com o objetivo e calorias diárias estimadas",
  "macros": { "proteina_g": número, "carbo_g": número, "gordura_g": número, "calorias": número },
  "refeicoes": [
    {
      "nome": "Café da manhã",
      "horario": "07:00",
      "itens": ["item 1 com quantidade", "item 2 com quantidade"],
      "calorias_aprox": número,
      "dica": "dica rápida e prática"
    }
  ],
  "dicas_gerais": ["dica 1", "dica 2", "dica 3"],
  "lista_compras": ["item 1", "item 2"]
}`;
}

// ── POST /nutrition/generate ───────────────────────────────
export const generate = async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json().catch(() => ({}));
    const { goal, ingredients, restrictions, meals, profile } = body;

    if (!goal) return c.json({ error: 'Informe o objetivo.' }, 400);

    // Verifica is_premium do banco (não confia no frontend)
    const { data: userData } = await supabase
      .from('users')
      .select('is_premium, premium_expires_at')
      .eq('user_id', user.user_id)
      .single();

    const isPremium = userData?.is_premium &&
      (!userData.premium_expires_at || new Date(userData.premium_expires_at) > new Date());

    // Verifica limite diário para não-premium
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

   const groqKey = process.env.GROQ_API_KEY;
if (!groqKey) return c.json({ error: 'Chave da IA não configurada.' }, 500);

const aiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${groqKey}`,
  },
  body: JSON.stringify({
    model: 'llama-3.1-8b-instant',
    max_tokens: 2000,
    temperature: 0.7,
    messages: [{ role: 'user', content: buildPrompt({ goal, ingredients, restrictions, meals, profile }) }],
  }),
});

if (!aiRes.ok) {
  const err = await aiRes.json().catch(() => ({}));
  console.error('Groq error:', err);
  return c.json({ error: 'Erro ao gerar plano com IA.' }, 500);
}

const aiData = await aiRes.json();
const rawText = aiData.choices?.[0]?.message?.content || '';

const jsonMatch = rawText.match(/\{[\s\S]*\}/);
if (!jsonMatch) return c.json({ error: 'IA retornou formato inválido.' }, 500);
const plan = JSON.parse(jsonMatch[0]);

    // Salva log
    await supabase.from('nutrition_logs').insert({
      user_id: user.user_id,
      date: todayStr(),
      goal,
      is_premium: isPremium,
      plan: JSON.stringify(plan),
    }).catch((e) => console.error('Erro ao salvar nutrition_log:', e.message));

    return c.json({ plan, isPremium });
  } catch (error) {
    console.error('generate error:', error);
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