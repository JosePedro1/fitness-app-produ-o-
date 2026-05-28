import React from 'react';

/* ── Tipografia ── */
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
    .auth-root, .auth-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
    .auth-root h1, .auth-root h2, .auth-root .auth-syne { font-family: 'Syne', sans-serif; }
    .auth-logo-dot { animation: auth-pulse 2s ease-in-out infinite; }
    @keyframes auth-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(.85)} }
    .auth-card { animation: auth-slide-up .25s ease both; }
    @keyframes auth-slide-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    .auth-orb-1 { position:absolute; width:500px; height:500px; background:#5B4FFF; top:-180px; right:-120px; border-radius:50%; filter:blur(80px); opacity:.15; pointer-events:none; }
    .auth-orb-2 { position:absolute; width:350px; height:350px; background:#8B5CF6; bottom:-100px; left:-80px; border-radius:50%; filter:blur(80px); opacity:.15; pointer-events:none; }
    .auth-grid {
      position:absolute; inset:0;
      background-image: linear-gradient(rgba(255,255,255,.06) 1px,transparent 1px), linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px);
      background-size: 60px 60px;
      mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%);
      pointer-events:none;
    }
    .auth-primary-btn { background:#5B4FFF; transition:background .2s; }
    .auth-primary-btn:hover:not(:disabled) { background:#7B6FFF; }
    .auth-primary-btn:disabled { opacity:.5; cursor:not-allowed; }
    .auth-secondary-btn { background:transparent; border:1px solid #5B4FFF; color:#7B6FFF; transition:background .2s; }
    .auth-secondary-btn:hover { background:rgba(91,79,255,.08); }
    .auth-back { position:absolute; top:20px; left:24px; z-index:10; font-size:13px; color:rgba(240,240,248,.35); text-decoration:none; display:flex; align-items:center; gap:5px; transition:color .2s; cursor:pointer; background:none; border:none; }
    .auth-back:hover { color:rgba(240,240,248,.8); }
  `}</style>
);

const AuthLayout = ({
  title,
  primaryBtnText,
  secondaryBtnText,
  onSubmit,
  onNavigate,
  disablePrimaryBtn,
  children,
}) => (
  <>
    <FontLoader />
    <main
      className="auth-root"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
        background: '#111118',
        color: '#f0f0f8',
      }}
    >
      {/* Background */}
      <div className="auth-orb-1" />
      <div className="auth-orb-2" />
      <div className="auth-grid" />

      {/* Card */}
      <div
        className="auth-card"
        style={{
          background: '#18181f',
          border: '1px solid rgba(255,255,255,.14)',
          borderRadius: 24,
          padding: '36px',
          width: '100%',
          maxWidth: 420,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span className="auth-syne" style={{ fontSize: 22, fontWeight: 800, color: '#f0f0f8' }}>
            Fit<span style={{ color: '#5B4FFF' }}>Track</span>
            <span
              className="auth-logo-dot"
              style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#5B4FFF', marginLeft: 3, verticalAlign: 'middle' }}
            />
          </span>
        </div>

        {/* Title */}
        <h2 className="auth-syne" style={{ fontSize: 20, fontWeight: 700, textAlign: 'center', marginBottom: 28, color: '#f0f0f8' }}>
          {title}
        </h2>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {children}
        </div>

        {/* Buttons */}
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={onSubmit}
            disabled={disablePrimaryBtn}
            className="auth-primary-btn"
            style={{
              width: '100%', height: 48, borderRadius: 8,
              fontSize: 15, fontWeight: 500, color: '#fff',
              border: 'none', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {primaryBtnText}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(240,240,248,.35)', fontSize: 13 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.08)' }} />
            <span>ou</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.08)' }} />
          </div>

          <button
            onClick={onNavigate}
            className="auth-secondary-btn"
            style={{
              width: '100%', height: 48, borderRadius: 8,
              fontSize: 15, fontWeight: 500,
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {secondaryBtnText}
          </button>
        </div>
      </div>
    </main>
  </>
);

export default AuthLayout;
