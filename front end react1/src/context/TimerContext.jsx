import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const TimerContext = createContext(null);

export const useTimer = () => {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error('useTimer must be used inside TimerProvider');
  return ctx;
};

export const TimerProvider = ({ children }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [sessionLabel, setSessionLabel] = useState('Treino');
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  const intervalRef = useRef(null);

  const startSession = useCallback((label = 'Treino') => {
    setSessionLabel(label);
    setElapsedSec(0);
    setIsRunning(true);
    setIsPaused(false);
    setSessionStartTime(new Date());
  }, []);

  const pauseSession = useCallback(() => {
    setIsPaused(true);
    setIsRunning(false);
  }, []);

  const resumeSession = useCallback(() => {
    setIsPaused(false);
    setIsRunning(true);
  }, []);

  const finishSession = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setShowFinishModal(true);
  }, []);

  const resetSession = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setElapsedSec(0);
    setShowFinishModal(false);
    setSessionStartTime(null);
    clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedSec(s => s + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const fmt = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  const isActive = isRunning || isPaused;

  return (
    <TimerContext.Provider value={{
      isRunning, isPaused, isActive,
      elapsedSec, sessionLabel, sessionStartTime,
      showFinishModal, setShowFinishModal,
      startSession, pauseSession, resumeSession, finishSession, resetSession,
      fmt,
    }}>
      {children}
    </TimerContext.Provider>
  );
};
