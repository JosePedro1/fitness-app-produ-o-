/**
 * shareCardTheme.js
 * Constantes de marca compartilhadas por todos os cards de compartilhamento.
 * Mantém a mesma identidade visual do resto do app (indigo #5B4FFF, fundo escuro,
 * fonte Syne nos destaques) para que o card pareça parte do produto, não um anexo.
 */

export const BRAND = {
  name: 'FitTrack',
  tagline: 'Treine. Registre. Compartilhe.',
  indigo: '#5B4FFF',
  indigoLight: '#7B6FFF',
  bgFrom: '#1a1533',
  bgTo: '#0d0d10',
  displayFont: "'Syne', sans-serif",
};

/** URL base do app rodando (usa a origem atual, funciona em qualquer ambiente). */
export const getAppOrigin = () => window.location.origin;
