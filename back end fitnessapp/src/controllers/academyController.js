/**
 * academyController.js
 * Backend: Hono + Supabase
 *
 * Rotas:
 *   GET  /ranking/:slug          — público, sem auth
 *   GET  /profile                — protegido, retorna perfil do usuário
 *   PUT  /profile                — protegido, atualiza perfil do usuário
 *   POST /profile/join/:slug     — protegido, associa usuário a academia
 *   GET  /academies              — protegido, lista academias ativas
 *   POST /admin/academies        — admin, cria academia
 */

import supabase from '../config/supabase.js';

// ── GET /ranking/:slug ────────────────────────────────────────────────────────
// Rota PÚBLICA — não precisa de token. Usada pela tela de ranking da academia.
export const getRanking = async (c) => {
  try {
    const slug = c.req.param('slug');

    // Busca a academia pelo slug
    const { data: academy, error: acadErr } = await supabase
      .from('academies')
      .select('id, name, slug, logo_url, city')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (acadErr || !academy) {
      return c.json({ error: 'Academia não encontrada.' }, 404);
    }

    // Busca ranking usando a view
    const { data: ranking, error: rankErr } = await supabase
      .from('ranking_view')
      .select('*')
      .eq('academy_slug', slug)
      .order('dias_treinados', { ascending: false })
      .limit(50);

    if (rankErr) throw new Error(rankErr.message);

    return c.json({
      academy,
      ranking: ranking || [],
      total_members: (ranking || []).length,
    });
  } catch (err) {
    console.error('getRanking error:', err);
    return c.json({ error: err.message }, 500);
  }
};

// ── GET /profile ──────────────────────────────────────────────────────────────
export const getProfile = async (c) => {
  try {
    const user = c.get('user');

    const { data, error } = await supabase
      .from('users')
      .select(`
        user_id,
        email,
        display_name,
        avatar_url,
        bio,
        show_in_ranking,
        academy_id,
        is_premium,
        premium_expires_at,
        created_at,
        academies (
          id,
          name,
          slug,
          logo_url,
          city
        )
      `)
      .eq('user_id', user.user_id)
      .single();

    if (error) throw new Error(error.message);

    return c.json(data);
  } catch (err) {
    console.error('getProfile error:', err);
    return c.json({ error: err.message }, 500);
  }
};

// ── PUT /profile ──────────────────────────────────────────────────────────────
export const updateProfile = async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();

    // Campos editáveis pelo usuário
    const allowed = ['display_name', 'bio', 'avatar_url', 'show_in_ranking'];
    const updates = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    if (Object.keys(updates).length === 0) {
      return c.json({ error: 'Nenhum campo válido para atualizar.' }, 400);
    }

    // Validação: display_name máx 40 chars
    if (updates.display_name && updates.display_name.length > 40) {
      return c.json({ error: 'Nome de exibição deve ter no máximo 40 caracteres.' }, 400);
    }

    // Validação: bio máx 160 chars
    if (updates.bio && updates.bio.length > 160) {
      return c.json({ error: 'Bio deve ter no máximo 160 caracteres.' }, 400);
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('user_id', user.user_id)
      .select(`
        user_id,
        email,
        display_name,
        avatar_url,
        bio,
        show_in_ranking,
        academy_id,
        academies ( id, name, slug )
      `)
      .single();

    if (error) throw new Error(error.message);
    return c.json(data);
  } catch (err) {
    console.error('updateProfile error:', err);
    return c.json({ error: err.message }, 500);
  }
};

// ── POST /profile/join/:slug ──────────────────────────────────────────────────
// Associa (ou reassocia) o usuário a uma academia pelo slug
export const joinAcademy = async (c) => {
  try {
    const user = c.get('user');
    const slug = c.req.param('slug');

    const { data: academy, error: acadErr } = await supabase
      .from('academies')
      .select('id, name')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (acadErr || !academy) {
      return c.json({ error: 'Academia não encontrada.' }, 404);
    }

    const { data, error } = await supabase
      .from('users')
      .update({ academy_id: academy.id })
      .eq('user_id', user.user_id)
      .select('user_id, academy_id, academies(name, slug)')
      .single();

    if (error) throw new Error(error.message);

    return c.json({
      message: `Você foi associado à ${academy.name}!`,
      user: data,
    });
  } catch (err) {
    console.error('joinAcademy error:', err);
    return c.json({ error: err.message }, 500);
  }
};

// ── GET /academies ────────────────────────────────────────────────────────────
// Lista todas as academias ativas (para o select no perfil do usuário)
export const listAcademies = async (c) => {
  try {
    const { data, error } = await supabase
      .from('academies')
      .select('id, name, slug, city, logo_url')
      .eq('is_active', true)
      .order('name');

    if (error) throw new Error(error.message);
    return c.json(data || []);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
};

// ── POST /admin/academies ─────────────────────────────────────────────────────
// Cria nova academia (só admin)
export const createAcademy = async (c) => {
  try {
    const body = await c.req.json();
    const { name, slug, city, logo_url } = body;

    if (!name?.trim() || !slug?.trim()) {
      return c.json({ error: 'Nome e slug são obrigatórios.' }, 400);
    }

    // Slug: apenas letras minúsculas, números e hífen
    const slugClean = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

    const { data, error } = await supabase
      .from('academies')
      .insert({ name: name.trim(), slug: slugClean, city, logo_url })
      .select()
      .single();

    if (error) {
      if (error.message.includes('unique')) {
        return c.json({ error: 'Este slug já está em uso.' }, 400);
      }
      throw new Error(error.message);
    }

    return c.json(data, 201);
  } catch (err) {
    console.error('createAcademy error:', err);
    return c.json({ error: err.message }, 500);
  }
};

// ── DELETE /admin/academies/:id ───────────────────────────────────────────────
export const deleteAcademy = async (c) => {
  try {
    const id = c.req.param('id');
    const { error } = await supabase
      .from('academies')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw new Error(error.message);
    return c.json({ message: 'Academia desativada.' });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
};
