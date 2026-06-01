// src/controllers/nutritionController.js
import supabase from '../config/supabase.js';

const DAILY_FREE_LIMIT = 3;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function buildPrompt({ goal, ingredients, restrictions, meals, profile }) {
  const { weight, height, age, gender, activityLevel } = profile || {};

  const profileInfo = weight && height && age
    ? `Perfil: ${gender === 'f' ? 'Mulher' : 'Homem'}, ${age} anos, ${weight}kg, ${height}cm, atividade: ${activityLevel || 'moderado'}.`
    : '';

  const ingredientsList = ingredients?.trim()
    ? `Ingredientes disponíveis: ${ingredients}.`
    : 'Use alimentos comuns e acessíveis do Brasil.';

  const restrictionInfo = restrictions?.trim()
    ? `Restrições: ${restrictions}.`
    : '';

  const goalMap = {
    emagrecer:  'Emagrecimento com déficit calórico e alto teor de proteína',
    massa:      'Ganho de massa com superávit calórico, proteína e carboidratos altos',
    manutencao: 'Manutenção do peso com equilíbrio calórico',
    saude:      'Alimentação saudável e balanceada',
  };

  const numMeals = parseInt(meals) || 3;

  return `Você é nutricionista fitness. Crie um plano alimentar personalizado em JSON.

${profileInfo}
Objetivo: ${goalMap[goal] || 'Alimentação saudável'}.
${ingredientsList}
${restrictionInfo}
Número de refeições: ${numMeals}.

REGRAS OBRIGATÓRIAS:
- Responda APENAS com JSON puro, sem markdown, sem blocos de código, sem texto antes ou depois
- Todos os valores numéricos devem ser números inteiros reais (ex: 2000, 150, 60), NUNCA strings
- Use nomes de alimentos reais em português brasileiro

Formato exato:
{"objetivo":"descrição do objetivo com estimativa calórica","macros":{"proteina_g":150,"carbo_g":200,"gordura_g":60,"calorias":2000},"refeicoes":[{"nome":"Café da manhã","horario":"07:00","itens":["2 ovos mexidos","1 fatia de pão integral","1 banana"],"calorias_aprox":350,"dica":"Prefira ovos cozidos para mais saciedade"}],"dicas_gerais":["Beba 2L de água por dia","Evite ultraprocessados","Durma bem para recuperação"],"lista_compras":["Ovos","Pão integral","Banana","Frango","Arroz"]}

Gere exatamente ${numMeals} refeições no array refeicoes.`;
}

// ── POST /nutrition/generate ───────────────────────────────
export const generate = async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json().catch(() => ({}));
    const { goal, ingredients, restrictions, meals, profile } = body;

    if (!goal) return c.json({ error: 'Informe o objetivo.' }, 400);

    // Verifica is_premium do banco
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
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: 'Você é um nutricionista. Responda SEMPRE e SOMENTE com JSON puro válido, sem markdown, sem texto adicional.',
          },
          {
            role: 'user',
            content: buildPrompt({ goal, ingredients, restrictions, meals, profile }),
          },
        ],
      }),
    });

    if (!aiRes.ok) {
      const err = await aiRes.json().catch(() => ({}));
      console.error('Groq error:', err);
      return c.json({ error: 'Erro ao gerar plano com IA.' }, 500);
    }

    const aiData = await aiRes.json();
    let rawText = aiData.choices?.[0]?.message?.content || '';

    // Limpa qualquer markdown que o modelo possa ter incluído
    rawText = rawText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    // Extrai o JSON da resposta
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Resposta sem JSON válido:', rawText);
      return c.json({ error: 'IA retornou formato inválido. Tente novamente.' }, 500);
    }

    let plan;
    try {
      plan = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr.message);
      console.error('Raw text:', rawText.slice(0, 300));
      return c.json({ error: 'Erro ao interpretar resposta da IA. Tente novamente.' }, 500);
    }

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