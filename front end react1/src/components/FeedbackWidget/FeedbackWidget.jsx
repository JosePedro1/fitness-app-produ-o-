/**
 * FeedbackWidget.jsx
 *
 * Botão flutuante (canto inferior direito) que abre um painel para o usuário:
 *  1. Dar uma nota de 1 a 5 estrelas
 *  2. Escrever um comentário geral
 *  3. Sugerir o que deveria existir no plano premium
 *
 * Após o envio exibe confirmação e não abre novamente nessa sessão.
 */

import { useState, useEffect, useRef } from 'react';
import { submitFeedback, getMyFeedback } from '../../services/api-feedback';

// ── Ícones SVG inline ─────────────────────────────────────────────────────────
const IconStar = ({ filled, half }) => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill={filled ? '#F59E0B' : 'none'}
    stroke={filled || half ? '#F59E0B' : '#4B5563'} strokeWidth="1.8">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const IconClose = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconFeedback = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

// ── Componente principal ──────────────────────────────────────────────────────
export default function FeedbackWidget() {
  const [open,         setOpen]         = useState(false);
  const [rating,       setRating]       = useState(0);
  const [hovered,      setHovered]      = useState(0);
  const [message,      setMessage]      = useState('');
  const [suggestions,  setSuggestions]  = useState('');
  const [loading,      setLoading]      = useState(false);
  const [submitted,    setSubmitted]    = useState(false);
  const [alreadyDone,  setAlreadyDone]  = useState(false);
  const [error,        setError]        = useState('');
  const panelRef = useRef(null);

  // Verifica se usuário já enviou feedback antes (evita reenvio desnecessário)
  useEffect(() => {
    getMyFeedback()
      .then((fb) => { if (fb?.id) setAlreadyDone(true); })
      .catch(() => {}); // falha silenciosa
  }, []);

  // Fecha ao clicar fora
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSubmit = async () => {
    if (rating === 0) { setError('Por favor, selecione uma nota.'); return; }
    setError('');
    setLoading(true);
    try {
      await submitFeedback({ rating, message, premium_suggestions: suggestions });
      setSubmitted(true);
    } catch (err) {
      setError(err?.response?.data?.error || 'Erro ao enviar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const starLabel = ['', 'Ruim', 'Regular', 'Bom', 'Muito bom', 'Excelente'];
  const displayRating = hovered || rating;

  return (
    <>
      {/* ── Botão flutuante ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        title="Enviar feedback"
        style={{
          position:       'fixed',
          bottom:         '24px',
          right:          '24px',
          zIndex:         1000,
          width:          '52px',
          height:         '52px',
          borderRadius:   '50%',
          background:     'linear-gradient(135deg, #5B4FFF, #7B6FFF)',
          border:         'none',
          color:          '#fff',
          cursor:         'pointer',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          boxShadow:      '0 4px 20px rgba(91,79,255,0.45)',
          transition:     'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        <IconFeedback />
      </button>

      {/* ── Painel de feedback ── */}
      {open && (
        <div
          ref={panelRef}
          style={{
            position:     'fixed',
            bottom:       '88px',
            right:        '24px',
            zIndex:       1000,
            width:        '340px',
            background:   '#13131a',
            border:       '1px solid rgba(255,255,255,0.10)',
            borderRadius: '16px',
            boxShadow:    '0 16px 48px rgba(0,0,0,0.55)',
            overflow:     'hidden',
            animation:    'fbSlideUp 0.22s ease',
          }}
        >
          <style>{`
            @keyframes fbSlideUp {
              from { opacity: 0; transform: translateY(14px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Header */}
          <div style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            padding:        '16px 18px 12px',
            borderBottom:   '1px solid rgba(255,255,255,0.07)',
          }}>
            <div>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#f0f0f8' }}>
                Avalie o FitTrack
              </p>
              <p style={{ fontSize: 12, color: 'rgba(240,240,248,0.45)', marginTop: 2 }}>
                Sua opinião nos ajuda a melhorar
              </p>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: 'none', border: 'none', color: 'rgba(240,240,248,0.45)',
              cursor: 'pointer', padding: 4, borderRadius: 6,
              display: 'flex', alignItems: 'center',
            }}>
              <IconClose />
            </button>
          </div>

          {/* Corpo */}
          <div style={{ padding: '16px 18px 20px' }}>

            {/* Estado: já avaliou */}
            {alreadyDone && !submitted ? (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <p style={{ fontSize: 32, marginBottom: 8 }}>✅</p>
                <p style={{ fontSize: 14, color: '#f0f0f8', fontWeight: 600 }}>Você já enviou um feedback!</p>
                <p style={{ fontSize: 12, color: 'rgba(240,240,248,0.45)', marginTop: 4 }}>
                  Agradecemos por contribuir com o FitTrack.
                </p>
              </div>

            /* Estado: enviado agora */
            ) : submitted ? (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <p style={{ fontSize: 36, marginBottom: 8 }}>🎉</p>
                <p style={{ fontSize: 14, color: '#f0f0f8', fontWeight: 600, fontFamily: 'Syne, sans-serif' }}>
                  Obrigado pelo feedback!
                </p>
                <p style={{ fontSize: 12, color: 'rgba(240,240,248,0.45)', marginTop: 6 }}>
                  Usaremos sua avaliação para melhorar o app.
                </p>
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    marginTop:    14,
                    background:   'linear-gradient(135deg, #5B4FFF, #7B6FFF)',
                    color:        '#fff',
                    border:       'none',
                    borderRadius: '8px',
                    padding:      '9px 22px',
                    fontWeight:   600,
                    fontSize:     13,
                    cursor:       'pointer',
                    fontFamily:   'Syne, sans-serif',
                  }}
                >
                  Fechar
                </button>
              </div>

            /* Estado: formulário */
            ) : (
              <>
                {/* Estrelas */}
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 12, color: 'rgba(240,240,248,0.55)', marginBottom: 8, fontWeight: 500 }}>
                    Como você avalia o FitTrack?
                  </p>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, lineHeight: 0 }}
                      >
                        <IconStar filled={star <= displayRating} />
                      </button>
                    ))}
                    {displayRating > 0 && (
                      <span style={{ fontSize: 12, color: '#F59E0B', marginLeft: 6, fontWeight: 600 }}>
                        {starLabel[displayRating]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Comentário geral */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 12, color: 'rgba(240,240,248,0.55)', display: 'block', marginBottom: 6, fontWeight: 500 }}>
                    O que você achou? <span style={{ color: 'rgba(240,240,248,0.3)' }}>(opcional)</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Conte sua experiência com o FitTrack..."
                    maxLength={1000}
                    rows={3}
                    style={{
                      width:          '100%',
                      background:     '#18181f',
                      border:         '1px solid rgba(255,255,255,0.10)',
                      borderRadius:   '8px',
                      color:          '#f0f0f8',
                      fontSize:       13,
                      padding:        '10px 12px',
                      resize:         'vertical',
                      outline:        'none',
                      fontFamily:     'DM Sans, sans-serif',
                      lineHeight:     1.5,
                      boxSizing:      'border-box',
                    }}
                    onFocus={(e)  => { e.target.style.borderColor = '#5B4FFF'; }}
                    onBlur={(e)   => { e.target.style.borderColor = 'rgba(255,255,255,0.10)'; }}
                  />
                </div>

                {/* Sugestão premium */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, color: 'rgba(240,240,248,0.55)', display: 'block', marginBottom: 6, fontWeight: 500 }}>
                    💎 O que você pagaria para ter no premium?
                    <span style={{ color: 'rgba(240,240,248,0.3)' }}> (opcional)</span>
                  </label>
                  <textarea
                    value={suggestions}
                    onChange={(e) => setSuggestions(e.target.value)}
                    placeholder="Ex: planos de treino personalizados por IA, vídeos dos exercícios, chat com personal..."
                    maxLength={1000}
                    rows={3}
                    style={{
                      width:          '100%',
                      background:     '#18181f',
                      border:         '1px solid rgba(255,255,255,0.10)',
                      borderRadius:   '8px',
                      color:          '#f0f0f8',
                      fontSize:       13,
                      padding:        '10px 12px',
                      resize:         'vertical',
                      outline:        'none',
                      fontFamily:     'DM Sans, sans-serif',
                      lineHeight:     1.5,
                      boxSizing:      'border-box',
                    }}
                    onFocus={(e)  => { e.target.style.borderColor = '#7B6FFF'; }}
                    onBlur={(e)   => { e.target.style.borderColor = 'rgba(255,255,255,0.10)'; }}
                  />
                </div>

                {/* Erro */}
                {error && (
                  <p style={{ fontSize: 12, color: '#EF4444', marginBottom: 10 }}>{error}</p>
                )}

                {/* Botão enviar */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    width:        '100%',
                    height:       '42px',
                    background:   loading ? 'rgba(91,79,255,0.5)' : 'linear-gradient(135deg, #5B4FFF, #7B6FFF)',
                    color:        '#fff',
                    border:       'none',
                    borderRadius: '8px',
                    fontWeight:   700,
                    fontSize:     14,
                    cursor:       loading ? 'not-allowed' : 'pointer',
                    fontFamily:   'Syne, sans-serif',
                    transition:   'opacity 0.2s',
                  }}
                >
                  {loading ? 'Enviando...' : 'Enviar avaliação'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}