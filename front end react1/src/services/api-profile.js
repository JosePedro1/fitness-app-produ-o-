/**
 * api-profile.js  (versão 2 — com solicitação de entrada pendente)
 *
 * Novos exports:
 *   requestJoinAcademy(slug) — cria solicitação pendente (admin aprova)
 *   autoJoinAcademy(slug)    — entrada automática via QR (sem aprovação)
 *   getAdminAcademies(pass)  — admin: lista academias
 *   createAdminAcademy(pass, data) — admin: cria academia
 *   deleteAdminAcademy(pass, id)   — admin: desativa academia
 *   getAdminRequests(pass)   — admin: lista solicitações
 *   approveRequest(pass, id) — admin: aprova
 *   rejectRequest(pass, id)  — admin: rejeita
 */

import api from './api.js';

const API_BASE = 'https://fitness-app-produ-o.onrender.com';

// ── PERFIL ────────────────────────────────────────────────────────────────────

export const getProfile = async () => {
  const { data } = await api.get('/profile');
  return data;
};

export const updateProfile = async (updates) => {
  const { data } = await api.put('/profile', updates);
  return data;
};

export const uploadAvatar = async (file, userId) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const token       = localStorage.getItem('auth_token');
  if (!supabaseUrl) throw new Error('VITE_SUPABASE_URL não configurada.');

  const ext      = file.name.split('.').pop();
  const filePath = `${userId}/avatar.${ext}`;

  const uploadRes = await fetch(
    `${supabaseUrl}/storage/v1/object/avatars/${filePath}`,
    {
      method:  'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type':  file.type,
        'x-upsert':      'true',
      },
      body: file,
    }
  );

  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({}));
    throw new Error(err.message || 'Erro ao fazer upload do avatar.');
  }

  const avatarUrl = `${supabaseUrl}/storage/v1/object/public/avatars/${filePath}`;
  await updateProfile({ avatar_url: avatarUrl });
  return avatarUrl;
};

// ── ACADEMIA (usuário) ────────────────────────────────────────────────────────

export const listAcademies = async () => {
  const { data } = await api.get('/academies');
  return data;
};

/**
 * Solicitação MANUAL → cria registro pendente (precisa de aprovação do admin).
 * Chamado quando o usuário seleciona uma academia na tela de perfil.
 */
export const requestJoinAcademy = async (slug) => {
  const { data } = await api.post(`/profile/join/${slug}`);
  return data;
};

/**
 * Entrada AUTOMÁTICA via QR/cadastro → aprovação imediata.
 * Chamado no fluxo de signup quando o usuário vem por um link de academia.
 */
export const autoJoinAcademy = async (slug) => {
  const { data } = await api.post(
    `/profile/join/${slug}`,
    {},
    { headers: { 'x-auto-join': 'true' } }
  );
  return data;
};

// ── RANKING PÚBLICO ───────────────────────────────────────────────────────────

export const getRanking = async (slug) => {
  const { data } = await api.get(`/ranking/${slug}`);
  return data;
};

// ── SLUG DE ACADEMIA (signup) ─────────────────────────────────────────────────

export const persistAcademySlug = (slug) => {
  if (slug?.trim()) localStorage.setItem('pending_academy_slug', slug.trim().toLowerCase());
};

export const consumeAcademySlug = () => {
  const slug = localStorage.getItem('pending_academy_slug');
  localStorage.removeItem('pending_academy_slug');
  return slug || null;
};

// ── ADMIN: ACADEMIAS ──────────────────────────────────────────────────────────

export const getAdminAcademies = async (password) => {
  const res = await fetch(`${API_BASE}/admin/academies`, {
    headers: { 'x-admin-password': password },
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Erro');
  return res.json();
};

export const createAdminAcademy = async (password, body) => {
  const res = await fetch(`${API_BASE}/admin/academies`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
    body:    JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Erro ao criar academia.');
  return res.json();
};

export const deleteAdminAcademy = async (password, id) => {
  const res = await fetch(`${API_BASE}/admin/academies/${id}`, {
    method:  'DELETE',
    headers: { 'x-admin-password': password },
  });
  if (!res.ok) throw new Error('Erro ao desativar academia.');
  return res.json();
};

// ── ADMIN: SOLICITAÇÕES ───────────────────────────────────────────────────────

export const getAdminRequests = async (password) => {
  const res = await fetch(`${API_BASE}/admin/requests`, {
    headers: { 'x-admin-password': password },
  });
  if (!res.ok) throw new Error('Erro ao carregar solicitações.');
  return res.json();
};

export const approveRequest = async (password, id) => {
  const res = await fetch(`${API_BASE}/admin/requests/${id}/approve`, {
    method:  'POST',
    headers: { 'x-admin-password': password },
  });
  if (!res.ok) throw new Error('Erro ao aprovar.');
  return res.json();
};

export const rejectRequest = async (password, id) => {
  const res = await fetch(`${API_BASE}/admin/requests/${id}/reject`, {
    method:  'POST',
    headers: { 'x-admin-password': password },
  });
  if (!res.ok) throw new Error('Erro ao rejeitar.');
  return res.json();
};