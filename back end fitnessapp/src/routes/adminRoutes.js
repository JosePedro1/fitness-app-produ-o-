/**
 * adminRoutes.js  (versão 2 — com gestão de academias e aprovações)
 *
 * Novas rotas adicionadas:
 *   GET  /admin/academies              — lista academias com contagem de membros
 *   POST /admin/academies              — cria academia
 *   DELETE /admin/academies/:id        — desativa academia
 *   GET  /admin/requests               — lista todas solicitações (pendentes, aprovadas, rejeitadas)
 *   POST /admin/requests/:id/approve   — aprova solicitação (move user para academia)
 *   POST /admin/requests/:id/reject    — rejeita solicitação
 *
 * Rotas existentes mantidas:
 *   POST /admin/login
 *   GET  /admin/stats
 */

import { Hono } from 'hono';
import supabase from '../config/supabase.js';

const adminRoutes = new Hono();

const requireAdmin = (c) => {
  const pwd = c.req.header('x-admin-password');
  if (!process.env.ADMIN_PASSWORD || pwd !== process.env.ADMIN_PASSWORD) return false;
  return true;
};

// ── POST /admin/login ─────────────────────────────────────────────────────────
adminRoutes.post('/login', async (c) => {
  const { password } = await c.req.json().catch(() => ({}));
  if (!process.env.ADMIN_PASSWORD) return c.json({ error: 'Senha não configurada.' }, 500);
  if (!password || password !== process.env.ADMIN_PASSWORD) return c.json({ error: 'Senha incorreta.' }, 401);
  return c.json({ ok: true });
});

// ── GET /admin/stats ──────────────────────────────────────────────────────────
adminRoutes.get('/stats', async (c) => {
  if (!requireAdmin(c)) return c.json({ error: 'Não autorizado.' }, 401);

  try {
    const sevenDaysAgo  = new Date(Date.now() - 7  * 86400000).toISOString();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

    const [
      { count: totalUsers },
      { count: newUsersWeek },
      { count: newUsersMonth },
      { count: totalRoutines },
      { count: totalTasks },
      { count: totalProgress },
      { count: totalAcademies },
      { data: recentUsers },
      { data: userGrowth },
      { data: topByRoutines },
      { data: topByTasks },
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
      supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
      supabase.from('routines').select('*', { count: 'exact', head: true }),
      supabase.from('tasks').select('*', { count: 'exact', head: true }),
      supabase.from('progress').select('*', { count: 'exact', head: true }),
      supabase.from('academies').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('users').select('email, created_at').order('created_at', { ascending: false }).limit(10),
      supabase.from('users').select('created_at').gte('created_at', thirtyDaysAgo).order('created_at', { ascending: true }),
      supabase.from('routines').select('user_id, users(email)').order('user_id'),
      supabase.from('tasks').select('user_id, users(email)'),
    ]);

    const groupByUser = (rows) => {
      const map = {};
      for (const r of rows || []) {
        const uid = r.user_id;
        if (!map[uid]) map[uid] = { email: r.users?.email || uid, count: 0 };
        map[uid].count++;
      }
      return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 10);
    };

    const growthByDay = {};
    for (const u of userGrowth || []) {
      const day = u.created_at.slice(0, 10);
      growthByDay[day] = (growthByDay[day] || 0) + 1;
    }
    const growthSeries = Object.entries(growthByDay).map(([date, count]) => ({ date, count }));

    return c.json({
      overview: {
        totalUsers:    totalUsers    || 0,
        newUsersWeek:  newUsersWeek  || 0,
        newUsersMonth: newUsersMonth || 0,
        totalRoutines: totalRoutines || 0,
        totalTasks:    totalTasks    || 0,
        totalProgress: totalProgress || 0,
        totalAcademies: totalAcademies || 0,
      },
      topRoutineUsers: groupByUser(topByRoutines),
      topTaskUsers:    groupByUser(topByTasks),
      recentUsers:     recentUsers || [],
      growthSeries,
    });
  } catch (err) {
    console.error('admin/stats error:', err);
    return c.json({ error: 'Erro ao buscar estatísticas.' }, 500);
  }
});

// ── GET /admin/academies ──────────────────────────────────────────────────────
adminRoutes.get('/academies', async (c) => {
  if (!requireAdmin(c)) return c.json({ error: 'Não autorizado.' }, 401);

  try {
    // Busca academias
    const { data: academies, error } = await supabase
      .from('academies')
      .select('id, name, slug, city, logo_url, is_active, created_at')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // Conta membros por academia
    const { data: memberCounts } = await supabase
      .from('users')
      .select('academy_id')
      .not('academy_id', 'is', null);

    const countMap = {};
    for (const u of memberCounts || []) {
      countMap[u.academy_id] = (countMap[u.academy_id] || 0) + 1;
    }

    const result = (academies || []).map((a) => ({
      ...a,
      member_count: countMap[a.id] || 0,
    }));

    return c.json(result);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

// ── POST /admin/academies ─────────────────────────────────────────────────────
adminRoutes.post('/academies', async (c) => {
  if (!requireAdmin(c)) return c.json({ error: 'Não autorizado.' }, 401);

  try {
    const body = await c.req.json();
    const { name, slug, city, logo_url } = body;

    if (!name?.trim() || !slug?.trim()) {
      return c.json({ error: 'Nome e slug são obrigatórios.' }, 400);
    }

    const slugClean = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');

    const { data, error } = await supabase
      .from('academies')
      .insert({ name: name.trim(), slug: slugClean, city: city?.trim() || null, logo_url: logo_url?.trim() || null })
      .select()
      .single();

    if (error) {
      if (error.message.includes('unique')) return c.json({ error: 'Este slug já está em uso.' }, 400);
      throw new Error(error.message);
    }

    return c.json(data, 201);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

// ── DELETE /admin/academies/:id ───────────────────────────────────────────────
adminRoutes.delete('/academies/:id', async (c) => {
  if (!requireAdmin(c)) return c.json({ error: 'Não autorizado.' }, 401);

  const id = c.req.param('id');
  const { error } = await supabase.from('academies').update({ is_active: false }).eq('id', id);
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ message: 'Academia desativada.' });
});

// ── GET /admin/requests ───────────────────────────────────────────────────────
// Lista TODAS as solicitações de entrada em academias (pendentes e recentes)
adminRoutes.get('/requests', async (c) => {
  if (!requireAdmin(c)) return c.json({ error: 'Não autorizado.' }, 401);

  try {
    const { data, error } = await supabase
      .from('academy_join_requests')
      .select(`
        id, status, created_at, reviewed_at,
        users(user_id, email, display_name, avatar_url),
        academies(id, name, slug, city)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw new Error(error.message);
    return c.json(data || []);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

// ── POST /admin/requests/:id/approve ─────────────────────────────────────────
adminRoutes.post('/requests/:id/approve', async (c) => {
  if (!requireAdmin(c)) return c.json({ error: 'Não autorizado.' }, 401);

  const id = c.req.param('id');

  try {
    // Busca a solicitação
    const { data: req, error: reqErr } = await supabase
      .from('academy_join_requests')
      .select('user_id, academy_id')
      .eq('id', id)
      .single();

    if (reqErr || !req) return c.json({ error: 'Solicitação não encontrada.' }, 404);

    // Atualiza academy_id do usuário
    const { error: userErr } = await supabase
      .from('users')
      .update({ academy_id: req.academy_id })
      .eq('user_id', req.user_id);

    if (userErr) throw new Error(userErr.message);

    // Marca como aprovado
    await supabase
      .from('academy_join_requests')
      .update({ status: 'approved', reviewed_at: new Date().toISOString() })
      .eq('id', id);

    return c.json({ message: 'Solicitação aprovada.' });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

// ── POST /admin/requests/:id/reject ──────────────────────────────────────────
adminRoutes.post('/requests/:id/reject', async (c) => {
  if (!requireAdmin(c)) return c.json({ error: 'Não autorizado.' }, 401);

  const id = c.req.param('id');

  const { error } = await supabase
    .from('academy_join_requests')
    .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ message: 'Solicitação rejeitada.' });
});

export default adminRoutes;