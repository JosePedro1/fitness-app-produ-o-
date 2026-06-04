/**
 * academyController.js  (versão 2 — com sistema de aprovação)
 *
 * Mudanças em relação à v1:
 *   - getProfile: inclui pending_request no retorno
 *   - joinAcademy: agora cria solicitação pendente (sem aprovação auto)
 *     Exceto quando chamado com header x-auto-join=true (fluxo do cadastro via QR)
 */

import supabase from '../config/supabase.js';

// ── GET /ranking/:slug ────────────────────────────────────────────────────────
export const getRanking = async (c) => {
  try {
    const slug = c.req.param('slug');

    const { data: academy, error: acadErr } = await supabase
      .from('academies')
      .select('id, name, slug, logo_url, city')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (acadErr || !academy) {
      return c.json({ error: 'Academia não encontrada.' }, 404);
    }

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

    // Perfil com academia atual
    const { data, error } = await supabase
      .from('users')
      .select(`
        user_id, email, display_name, avatar_url, bio,
        show_in_ranking, academy_id, is_premium, premium_expires_at, created_at,
        academies(id, name, slug, logo_url, city)
      `)
      .eq('user_id', user.user_id)
      .single();

    if (error) throw new Error(error.message);

    // Solicitação pendente ou rejeitada (para mostrar estado no frontend)
    const { data: pendingReq } = await supabase
      .from('academy_join_requests')
      .select('id, status, created_at, academies(id, name, slug, city)')
      .eq('user_id', user.user_id)
      .in('status', ['pending', 'rejected'])
      .maybeSingle();

    return c.json({ ...data, pending_request: pendingReq || null });
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

    const allowed = ['display_name', 'bio', 'avatar_url', 'show_in_ranking'];
    const updates = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    if (Object.keys(updates).length === 0) {
      return c.json({ error: 'Nenhum campo válido para atualizar.' }, 400);
    }
    if (updates.display_name && updates.display_name.length > 40) {
      return c.json({ error: 'Nome de exibição deve ter no máximo 40 caracteres.' }, 400);
    }
    if (updates.bio && updates.bio.length > 160) {
      return c.json({ error: 'Bio deve ter no máximo 160 caracteres.' }, 400);
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('user_id', user.user_id)
      .select('user_id, email, display_name, avatar_url, bio, show_in_ranking, academy_id, academies(id, name, slug)')
      .single();

    if (error) throw new Error(error.message);
    return c.json(data);
  } catch (err) {
    console.error('updateProfile error:', err);
    return c.json({ error: err.message }, 500);
  }
};

// ── POST /profile/join/:slug ──────────────────────────────────────────────────
// Comportamento:
//   - Header "x-auto-join: true" → fluxo do QR/cadastro → aprovação automática
//   - Sem header → manual pelo perfil → cria solicitação pendente
export const joinAcademy = async (c) => {
  try {
    const user   = c.get('user');
    const slug   = c.req.param('slug');
    const isAuto = c.req.header('x-auto-join') === 'true';

    const { data: academy, error: acadErr } = await supabase
      .from('academies')
      .select('id, name')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (acadErr || !academy) {
      return c.json({ error: 'Academia não encontrada.' }, 404);
    }

    // ── Fluxo automático (QR / cadastro) ─────────────────────────────────────
    if (isAuto) {
      const { data, error } = await supabase
        .from('users')
        .update({ academy_id: academy.id })
        .eq('user_id', user.user_id)
        .select('user_id, academy_id, academies(name, slug)')
        .single();

      if (error) throw new Error(error.message);

      return c.json({
        message: `Bem-vindo à ${academy.name}!`,
        status: 'approved',
        user: data,
      });
    }

    // ── Fluxo manual → solicitação pendente ──────────────────────────────────
    const { error: upsertErr } = await supabase
      .from('academy_join_requests')
      .upsert({
        user_id:    user.user_id,
        academy_id: academy.id,
        status:     'pending',
        created_at: new Date().toISOString(),
        reviewed_at: null,
      }, { onConflict: 'user_id' });

    if (upsertErr) throw new Error(upsertErr.message);

    return c.json({
      message: `Solicitação enviada para ${academy.name}. Aguarde a aprovação do administrador.`,
      status:  'pending',
      academy: { id: academy.id, name: academy.name, slug },
    });
  } catch (err) {
    console.error('joinAcademy error:', err);
    return c.json({ error: err.message }, 500);
  }
};

// ── GET /academies ────────────────────────────────────────────────────────────
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
export const createAcademy = async (c) => {
  try {
    const body = await c.req.json();
    const { name, slug, city, logo_url } = body;

    if (!name?.trim() || !slug?.trim()) {
      return c.json({ error: 'Nome e slug são obrigatórios.' }, 400);
    }

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