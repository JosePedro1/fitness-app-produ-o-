import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/* ─────────────────────────────────────────────────────────
   Direção de design
   Fundo carvão quente (não preto-azulado), tipografia condensada
   de placar/vestiário para títulos, corpo em sans humanista.
   Um único dispositivo visual — a "placa" (barra de peso) —
   é reaproveitado como marcador de item, indicador de nota e
   textura de fundo, em vez de emojis, pílulas e blobs roxos.
───────────────────────────────────────────────────────── */

const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Work+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');

    .lp-root { font-family: 'Work Sans', sans-serif; }
    .lp-display { font-family: 'Bebas Neue', sans-serif; letter-spacing: .015em; line-height: .92; }

    .lp-stripes {
      background-image: repeating-linear-gradient(
        -35deg,
        rgba(243,238,226,.05) 0px,
        rgba(243,238,226,.05) 2px,
        transparent 2px,
        transparent 22px
      );
    }

    .lp-nav-link { color: rgba(243,238,226,.62); text-decoration: none; border-bottom: 1px solid transparent; padding-bottom: 3px; transition: color .15s, border-color .15s; }
    .lp-nav-link:hover { color: #F3EEE2; border-color: #D3452B; }

    .lp-btn-primary { background: #D3452B; color: #F3EEE2; transition: background-color .15s; }
    .lp-btn-primary:hover { background: #B93A23; }

    .lp-btn-outline { background: transparent; color: #F3EEE2; border: 1px solid rgba(243,238,226,.22); transition: border-color .15s, background-color .15s; }
    .lp-btn-outline:hover { border-color: #F3EEE2; background: rgba(243,238,226,.04); }

    .lp-row { border-top: 1px solid rgba(243,238,226,.12); transition: background-color .15s; cursor: pointer; }
    .lp-row:hover { background: rgba(243,238,226,.03); }
    .lp-row:last-child { border-bottom: 1px solid rgba(243,238,226,.12); }

    .lp-input { background: transparent; border: none; border-bottom: 1px solid rgba(243,238,226,.28); color: #F3EEE2; outline: none; transition: border-color .15s; }
    .lp-input:focus { border-color: #D3452B; }

    .lp-note { border: 1px solid rgba(243,238,226,.14); }

    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #17150F; }
    ::-webkit-scrollbar-thumb { background: #3A362B; border-radius: 0; }
    ::-webkit-scrollbar-thumb:hover { background: #D3452B; }
  `}</style>
);

/* Marcador em forma de placa — usado como bullet, nota e textura */
const Plate = ({ filled, size = 18 }) => (
  <div
    style={{
      width: 9,
      height: size,
      background: filled ? '#D3452B' : 'transparent',
      border: `1px solid ${filled ? '#D3452B' : 'rgba(243,238,226,.3)'}`,
    }}
  />
);

const PlateRating = ({ value }) => {
  const heights = [12, 16, 20, 24, 28];
  return (
    <div className="flex items-end gap-[3px]">
      {heights.map((h, i) => (
        <Plate key={i} filled={i < value} size={h} />
      ))}
    </div>
  );
};

const NavLink = ({ children, onClick }) => (
  <span onClick={onClick} className="lp-nav-link cursor-pointer text-[14px]">
    {children}
  </span>
);

const FeatureRow = ({ tag, title, desc, onClick }) => (
  <div className="lp-row grid gap-4 py-6 items-start" style={{ gridTemplateColumns: '64px 1fr' }} onClick={onClick}>
    <div
      className="lp-display flex items-center justify-center text-[15px]"
      style={{ width: 48, height: 48, border: '1px solid #D3452B', color: '#D3452B' }}
    >
      {tag}
    </div>
    <div>
      <div className="text-[16px] font-semibold mb-1" style={{ color: '#F3EEE2' }}>{title}</div>
      <div className="text-[14px] leading-[1.6]" style={{ color: 'rgba(243,238,226,.6)', maxWidth: 460 }}>{desc}</div>
    </div>
  </div>
);

const Note = ({ rating, text, name, role }) => (
  <div className="lp-note relative p-6" style={{ background: '#1D1B14' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, width: 26, height: 5, background: '#D3452B' }} />
    <PlateRating value={rating} />
    <div className="text-[14px] leading-[1.7] my-4" style={{ color: 'rgba(243,238,226,.72)' }}>{text}</div>
    <div className="flex items-baseline justify-between border-t pt-3" style={{ borderColor: 'rgba(243,238,226,.12)' }}>
      <span className="text-[13px] font-medium" style={{ color: '#F3EEE2' }}>{name}</span>
      <span className="text-[12px]" style={{ color: 'rgba(243,238,226,.4)' }}>{role}</span>
    </div>
  </div>
);

/* ── Classificação IMC ── */
const classificarIMC = (v) => {
  if (v < 18.5) return { label: 'Abaixo do peso', cor: '#6FA8DC', exercises: ['Supino Reto','Levantamento Terra','Agachamento Livre','Desenvolvimento Halteres','Rosca Direta'] };
  if (v < 25)   return { label: 'Peso normal',    cor: '#7FB069', exercises: ['Supino Reto','Remada Curvada','Agachamento Livre','Prancha','Elevação Lateral'] };
  if (v < 30)   return { label: 'Sobrepeso',      cor: '#E8B23D', exercises: ['Flexão de Braços','Agachamento Sumô','Prancha','Abdominal Crunch','Elevação de Pernas'] };
  if (v < 35)   return { label: 'Obesidade grau 1', cor: '#D3452B', exercises: ['Flexão de Braços','Panturrilha em Pé','Prancha','Abdominal Crunch','Russian Twist'] };
  return              { label: 'Obesidade grau 2+', cor: '#B93A23', exercises: ['Flexão de Braços','Prancha','Abdominal Crunch','Panturrilha em Pé','Elevação Lateral'] };
};

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
    { tag: 'RT',  title: 'Rotinas de treino',      desc: 'Monte rotinas com exercícios da biblioteca, organize por dia da semana e marque cada treino como concluído.' },
    { tag: 'HIIT', title: 'Cronômetro de séries',  desc: 'Timer de série e descanso com aviso sonoro, presets prontos (Tabata, Força, HIIT) e contagem de rounds.' },
    { tag: 'PG',  title: 'Progresso corporal',      desc: 'Registre peso e medidas ao longo do tempo e acompanhe a evolução em gráficos por data.' },
    { tag: 'CAL', title: 'Calendário de treinos',   desc: 'Mapa de calor com sequência de dias treinados, estatísticas e histórico — manual ou puxado do cronômetro.' },
    { tag: 'IMC', title: 'Calculadora de IMC',      desc: 'Calcule seu IMC e receba uma rotação de treino A/B/C com progressão de fase automática.' },
    { tag: 'BIB', title: 'Biblioteca de exercícios', desc: '48 exercícios em 8 grupos musculares, cada um com vídeo demonstrativo do YouTube.' },
  ];

  const stats = [
    { num: '48',  label: 'exercícios catalogados' },
    { num: '8',   label: 'grupos musculares' },
    { num: '100', label: '% gratuito', suffix: '%' },
    { num: '0',   label: 'cartão de crédito exigido' },
  ];

  return (
    <div className="lp-root" style={{ background: '#17150F', color: '#F3EEE2', minHeight: '100vh', overflowX: 'hidden' }}>
      <FontLoader />

      {/* ── NAV ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-[5vw]"
        style={{ height: 60, background: 'rgba(23,21,15,.92)', borderBottom: '1px solid rgba(243,238,226,.12)' }}
      >
        <div className="lp-display text-[24px]" style={{ color: '#F3EEE2' }}>
          FIT<span style={{ color: '#D3452B' }}>NESS</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <NavLink onClick={() => scrollTo('features')}>Funcionalidades</NavLink>
          <NavLink onClick={() => scrollTo('imc-section')}>Calcular IMC</NavLink>
          <NavLink onClick={() => scrollTo('depoimentos')}>Depoimentos</NavLink>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login" className="lp-nav-link hidden md:inline text-[14px]">Entrar</Link>
          <Link to="/signup" className="lp-btn-primary px-5 py-[9px] text-[14px] font-medium" style={{ border: 'none' }}>
            Criar conta grátis
          </Link>
          <button
            className="md:hidden p-2 text-lg"
            style={{ background: 'none', border: 'none', color: '#F3EEE2', cursor: 'pointer' }}
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed top-[60px] left-0 right-0 z-40 flex flex-col gap-1 p-4 md:hidden" style={{ background: '#1D1B14', borderBottom: '1px solid rgba(243,238,226,.12)' }}>
          <NavLink onClick={() => scrollTo('features')}>Funcionalidades</NavLink>
          <NavLink onClick={() => scrollTo('imc-section')}>Calcular IMC</NavLink>
          <NavLink onClick={() => scrollTo('depoimentos')}>Depoimentos</NavLink>
          <Link to="/login" className="lp-nav-link text-[14px] py-2">Entrar</Link>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="lp-stripes relative" style={{ padding: '150px 5vw 90px' }}>
        <div className="grid gap-12 mx-auto items-center" style={{ maxWidth: 1140, gridTemplateColumns: '1.2fr 1fr' }}>
          <div>
            <h1 className="lp-display" style={{ fontSize: 'clamp(44px,6.2vw,84px)', color: '#F3EEE2' }}>
              REGISTRE O TREINO.<br />
              VEJA O RESULTADO.
            </h1>
            <p className="mt-6 mb-9" style={{ fontSize: 17, color: 'rgba(243,238,226,.62)', maxWidth: 460, lineHeight: 1.7 }}>
              Monte rotinas, cronometre suas séries e acompanhe peso, medidas e frequência num só lugar.
              Sem planilha, sem caderno perdido.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link to="/signup" className="lp-btn-primary inline-flex items-center px-7 py-[14px] text-[15px] font-medium">
                Criar conta grátis
              </Link>
              <Link to="/login" className="lp-btn-outline inline-flex items-center px-7 py-[14px] text-[15px] font-medium">
                Já tenho conta
              </Link>
            </div>
          </div>

          {/* Painel de placar */}
          <div style={{ border: '1px solid rgba(243,238,226,.16)', background: '#1D1B14' }}>
            <div style={{ height: 4, background: '#D3452B' }} />
            <div className="grid grid-cols-2">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className="p-6"
                  style={{
                    borderRight: i % 2 === 0 ? '1px solid rgba(243,238,226,.12)' : 'none',
                    borderBottom: i < 2 ? '1px solid rgba(243,238,226,.12)' : 'none',
                  }}
                >
                  <div className="lp-display" style={{ fontSize: 42, color: '#F3EEE2' }}>{s.num}</div>
                  <div className="text-[12px] mt-1" style={{ color: 'rgba(243,238,226,.45)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '90px 5vw' }}>
        <div className="mx-auto" style={{ maxWidth: 760 }}>
          <h2 className="lp-display mb-3" style={{ fontSize: 'clamp(32px,4vw,48px)' }}>
            Seis ferramentas, um treino sério
          </h2>
          <p className="text-[16px] mb-2" style={{ color: 'rgba(243,238,226,.6)', maxWidth: 520 }}>
            Cada uma resolve uma parte do problema: planejar, cronometrar, medir e não deixar a sequência quebrar.
          </p>
        </div>

        <div className="mx-auto mt-10" style={{ maxWidth: 760 }}>
          {features.map(f => (
            <FeatureRow key={f.title} {...f} onClick={() => navigate('/signup')} />
          ))}
        </div>
      </section>

      {/* ── IMC ── */}
      <section id="imc-section" style={{ padding: '90px 5vw', background: '#1D1B14', borderTop: '1px solid rgba(243,238,226,.12)', borderBottom: '1px solid rgba(243,238,226,.12)' }}>
        <div className="mx-auto" style={{ maxWidth: 720 }}>
          <h2 className="lp-display mb-3" style={{ fontSize: 'clamp(32px,4vw,48px)' }}>Calcule seu IMC</h2>
          <p className="text-[16px] mb-10" style={{ color: 'rgba(243,238,226,.6)', maxWidth: 480 }}>
            Sem cadastro. O resultado já vem com uma sugestão de treino para o seu ponto de partida.
          </p>

          <div style={{ border: '1px solid rgba(243,238,226,.16)', background: '#17150F', padding: 32 }}>
            <div className="flex gap-8 flex-wrap items-end mb-2">
              {[
                { label: 'Peso (kg)', placeholder: '75', value: peso, set: setPeso },
                { label: 'Altura (cm)', placeholder: '175', value: altura, set: setAltura },
              ].map(f => (
                <div key={f.label} style={{ minWidth: 160 }}>
                  <label className="block text-[12px] mb-2" style={{ color: 'rgba(243,238,226,.5)' }}>{f.label}</label>
                  <input
                    type="number"
                    placeholder={f.placeholder}
                    value={f.value}
                    onChange={e => f.set(e.target.value)}
                    className="lp-input w-full h-10 text-[20px]"
                    style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '.02em' }}
                  />
                </div>
              ))}
              <button onClick={calcIMC} className="lp-btn-primary h-11 px-7 text-[14px] font-medium" style={{ border: 'none', cursor: 'pointer' }}>
                Calcular
              </button>
            </div>

            {imcResult && (
              <div className="mt-8 pt-8" style={{ borderTop: '1px solid rgba(243,238,226,.12)' }}>
                <div className="flex items-baseline gap-4 mb-1">
                  <div className="lp-display" style={{ fontSize: 56, color: imcResult.cor }}>{imcResult.val}</div>
                  <div className="text-[16px] font-medium" style={{ color: '#F3EEE2' }}>{imcResult.label}</div>
                </div>
                <div className="text-[13px] mb-4" style={{ color: 'rgba(243,238,226,.45)' }}>Sugestão de treino inicial</div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {imcResult.exercises.map(ex => (
                    <span key={ex} className="px-3 py-1 text-[12px]" style={{ border: '1px solid rgba(243,238,226,.2)', color: 'rgba(243,238,226,.75)' }}>
                      {ex}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/signup')}
                  className="lp-btn-primary w-full h-11 text-[14px] font-medium"
                  style={{ border: 'none', cursor: 'pointer' }}
                >
                  Criar conta para salvar o plano completo
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTOS ── */}
      <section id="depoimentos" style={{ padding: '90px 5vw' }}>
        <div className="mx-auto mb-10" style={{ maxWidth: 1140 }}>
          <h2 className="lp-display mb-3" style={{ fontSize: 'clamp(32px,4vw,48px)' }}>Quem já usa</h2>
        </div>

        <div className="grid gap-4 mx-auto" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', maxWidth: 1140 }}>
          <Note rating={5} text="O mapa de calor do calendário me motiva a não quebrar a sequência. Já são 34 dias e não pretendo parar." name="Lucas M." role="há 2 meses" />
          <Note rating={5} text="O cronômetro com aviso sonoro é ótimo para treino intenso. Uso o preset Tabata todo dia." name="Camila S." role="há 1 mês" />
          <Note rating={4} text="A calculadora de IMC que já sugere o treino é surpreendentemente boa. Economizei dinheiro de personal." name="Rafael P." role="há 3 semanas" />
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ padding: '90px 5vw' }}>
        <div className="mx-auto" style={{ maxWidth: 760, border: '1px solid rgba(243,238,226,.16)', background: '#1D1B14' }}>
          <div style={{ height: 4, background: '#D3452B' }} />
          <div style={{ padding: '56px 48px' }}>
            <h2 className="lp-display mb-4" style={{ fontSize: 'clamp(32px,4vw,44px)' }}>Comece hoje mesmo</h2>
            <p className="mb-8 text-[16px]" style={{ color: 'rgba(243,238,226,.62)', maxWidth: 440 }}>
              Grátis, sem cartão de crédito. Em menos de um minuto seu primeiro treino já está montado.
            </p>
            <Link to="/signup" className="lp-btn-primary inline-flex items-center px-7 py-[14px] text-[15px] font-medium">
              Criar conta grátis
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="flex items-center justify-between flex-wrap gap-4 px-[5vw] py-10" style={{ borderTop: '1px solid rgba(243,238,226,.12)' }}>
        <div className="lp-display text-[20px]">FIT<span style={{ color: '#D3452B' }}>NESS</span></div>
        <div className="flex gap-6">
          {[
            { label: 'Funcionalidades', action: () => scrollTo('features') },
            { label: 'IMC', action: () => scrollTo('imc-section') },
            { label: 'Entrar', action: () => navigate('/login') },
          ].map(l => (
            <span key={l.label} onClick={l.action} className="lp-nav-link text-[13px]">
              {l.label}
            </span>
          ))}
        </div>
        <div className="text-[12px]" style={{ color: 'rgba(243,238,226,.4)' }}>© 2025 Fitness App</div>
      </footer>
    </div>
  );
};

export default LandingPage;