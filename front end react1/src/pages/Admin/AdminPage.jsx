import { useState, useEffect, useCallback } from 'react';

const API = 'https://fitness-app-produ-o.onrender.com';

// ──────────────────────────────────────────────
// Utilitários
// ──────────────────────────────────────────────
function fmt(n) {
  return (n ?? 0).toLocaleString('pt-BR');
}
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ──────────────────────────────────────────────
// Estilos globais (inline para não tocar nos arquivos existentes)
// ──────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
  *{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased}
  :root{
    --primary:#5B4FFF;--primary-light:#7B6FFF;--primary-bg:rgba(91,79,255,0.10);
    --surface:#0d0d12;--surface2:#13131a;--surface3:#18181f;--surface4:#1e1e28;
    --border:rgba(255,255,255,0.07);--border2:rgba(255,255,255,0.12);
    --text:#f0f0f8;--text2:rgba(240,240,248,0.55);--text3:rgba(240,240,248,0.3);
    --green:#22c55e;--red:#ef4444;--amber:#f59e0b;--cyan:#06b6d4;
    --r:10px;
  }
  body{background:var(--surface);color:var(--text);font-family:'DM Sans',sans-serif;min-height:100vh}
  h1,h2,h3,h4,h5{font-family:'Syne',sans-serif;letter-spacing:-0.02em}
  ::-webkit-scrollbar{width:6px;height:6px}
  ::-webkit-scrollbar-track{background:var(--surface2)}
  ::-webkit-scrollbar-thumb{background:var(--border2);border-radius:3px}

  /* ── layout ── */
  .adm-wrap{min-height:100vh;display:flex;flex-direction:column}
  .adm-header{background:var(--surface2);border-bottom:1px solid var(--border);padding:14px 28px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50}
  .adm-logo{font-family:'Syne',sans-serif;font-size:18px;font-weight:800}
  .adm-logo span{color:var(--primary)}
  .adm-badge{background:var(--primary-bg);color:var(--primary-light);font-size:11px;font-weight:600;padding:3px 10px;border-radius:99px;border:1px solid rgba(91,79,255,.25);font-family:'Syne',sans-serif;letter-spacing:.04em}
  .adm-logout{background:none;border:1px solid var(--border2);color:var(--text2);font-size:13px;padding:6px 14px;border-radius:8px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s}
  .adm-logout:hover{border-color:var(--red);color:var(--red)}
  .adm-main{flex:1;padding:32px 28px;max-width:1200px;margin:0 auto;width:100%}

  /* ── login ── */
  .adm-login-page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--surface);position:relative;overflow:hidden}
  .adm-orb{position:absolute;border-radius:50%;filter:blur(90px);opacity:.12;pointer-events:none}
  .adm-orb-1{width:500px;height:500px;background:var(--primary);top:-150px;right:-100px}
  .adm-orb-2{width:350px;height:350px;background:#8B5CF6;bottom:-80px;left:-80px}
  .adm-login-card{background:var(--surface2);border:1px solid var(--border2);border-radius:20px;padding:40px 36px;width:100%;max-width:380px;position:relative;z-index:1;animation:fadeUp .25s ease}
  @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  .adm-lock-icon{width:52px;height:52px;background:var(--primary-bg);border:1px solid rgba(91,79,255,.3);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:22px;margin:0 auto 20px}
  .adm-login-title{font-family:'Syne',sans-serif;font-size:22px;font-weight:700;text-align:center;margin-bottom:6px}
  .adm-login-sub{font-size:13px;color:var(--text2);text-align:center;margin-bottom:28px}
  .adm-field{margin-bottom:18px}
  .adm-label{font-size:12px;color:var(--text2);margin-bottom:6px;display:block;font-weight:500}
  .adm-input{width:100%;height:46px;background:var(--surface3);border:1px solid var(--border2);border-radius:8px;color:var(--text);padding:0 14px;font-size:15px;outline:none;transition:border-color .2s;font-family:'DM Sans',sans-serif}
  .adm-input:focus{border-color:var(--primary)}
  .adm-btn{width:100%;height:46px;background:var(--primary);color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;font-family:'Syne',sans-serif;transition:opacity .2s;letter-spacing:-.01em}
  .adm-btn:hover{opacity:.88}
  .adm-btn:disabled{opacity:.5;cursor:not-allowed}
  .adm-err{font-size:12px;color:var(--red);margin-top:8px;text-align:center}

  /* ── cards de overview ── */
  .adm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:14px;margin-bottom:28px}
  .adm-card{background:var(--surface2);border:1px solid var(--border);border-radius:var(--r);padding:20px;transition:border-color .2s}
  .adm-card:hover{border-color:var(--border2)}
  .adm-card-label{font-size:11px;color:var(--text3);font-weight:600;letter-spacing:.05em;text-transform:uppercase;margin-bottom:10px}
  .adm-card-value{font-family:'Syne',sans-serif;font-size:28px;font-weight:700;line-height:1}
  .adm-card-sub{font-size:12px;color:var(--text2);margin-top:6px}
  .adm-card-icon{font-size:20px;margin-bottom:10px}

  /* ── seções ── */
  .adm-section{margin-bottom:28px}
  .adm-section-title{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:var(--text2);letter-spacing:.04em;text-transform:uppercase;margin-bottom:14px;display:flex;align-items:center;gap:8px}
  .adm-section-title::after{content:'';flex:1;height:1px;background:var(--border)}

  /* ── tabelas ── */
  .adm-table-wrap{background:var(--surface2);border:1px solid var(--border);border-radius:var(--r);overflow:hidden}
  .adm-table{width:100%;border-collapse:collapse}
  .adm-table th{font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.05em;padding:12px 16px;border-bottom:1px solid var(--border);text-align:left;background:var(--surface3)}
  .adm-table td{font-size:13px;color:var(--text2);padding:11px 16px;border-bottom:1px solid var(--border)}
  .adm-table tr:last-child td{border-bottom:none}
  .adm-table tr:hover td{background:rgba(255,255,255,.02)}
  .adm-pill{display:inline-flex;align-items:center;gap:5px;background:var(--primary-bg);color:var(--primary-light);font-size:12px;font-weight:600;padding:3px 9px;border-radius:99px}

  /* ── gráfico de crescimento ── */
  .adm-chart-wrap{background:var(--surface2);border:1px solid var(--border);border-radius:var(--r);padding:20px;overflow-x:auto}
  .adm-bars{display:flex;align-items:flex-end;gap:4px;height:100px;min-width:400px}
  .adm-bar-col{display:flex;flex-direction:column;align-items:center;flex:1;gap:4px;min-width:20px}
  .adm-bar{width:100%;background:var(--primary-bg);border-radius:4px 4px 0 0;transition:background .2s;position:relative;cursor:default}
  .adm-bar:hover{background:var(--primary)}
  .adm-bar-date{font-size:9px;color:var(--text3);transform:rotate(-45deg);transform-origin:top left;white-space:nowrap;margin-top:2px}

  /* ── loader ── */
  .adm-loader{display:flex;flex-direction:column;align-items:center;justify-content:center;height:300px;gap:12px;color:var(--text3)}
  .adm-spinner{width:32px;height:32px;border:3px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:spin .8s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}

  /* ── dois colunas ── */
  .adm-row2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  @media(max-width:700px){.adm-row2{grid-template-columns:1fr}.adm-grid{grid-template-columns:repeat(2,1fr)}}
`;

// ──────────────────────────────────────────────
// Componente de Login
// ──────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!pass) { setError('Informe a senha.'); return; }
    setLoading(true);
    setError('');
    try {
      const r = await fetch(`${API}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error || 'Senha incorreta.');
      }
      onLogin(pass);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="adm-login-page">
      <div className="adm-orb adm-orb-1" />
      <div className="adm-orb adm-orb-2" />
      <form className="adm-login-card" onSubmit={handleSubmit}>
        <h1 className="adm-login-title">Painel Administrativo</h1>
        <p className="adm-login-sub">Acesso restrito — insira a senha de admin</p>
        <div className="adm-field">
          <label className="adm-label">Senha</label>
          <input
            className="adm-input"
            type="password"
            placeholder="••••••••"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            autoFocus
          />
        </div>
        {error && <p className="adm-err">{error}</p>}
        <button className="adm-btn" type="submit" disabled={loading} style={{ marginTop: 16 }}>
          {loading ? 'Verificando…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}

// ──────────────────────────────────────────────
// Mini-barra de crescimento
// ──────────────────────────────────────────────
function GrowthChart({ data }) {
  if (!data || data.length === 0) return <p style={{ color: 'var(--text3)', fontSize: 13 }}>Sem dados de crescimento.</p>;
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="adm-chart-wrap">
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13 }}>Novos usuários — últimos 30 dias</span>
      </div>
      <div className="adm-bars">
        {data.map((d) => (
          <div className="adm-bar-col" key={d.date} title={`${d.date}: ${d.count} usuário(s)`}>
            <div className="adm-bar" style={{ height: `${Math.max((d.count / max) * 100, 4)}%` }} />
            <span className="adm-bar-date">{d.date.slice(5)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Card de estatística
// ──────────────────────────────────────────────
function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className="adm-card">
      <div className="adm-card-icon">{icon}</div>
      <div className="adm-card-label">{label}</div>
      <div className="adm-card-value" style={accent ? { color: accent } : {}}>{fmt(value)}</div>
      {sub && <div className="adm-card-sub">{sub}</div>}
    </div>
  );
}

// ──────────────────────────────────────────────
// Dashboard principal
// ──────────────────────────────────────────────
function AdminDashboard({ password, onLogout }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const r = await fetch(`${API}/admin/stats`, {
        headers: { 'x-admin-password': password },
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error || 'Erro ao carregar estatísticas.');
      }
      setStats(await r.json());
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, [password]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="adm-wrap">
      <header className="adm-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="adm-logo">Fit<span>Ness</span></span>
          <span className="adm-badge">ADMIN</span>
        </div>
        <button className="adm-logout" onClick={onLogout}>Sair</button>
      </header>

      <main className="adm-main">
        {loading && (
          <div className="adm-loader">
            <div className="adm-spinner" />
            <span style={{ fontSize: 13 }}>Carregando dados…</span>
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 10, padding: '14px 18px', color: 'var(--red)', fontSize: 14, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{error}</span>
            <button onClick={load} style={{ background: 'none', border: '1px solid var(--red)', color: 'var(--red)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}>Tentar novamente</button>
          </div>
        )}

        {stats && (
          <>
            {/* Overview */}
            <div className="adm-section">
              <div className="adm-section-title">Visão Geral</div>
              <div className="adm-grid">
                <StatCard label="Usuários Totais" value={stats.overview.totalUsers} accent="var(--primary-light)" />
                <StatCard label="Novos esta semana" value={stats.overview.newUsersWeek} sub="últimos 7 dias" accent="var(--green)" />
                <StatCard label="Novos este mês" value={stats.overview.newUsersMonth} sub="últimos 30 dias" />
                <StatCard label="Rotinas" value={stats.overview.totalRoutines} />
                <StatCard label="Tarefas" value={stats.overview.totalTasks} />
                <StatCard label="Progressos" value={stats.overview.totalProgress} />
              </div>
            </div>

            {/* Gráfico de crescimento */}
            <div className="adm-section">
              <div className="adm-section-title">Crescimento</div>
              <GrowthChart data={stats.growthSeries} />
            </div>

            {/* Top usuários + Recentes */}
            <div className="adm-section">
              <div className="adm-section-title">Usuários</div>
              <div className="adm-row2">
                {/* Top por rotinas */}
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>Mais rotinas criadas</p>
                  <div className="adm-table-wrap">
                    <table className="adm-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Usuário</th>
                          <th>Rotinas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.topRoutineUsers.length === 0 && (
                          <tr><td colSpan={3} style={{ color: 'var(--text3)', textAlign: 'center' }}>Sem dados</td></tr>
                        )}
                        {stats.topRoutineUsers.map((u, i) => (
                          <tr key={i}>
                            <td style={{ color: 'var(--text3)', fontWeight: 600, width: 28 }}>{i + 1}</td>
                            <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</td>
                            <td><span className="adm-pill">{u.count}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top por tarefas */}
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>Mais tarefas criadas</p>
                  <div className="adm-table-wrap">
                    <table className="adm-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Usuário</th>
                          <th>Tarefas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.topTaskUsers.length === 0 && (
                          <tr><td colSpan={3} style={{ color: 'var(--text3)', textAlign: 'center' }}>Sem dados</td></tr>
                        )}
                        {stats.topTaskUsers.map((u, i) => (
                          <tr key={i}>
                            <td style={{ color: 'var(--text3)', fontWeight: 600, width: 28 }}>{i + 1}</td>
                            <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</td>
                            <td><span className="adm-pill" style={{ background: 'rgba(6,182,212,.1)', color: 'var(--cyan)' }}>{u.count}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Usuários recentes */}
            <div className="adm-section">
              <div className="adm-section-title">Últimos Cadastros</div>
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>E-mail</th>
                      <th>Cadastrado em</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats.recentUsers || []).map((u, i) => (
                      <tr key={i}>
                        <td>{u.email}</td>
                        <td style={{ color: 'var(--text3)' }}>{fmtDate(u.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Botão de refresh */}
            <div style={{ textAlign: 'right', marginTop: 8 }}>
              <button onClick={load} style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text2)', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans', transition: 'all .2s' }}>
                🔄 Atualizar dados
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// ──────────────────────────────────────────────
// Componente raiz — rota /adm
// ──────────────────────────────────────────────
export default function AdminPage() {
  const [adminPass, setAdminPass] = useState(() => sessionStorage.getItem('adm_pass') || '');

  function handleLogin(pass) {
    sessionStorage.setItem('adm_pass', pass);
    setAdminPass(pass);
  }

  function handleLogout() {
    sessionStorage.removeItem('adm_pass');
    setAdminPass('');
  }

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      {adminPass
        ? <AdminDashboard password={adminPass} onLogout={handleLogout} />
        : <AdminLogin onLogin={handleLogin} />
      }
    </>
  );
}