/**
 * RankingPage.jsx
 * Rota PÚBLICA: /ranking/:slug (sem PrivateRoute)
 *
 * Esta página é acessível a qualquer pessoa, inclusive sem login.
 * É a tela que a academia mostra para seus alunos.
 *
 * Adicione ao AppRoutes.jsx:
 *   import RankingPage from '../pages/Ranking/RankingPage';
 *   <Route path="/ranking/:slug" element={<RankingPage />} />
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Trophy, Dumbbell, Flame, Crown, Star, Loader2, Users } from 'lucide-react';
import { getRanking } from '../../services/api-profile';

// ── Helpers ───────────────────────────────────────────────────────────────────
const medal = (pos) => {
  if (pos === 0) return { icon: '🥇', bg: 'bg-yellow-500/15', ring: 'ring-yellow-500/40', text: 'text-yellow-400' };
  if (pos === 1) return { icon: '🥈', bg: 'bg-gray-400/10',  ring: 'ring-gray-400/30',   text: 'text-gray-300' };
  if (pos === 2) return { icon: '🥉', bg: 'bg-orange-600/15',ring: 'ring-orange-500/30',  text: 'text-orange-400' };
  return { icon: null, bg: 'bg-[#1c1c1c]', ring: 'ring-transparent', text: 'text-gray-400' };
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function RankingPage() {
  const { slug }       = useParams();
  const [data,     setData]    = useState(null);
  const [loading,  setLoading] = useState(true);
  const [error,    setError]   = useState(null);

  useEffect(() => {
    getRanking(slug)
      .then(setData)
      .catch(() => setError('Academia não encontrada ou ranking indisponível.'))
      .finally(() => setLoading(false));
  }, [slug]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#111114] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  // ── Erro ───────────────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#111114] flex flex-col items-center justify-center gap-4 px-6">
        <Trophy className="w-12 h-12 text-gray-700" />
        <p className="text-gray-400 text-center">{error || 'Erro ao carregar ranking.'}</p>
        <Link to="/" className="text-indigo-400 text-sm hover:text-indigo-300 transition-colors">
          ← Voltar ao app
        </Link>
      </div>
    );
  }

  const { academy, ranking } = data;
  const top3    = ranking.slice(0, 3);
  const rest    = ranking.slice(3);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#111114]">

      {/* Header da academia */}
      <div className="relative overflow-hidden">
        {/* Gradiente decorativo */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-transparent to-purple-900/20 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px]
          bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto px-6 pt-12 pb-10 text-center">
          {/* Logo / ícone */}
          {academy.logo_url ? (
            <img src={academy.logo_url} alt={academy.name}
              className="w-16 h-16 rounded-2xl object-cover mx-auto mb-4 ring-4 ring-indigo-500/30" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 ring-4 ring-indigo-500/30
              flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="w-8 h-8 text-indigo-400" />
            </div>
          )}

          <h1 className="text-3xl font-black text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
            {academy.name}
          </h1>
          {academy.city && <p className="text-sm text-gray-400 mb-3">{academy.city}</p>}

          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-600/20 border border-indigo-600/30
            rounded-full text-indigo-300 text-sm font-medium">
            <Trophy className="w-3.5 h-3.5" /> Ranking de Treinos
          </div>

          <div className="flex justify-center gap-6 mt-6">
            <div className="text-center">
              <p className="text-2xl font-black text-indigo-300" style={{ fontFamily: 'Syne, sans-serif' }}>
                {ranking.length}
              </p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Membros</p>
            </div>
            {ranking.length > 0 && (
              <div className="text-center">
                <p className="text-2xl font-black text-indigo-300" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {ranking[0]?.dias_treinados || 0}
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Dias do 1º</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ranking */}
      <div className="max-w-2xl mx-auto px-4 pb-16">

        {ranking.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Nenhum membro no ranking ainda.</p>
            <p className="text-gray-600 text-xs mt-1">
              Cadastre-se pelo link da academia e comece a treinar!
            </p>
          </div>
        ) : (
          <>
            {/* Top 3 — destaque */}
            {top3.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-600 uppercase tracking-wider text-center mb-4">Top 3</p>
                <div className="flex flex-col gap-3">
                  {top3.map((member, i) => {
                    const m = medal(i);
                    return (
                      <div key={member.user_id}
                        className={`flex items-center gap-4 p-4 rounded-2xl ring-1 ${m.bg} ${m.ring} transition-all`}>

                        {/* Posição */}
                        <div className="w-8 text-center text-xl shrink-0">
                          {m.icon || <span className={`text-sm font-bold ${m.text}`}>{i + 1}</span>}
                        </div>

                        {/* Avatar */}
                        {member.avatar_url ? (
                          <img src={member.avatar_url} alt={member.display_name}
                            className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-white/10" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-600/20 shrink-0 ring-2 ring-white/10
                            flex items-center justify-center text-sm font-bold text-indigo-300">
                            {member.display_name.slice(0, 2).toUpperCase()}
                          </div>
                        )}

                        {/* Nome */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-bold text-gray-100 truncate" style={{ fontFamily: 'Syne, sans-serif' }}>
                              {member.display_name}
                            </span>
                            {member.is_premium && (
                              <Star className="w-3.5 h-3.5 text-yellow-400 shrink-0" fill="currentColor" title="Premium" />
                            )}
                          </div>
                        </div>

                        {/* Dias */}
                        <div className="text-right shrink-0">
                          <p className={`text-lg font-black ${m.text}`} style={{ fontFamily: 'Syne, sans-serif' }}>
                            {member.dias_treinados}
                          </p>
                          <p className="text-xs text-gray-600">dias</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Restante */}
            {rest.length > 0 && (
              <div>
                {rest.length > 0 && <p className="text-xs text-gray-600 uppercase tracking-wider text-center mb-3">Todos os membros</p>}
                <div className="flex flex-col gap-2">
                  {rest.map((member, i) => (
                    <div key={member.user_id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#1c1c1c] border border-white/5 hover:bg-[#222] transition-colors">

                      <span className="w-6 text-center text-xs font-bold text-gray-600 shrink-0">
                        {i + 4}
                      </span>

                      {member.avatar_url ? (
                        <img src={member.avatar_url} alt={member.display_name}
                          className="w-8 h-8 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#252525] shrink-0
                          flex items-center justify-center text-xs font-bold text-gray-500">
                          {member.display_name.slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      <span className="flex-1 text-sm text-gray-300 truncate">
                        {member.display_name}
                      </span>

                      {member.is_premium && (
                        <Star className="w-3 h-3 text-yellow-400 shrink-0" fill="currentColor" />
                      )}

                      <div className="text-right shrink-0">
                        <span className="text-sm font-bold text-indigo-300">{member.dias_treinados}</span>
                        <span className="text-xs text-gray-600 ml-1">d</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* CTA — cadastro */}
        <div className="mt-10 p-6 bg-gradient-to-br from-indigo-900/30 to-purple-900/20
          border border-indigo-700/30 rounded-2xl text-center">
          <Flame className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-100 mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
            Faça parte do ranking!
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Cadastre-se no app, registre seus treinos e apareça aqui.
          </p>
          <Link
            to={`/signup?academy=${slug}`}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#5B4FFF] hover:bg-[#7B6FFF]
              text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Dumbbell className="w-4 h-4" /> Criar conta grátis
          </Link>
        </div>

        {/* Footer discreto */}
        <p className="text-center text-xs text-gray-700 mt-8">
          Powered by <span className="text-indigo-600 font-semibold">FitNess</span>
        </p>
      </div>
    </div>
  );
}
