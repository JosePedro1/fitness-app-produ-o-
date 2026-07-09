import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { saveCalendarSession } from '../services/api-calendar';
import {
  requestNotificationPermission,
  showLocalNotification,
  closeLocalNotification,
} from '../utils/notifications';

const TIMER_NOTIF_TAG = 'workout-timer';

// ── Formatação (usada também pela notificação, por isso fica fora do componente) ──
const fmtElapsed = (s) => {
  const h   = Math.floor(s / 3600);
  const m   = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
};

// ─── Context ──────────────────────────────────────────────────────────────────
const WorkoutTimerContext = createContext(null);

export const useWorkoutTimer = () => {
  const ctx = useContext(WorkoutTimerContext);
  if (!ctx) throw new Error('useWorkoutTimer deve ser usado dentro de WorkoutTimerProvider');
  return ctx;
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export const WorkoutTimerProvider = ({ children }) => {
  const [isRunning, setIsRunning]     = useState(false);
  const [elapsed, setElapsed]         = useState(0);       // segundos totais
  const [isVisible, setIsVisible]     = useState(false);   // widget visível na tela
  const [isMinimized, setIsMinimized] = useState(false);   // widget minimizado (pill)
  const [finishModal, setFinishModal] = useState(false);   // modal de conclusão aberto
  const [saving, setSaving]           = useState(false);
  const [saveError, setSaveError]     = useState(null);
  const [lastSession, setLastSession] = useState(null);    // última sessão salva com sucesso

  const intervalRef    = useRef(null);
  const startTimeRef   = useRef(null); // timestamp de quando o play foi pressionado
  const baseElapsedRef = useRef(0);    // elapsed acumulado antes de pausas
  const notifIntervalRef = useRef(null); // atualização periódica da notificação do cronômetro

  // ── Elapsed "ao vivo" calculado a partir dos refs (não sofre com closures obsoletas) ──
  const computeElapsed = useCallback(
    () => baseElapsedRef.current + (startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0),
    []
  );

  /**
   * Notificação local do cronômetro geral — não depende de servidor/push.
   * Estática (não conta segundo a segundo): mostra o tempo no momento de
   * iniciar/pausar/retomar e se atualiza a cada minuto enquanto ativo.
   * Em navegadores/SO que suportam (Android/desktop), traz os botões
   * Pausar/Retomar e Finalizar; no iOS aparece sem os botões.
   */
  const updateTimerNotification = useCallback((running) => {
    const text = running
      ? `Em andamento — ${fmtElapsed(computeElapsed())}`
      : `Pausado em ${fmtElapsed(computeElapsed())}`;

    showLocalNotification('Treino em andamento 💪', {
      tag: TIMER_NOTIF_TAG,
      body: text,
      requireInteraction: true,
      actions: running
        ? [{ action: 'pause', title: 'Pausar' }, { action: 'finish', title: 'Finalizar' }]
        : [{ action: 'resume', title: 'Retomar' }, { action: 'finish', title: 'Finalizar' }],
    });
  }, [computeElapsed]);

  // ── Tick — usa Date.now() para cálculo preciso mesmo com abas em background ──
  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        const passed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsed(baseElapsedRef.current + passed);
      }, 500);
    } else {
      clearInterval(intervalRef.current);
      if (startTimeRef.current) {
        baseElapsedRef.current += Math.floor((Date.now() - startTimeRef.current) / 1000);
        startTimeRef.current = null;
      }
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  // ── Ações públicas ──────────────────────────────────────────────────────────

  /** Inicia um novo treino do zero */
  const start = useCallback(() => {
    baseElapsedRef.current = 0;
    setElapsed(0);
    setSaveError(null);
    setIsVisible(true);
    setIsMinimized(false);
    setIsRunning(true);
    // Pede permissão de notificação aqui, dentro do gesto do usuário (clique
    // em "Iniciar"). Se já foi decidido antes (aceito/recusado), não pergunta de novo.
    requestNotificationPermission();
  }, []);

  const pause  = useCallback(() => setIsRunning(false), []);
  const resume = useCallback(() => setIsRunning(true),  []);

  /** Reseta tudo internamente sem fechar o widget */
  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    clearInterval(notifIntervalRef.current);
    setIsRunning(false);
    setElapsed(0);
    baseElapsedRef.current = 0;
    startTimeRef.current   = null;
    closeLocalNotification(TIMER_NOTIF_TAG);
  }, []);

  /** Pausa e abre o modal de finalização */
  const openFinishDialog = useCallback(() => {
    setIsRunning(false);
    setFinishModal(true);
  }, []);

  /** Fecha o modal e retoma o cronômetro */
  const cancelFinish = useCallback(() => {
    setFinishModal(false);
    setIsRunning(true);
  }, []);

  /**
   * Salva a sessão no backend (POST /calendar) e fecha o widget.
   * @param {string} label  - nome do treino
   * @param {string} notes  - observações (opcional)
   * @returns {boolean} true se salvou com sucesso
   */
  const finishAndSave = useCallback(async (label, notes = '') => {
    setSaving(true);
    setSaveError(null);

    // elapsed pode ter aumentado enquanto o usuário preenchia o modal —
    // captura o valor atual uma única vez
    const durationSec = baseElapsedRef.current + (
      startTimeRef.current
        ? Math.floor((Date.now() - startTimeRef.current) / 1000)
        : 0
    );
    const date = new Date().toISOString().split('T')[0];

    try {
      await saveCalendarSession({ date, label: label.trim() || 'Treino livre', duration_sec: durationSec, notes });
      setLastSession({ date, label, durationSec });
      setFinishModal(false);
      setIsVisible(false);
      reset();
      return true;
    } catch (err) {
      setSaveError(err.response?.data?.error || err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [reset]);

  /** Descarta a sessão sem salvar */
  const discardSession = useCallback(() => {
    setFinishModal(false);
    setIsVisible(false);
    reset();
  }, [reset]);

  // ── Notificação local do cronômetro: atualiza ao iniciar/pausar/retomar e
  //    a cada 1 min enquanto ativo. Fecha quando o widget não está mais visível. ──
  useEffect(() => {
    if (!isVisible) return;

    updateTimerNotification(isRunning);

    if (isRunning) {
      notifIntervalRef.current = setInterval(() => updateTimerNotification(true), 60000);
    }
    return () => clearInterval(notifIntervalRef.current);
  }, [isRunning, isVisible, updateTimerNotification]);

  // ── Ouve cliques nos botões da notificação (Pausar/Retomar/Finalizar),
  //    repassados pelo sw.js via postMessage. ──
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleMessage = (event) => {
      const data = event.data;
      if (!data || data.type !== 'TIMER_ACTION' || data.tag !== TIMER_NOTIF_TAG) return;
      if (data.action === 'pause') pause();
      else if (data.action === 'resume') resume();
      else if (data.action === 'finish') openFinishDialog();
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
  }, [pause, resume, openFinishDialog]);

  return (
    <WorkoutTimerContext.Provider value={{
      // estado
      isRunning, elapsed, isVisible, isMinimized, finishModal, saving, saveError, lastSession,
      elapsedFormatted: fmtElapsed(elapsed),
      // ações
      start, pause, resume, reset,
      openFinishDialog, cancelFinish, finishAndSave, discardSession,
      setIsMinimized, setIsVisible,
    }}>
      {children}
    </WorkoutTimerContext.Provider>
  );
};
