/**
 * ProfilePage.jsx — versão corrigida + ranking inline
 *
 * CORREÇÕES:
 *   - Import corrigido: requestJoinAcademy (era joinAcademy — não existia)
 *   - Ranking da academia exibido inline na própria página de perfil
 *   - Posição do usuário no ranking destacada
 *
 * Rota: /profile (dentro de PrivateRoute)
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  User, Camera, Save, Trophy, Dumbbell,
  Eye, EyeOff, Building2, CheckCircle2, Loader2,
  Crown, Star, Medal,
} from 'lucide-react';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  listAcademies,
  requestJoinAcademy,   // ← CORRIGIDO (era joinAcademy)
  getRanking,
} from '../../services/api-profile';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
};

/** Retorna medalha e cor por posição no ranking */
const getMedalProps = (pos) => {
  if (pos === 0) return { icon: '🥇', color: 'text-yellow-400', bg: 'bg-yellow-500/10 ring-1 ring-yellow-500/30' };
  if (pos === 1) return { icon: '🥈', color: 'text-gray-300',  bg: 'bg-gray-400/10 ring-1 ring-gray-400/20' };
  if (pos === 2) return { icon: '🥉', color: 'text-orange-400',bg: 'bg-orange-600/10 ring-1 ring-orange-500/20' };
  return { icon: null, color: 'text-gray-500', bg: '' };
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [profile,        setProfile]        = useState(null);
  const [academies,      setAcademies]       = useState([]);
  const [ranking,        setRanking]         = useState([]);
  const [rankingLoading, setRankingLoading]  = useState(false);
  const [loading,        setLoading]         = useState(true);
  const [saving,         setSaving]          = useState(false);
  const [toast,          setToast]           = useState(null);

  // Campos editáveis
  const [displayName,     setDisplayName]     = useState('');
  const [bio,             setBio]             = useState('');
  const [showInRanking,   setShowInRanking]   = useState(false);
  const [selectedAcademy, setSelectedAcademy] = useState('');

  // Estado de solicitação de academia
  const [joinStatus, setJoinStatus] = useState(null); // 'pending' | 'approved' | null

  const fileRef = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Carregar ranking inline ─────────────────────────────────────────────────
  const loadRanking = async (slug) => {
    if (!slug) return;
    setRankingLoading(true);
    try {
      const data = await getRanking(slug);
      setRanking(data?.ranking || []);
    } catch {
      setRanking([]);
    } finally {
      setRankingLoading(false);
    }
  };

  // ── Carregar dados do perfil ────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([getProfile(), listAcademies()])
      .then(([prof, acadList]) => {
        setProfile(prof);
        setAcademies(acadList);
        setDisplayName(prof.display_name || '');
        setBio(prof.bio || '');
        setShowInRanking(prof.show_in_ranking || false);
        setSelectedAcademy(prof.academies?.slug || '');
        setJoinStatus(prof.pending_request?.status || null);

        // Carrega ranking se já tiver academia
        if (prof.academies?.slug) {
          loadRanking(prof.academies.slug);
        }
      })
      .catch(() => showToast('Erro ao carregar perfil.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  // ── Salvar perfil ───────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Atualiza campos básicos
      const updated = await updateProfile({
        display_name:    displayName.trim() || null,
        bio:             bio.trim() || null,
        show_in_ranking: showInRanking,
      });

      // 2. Se academia mudou, cria solicitação de entrada
      const currentSlug = profile?.academies?.slug || '';
      if (selectedAcademy && selectedAcademy !== currentSlug) {
        const joinResult = await requestJoinAcademy(selectedAcademy);  // ← CORRIGIDO
        setJoinStatus(joinResult.status);

        const msg = joinResult.status === 'approved'
          ? 'Perfil salvo e academia atualizada! ✓'
          : 'Perfil salvo! Solicitação de academia enviada para o admin. ✓';
        showToast(msg);
      } else {
        showToast('Perfil salvo com sucesso! ✓');
      }

      setProfile(p => ({ ...p, ...updated }));

      // Recarrega ranking se academia está aprovada
      if (profile?.academies?.slug) {
        loadRanking(profile.academies.slug);
      }
    } catch (err) {
      showToast(err?.response?.data?.error || 'Erro ao salvar.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Upload de avatar ────────────────────────────────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Imagem deve ter no máximo 2MB.', 'error');
      return;
    }
    setSaving(true);
    try {
      // user_id salvo no localStorage pelo api-login.js loginUser
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('user_id não encontrado. Faça login novamente.');
      const url = await uploadAvatar(file, userId);
      setProfile(p => ({ ...p, avatar_url: url }));
      showToast('Foto atualizada! ✓');
    } catch (err) {
      showToast(err.message || 'Erro ao enviar foto.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Posição do usuário no ranking ───────────────────────────────────────────
  const myRankingPos = profile?.user_id
    ? ranking.findIndex(r => r.user_id === profile.user_id)
    : -1;

  // ── Render: loading ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#171717] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  const displayEmail = profile?.email || '';
  const initials = (profile?.display_name || displayEmail).slice(0, 2).toUpperCase();

  return (
    <div className="w-full min-h-screen bg-[#171717] lg:px-24 md:px-16 sm:px-6 px-4 py-8">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 left-5 sm:left-auto sm:max-w-sm z-50 px-5 py-3 rounded-xl text-white text-sm font-medium shadow-xl transition-all break-words
          ${toast.type === 'error' ? 'bg-red-500' : 'bg-[#5B4FFF]'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2"
          style={{ fontFamily: 'Syne, sans-serif' }}>
          <User className="w-6 h-6 text-[#5B4FFF]" /> Meu Perfil
        </h1>
        <p className="text-sm text-gray-500 mt-1">Gerencie suas informações e preferências</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Coluna esquerda: avatar + info + ranking inline ── */}
        <div className="lg:col-span-1 flex flex-col gap-4">

          {/* Avatar card */}
          <div className="bg-[#1c1c1c] border border-white/5 rounded-2xl p-6 flex flex-col items-center gap-4">
            <div className="relative">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-[#5B4FFF]/30"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#5B4FFF]/20 ring-4 ring-[#5B4FFF]/30
                  flex items-center justify-center text-3xl font-bold text-[#7B6FFF]"
                  style={{ fontFamily: 'Syne, sans-serif' }}>
                  {initials}
                </div>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#5B4FFF] hover:bg-[#7B6FFF] rounded-full
                  flex items-center justify-center shadow-lg transition-colors"
                title="Alterar foto"
              >
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <div className="text-center">
              <p className="text-base font-bold text-gray-100" style={{ fontFamily: 'Syne, sans-serif' }}>
                {profile?.display_name || displayEmail.split('@')[0]}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{displayEmail}</p>

              {profile?.is_premium && (
                <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 bg-yellow-500/15
                  text-yellow-400 text-xs font-semibold rounded-full border border-yellow-500/20">
                  ⭐ Premium
                </span>
              )}
            </div>

            <div className="w-full border-t border-white/5 pt-4 text-xs text-gray-500 text-center">
              Membro desde {fmtDate(profile?.created_at)}
            </div>
          </div>

          {/* ── Academia card ── */}
          {profile?.academies ? (
            <div className="bg-[#1c1c1c] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-semibold text-gray-300">Academia</span>
              </div>
              <p className="text-base font-bold text-indigo-300" style={{ fontFamily: 'Syne, sans-serif' }}>
                {profile.academies.name}
              </p>
              {profile.academies.city && (
                <p className="text-xs text-gray-500 mt-0.5">{profile.academies.city}</p>
              )}

              {/* Posição no ranking */}
              {myRankingPos >= 0 && showInRanking && (
                <div className="mt-3 flex items-center gap-2 p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                  <Trophy className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="text-sm font-bold text-indigo-300">
                    #{myRankingPos + 1}º no ranking
                  </span>
                  <span className="text-xs text-gray-500 ml-auto">
                    {ranking[myRankingPos]?.dias_treinados} dias
                  </span>
                </div>
              )}

              <a
                href={`/ranking/${profile.academies.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <Trophy className="w-3 h-3" /> Ver ranking completo →
              </a>
            </div>
          ) : joinStatus === 'pending' ? (
            <div className="bg-[#1c1c1c] border border-yellow-500/20 rounded-2xl p-5">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-sm">⏳</span>
                <p className="text-sm text-yellow-300 font-medium">Aguardando aprovação</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Sua solicitação está sendo analisada pelo administrador.
              </p>
            </div>
          ) : null}

          {/* ── Ranking inline ── */}
          {profile?.academies?.slug && (
            <div className="bg-[#1c1c1c] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-bold text-gray-200" style={{ fontFamily: 'Syne, sans-serif' }}>
                    Ranking da Academia
                  </span>
                </div>
                {!rankingLoading && (
                  <span className="text-xs text-gray-600">{ranking.length} membros</span>
                )}
              </div>

              {rankingLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                </div>
              ) : ranking.length === 0 ? (
                <p className="text-xs text-gray-600 text-center py-3">
                  {showInRanking
                    ? 'Nenhum membro no ranking ainda. Registre treinos!'
                    : 'Ative "Aparecer no ranking" para participar.'}
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {ranking.slice(0, 10).map((member, i) => {
                    const m = getMedalProps(i);
                    const isMe = member.user_id === profile?.user_id;
                    return (
                      <div
                        key={member.user_id}
                        className={`flex items-center gap-3 p-2.5 rounded-xl transition-all
                          ${isMe ? 'bg-indigo-500/15 ring-1 ring-indigo-500/30' : m.bg || 'hover:bg-white/3'}`}
                      >
                        {/* Posição */}
                        <div className="w-7 text-center shrink-0">
                          {m.icon
                            ? <span className="text-base">{m.icon}</span>
                            : <span className={`text-xs font-bold ${m.color}`}>{i + 1}</span>
                          }
                        </div>

                        {/* Avatar */}
                        {member.avatar_url ? (
                          <img src={member.avatar_url} alt={member.display_name}
                            className="w-7 h-7 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-[#252525] shrink-0
                            flex items-center justify-center text-xs font-bold text-gray-500">
                            {member.display_name.slice(0, 2).toUpperCase()}
                          </div>
                        )}

                        {/* Nome */}
                        <span className={`flex-1 text-sm truncate ${isMe ? 'text-indigo-200 font-semibold' : 'text-gray-300'}`}>
                          {member.display_name}{isMe && ' (você)'}
                        </span>

                        {member.is_premium && (
                          <Star className="w-3 h-3 text-yellow-400 shrink-0" fill="currentColor" />
                        )}

                        {/* Dias */}
                        <div className="text-right shrink-0">
                          <span className={`text-sm font-bold ${isMe ? 'text-indigo-300' : 'text-gray-400'}`}>
                            {member.dias_treinados}
                          </span>
                          <span className="text-xs text-gray-600 ml-1">d</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Se o usuário não está no top 10 mas está no ranking */}
                  {myRankingPos > 9 && showInRanking && (
                    <>
                      <div className="text-center text-gray-700 text-xs py-1">· · ·</div>
                      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-indigo-500/15 ring-1 ring-indigo-500/30">
                        <div className="w-7 text-center shrink-0">
                          <span className="text-xs font-bold text-indigo-400">#{myRankingPos + 1}</span>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-indigo-600/20 shrink-0
                          flex items-center justify-center text-xs font-bold text-indigo-400">
                          {initials}
                        </div>
                        <span className="flex-1 text-sm text-indigo-200 font-semibold truncate">
                          {profile?.display_name || displayEmail.split('@')[0]} (você)
                        </span>
                        <span className="text-sm font-bold text-indigo-300">
                          {ranking[myRankingPos]?.dias_treinados}
                          <span className="text-xs text-gray-600 ml-1">d</span>
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}

              <a
                href={`/ranking/${profile.academies.slug}`}
                target="_blank"
                rel="noreferrer"
                className="flex justify-center items-center gap-1 mt-4 text-xs text-indigo-500
                  hover:text-indigo-400 transition-colors border border-indigo-500/20 rounded-lg py-2"
              >
                <Trophy className="w-3 h-3" /> Ver ranking completo ↗
              </a>
            </div>
          )}
        </div>

        {/* ── Coluna direita: formulário ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Dados pessoais */}
          <div className="bg-[#1c1c1c] border border-white/5 rounded-2xl p-6">
            <h2 className="text-base font-bold text-gray-200 mb-5 flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-indigo-400" /> Dados pessoais
            </h2>

            <div className="flex flex-col gap-4">
              {/* Nome de exibição */}
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">
                  Nome de exibição
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  maxLength={40}
                  placeholder="Como quer aparecer no ranking"
                  className="w-full h-11 bg-[#252525] border border-gray-700 rounded-xl px-4 text-gray-200 text-sm
                    outline-none focus:border-indigo-500 transition-colors placeholder-gray-600"
                />
                <p className="text-xs text-gray-600 mt-1">
                  {displayName.length}/40 — aparece no ranking no lugar do e-mail
                </p>
              </div>

              {/* Bio */}
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  maxLength={160}
                  placeholder="Conte um pouco sobre você (opcional)"
                  rows={3}
                  className="w-full bg-[#252525] border border-gray-700 rounded-xl px-4 py-3 text-gray-200 text-sm
                    outline-none focus:border-indigo-500 transition-colors placeholder-gray-600 resize-none"
                />
                <p className="text-xs text-gray-600 mt-1">{bio.length}/160</p>
              </div>
            </div>
          </div>

          {/* Academia */}
          <div className="bg-[#1c1c1c] border border-white/5 rounded-2xl p-6">
            <h2 className="text-base font-bold text-gray-200 mb-1 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" /> Academia
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Associe seu perfil a uma academia parceira.
              {joinStatus === 'pending' && (
                <span className="ml-1 text-yellow-400">⏳ Solicitação pendente de aprovação.</span>
              )}
            </p>

            <select
              value={selectedAcademy}
              onChange={e => setSelectedAcademy(e.target.value)}
              className="w-full h-11 bg-[#252525] border border-gray-700 rounded-xl px-4 text-gray-200 text-sm
                outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
            >
              <option value="">Sem academia</option>
              {academies.map(a => (
                <option key={a.id} value={a.slug}>{a.name}{a.city ? ` — ${a.city}` : ''}</option>
              ))}
            </select>

            {selectedAcademy && selectedAcademy !== (profile?.academies?.slug || '') && (
              <p className="text-xs text-yellow-500 mt-2">
                ⚠️ Trocar de academia cria uma solicitação — precisa de aprovação do admin (exceto via link QR).
              </p>
            )}
          </div>

          {/* Visibilidade no ranking */}
          <div className="bg-[#1c1c1c] border border-white/5 rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {showInRanking
                    ? <Eye className="w-4 h-4 text-green-400" />
                    : <EyeOff className="w-4 h-4 text-gray-500" />
                  }
                  <span className="text-sm font-semibold text-gray-200">
                    Aparecer no ranking
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Quando ativo, seu nome e dias treinados ficam visíveis no ranking público da academia.
                  Nenhuma outra informação é exibida.
                </p>
              </div>

              <button
                onClick={() => setShowInRanking(v => !v)}
                className={`shrink-0 w-12 h-6 rounded-full transition-colors relative
                  ${showInRanking ? 'bg-[#5B4FFF]' : 'bg-gray-700'}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform
                  ${showInRanking ? 'translate-x-6' : 'translate-x-0'}`}
                />
              </button>
            </div>

            {showInRanking && (
              <div className="mt-4 flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                <p className="text-xs text-green-300">
                  Você aparecerá no ranking da sua academia. Pode desativar a qualquer momento.
                </p>
              </div>
            )}
          </div>

          {/* Botão salvar */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-12 bg-[#5B4FFF] hover:bg-[#7B6FFF] disabled:opacity-50
              text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
              : <><Save className="w-4 h-4" /> Salvar perfil</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}