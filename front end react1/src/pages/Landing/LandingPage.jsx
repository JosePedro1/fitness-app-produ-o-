import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/* ── Tipografia via Google Fonts ── */
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
    .lp-root { font-family: 'DM Sans', sans-serif; }
    .lp-root h1, .lp-root h2, .lp-root h3, .lp-root .syne { font-family: 'Syne', sans-serif; }
    .lp-logo-dot { animation: lp-pulse 2s ease-in-out infinite; }
    @keyframes lp-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(.85)} }
    .lp-feature-card::before {
      content:''; position:absolute; inset:0;
      background:linear-gradient(135deg,rgba(91,79,255,.12) 0%,transparent 60%);
      opacity:0; transition:opacity .3s; border-radius:20px;
    }
    .lp-feature-card:hover::before { opacity:1; }
    .lp-feature-card:hover { border-color:#5B4FFF; transform:translateY(-4px); box-shadow:0 12px 40px rgba(91,79,255,.2); }
    .lp-nav-link:hover { color:#f0f0f8; background:#1e1e28; }
    .lp-hero-grid {
      background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),
        linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);
      background-size:60px 60px;
      mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black 0%,transparent 100%);
    }
    .lp-service-card:hover { border-color:#5B4FFF; transform:translateY(-3px); box-shadow:0 8px 24px rgba(91,79,255,.15); }
    .lp-cta-card::before {
      content:''; position:absolute; top:-80px; left:50%; transform:translateX(-50%);
      width:400px; height:400px; background:#5B4FFF; border-radius:50%;
      filter:blur(80px); opacity:.12; pointer-events:none;
    }
    .lp-btn-primary:hover { background:#7B6FFF; transform:translateY(-2px); box-shadow:0 8px 24px rgba(91,79,255,.4); }
    .lp-btn-secondary:hover { background:#1e1e28; border-color:#5B4FFF; transform:translateY(-2px); }
    ::-webkit-scrollbar { width:6px; }
    ::-webkit-scrollbar-track { background:#111118; }
    ::-webkit-scrollbar-thumb { background:#252533; border-radius:3px; }
    ::-webkit-scrollbar-thumb:hover { background:#5B4FFF; }
  `}</style>
);

/* ── Classificação IMC ── */
const classificarIMC = (v) => {
  if (v < 18.5) return { label: 'Abaixo do peso', cor: '#60a5fa', exercises: ['Supino Reto','Levantamento Terra','Agachamento Livre','Desenvolvimento Halteres','Rosca Direta'] };
  if (v < 25)   return { label: 'Peso normal',    cor: '#22c55e', exercises: ['Supino Reto','Remada Curvada','Agachamento Livre','Prancha','Elevação Lateral'] };
  if (v < 30)   return { label: 'Sobrepeso',      cor: '#f59e0b', exercises: ['Flexão de Braços','Agachamento Sumô','Prancha','Abdominal Crunch','Elevação de Pernas'] };
  if (v < 35)   return { label: 'Obesidade grau 1', cor: '#f97316', exercises: ['Flexão de Braços','Panturrilha em Pé','Prancha','Abdominal Crunch','Russian Twist'] };
  return              { label: 'Obesidade grau 2+', cor: '#ef4444', exercises: ['Flexão de Braços','Prancha','Abdominal Crunch','Panturrilha em Pé','Elevação Lateral'] };
};

/* ── Componentes ── */
const NavLink = ({ children, onClick }) => (
  <span
    onClick={onClick}
    className="lp-nav-link cursor-pointer px-3 py-2 rounded-lg text-sm transition-all duration-200"
    style={{ color: 'rgba(240,240,248,.6)' }}
  >
    {children}
  </span>
);

const FeatureCard = ({ icon, title, desc }) => (
  <div
    className="lp-feature-card relative cursor-pointer rounded-[20px] p-7 border transition-all duration-300 overflow-hidden"
    style={{ background: '#18181f', borderColor: 'rgba(255,255,255,.08)' }}
  >
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center mb-[18px] text-[22px] relative z-10 border"
      style={{ background: 'rgba(91,79,255,.08)', borderColor: 'rgba(91,79,255,.14)' }}
    >
      {icon}
    </div>
    <div className="syne text-[17px] font-bold mb-2 relative z-10" style={{ color: '#f0f0f8' }}>{title}</div>
    <div className="text-[14px] leading-[1.65] relative z-10" style={{ color: 'rgba(240,240,248,.6)' }}>{desc}</div>
    <div className="relative z-10 mt-3 text-[13px] inline-flex items-center gap-1 transition-all duration-200" style={{ color: '#7B6FFF' }}>
      Explorar →
    </div>
  </div>
);

const Testimonial = ({ stars, text, initials, name, role }) => (
  <div className="rounded-[20px] p-6 border" style={{ background: '#18181f', borderColor: 'rgba(255,255,255,.08)' }}>
    <div className="mb-3 text-sm" style={{ color: '#f59e0b' }}>{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</div>
    <div className="text-[14px] leading-[1.7] mb-4 italic" style={{ color: 'rgba(240,240,248,.6)' }}>"{text}"</div>
    <div className="flex items-center gap-[10px]">
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold text-white syne" style={{ background: '#5B4FFF' }}>{initials}</div>
      <div>
        <div className="text-[14px] font-medium" style={{ color: '#f0f0f8' }}>{name}</div>
        <div className="text-[12px]" style={{ color: 'rgba(240,240,248,.35)' }}>{role}</div>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════ MAIN ══════════════════════════════ */
const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [imcResult, setImcResult] = useState(null);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  const calcIMC = () => {
    const p = parseFloat(peso), h = parseFloat(altura);
    if (!p || !h) return;
    const val = (p / ((h / 100) ** 2)).toFixed(1);
    setImcResult({ val, ...classificarIMC(parseFloat(val)) });
  };

  const features = [
    { icon: '🏋️', title: 'Rotinas de Treino',       desc: 'Crie rotinas completas com exercícios da biblioteca, organize por dias da semana e marque como concluídos.' },
    { icon: '⏱️', title: 'Cronômetro HIIT',          desc: 'Timer de séries e descanso com alertas sonoros, presets prontos (Tabata, Força, HIIT) e rastreamento de rounds.' },
    { icon: '📈', title: 'Progresso Corporal',       desc: 'Registre peso e medidas corporais e visualize sua evolução com gráficos de barras por data.' },
    { icon: '📅', title: 'Calendário de Treinos',    desc: 'Heatmap estilo GitHub com streak, estatísticas e histórico completo. Registre treinos manuais ou pelo cronômetro.' },
    { icon: '🧮', title: 'Calculadora IMC',          desc: 'Calcule seu IMC e receba um plano de treino personalizado com rotação A/B/C e progressão de fase automática.' },
    { icon: '📚', title: 'Biblioteca de Exercícios', desc: '48+ exercícios em 8 grupos musculares com vídeos do YouTube integrados diretamente no app.' },
  ];

  const stats = [
    { num: '7',   label: 'Funcionalidades' },
    { num: '100%', label: 'Gratuito'       },
    { num: '48+',  label: 'Exercícios'     },
    { num: '∞',    label: 'Rotinas'        },
  ];

  return (
    <div className="lp-root" style={{ background: '#111118', color: '#f0f0f8', minHeight: '100vh', overflowX: 'hidden' }}>
      <FontLoader />

      {/* ── NAV ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-[5vw]"
        style={{ height: 64, background: 'rgba(17,17,24,.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,.08)' }}
      >
        <div className="syne flex items-center gap-2 text-[20px] font-black" style={{ color: '#f0f0f8' }}>
          Fit<span style={{ color: '#5B4FFF' }}>Track</span>
          <span className="lp-logo-dot inline-block w-2 h-2 rounded-full ml-0.5" style={{ background: '#5B4FFF' }} />
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink onClick={() => scrollTo('features')}>Funcionalidades</NavLink>
          <NavLink onClick={() => scrollTo('imc-section')}>Calcular IMC</NavLink>
          <NavLink onClick={() => scrollTo('depoimentos')}>Depoimentos</NavLink>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/login" className="lp-nav-link hidden md:inline-flex px-3 py-2 rounded-lg text-sm transition-all duration-200" style={{ color: 'rgba(240,240,248,.6)' }}>
            Entrar
          </Link>
          <Link
            to="/signup"
            className="lp-btn-primary px-5 py-[9px] rounded-lg text-sm font-medium text-white border-none cursor-pointer transition-all duration-200 inline-flex items-center"
            style={{ background: '#5B4FFF' }}
          >
            Começar grátis
          </Link>
          {/* Mobile menu toggle */}
          <button className="md:hidden p-2 rounded-lg text-lg" style={{ background: 'none', border: 'none', color: '#f0f0f8', cursor: 'pointer' }} onClick={() => setMobileOpen(v => !v)}>
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed top-16 left-0 right-0 z-40 flex flex-col gap-1 p-4 md:hidden" style={{ background: '#18181f', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <NavLink onClick={() => scrollTo('features')}>Funcionalidades</NavLink>
          <NavLink onClick={() => scrollTo('imc-section')}>Calcular IMC</NavLink>
          <NavLink onClick={() => scrollTo('depoimentos')}>Depoimentos</NavLink>
          <Link to="/login" className="lp-nav-link px-3 py-2 rounded-lg text-sm" style={{ color: 'rgba(240,240,248,.6)' }}>Entrar</Link>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="relative flex items-center justify-center text-center overflow-hidden" style={{ minHeight: '100vh', padding: '80px 5vw 60px' }}>
        {/* Orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute rounded-full" style={{ width: 600, height: 600, background: '#5B4FFF', top: -200, right: -150, filter: 'blur(80px)', opacity: .18 }} />
          <div className="absolute rounded-full" style={{ width: 400, height: 400, background: '#8B5CF6', bottom: -100, left: -100, filter: 'blur(80px)', opacity: .18 }} />
          <div className="lp-hero-grid absolute inset-0" />
        </div>

        <div className="relative z-10 max-w-[680px]">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-[14px] py-[6px] rounded-full text-[13px] mb-7 border" style={{ background: 'rgba(91,79,255,.08)', borderColor: '#5B4FFF', color: '#7B6FFF' }}>
            <span className="lp-logo-dot inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#5B4FFF' }} />
            Novo · Plano Alimentar Inteligente
          </div>

          <h1 className="font-black leading-[1.05] mb-6" style={{ fontSize: 'clamp(40px,7vw,72px)', color: '#f0f0f8', letterSpacing: '-0.02em' }}>
            Seu fitness,<br />
            <span style={{ color: '#5B4FFF' }}>organizado</span><br />
            de verdade.
          </h1>

          <p className="mb-9 mx-auto" style={{ fontSize: 17, color: 'rgba(240,240,248,.6)', maxWidth: 500, lineHeight: 1.7 }}>
            Rotinas personalizadas, acompanhamento de progresso, cronômetro HIIT e muito mais. Tudo num único app, feito para quem leva o treino a sério.
          </p>

          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              to="/signup"
              className="lp-btn-primary inline-flex items-center gap-2 px-7 py-[14px] rounded-xl text-[15px] font-medium text-white transition-all duration-200"
              style={{ background: '#5B4FFF' }}
            >
              ✦ Criar conta grátis
            </Link>
            <Link
              to="/login"
              className="lp-btn-secondary inline-flex items-center px-7 py-[14px] rounded-xl text-[15px] font-medium transition-all duration-200 border"
              style={{ background: 'transparent', color: '#f0f0f8', borderColor: 'rgba(255,255,255,.14)' }}
            >
              Já tenho conta
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-6 justify-center mt-14 flex-wrap">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <div className="syne text-[28px] font-black" style={{ color: '#5B4FFF' }}>{s.num}</div>
                <div className="text-[12px] mt-0.5" style={{ color: 'rgba(240,240,248,.35)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '80px 5vw' }}>
        <div className="text-center mb-14">
          <div className="inline-block px-[14px] py-1 rounded-full text-[12px] font-medium uppercase tracking-[.06em] mb-[14px] border" style={{ background: 'rgba(91,79,255,.08)', color: '#7B6FFF', borderColor: 'transparent' }}>
            Funcionalidades
          </div>
          <h2 className="font-black mb-[14px]" style={{ fontSize: 'clamp(28px,4vw,42px)', letterSpacing: '-0.02em' }}>
            Tudo que você precisa<br />para evoluir
          </h2>
          <p className="mx-auto text-[16px]" style={{ color: 'rgba(240,240,248,.6)', maxWidth: 560 }}>
            De rotinas personalizadas a heatmap de treinos — o FitTrack centraliza sua jornada fitness em um só lugar.
          </p>
        </div>

        <div className="grid gap-4 mx-auto" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', maxWidth: 1100 }}>
          {features.map(f => (
            <div key={f.title} onClick={() => navigate('/signup')}>
              <FeatureCard {...f} />
            </div>
          ))}
        </div>
      </section>

      {/* ── IMC ── */}
      <section id="imc-section" style={{ padding: '80px 5vw', background: '#18181f', borderTop: '1px solid rgba(255,255,255,.08)', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <div className="text-center mb-14">
          <div className="inline-block px-[14px] py-1 rounded-full text-[12px] font-medium uppercase tracking-[.06em] mb-[14px]" style={{ background: 'rgba(91,79,255,.08)', color: '#7B6FFF' }}>
            Ferramenta gratuita
          </div>
          <h2 className="font-black mb-[14px]" style={{ fontSize: 'clamp(28px,4vw,42px)', letterSpacing: '-0.02em' }}>Calcule seu IMC agora</h2>
          <p className="mx-auto text-[16px]" style={{ color: 'rgba(240,240,248,.6)', maxWidth: 560 }}>Sem precisar criar conta. Descubra seu índice e veja um plano de treino sugerido.</p>
        </div>

        <div className="mx-auto" style={{ maxWidth: 720 }}>
          <div className="rounded-[20px] p-8 border" style={{ background: '#1e1e28', borderColor: 'rgba(255,255,255,.08)' }}>
            <div className="flex gap-4 flex-wrap items-end mb-5">
              {[
                { label: 'Peso (kg)', placeholder: 'Ex: 75', value: peso, set: setPeso },
                { label: 'Altura (cm)', placeholder: 'Ex: 175', value: altura, set: setAltura },
              ].map(f => (
                <div key={f.label} className="flex-1" style={{ minWidth: 160 }}>
                  <label className="block text-[13px] mb-1.5" style={{ color: 'rgba(240,240,248,.6)' }}>{f.label}</label>
                  <input
                    type="number"
                    placeholder={f.placeholder}
                    value={f.value}
                    onChange={e => f.set(e.target.value)}
                    className="w-full h-11 rounded-lg px-[14px] text-[15px] outline-none transition-all duration-200"
                    style={{ background: '#252533', border: '1px solid rgba(255,255,255,.14)', color: '#f0f0f8' }}
                    onFocus={e => e.target.style.borderColor = '#5B4FFF'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.14)'}
                  />
                </div>
              ))}
              <button
                onClick={calcIMC}
                className="h-11 px-6 rounded-lg text-sm font-medium text-white transition-all duration-200"
                style={{ background: '#5B4FFF', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
                onMouseEnter={e => e.target.style.background = '#7B6FFF'}
                onMouseLeave={e => e.target.style.background = '#5B4FFF'}
              >
                Calcular
              </button>
            </div>

            {imcResult && (
              <div className="rounded-xl p-6 border mt-2" style={{ borderColor: imcResult.cor + '40', background: '#111118' }}>
                <div className="syne text-[18px] font-bold mb-1" style={{ color: imcResult.cor }}>{imcResult.label}</div>
                <div className="syne text-[28px] font-black mb-2">IMC: {imcResult.val}</div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {imcResult.exercises.map(ex => (
                    <span key={ex} className="px-3 py-1 rounded-full text-[12px] border" style={{ background: 'rgba(91,79,255,.08)', color: '#7B6FFF', borderColor: 'rgba(91,79,255,.14)' }}>
                      {ex}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full h-11 rounded-lg text-sm font-medium text-white transition-all duration-200"
                  style={{ background: '#5B4FFF', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={e => e.target.style.background = '#7B6FFF'}
                  onMouseLeave={e => e.target.style.background = '#5B4FFF'}
                >
                  Criar conta para salvar plano completo →
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTOS ── */}
      {/* <section id="depoimentos" style={{ padding: '80px 5vw' }}>
        <div className="text-center mb-14">
          <div className="inline-block px-[14px] py-1 rounded-full text-[12px] font-medium uppercase tracking-[.06em] mb-[14px]" style={{ background: 'rgba(91,79,255,.08)', color: '#7B6FFF' }}>
            Depoimentos
          </div>
          <h2 className="font-black" style={{ fontSize: 'clamp(28px,4vw,42px)', letterSpacing: '-0.02em' }}>O que dizem os usuários</h2>
        </div>

        <div className="grid gap-4 mx-auto" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', maxWidth: 1100 }}>
          <Testimonial stars={5} text="O heatmap de calendário me motiva a não quebrar a sequência. Já são 34 dias de streak e não pretendo parar." initials="LM" name="Lucas M." role="Usuário há 2 meses" />
          <Testimonial stars={5} text="O cronômetro HIIT com alertas sonoros é perfeito para treinos intensos. Uso o preset Tabata todo dia." initials="CS" name="Camila S." role="Usuária há 1 mês" />
          <Testimonial stars={4} text="A calculadora de IMC que gera treino personalizado é surpreendentemente boa. Economizei dinheiro de personal." initials="RP" name="Rafael P." role="Usuário há 3 semanas" />
        </div>
      </section> */}

      {/* ── CTA FINAL ── */}
      <section style={{ padding: '100px 5vw', textAlign: 'center' }}>
        <div className="lp-cta-card relative mx-auto rounded-[24px] border overflow-hidden" style={{ maxWidth: 680, background: '#18181f', borderColor: 'rgba(255,255,255,.08)', padding: '60px 40px' }}>
          <h2 className="font-black mb-[14px] relative" style={{ fontSize: 'clamp(28px,4vw,40px)', letterSpacing: '-0.02em' }}>Comece hoje mesmo.</h2>
          <p className="mb-8 relative text-[16px]" style={{ color: 'rgba(240,240,248,.6)' }}>Totalmente gratuito. Sem cartão de crédito. Em menos de 1 minuto você já tem seu primeiro treino configurado.</p>
          <Link
            to="/signup"
            className="lp-btn-primary inline-flex items-center gap-2 px-7 py-[14px] rounded-xl text-[15px] font-medium text-white transition-all duration-200 relative"
            style={{ background: '#5B4FFF' }}
          >
            ✦ Criar conta grátis
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="flex items-center justify-between flex-wrap gap-4 px-[5vw] py-10" style={{ borderTop: '1px solid rgba(255,255,255,.08)' }}>
        <div className="syne text-[18px] font-black">Fit<span style={{ color: '#5B4FFF' }}>Track</span></div>
        <div className="flex gap-5">
          {[
            { label: 'Funcionalidades', action: () => scrollTo('features') },
            { label: 'IMC',             action: () => scrollTo('imc-section') },
            { label: 'Entrar',          action: () => navigate('/login') },
          ].map(l => (
            <span key={l.label} onClick={l.action} className="cursor-pointer text-[13px] transition-colors duration-200 hover:text-white" style={{ color: 'rgba(240,240,248,.35)' }}>
              {l.label}
            </span>
          ))}
        </div>
        <div className="text-[12px]" style={{ color: 'rgba(240,240,248,.35)' }}>© 2025 FitTrack</div>
      </footer>
    </div>
  );
};

export default LandingPage;