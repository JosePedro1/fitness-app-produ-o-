

import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { persistAcademySlug, consumeAcademySlug, autoJoinAcademy } from '../../services/api-profile';

const API = import.meta.env.VITE_API_URL || 'https://fitness-app-produ-o.onrender.com';
// Client ID buscado do backend em runtime — sem hardcode, sem alertas do GitHub

/* ── ícones ── */
const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email,     setEmail]     = useState('');
  const [pass,      setPass]      = useState('');
  const [pass2,     setPass2]     = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [errors,    setErrors]    = useState({});
  const [loading,   setLoading]   = useState(false);
  const [gLoading,  setGLoading]  = useState(false);
  const [toast,     setToast]     = useState(null);
  const googleClientId            = useRef(null);

  useEffect(() => {
    const academyParam = searchParams.get('academy');
    if (academyParam) persistAcademySlug(academyParam);
  }, [searchParams]);

  // Busca o Client ID do Google no backend — sem hardcode no fonte
  useEffect(() => {
    fetch(API + '/auth/google/config')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.clientId) googleClientId.current = data.clientId; })
      .catch(() => {});
  }, []);

  function showToast(msg, type = 'info') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  /* ── Cadastro com e-mail / senha ── */
  async function doSignup(e) {
    e?.preventDefault();
    const errs = {};
    if (!email || !/\S+@\S+\.\S+/.test(email)) errs.email = 'E-mail inválido';
    if (!pass || pass.length < 6)  errs.pass  = 'Mínimo 6 caracteres';
    if (pass !== pass2)            errs.pass2 = 'Senhas não coincidem';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setErrors({});
    const academy_slug = consumeAcademySlug();

    try {
      const r = await fetch(API + '/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass, academy_slug }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || 'Erro ao criar conta');
      }

      showToast('Conta criada! Fazendo login...', 'success');
      await new Promise(resolve => setTimeout(resolve, 800));

      const lr = await fetch(API + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      if (!lr.ok) { navigate('/login'); return; }

      const data = await lr.json();
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_id',    data.user?.user_id || '');
      localStorage.setItem('email',      data.user?.email   || email);

      if (academy_slug) {
        try {
          await autoJoinAcademy(academy_slug);
          showToast(`Você foi associado à academia ${academy_slug}.`, 'success');
        } catch (joinErr) {
          console.warn('autoJoinAcademy falhou:', joinErr.message);
        }
      }

      navigate('/home');
    } catch (err) {
      setErrors({ email: err.message || 'Erro ao criar conta' });
    }
    setLoading(false);
  }

  /* ── Cadastro com Google ── */
  async function doGoogleSignup() {

    if (!window.google?.accounts?.id) {
      showToast('Aguarde e tente novamente', 'info');
      return;
    }

    setGLoading(true);
    const academy_slug = consumeAcademySlug();

    window.google.accounts.id.initialize({
      client_id: googleClientId.current,
      callback: async (response) => {
        try {
          const r = await fetch(API + '/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: response.credential, academy_slug }),
          });
          if (!r.ok) {
            const e = await r.json().catch(() => ({}));
            throw new Error(e.error || 'Erro ao cadastrar com Google');
          }
          const data = await r.json();
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('user_id',    data.user?.user_id || '');
          localStorage.setItem('email',      data.user?.email   || '');
          showToast('Conta criada com sucesso! 🎉', 'success');
          setTimeout(() => navigate('/home'), 400);
        } catch (err) {
          showToast(err.message, 'error');
        }
        setGLoading(false);
      },
    });

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        window.google.accounts.id.renderButton(
          document.getElementById('g-btn-fallback-signup'),
          { theme: 'outline', size: 'large' }
        );
        setGLoading(false);
      }
    });
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased}
        :root{
          --primary:#5B4FFF;--primary-light:#7B6FFF;--primary-bg:rgba(91,79,255,0.08);--primary-bg2:rgba(91,79,255,0.14);
          --surface:#111118;--surface2:#18181f;--surface3:#1e1e28;--surface4:#252533;
          --border:rgba(255,255,255,0.08);--border2:rgba(255,255,255,0.14);
          --text:#f0f0f8;--text2:rgba(240,240,248,0.6);--text3:rgba(240,240,248,0.35);
          --red:#ef4444;--radius-sm:8px;
        }
        body{background:var(--surface);color:var(--text);font-family:'DM Sans',sans-serif}
        h1,h2,h3{font-family:'Syne',sans-serif;letter-spacing:-0.02em}

        .auth-page{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;position:relative;overflow:hidden;background:var(--surface)}
        .auth-orb{position:absolute;border-radius:50%;filter:blur(80px);opacity:0.15;pointer-events:none}
        .auth-orb-1{width:500px;height:500px;background:var(--primary);top:-180px;right:-120px}
        .auth-orb-2{width:350px;height:350px;background:#8B5CF6;bottom:-100px;left:-80px}
        .auth-grid{position:absolute;inset:0;background-image:linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px);background-size:60px 60px;mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black 0%,transparent 100%)}
        .auth-card{background:var(--surface2);border:1px solid var(--border2);border-radius:24px;padding:36px;width:100%;max-width:420px;position:relative;z-index:1;animation:slideUp .25s ease}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}

        .auth-logo{text-align:center;margin-bottom:24px}
        .auth-logo-text{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;color:var(--text)}
        .auth-logo-text span{color:var(--primary)}
        .logo-dot{width:7px;height:7px;border-radius:50%;background:var(--primary);display:inline-block;margin-left:2px;animation:pulse 2s ease-in-out infinite}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.6;transform:scale(0.85)}}

        .auth-title{font-family:'Syne',sans-serif;font-size:20px;font-weight:700;text-align:center;margin-bottom:6px;color:var(--text)}
        .auth-sub{font-size:14px;color:var(--text2);text-align:center;margin-bottom:28px}
        .academy-badge{background:rgba(91,79,255,0.12);border:1px solid rgba(91,79,255,0.3);border-radius:8px;padding:8px 12px;margin-bottom:16px;font-size:13px;color:#a5a0ff;text-align:center}

        .field{margin-bottom:16px}
        .field-label{font-size:13px;color:var(--text2);margin-bottom:6px;display:block}
        .field-wrap{position:relative;display:flex;align-items:center}
        .field-input{
          width:100%;height:46px;background:var(--surface3);border:1px solid var(--border2);
          border-radius:var(--radius-sm);color:var(--text);padding:0 44px 0 14px;
          font-size:15px;outline:none;transition:border-color .2s;font-family:'DM Sans',sans-serif;
        }
        .field-input.no-icon{padding-right:14px}
        .field-input:focus{border-color:var(--primary)}
        .field-input.has-error{border-color:var(--red)}
        .field-error{font-size:12px;color:var(--red);margin-top:4px}

        .eye-btn{
          position:absolute;right:0;top:0;bottom:0;width:44px;
          display:flex;align-items:center;justify-content:center;
          background:none;border:none;cursor:pointer;
          color:rgba(240,240,248,0.35);transition:color .2s;
          border-radius:0 var(--radius-sm) var(--radius-sm) 0;
        }
        .eye-btn:hover{color:rgba(240,240,248,0.75)}

        .auth-btn{width:100%;height:48px;background:var(--primary);color:#fff;border:none;border-radius:var(--radius-sm);font-size:15px;font-weight:500;cursor:pointer;transition:background .2s, transform .1s;margin-top:8px;font-family:'DM Sans',sans-serif}
        .auth-btn:hover:not(:disabled){background:var(--primary-light)}
        .auth-btn:active:not(:disabled){transform:scale(0.98)}
        .auth-btn:disabled{opacity:0.5;cursor:not-allowed}

        .divider{display:flex;align-items:center;gap:12px;margin:20px 0;color:var(--text3);font-size:13px}
        .divider::before,.divider::after{content:'';flex:1;height:1px;background:var(--border)}

        .google-btn{
          width:100%;height:48px;background:var(--surface3);
          color:var(--text);border:1px solid var(--border2);
          border-radius:var(--radius-sm);font-size:15px;font-weight:500;
          cursor:pointer;transition:background .2s, border-color .2s, transform .1s;
          font-family:'DM Sans',sans-serif;
          display:flex;align-items:center;justify-content:center;gap:10px;
        }
        .google-btn:hover:not(:disabled){background:var(--surface);border-color:rgba(255,255,255,0.25)}
        .google-btn:active:not(:disabled){transform:scale(0.98)}
        .google-btn:disabled{opacity:0.5;cursor:not-allowed}

        .alt-btn{width:100%;height:48px;background:transparent;color:var(--primary-light);border:1px solid var(--primary);border-radius:var(--radius-sm);font-size:15px;font-weight:500;cursor:pointer;transition:background .2s;font-family:'DM Sans',sans-serif;text-decoration:none;display:flex;align-items:center;justify-content:center}
        .alt-btn:hover{background:var(--primary-bg)}

        .toast{position:fixed;top:20px;right:20px;z-index:300;padding:14px 20px;border-radius:12px;font-size:14px;font-weight:500;animation:toastIn .3s;max-width:360px}
        @keyframes toastIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        .toast-success{background:#22c55e;color:#fff}
        .toast-error{background:#ef4444;color:#fff}
        .toast-info{background:var(--primary);color:#fff}

        .back-link{position:absolute;top:20px;left:24px;z-index:2;font-size:13px;color:var(--text3);text-decoration:none;display:flex;align-items:center;gap:5px;transition:color .2s}
        .back-link:hover{color:var(--text)}

        #g-btn-fallback-signup{position:fixed;bottom:100px;left:50%;transform:translateX(-50%);z-index:999}
      `}</style>

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div id="g-btn-fallback-signup" />

      <div className="auth-page">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-grid" />

        <Link to="/" className="back-link">← Voltar</Link>

        <div className="auth-card">
          <div className="auth-logo">
            <span className="auth-logo-text">Fit<span>Ness</span><span className="logo-dot" /></span>
          </div>

          {searchParams.get('academy') && (
            <div className="academy-badge">
              🏋️ Entrando pelo link da academia <strong>{searchParams.get('academy')}</strong>
            </div>
          )}

          <div className="auth-title">Crie sua conta</div>
          <div className="auth-sub">Grátis para sempre. Sem cartão.</div>

          {/* Google primeiro — fluxo mais rápido */}
          <button className="google-btn" onClick={doGoogleSignup} disabled={gLoading} style={{ marginBottom: 4 }}>
            <GoogleIcon />
            {gLoading ? 'Aguarde...' : 'Cadastrar com Google'}
          </button>

          <div className="divider">ou com e-mail</div>

          <form onSubmit={doSignup}>
            {/* E-mail */}
            <div className="field">
              <label className="field-label">E-mail</label>
              <div className="field-wrap">
                <input
                  className={`field-input no-icon ${errors.email ? 'has-error' : ''}`}
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              {errors.email && <div className="field-error">{errors.email}</div>}
            </div>

            {/* Senha */}
            <div className="field">
              <label className="field-label">Senha</label>
              <div className="field-wrap">
                <input
                  className={`field-input ${errors.pass ? 'has-error' : ''}`}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Esconder senha' : 'Mostrar senha'}
                >
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.pass && <div className="field-error">{errors.pass}</div>}
            </div>

            {/* Confirmar senha */}
            <div className="field">
              <label className="field-label">Confirmar senha</label>
              <div className="field-wrap">
                <input
                  className={`field-input ${errors.pass2 ? 'has-error' : ''}`}
                  type={showPass2 ? 'text' : 'password'}
                  placeholder="Repita a senha"
                  value={pass2}
                  onChange={e => setPass2(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPass2(v => !v)}
                  aria-label={showPass2 ? 'Esconder confirmação' : 'Mostrar confirmação'}
                >
                  {showPass2 ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.pass2 && <div className="field-error">{errors.pass2}</div>}
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <div className="divider">já tem conta?</div>
          <Link to="/login" className="alt-btn">Entrar na minha conta</Link>
        </div>
      </div>
    </>
  );
}