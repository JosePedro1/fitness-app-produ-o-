/**
 * api-profile.js
 * Serviços de perfil e academias para o frontend React.
 * Importa a instância axios centralizada de api.js.
 */

import api from './api.js';

// ── PERFIL ────────────────────────────────────────────────────────────────────

/** Retorna o perfil completo do usuário autenticado (inclui academia) */
export const getProfile = async () => {
  const { data } = await api.get('/profile');
  return data;
};

/**
 * Atualiza campos do perfil
 * @param {{ display_name?, bio?, avatar_url?, show_in_ranking? }} updates
 */
export const updateProfile = async (updates) => {
  const { data } = await api.put('/profile', updates);
  return data;
};

/**
 * Faz upload do avatar para o Supabase Storage e atualiza o perfil
 * Requer que o bucket "avatars" esteja criado e público no Supabase.
 * @param {File} file
 * @param {string} userId
 * @returns {string} avatar_url público
 */
export const uploadAvatar = async (file, userId) => {
  // O Supabase SDK não está disponível diretamente no frontend (usa backend como proxy).
  // Estratégia: faz upload diretamente via Supabase Storage REST API com o JWT do usuário.
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const token       = localStorage.getItem('auth_token');

  if (!supabaseUrl) throw new Error('VITE_SUPABASE_URL não configurada.');

  const ext      = file.name.split('.').pop();
  const filePath = `${userId}/avatar.${ext}`;

  const uploadRes = await fetch(
    `${supabaseUrl}/storage/v1/object/avatars/${filePath}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': file.type,
        'x-upsert': 'true', // sobrescreve se já existir
      },
      body: file,
    }
  );

  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({}));
    throw new Error(err.message || 'Erro ao fazer upload do avatar.');
  }

  // URL pública do avatar
  const avatarUrl = `${supabaseUrl}/storage/v1/object/public/avatars/${filePath}`;

  // Salva a URL no perfil do usuário
  await updateProfile({ avatar_url: avatarUrl });

  return avatarUrl;
};

// ── ACADEMIA ──────────────────────────────────────────────────────────────────

/** Lista todas as academias ativas (para o select no perfil) */
export const listAcademies = async () => {
  const { data } = await api.get('/academies');
  return data;
};

/**
 * Associa o usuário autenticado a uma academia pelo slug
 * @param {string} slug
 */
export const joinAcademy = async (slug) => {
  const { data } = await api.post(`/profile/join/${slug}`);
  return data;
};

// ── RANKING PÚBLICO ───────────────────────────────────────────────────────────

/**
 * Busca o ranking público de uma academia.
 * Não precisa de auth — funciona até sem token.
 * @param {string} slug
 */
export const getRanking = async (slug) => {
  const { data } = await api.get(`/ranking/${slug}`);
  return data;
};

// ── SIGNUP COM ACADEMIA ───────────────────────────────────────────────────────

/**
 * Lê e persiste o slug de academia do localStorage.
 * Chamado quando o usuário abre um link de academia (/join/:slug).
 */
export const persistAcademySlug = (slug) => {
  if (slug?.trim()) {
    localStorage.setItem('pending_academy_slug', slug.trim().toLowerCase());
  }
};

/** Retorna o slug pendente e o remove do storage */
export const consumeAcademySlug = () => {
  const slug = localStorage.getItem('pending_academy_slug');
  localStorage.removeItem('pending_academy_slug');
  return slug || null;
};
