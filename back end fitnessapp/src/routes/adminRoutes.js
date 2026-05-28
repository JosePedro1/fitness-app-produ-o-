// src/routes/adminRoutes.js
import { Hono } from 'hono';
import supabase from '../config/supabase.js';

const adminRoutes = new Hono();

// Middleware de autenticação por senha de admin
const adminAuth = async (c, next) => {
  const { password } = await c.req.json().catch(() => ({}));
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return c.json({ error: 'Senha de admin não configurada no servidor.' }, 500);
  }

  if (!password || password !== adminPassword) {
    return c.json({ error: 'Senha incorreta.' }, 401);
  }

  await next();
};

// POST /admin/login — valida a senha de admin
adminRoutes.post('/login', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return c.json({ error: 'Senha de admin não configurada no servidor.' }, 500);
  }

  if (!body.password || body.password !== adminPassword) {
    return c.json({ error: 'Senha incorreta.' }, 401);
  }

  return c.json({ ok: true });
});

// GET /admin/stats — retorna painel completo de estatísticas
adminRoutes.get('/stats', async (c) => {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const sentPassword = c.req.header('x-admin-password');

  if (!adminPassword || sentPassword !== adminPassword) {
    return c.json({ error: 'Não autorizado.' }, 401);
  }

  try {
    // Total de usuários
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Novos usuários nos últimos 7 dias
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: newUsersWeek } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo);

    // Novos usuários nos últimos 30 dias
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: newUsersMonth } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo);

    // Total de rotinas criadas
    const { count: totalRoutines } = await supabase
      .from('routines')
      .select('*', { count: 'exact', head: true });

    // Total de tarefas
    const { count: totalTasks } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true });

    // Total de progressos registrados
    const { count: totalProgress } = await supabase
      .from('progress')
      .select('*', { count: 'exact', head: true });

    // Top 10 usuários com mais rotinas
    const { data: topByRoutines } = await supabase
      .from('routines')
      .select('user_id, users(email)')
      .order('user_id');

    const routinesByUser = {};
    (topByRoutines || []).forEach((r) => {
      const uid = r.user_id;
      if (!routinesByUser[uid]) {
        routinesByUser[uid] = { email: r.users?.email || uid, count: 0 };
      }
      routinesByUser[uid].count++;
    });
    const topRoutineUsers = Object.values(routinesByUser)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top 10 usuários com mais tarefas
    const { data: topByTasks } = await supabase
      .from('tasks')
      .select('user_id, users(email)');

    const tasksByUser = {};
    (topByTasks || []).forEach((t) => {
      const uid = t.user_id;
      if (!tasksByUser[uid]) {
        tasksByUser[uid] = { email: t.users?.email || uid, count: 0 };
      }
      tasksByUser[uid].count++;
    });
    const topTaskUsers = Object.values(tasksByUser)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Últimos 10 usuários cadastrados
    const { data: recentUsers } = await supabase
      .from('users')
      .select('email, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    // Crescimento de usuários por dia (últimos 30 dias)
    const { data: userGrowth } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: true });

    const growthByDay = {};
    (userGrowth || []).forEach((u) => {
      const day = u.created_at.slice(0, 10);
      growthByDay[day] = (growthByDay[day] || 0) + 1;
    });
    const growthSeries = Object.entries(growthByDay).map(([date, count]) => ({ date, count }));

    return c.json({
      overview: {
        totalUsers: totalUsers || 0,
        newUsersWeek: newUsersWeek || 0,
        newUsersMonth: newUsersMonth || 0,
        totalRoutines: totalRoutines || 0,
        totalTasks: totalTasks || 0,
        totalProgress: totalProgress || 0,
      },
      topRoutineUsers,
      topTaskUsers,
      recentUsers: recentUsers || [],
      growthSeries,
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    return c.json({ error: 'Erro ao buscar estatísticas.' }, 500);
  }
});

export default adminRoutes;