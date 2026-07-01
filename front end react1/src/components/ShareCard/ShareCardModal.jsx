/**
 * ShareCardModal.jsx
 * Modal genérico usado pelos 3 pontos de compartilhamento (treino do dia,
 * ranking da academia e rotina semanal). Recebe o card já pronto via
 * `renderCard(cardRef)` — cada card é responsável só pelo próprio visual,
 * este modal cuida de: exibir, gerar a imagem e compartilhar/baixar.
 */

import React from 'react';
import { X, Share2, Download, Loader2 } from 'lucide-react';
import { useShareCard } from './useShareCard';

const ShareCardModal = ({ open, onClose, fileName, shareTitle, shareText, renderCard }) => {
  const { cardRef, generating, error, share, download } = useShareCard({ fileName, shareTitle, shareText });

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[400px] flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="w-full flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-300">Compartilhar</p>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preview do card — este é o nó capturado pelo html2canvas */}
        <div className="rounded-3xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10">
          {renderCard(cardRef)}
        </div>

        {error && (
          <p className="text-xs text-red-400 text-center px-2">{error}</p>
        )}

        {/* Ações */}
        <div className="w-full flex gap-3">
          <button
            onClick={download}
            disabled={generating}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-gray-200 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Baixar
          </button>
          <button
            onClick={share}
            disabled={generating}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#5B4FFF] hover:bg-[#7B6FFF] text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
            {generating ? 'Gerando…' : 'Compartilhar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareCardModal;
