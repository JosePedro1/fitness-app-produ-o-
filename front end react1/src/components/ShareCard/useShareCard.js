/**
 * useShareCard.js
 * Hook genérico: pega o DOM de um card (via cardRef), transforma em PNG
 * (html2canvas) e oferece duas saídas:
 *   - share()    → Web Share API nativa (abre a folha de compartilhar do
 *                  celular: WhatsApp, Instagram Stories, SMS, etc.)
 *   - download() → baixa o PNG (fallback para desktop, onde a Web Share
 *                  API de arquivos não é suportada pela maioria dos browsers)
 */

import { useRef, useState, useCallback } from 'react';
import html2canvas from 'html2canvas';

const downloadBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export function useShareCard({ fileName = 'fittrack.png', shareTitle, shareText } = {}) {
  const cardRef = useRef(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const renderToBlob = useCallback(async () => {
    if (!cardRef.current) throw new Error('Card ainda não está pronto.');
    // scale: 2 → resolução nítida o suficiente pra Stories/WhatsApp (~2x a tela)
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
    });
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Falha ao gerar a imagem do card.'));
      }, 'image/png');
    });
  }, []);

  /** Tenta abrir a folha nativa de compartilhar; se o browser não suportar
   *  compartilhar arquivos (comum em desktop), cai para download. */
  const share = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      const blob = await renderToBlob();
      const file = new File([blob], fileName, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: shareTitle, text: shareText });
        return { method: 'share' };
      }

      downloadBlob(blob, fileName);
      return { method: 'download' };
    } catch (err) {
      if (err?.name === 'AbortError') return { method: 'cancelled' }; // usuário fechou a folha nativa
      console.error('Erro ao compartilhar card:', err);
      setError('Não foi possível compartilhar agora. Tente baixar a imagem.');
      throw err;
    } finally {
      setGenerating(false);
    }
  }, [renderToBlob, fileName, shareTitle, shareText]);

  const download = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      const blob = await renderToBlob();
      downloadBlob(blob, fileName);
      return { method: 'download' };
    } catch (err) {
      console.error('Erro ao baixar card:', err);
      setError('Não foi possível gerar a imagem.');
      throw err;
    } finally {
      setGenerating(false);
    }
  }, [renderToBlob, fileName]);

  return { cardRef, generating, error, share, download };
}
