import { Hono } from 'hono';
import supabase from '../config/supabase.js';

const adminRoutes = new Hono();

/** Valida senha de admin via header */
const requireAdmin = (c) => {
  const pwd = c.req.header('x-admin-password');
  if (!process.env.ADMIN_PASSWORD || pwd !== process.env.ADMIN_PASSWORD) {
    return false;
  }
  return true;
};

// POST /admin/login — valida senha
adminRoutes.post('/login', async (c) => {
  const { password } = await c.req.json().catch(() => ({}));
  if (!process.env.ADMIN_PASSWORD) {
    return c.json({ error: 'Senha de admin não configurada.' }, 500);
  }
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return c.json({ error: 'Senha incorreta.' }, 401);
  }
  return c.json({ ok: true });
});

// GET /admin/stats
adminRoutes.get('/stats', async (c) => {
  if (!requireAdmin(c)) return c.json({ error: 'Não autorizado.' }, 401);

  try {
    const sevenDaysAgo  = new Date(Date.now() - 7 * 86400000).toISOString();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

    const [
      { count: totalUsers },
      { count: newUsersWeek },
      { count: newUsersMonth },
      { count: totalRoutines },
      { count: totalTasks },
      { count: totalProgress },
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
      supabase.from('users').select('email, created_at').order('created_at', { ascending: false }).limit(10),
      supabase.from('users').select('created_at').gte('created_at', thirtyDaysAgo).order('created_at', { ascending: true }),
      supabase.from('routines').select('user_id, users(email)').order('user_id'),
      supabase.from('tasks').select('user_id, users(email)'),
    ]);

    // Agrupa por usuário
    const groupByUser = (rows) => {
      const map = {};
      for (const r of rows || []) {
        const uid = r.user_id;
        if (!map[uid]) map[uid] = { email: r.users?.email || uid, count: 0 };
        map[uid].count++;
      }
      return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 10);
    };

    // Série de crescimento
    const growthByDay = {};
    for (const u of userGrowth || []) {
      const day = u.created_at.slice(0, 10);
      growthByDay[day] = (growthByDay[day] || 0) + 1;
    }
    const growthSeries = Object.entries(growthByDay).map(([date, count]) => ({ date, count }));

    return c.json({
      overview: {
        totalUsers:    totalUsers  || 0,
        newUsersWeek:  newUsersWeek  || 0,
        newUsersMonth: newUsersMonth || 0,
        totalRoutines: totalRoutines || 0,
        totalTasks:    totalTasks    || 0,
        totalProgress: totalProgress || 0,
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

export default adminRoutes;