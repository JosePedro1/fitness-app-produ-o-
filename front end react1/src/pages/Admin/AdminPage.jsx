import { useState, useEffect, useCallback } from 'react';

const API = 'https://fitness-app-produ-o.onrender.com';

function fmt(n) { return (n ?? 0).toLocaleString('pt-BR'); }
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const APP_URL = 'https://fitness-app-produ-o.vercel.app';

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

  .adm-wrap{min-height:100vh;display:flex;flex-direction:column}
  .adm-header{background:var(--surface2);border-bottom:1px solid var(--border);padding:14px 28px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50}
  .adm-logo{font-family:'Syne',sans-serif;font-size:18px;font-weight:800}
  .adm-logo span{color:var(--primary)}
  .adm-badge{background:var(--primary-bg);color:var(--primary-light);font-size:11px;font-weight:600;padding:3px 10px;border-radius:99px;border:1px solid rgba(91,79,255,.25);font-family:'Syne',sans-serif;letter-spacing:.04em}
  .adm-logout{background:none;border:1px solid var(--border2);color:var(--text2);font-size:13px;padding:6px 14px;border-radius:8px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s}
  .adm-logout:hover{border-color:var(--red);color:var(--red)}
  .adm-main{flex:1;padding:32px 28px;max-width:1200px;margin:0 auto;width:100%}

  /* tabs */
  .adm-tabs{display:flex;gap:4px;border-bottom:1px solid var(--border);margin-bottom:28px}
  .adm-tab{background:none;border:none;padding:10px 18px;font-size:13px;font-weight:600;font-family:'Syne',sans-serif;color:var(--text3);cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;transition:all .2s;letter-spacing:.02em}
  .adm-tab:hover{color:var(--text2)}
  .adm-tab.active{color:var(--primary-light);border-bottom-color:var(--primary)}
  .adm-tab-badge{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;background:var(--red);color:#fff;font-size:10px;font-weight:700;border-radius:99px;padding:0 5px;margin-left:6px}

  /* login */
  .adm-login-page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--surface);position:relative;overflow:hidden}
  .adm-orb{position:absolute;border-radius:50%;filter:blur(90px);opacity:.12;pointer-events:none}
  .adm-orb-1{width:500px;height:500px;background:var(--primary);top:-150px;right:-100px}
  .adm-orb-2{width:350px;height:350px;background:#8B5CF6;bottom:-80px;left:-80px}
  .adm-login-card{background:var(--surface2);border:1px solid var(--border2);border-radius:20px;padding:40px 36px;width:100%;max-width:380px;position:relative;z-index:1;animation:fadeUp .25s ease}
  @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  .adm-login-title{font-family:'Syne',sans-serif;font-size:22px;font-weight:700;text-align:center;margin-bottom:6px}
  .adm-login-sub{font-size:13px;color:var(--text2);text-align:center;margin-bottom:28px}
  .adm-field{margin-bottom:18px}
  .adm-label{font-size:12px;color:var(--text2);margin-bottom:6px;display:block;font-weight:500}
  .adm-input{width:100%;height:46px;background:var(--surface3);border:1px solid var(--border2);border-radius:8px;color:var(--text);padding:0 14px;font-size:15px;outline:none;transition:border-color .2s;font-family:'DM Sans',sans-serif}
  .adm-input:focus{border-color:var(--primary)}
  .adm-btn{background:var(--primary);color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;font-family:'Syne',sans-serif;transition:opacity .2s;padding:10px 20px}
  .adm-btn:hover{opacity:.88}
  .adm-btn:disabled{opacity:.5;cursor:not-allowed}
  .adm-btn-full{width:100%;height:46px}
  .adm-btn-sm{font-size:12px;padding:6px 12px;border-radius:6px}
  .adm-btn-danger{background:rgba(239,68,68,.15);color:var(--red);border:1px solid rgba(239,68,68,.25)}
  .adm-btn-danger:hover{background:rgba(239,68,68,.25);opacity:1}
  .adm-btn-success{background:rgba(34,197,94,.15);color:var(--green);border:1px solid rgba(34,197,94,.25)}
  .adm-btn-success:hover{background:rgba(34,197,94,.25);opacity:1}
  .adm-btn-ghost{background:var(--surface3);color:var(--text2);border:1px solid var(--border2)}
  .adm-btn-ghost:hover{border-color:var(--primary);color:var(--primary-light);opacity:1}
  .adm-err{font-size:12px;color:var(--red);margin-top:8px;text-align:center}

  /* cards */
  .adm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:14px;margin-bottom:28px}
  .adm-card{background:var(--surface2);border:1px solid var(--border);border-radius:var(--r);padding:20px;transition:border-color .2s}
  .adm-card:hover{border-color:var(--border2)}
  .adm-card-label{font-size:11px;color:var(--text3);font-weight:600;letter-spacing:.05em;text-transform:uppercase;margin-bottom:10px}
  .adm-card-value{font-family:'Syne',sans-serif;font-size:28px;font-weight:700;line-height:1}
  .adm-card-sub{font-size:12px;color:var(--text2);margin-top:6px}
  .adm-card-icon{font-size:20px;margin-bottom:10px}

  .adm-section{margin-bottom:28px}
  .adm-section-title{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:var(--text2);letter-spacing:.04em;text-transform:uppercase;margin-bottom:14px;display:flex;align-items:center;gap:8px}
  .adm-section-title::after{content:'';flex:1;height:1px;background:var(--border)}

  .adm-table-wrap{background:var(--surface2);border:1px solid var(--border);border-radius:var(--r);overflow:hidden}
  .adm-table{width:100%;border-collapse:collapse}
  .adm-table th{font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.05em;padding:12px 16px;border-bottom:1px solid var(--border);text-align:left;background:var(--surface3)}
  .adm-table td{font-size:13px;color:var(--text2);padding:11px 16px;border-bottom:1px solid var(--border);vertical-align:middle}
  .adm-table tr:last-child td{border-bottom:none}
  .adm-table tr:hover td{background:rgba(255,255,255,.02)}
  .adm-pill{display:inline-flex;align-items:center;gap:5px;background:var(--primary-bg);color:var(--primary-light);font-size:12px;font-weight:600;padding:3px 9px;border-radius:99px}
  .adm-pill-green{background:rgba(34,197,94,.12);color:var(--green)}
  .adm-pill-amber{background:rgba(245,158,11,.12);color:var(--amber)}
  .adm-pill-red{background:rgba(239,68,68,.12);color:var(--red)}

  .adm-chart-wrap{background:var(--surface2);border:1px solid var(--border);border-radius:var(--r);padding:20px;overflow-x:auto}
  .adm-bars{display:flex;align-items:flex-end;gap:4px;height:100px;min-width:400px}
  .adm-bar-col{display:flex;flex-direction:column;align-items:center;flex:1;gap:4px;min-width:20px}
  .adm-bar{width:100%;background:var(--primary-bg);border-radius:4px 4px 0 0;transition:background .2s;cursor:default}
  .adm-bar:hover{background:var(--primary)}
  .adm-bar-date{font-size:9px;color:var(--text3);transform:rotate(-45deg);transform-origin:top left;white-space:nowrap;margin-top:2px}

  .adm-loader{display:flex;flex-direction:column;align-items:center;justify-content:height:300px;gap:12px;color:var(--text3);padding:60px 0}
  .adm-spinner{width:32px;height:32px;border:3px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:spin .8s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}

  .adm-row2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  @media(max-width:700px){.adm-row2{grid-template-columns:1fr}.adm-grid{grid-template-columns:repeat(2,1fr)}}

  /* form inline */
  .adm-form-card{background:var(--surface2);border:1px solid var(--border);border-radius:var(--r);padding:20px;margin-bottom:16px}
  .adm-form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .adm-form-full{grid-column:1/-1}
  @media(max-width:600px){.adm-form-row{grid-template-columns:1fr}}

  /* qr/link card */
  .adm-acad-card{background:var(--surface2);border:1px solid var(--border);border-radius:var(--r);padding:16px;display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap}
  .adm-acad-qr{flex-shrink:0}
  .adm-acad-info{flex:1;min-width:180px}
  .adm-link-box{background:var(--surface3);border:1px solid var(--border2);border-radius:6px;padding:8px 12px;font-size:12px;color:var(--text2);word-break:break-all;user-select:all;margin-top:8px}
  .adm-copy-btn{font-size:11px;padding:4px 10px;background:var(--primary-bg);color:var(--primary-light);border:1px solid rgba(91,79,255,.2);border-radius:5px;cursor:pointer;font-family:'DM Sans';transition:all .2s}
  .adm-copy-btn:hover{background:var(--primary);color:#fff}
`;

// ── Login ─────────────────────────────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!pass) { setError('Informe a senha.'); return; }
    setLoading(true); setError('');
    try {
      const r = await fetch(`${API}/admin/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass }),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'Senha incorreta.');
      onLogin(pass);
    } catch (err) { setError(err.message); }
    setLoading(false);
  }

  return (
    <div className="adm-login-page">
      <div className="adm-orb adm-orb-1" /><div className="adm-orb adm-orb-2" />
      <form className="adm-login-card" onSubmit={handleSubmit}>
        <h1 className="adm-login-title">Painel Administrativo</h1>
        <p className="adm-login-sub">Acesso restrito — insira a senha de admin</p>
        <div className="adm-field">
          <label className="adm-label">Senha</label>
          <input className="adm-input" type="password" placeholder="••••••••" value={pass}
            onChange={e => setPass(e.target.value)} autoFocus />
        </div>
        {error && <p className="adm-err">{error}</p>}
        <button className="adm-btn adm-btn-full" type="submit" disabled={loading} style={{ marginTop: 16 }}>
          {loading ? 'Verificando…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}

// ── GrowthChart ───────────────────────────────────────────────────────────────
function GrowthChart({ data }) {
  if (!data || data.length === 0) return <p style={{ color: 'var(--text3)', fontSize: 13 }}>Sem dados.</p>;
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="adm-chart-wrap">
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13 }}>Novos usuários — últimos 30 dias</span>
      </div>
      <div className="adm-bars">
        {data.map(d => (
          <div className="adm-bar-col" key={d.date} title={`${d.date}: ${d.count}`}>
            <div className="adm-bar" style={{ height: `${Math.max((d.count / max) * 100, 4)}%` }} />
            <span className="adm-bar-date">{d.date.slice(5)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className="adm-card">
      {icon && <div className="adm-card-icon">{icon}</div>}
      <div className="adm-card-label">{label}</div>
      <div className="adm-card-value" style={accent ? { color: accent } : {}}>{fmt(value)}</div>
      {sub && <div className="adm-card-sub">{sub}</div>}
    </div>
  );
}

// ── Tab: Visão Geral ──────────────────────────────────────────────────────────
function TabOverview({ password }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const r = await fetch(`${API}/admin/stats`, { headers: { 'x-admin-password': password } });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'Erro');
      setStats(await r.json());
    } catch (err) { setError(err.message); }
    setLoading(false);
  }, [password]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="adm-loader"><div className="adm-spinner" /><span style={{ fontSize: 13 }}>Carregando…</span></div>;

  if (error) return (
    <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 10, padding: '14px 18px', color: 'var(--red)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span>{error}</span>
      <button onClick={load} style={{ background: 'none', border: '1px solid var(--red)', color: 'var(--red)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}>Tentar novamente</button>
    </div>
  );

  if (!stats) return null;

  return (
    <>
      <div className="adm-section">
        <div className="adm-section-title">Visão Geral</div>
        <div className="adm-grid">
          <StatCard label="Usuários Totais"   value={stats.overview.totalUsers}    accent="var(--primary-light)" />
          <StatCard label="Novos esta semana"  value={stats.overview.newUsersWeek}  sub="últimos 7 dias" accent="var(--green)" />
          <StatCard label="Novos este mês"     value={stats.overview.newUsersMonth} sub="últimos 30 dias" />
          <StatCard label="Academias ativas"   value={stats.overview.totalAcademies} accent="var(--cyan)" />
          <StatCard label="Rotinas"            value={stats.overview.totalRoutines} />
          <StatCard label="Progressos"         value={stats.overview.totalProgress} />
        </div>
      </div>

      <div className="adm-section">
        <div className="adm-section-title">Crescimento</div>
        <GrowthChart data={stats.growthSeries} />
      </div>

      <div className="adm-section">
        <div className="adm-section-title">Usuários</div>
        <div className="adm-row2">
          <div>
            <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8, fontWeight: 600, letterSpacing: '.03em', textTransform: 'uppercase' }}>Mais rotinas</p>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead><tr><th>#</th><th>Usuário</th><th>Rotinas</th></tr></thead>
                <tbody>
                  {stats.topRoutineUsers.length === 0 && <tr><td colSpan={3} style={{ color: 'var(--text3)', textAlign: 'center' }}>Sem dados</td></tr>}
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
          <div>
            <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8, fontWeight: 600, letterSpacing: '.03em', textTransform: 'uppercase' }}>Últimos cadastros</p>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead><tr><th>E-mail</th><th>Data</th></tr></thead>
                <tbody>
                  {(stats.recentUsers || []).map((u, i) => (
                    <tr key={i}>
                      <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</td>
                      <td style={{ color: 'var(--text3)', whiteSpace: 'nowrap' }}>{fmtDate(u.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'right', marginTop: 8 }}>
        <button onClick={load} className="adm-btn adm-btn-ghost adm-btn-sm">🔄 Atualizar dados</button>
      </div>
    </>
  );
}

// ── Tab: Academias ────────────────────────────────────────────────────────────
function TabAcademies({ password }) {
  const [academies, setAcademies] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');
  const [toast,     setToast]     = useState('');
  const [copied,    setCopied]    = useState('');

  // Form
  const [name,   setName]   = useState('');
  const [slug,   setSlug]   = useState('');
  const [city,   setCity]   = useState('');
  const [logoUrl,setLogoUrl]= useState('');
  const [formErr,setFormErr]= useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const r = await fetch(`${API}/admin/academies`, { headers: { 'x-admin-password': password } });
      if (!r.ok) throw new Error('Erro ao carregar');
      setAcademies(await r.json());
    } catch { setError('Não foi possível carregar as academias.'); }
    setLoading(false);
  }, [password]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) { setFormErr('Nome e slug são obrigatórios.'); return; }
    setSaving(true); setFormErr('');
    try {
      const r = await fetch(`${API}/admin/academies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ name, slug, city, logo_url: logoUrl }),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'Erro ao criar');
      setName(''); setSlug(''); setCity(''); setLogoUrl('');
      showToast('Academia criada com sucesso!');
      load();
    } catch (err) { setFormErr(err.message); }
    setSaving(false);
  };

  const handleDelete = async (id, academyName) => {
    if (!window.confirm(`Desativar a academia "${academyName}"?`)) return;
    try {
      await fetch(`${API}/admin/academies/${id}`, { method: 'DELETE', headers: { 'x-admin-password': password } });
      showToast('Academia desativada.');
      load();
    } catch { showToast('Erro ao desativar.'); }
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(key); setTimeout(() => setCopied(''), 2000); });
  };

  const autoSlug = (val) => {
    setSlug(val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-'));
  };

  if (loading) return <div className="adm-loader"><div className="adm-spinner" /></div>;

  return (
    <>
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 999, background: 'var(--primary)', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600 }}>
          {toast}
        </div>
      )}

      {/* Form criar academia */}
      <div className="adm-section">
        <div className="adm-section-title">Nova Academia</div>
        <div className="adm-form-card">
          <form onSubmit={handleCreate}>
            <div className="adm-form-row">
              <div>
                <label className="adm-label">Nome da academia *</label>
                <input className="adm-input" placeholder="Ex: Academia Selfit" value={name}
                  onChange={e => { setName(e.target.value); if (!slug) autoSlug(e.target.value); }} />
              </div>
              <div>
                <label className="adm-label">Slug único * (para o link/QR)</label>
                <input className="adm-input" placeholder="ex: selfit" value={slug}
                  onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} />
                {slug && (
                  <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
                    Link: {APP_URL}/signup?academy={slug}
                  </p>
                )}
              </div>
              <div>
                <label className="adm-label">Cidade</label>
                <input className="adm-input" placeholder="Ex: São Paulo, SP" value={city} onChange={e => setCity(e.target.value)} />
              </div>
              <div>
                <label className="adm-label">Logo URL (opcional)</label>
                <input className="adm-input" placeholder="https://..." value={logoUrl} onChange={e => setLogoUrl(e.target.value)} />
              </div>
            </div>
            {formErr && <p className="adm-err" style={{ textAlign: 'left', marginTop: 12 }}>{formErr}</p>}
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="adm-btn" type="submit" disabled={saving}>
                {saving ? 'Criando…' : '+ Criar Academia'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Lista de academias */}
      <div className="adm-section">
        <div className="adm-section-title">Academias Cadastradas</div>
        {error && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        {academies.length === 0 ? (
          <p style={{ color: 'var(--text3)', fontSize: 13 }}>Nenhuma academia cadastrada ainda.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {academies.map(acad => {
              const joinLink  = `${APP_URL}/signup?academy=${acad.slug}`;
              const qrUrl     = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(joinLink)}`;

              return (
                <div key={acad.id} className="adm-acad-card" style={{ opacity: acad.is_active ? 1 : 0.45 }}>
                  {/* QR Code */}
                  <div className="adm-acad-qr">
                    <img src={qrUrl} alt="QR Code" width={100} height={100}
                      style={{ borderRadius: 8, border: '2px solid var(--border2)', display: 'block' }} />
                    <p style={{ fontSize: 10, color: 'var(--text3)', textAlign: 'center', marginTop: 4 }}>QR Code</p>
                  </div>

                  {/* Info */}
                  <div className="adm-acad-info" style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15 }}>{acad.name}</span>
                      {!acad.is_active && <span className="adm-pill adm-pill-red" style={{ fontSize: 11 }}>Inativa</span>}
                      <span className="adm-pill adm-pill-green" style={{ fontSize: 11 }}>
                        👥 {acad.member_count || 0} membro{acad.member_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {acad.city && <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>📍 {acad.city}</p>}

                    <div style={{ marginTop: 8 }}>
                      <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>🔗 Link de cadastro:</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="adm-link-box" style={{ flex: 1 }}>{joinLink}</div>
                        <button className="adm-copy-btn" onClick={() => handleCopy(joinLink, acad.id)}>
                          {copied === acad.id ? '✓ Copiado' : 'Copiar'}
                        </button>
                      </div>
                    </div>

                    <div style={{ marginTop: 8 }}>
                      <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>📊 Ranking público:</p>
                      <a href={`${APP_URL}/ranking/${acad.slug}`} target="_blank" rel="noreferrer"
                        style={{ fontSize: 12, color: 'var(--primary-light)' }}>
                        {APP_URL}/ranking/{acad.slug} ↗
                      </a>
                    </div>
                  </div>

                  {/* Ações */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignSelf: 'flex-start' }}>
                    {acad.is_active && (
                      <button className="adm-btn adm-btn-sm adm-btn-danger"
                        onClick={() => handleDelete(acad.id, acad.name)}>
                        Desativar
                      </button>
                    )}
                    <p style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'right' }}>
                      {fmtDate(acad.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

// ── Tab: Aprovações ───────────────────────────────────────────────────────────
function TabRequests({ password, onPendingCount }) {
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('pending');
  const [toast,    setToast]    = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/admin/requests`, { headers: { 'x-admin-password': password } });
      const data = await r.json();
      setRequests(data || []);
      const pending = (data || []).filter(r => r.status === 'pending').length;
      onPendingCount(pending);
    } catch { /* silencioso */ }
    setLoading(false);
  }, [password, onPendingCount]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id) => {
    try {
      await fetch(`${API}/admin/requests/${id}/approve`, { method: 'POST', headers: { 'x-admin-password': password } });
      showToast('Aprovado com sucesso!');
      load();
    } catch { showToast('Erro ao aprovar.'); }
  };

  const handleReject = async (id) => {
    try {
      await fetch(`${API}/admin/requests/${id}/reject`, { method: 'POST', headers: { 'x-admin-password': password } });
      showToast('Rejeitado.');
      load();
    } catch { showToast('Erro ao rejeitar.'); }
  };

  const filtered = requests.filter(r => filter === 'all' ? true : r.status === filter);
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  const statusLabel = (s) => {
    if (s === 'pending')  return <span className="adm-pill adm-pill-amber">⏳ Pendente</span>;
    if (s === 'approved') return <span className="adm-pill adm-pill-green">✓ Aprovado</span>;
    if (s === 'rejected') return <span className="adm-pill adm-pill-red">✗ Rejeitado</span>;
    return s;
  };

  if (loading) return <div className="adm-loader"><div className="adm-spinner" /></div>;

  return (
    <>
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 999, background: 'var(--primary)', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600 }}>
          {toast}
        </div>
      )}

      {pendingCount > 0 && (
        <div style={{ background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.25)', borderRadius: 10, padding: '12px 16px', color: 'var(--amber)', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          ⚠️ Você tem <strong>{pendingCount}</strong> solicitação{pendingCount > 1 ? 'ões' : ''} pendente{pendingCount > 1 ? 's' : ''} aguardando aprovação.
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[['pending', 'Pendentes'], ['approved', 'Aprovados'], ['rejected', 'Rejeitados'], ['all', 'Todos']].map(([val, label]) => (
          <button key={val} className={`adm-btn adm-btn-sm ${filter === val ? '' : 'adm-btn-ghost'}`}
            onClick={() => setFilter(val)} style={{ fontFamily: 'DM Sans' }}>
            {label} {val !== 'all' && `(${requests.filter(r => r.status === val).length})`}
          </button>
        ))}
        <button className="adm-btn adm-btn-sm adm-btn-ghost" onClick={load} style={{ marginLeft: 'auto' }}>🔄</button>
      </div>

      {filtered.length === 0 ? (
        <p style={{ color: 'var(--text3)', fontSize: 13 }}>
          {filter === 'pending' ? 'Nenhuma solicitação pendente.' : 'Nenhum registro.'}
        </p>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Academia solicitada</th>
                <th>Data</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(req => (
                <tr key={req.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {req.users?.avatar_url
                        ? <img src={req.users.avatar_url} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                        : <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--primary-light)' }}>
                            {(req.users?.email || '?').slice(0, 2).toUpperCase()}
                          </div>
                      }
                      <div>
                        <p style={{ fontSize: 13, color: 'var(--text)' }}>
                          {req.users?.display_name || req.users?.email?.split('@')[0] || '—'}
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--text3)' }}>{req.users?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <p style={{ fontSize: 13 }}>{req.academies?.name || '—'}</p>
                      {req.academies?.city && <p style={{ fontSize: 11, color: 'var(--text3)' }}>{req.academies.city}</p>}
                    </div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{fmtDateTime(req.created_at)}</td>
                  <td>{statusLabel(req.status)}</td>
                  <td>
                    {req.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="adm-btn adm-btn-sm adm-btn-success" onClick={() => handleApprove(req.id)}>
                          ✓ Aprovar
                        </button>
                        <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => handleReject(req.id)}>
                          ✗ Rejeitar
                        </button>
                      </div>
                    )}
                    {req.status !== 'pending' && (
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                        {req.reviewed_at ? fmtDateTime(req.reviewed_at) : '—'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ── Tab: Feedback dos usuários ────────────────────────────────────────────────
function TabFeedback({ password }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [page,    setPage]    = useState(1);
  const [deleting, setDeleting] = useState(null);
  const limit = 20;

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API}/admin/feedback?page=${p}&limit=${limit}`,
        { headers: { 'x-admin-password': password } }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro');
      setData(json);
      setPage(p);
    } catch (e) { setError(e.message); }
    finally    { setLoading(false); }
  };

  useEffect(() => { load(1); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Remover este feedback?')) return;
    setDeleting(id);
    try {
      await fetch(`${API}/admin/feedback/${id}`, {
        method:  'DELETE',
        headers: { 'x-admin-password': password },
      });
      setData((prev) => ({
        ...prev,
        feedbacks: prev.feedbacks.filter((f) => f.id !== id),
        total:     prev.total - 1,
      }));
    } catch { /* silencioso */ }
    finally { setDeleting(null); }
  };

  const starBar = (count, total) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, height: 6, background: 'var(--surface4)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: '#F59E0B', borderRadius: 99 }} />
        </div>
        <span style={{ fontSize: 11, color: 'var(--text3)', minWidth: 24 }}>{count}</span>
      </div>
    );
  };

  const renderStars = (r) =>
    [1,2,3,4,5].map((s) => (
      <span key={s} style={{ color: s <= r ? '#F59E0B' : 'var(--border2)', fontSize: 14 }}>★</span>
    ));

  if (loading && !data) return (
    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text3)' }}>Carregando feedbacks…</div>
  );
  if (error) return (
    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--red)' }}>{error}</div>
  );
  if (!data) return null;

  const totalPages = Math.ceil(data.total / limit);

  return (
    <>
      {/* Resumo */}
      <div className="adm-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
        <div className="adm-card">
          <div className="adm-card-icon">💬</div>
          <div className="adm-card-label">Total de Feedbacks</div>
          <div className="adm-card-value" style={{ color: 'var(--primary-light)' }}>{fmt(data.total)}</div>
        </div>
        <div className="adm-card">
          <div className="adm-card-icon">⭐</div>
          <div className="adm-card-label">Nota Média</div>
          <div className="adm-card-value" style={{ color: '#F59E0B' }}>
            {data.avgRating !== null ? data.avgRating.toFixed(1) : '—'}
          </div>
          <div className="adm-card-sub">de 5 estrelas</div>
        </div>
      </div>

      {/* Distribuição de estrelas */}
      {data.distribution && data.total > 0 && (
        <div className="adm-section">
          <div className="adm-section-title">Distribuição de notas</div>
          <div className="adm-card" style={{ maxWidth: 340 }}>
            {[5,4,3,2,1].map(({ star } = data.distribution.find((d) => d.star === 5) && { star: 5 }) =>
              data.distribution.slice().reverse().map((d) => (
                <div key={d.star} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: '#F59E0B', minWidth: 20 }}>{d.star}★</span>
                  {starBar(d.count, data.total)}
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                    {data.total > 0 ? Math.round((d.count / data.total) * 100) : 0}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Lista de feedbacks */}
      <div className="adm-section">
        <div className="adm-section-title">Feedbacks recentes</div>
        {data.feedbacks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>
            Nenhum feedback ainda.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.feedbacks.map((fb) => (
              <div key={fb.id} className="adm-card" style={{ position: 'relative' }}>
                {/* Header do card */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/* Avatar */}
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'var(--primary-bg)', border: '1px solid rgba(91,79,255,.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 700, color: 'var(--primary-light)',
                      overflow: 'hidden', flexShrink: 0,
                    }}>
                      {fb.users?.avatar_url
                        ? <img src={fb.users.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                        : (fb.users?.display_name?.[0] || fb.users?.email?.[0] || '?').toUpperCase()
                      }
                    </div>
                    <div>
                      <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>
                        {fb.users?.display_name || fb.users?.email?.split('@')[0] || 'Usuário'}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--text3)' }}>{fb.users?.email}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>{fmtDate(fb.created_at)}</span>
                    <button
                      onClick={() => handleDelete(fb.id)}
                      disabled={deleting === fb.id}
                      style={{
                        background: 'none', border: '1px solid rgba(239,68,68,.2)',
                        color: 'var(--red)', borderRadius: 6, padding: '3px 8px',
                        fontSize: 11, cursor: 'pointer', opacity: deleting === fb.id ? 0.5 : 1,
                      }}
                    >
                      {deleting === fb.id ? '…' : '✕'}
                    </button>
                  </div>
                </div>

                {/* Estrelas */}
                <div style={{ marginBottom: 8 }}>{renderStars(fb.rating)}</div>

                {/* Comentário */}
                {fb.message && (
                  <div style={{ marginBottom: 8 }}>
                    <p style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>
                      Comentário
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{fb.message}</p>
                  </div>
                )}

                {/* Sugestão premium */}
                {fb.premium_suggestions && (
                  <div style={{
                    background: 'rgba(91,79,255,0.06)',
                    border:     '1px solid rgba(91,79,255,0.18)',
                    borderRadius: 8,
                    padding:    '10px 12px',
                    marginTop:  4,
                  }}>
                    <p style={{ fontSize: 11, color: 'var(--primary-light)', fontWeight: 600, letterSpacing: '.04em', marginBottom: 4 }}>
                      💎 SUGESTÃO PREMIUM
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{fb.premium_suggestions}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
            <button
              className="adm-btn adm-btn-ghost adm-btn-sm"
              disabled={page === 1 || loading}
              onClick={() => load(page - 1)}
            >
              ← Anterior
            </button>
            <span style={{ fontSize: 13, color: 'var(--text2)', padding: '6px 12px' }}>
              {page} / {totalPages}
            </span>
            <button
              className="adm-btn adm-btn-ghost adm-btn-sm"
              disabled={page === totalPages || loading}
              onClick={() => load(page + 1)}
            >
              Próxima →
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ── Dashboard principal ───────────────────────────────────────────────────────
function AdminDashboard({ password, onLogout }) {
  const [tab, setTab] = useState('overview');
  const [pendingCount, setPendingCount] = useState(0);

  return (
    <div className="adm-wrap">
      <header className="adm-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="adm-logo">Fit<span>Track</span></span>
          <span className="adm-badge">ADMIN</span>
        </div>
        <button className="adm-logout" onClick={onLogout}>Sair</button>
      </header>

      <main className="adm-main">
        {/* Tabs */}
        <div className="adm-tabs">
          <button className={`adm-tab ${tab === 'overview'  ? 'active' : ''}`} onClick={() => setTab('overview')}>
            📊 Visão Geral
          </button>
          <button className={`adm-tab ${tab === 'academies' ? 'active' : ''}`} onClick={() => setTab('academies')}>
            🏋️ Academias
          </button>
          <button className={`adm-tab ${tab === 'requests'  ? 'active' : ''}`} onClick={() => setTab('requests')}>
            📋 Aprovações
            {pendingCount > 0 && <span className="adm-tab-badge">{pendingCount}</span>}
          </button>
          <button className={`adm-tab ${tab === 'feedback' ? 'active' : ''}`} onClick={() => setTab('feedback')}>
            💬 Feedback
          </button>
        </div>

        {tab === 'overview'  && <TabOverview  password={password} />}
        {tab === 'academies' && <TabAcademies password={password} />}
        {tab === 'requests'  && <TabRequests  password={password} onPendingCount={setPendingCount} />}
        {tab === 'feedback'  && <TabFeedback  password={password} />}
      </main>
    </div>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [adminPass, setAdminPass] = useState(() => sessionStorage.getItem('adm_pass') || '');

  function handleLogin(pass) { sessionStorage.setItem('adm_pass', pass); setAdminPass(pass); }
  function handleLogout()    { sessionStorage.removeItem('adm_pass'); setAdminPass(''); }

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