import { useState, useCallback } from 'react';

export function useConfirm() {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    message: '',
    resolve: null,
  });

  const confirm = useCallback((message) => {
    return new Promise((resolve) => {
      setConfirmState({ isOpen: true, message, resolve });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    confirmState.resolve(true);
    setConfirmState({ isOpen: false, message: '', resolve: null });
  }, [confirmState]);

  const handleCancel = useCallback(() => {
    confirmState.resolve(false);
    setConfirmState({ isOpen: false, message: '', resolve: null });
  }, [confirmState]);

  return {
    confirm,
    confirmProps: {
      isOpen: confirmState.isOpen,
      message: confirmState.message,
      onConfirm: handleConfirm,
      onCancel: handleCancel,
    },
  };
}
