// src/routes/nutritionRoutes.js
import { Hono } from 'hono';
import supabase from '../config/supabase.js';

const nutritionRoutes = new Hono();

const DAILY_FREE_LIMIT = 3;

// ── Helpers ────────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().slice(0, 10); // "2025-08-01"
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
    emagrecer: 'Emagrecimento (déficit calórico, rico em proteína)',
    massa: 'Ganho de massa muscular (superávit calórico, alto em proteína e carboidratos)',
    manutencao: 'Manutenção do peso atual (equilíbrio calórico)',
    saude: 'Alimentação saudável e balanceada',
  };
  const goalText = goalMap[goal] || 'Alimentação saudável';

  return `Você é um nutricionista especializado em fitness. Crie um plano alimentar COMPLETO e PERSONALIZADO.

${profileInfo}
Objetivo: ${goalText}.
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
nutritionRoutes.post('/generate', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'Não autenticado.' }, 401);

  const body = await c.req.json().catch(() => ({}));
  const { goal, ingredients, restrictions, meals, profile, isPremium } = body;

  if (!goal) return c.json({ error: 'Informe o objetivo.' }, 400);

  const today = todayStr();

  // Verifica uso diário (apenas para não-premium)
  if (!isPremium) {
    const { count } = await supabase
      .from('nutrition_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.user_id)
      .eq('date', today);

    if ((count || 0) >= DAILY_FREE_LIMIT) {
      return c.json({
        error: 'limite_atingido',
        message: `Você usou seus ${DAILY_FREE_LIMIT} planos gratuitos de hoje. Assine o Premium para uso ilimitado.`,
        used: count,
        limit: DAILY_FREE_LIMIT,
      }, 429);
    }
  }

 const geminiKey = process.env.GEMINI_API_KEY;
if (!geminiKey) return c.json({ error: 'Chave da IA não configurada.' }, 500);

let plan;
try {
  const aiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt({ goal, ingredients, restrictions, meals, profile }) }] }],
        generationConfig: { maxOutputTokens: 2000, temperature: 0.7 },
      }),
    }
  );

  if (!aiRes.ok) {
    const err = await aiRes.json().catch(() => ({}));
    console.error('Gemini error:', err);
    return c.json({ error: 'Erro ao gerar plano com IA.' }, 500);
  }

  const aiData = await aiRes.json();
  const rawText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return c.json({ error: 'IA retornou formato inválido.' }, 500);
  plan = JSON.parse(jsonMatch[0]);
} catch (err) {
  console.error('AI parse error:', err);
  return c.json({ error: 'Erro ao processar resposta da IA.' }, 500);
}

  // Salva o log de uso
  await supabase.from('nutrition_logs').insert({
    user_id: user.user_id,
    date: today,
    goal,
    is_premium: !!isPremium,
    plan: JSON.stringify(plan),
  }).catch((e) => console.error('Erro ao salvar nutrition_log:', e.message));

  return c.json({ plan, isPremium: !!isPremium });
});

// ── GET /nutrition/usage ───────────────────────────────────
nutritionRoutes.get('/usage', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'Não autenticado.' }, 401);

  const { count } = await supabase
    .from('nutrition_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.user_id)
    .eq('date', todayStr());

  return c.json({ used: count || 0, limit: DAILY_FREE_LIMIT });
});

// ── GET /nutrition/history ─────────────────────────────────
nutritionRoutes.get('/history', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'Não autenticado.' }, 401);

  const { data } = await supabase
    .from('nutrition_logs')
    .select('id, date, goal, created_at, plan')
    .eq('user_id', user.user_id)
    .order('created_at', { ascending: false })
    .limit(10);

  return c.json({ history: data || [] });
});

export default nutritionRoutes;