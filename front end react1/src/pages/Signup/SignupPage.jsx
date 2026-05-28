import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API = 'https://fitness-app-produ-o.onrender.com';

export default function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  function showToast(msg, type = 'info') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function doSignup(e) {
    e?.preventDefault();
    const errs = {};
    if (!email || !/\S+@\S+\.\S+/.test(email)) errs.email = 'E-mail inválido';
    if (!pass || pass.length < 6) errs.pass = 'Mínimo 6 caracteres';
    if (pass !== pass2) errs.pass2 = 'Senhas não coincidem';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setErrors({});
    try {
      const r = await fetch(API + '/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || 'Erro ao criar conta');
      }
      showToast('Conta criada! Fazendo login...', 'success');
      // Auto-login
      setTimeout(async () => {
        try {
          const lr = await fetch(API + '/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: pass }),
          });
          const data = await lr.json();
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('ft_user', JSON.stringify({ email: data.user?.email || email, id: data.user?.user_id }));
          navigate('/home');
        } catch {
          navigate('/login');
        }
      }, 800);
    } catch (err) {
      setErrors({ email: err.message || 'Erro ao criar conta' });
    }
    setLoading(false);
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
        h1,h2,h3,h4{font-family:'Syne',sans-serif;letter-spacing:-0.02em}
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
        .field{margin-bottom:16px}
        .field-label{font-size:13px;color:var(--text2);margin-bottom:6px;display:block}
        .field-input{width:100%;height:46px;background:var(--surface3);border:1px solid var(--border2);border-radius:var(--radius-sm);color:var(--text);padding:0 14px;font-size:15px;outline:none;transition:border-color .2s;font-family:'DM Sans',sans-serif}
        .field-input:focus{border-color:var(--primary)}
        .field-error{font-size:12px;color:var(--red);margin-top:4px}
        .auth-btn{width:100%;height:48px;background:var(--primary);color:#fff;border:none;border-radius:var(--radius-sm);font-size:15px;font-weight:500;cursor:pointer;transition:all .2s;margin-top:8px;font-family:'DM Sans',sans-serif}
        .auth-btn:hover:not(:disabled){background:var(--primary-light)}
        .auth-btn:disabled{opacity:0.5;cursor:not-allowed}
        .divider{display:flex;align-items:center;gap:12px;margin:20px 0;color:var(--text3);font-size:13px}
        .divider::before,.divider::after{content:'';flex:1;height:1px;background:var(--border)}
        .alt-btn{width:100%;height:48px;background:transparent;color:var(--primary-light);border:1px solid var(--primary);border-radius:var(--radius-sm);font-size:15px;font-weight:500;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;text-decoration:none;display:flex;align-items:center;justify-content:center}
        .alt-btn:hover{background:var(--primary-bg)}
        .toast{position:fixed;top:20px;right:20px;z-index:300;padding:14px 20px;border-radius:12px;font-size:14px;font-weight:500;animation:toastIn .3s;max-width:360px}
        @keyframes toastIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        .toast-success{background:#22c55e;color:#fff}
        .toast-error{background:#ef4444;color:#fff}
        .toast-info{background:var(--primary);color:#fff}
        .back-link{position:absolute;top:20px;left:24px;z-index:2;font-size:13px;color:var(--text3);text-decoration:none;display:flex;align-items:center;gap:5px;transition:color .2s}
        .back-link:hover{color:var(--text)}
      `}</style>

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

      <div className="auth-page">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-grid" />

        <Link to="/" className="back-link">← Voltar</Link>

        <div className="auth-card">
          <div className="auth-logo">
            <span className="auth-logo-text">Fit<span>Track</span><span className="logo-dot" /></span>
          </div>
          <div className="auth-title">Crie sua conta</div>
          <div className="auth-sub">Grátis para sempre. Sem cartão.</div>

          <form onSubmit={doSignup}>
            <div className="field">
              <label className="field-label">E-mail</label>
              <input
                className="field-input"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
              {errors.email && <div className="field-error">{errors.email}</div>}
            </div>

            <div className="field">
              <label className="field-label">Senha</label>
              <input
                className="field-input"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={pass}
                onChange={e => setPass(e.target.value)}
                autoComplete="new-password"
              />
              {errors.pass && <div className="field-error">{errors.pass}</div>}
            </div>

            <div className="field">
              <label className="field-label">Confirmar senha</label>
              <input
                className="field-input"
                type="password"
                placeholder="Repita a senha"
                value={pass2}
                onChange={e => setPass2(e.target.value)}
                autoComplete="new-password"
              />
              {errors.pass2 && <div className="field-error">{errors.pass2}</div>}
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <div className="divider">ou</div>
          <Link to="/login" className="alt-btn">Já tenho conta</Link>
        </div>
      </div>
    </>
  );
}