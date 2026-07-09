import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onCancel}
    >
      <div
        className="bg-[#1d1d1d] border border-gray-700 rounded-xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-x-3">
          <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-gray-100 font-semibold text-base">Confirmar exclusão</h2>
            <p className="text-gray-400 text-sm mt-0.5">{message}</p>
          </div>
        </div>

        <div className="flex gap-x-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-black/30 border border-gray-600 rounded-lg hover:bg-black/50 ease-out duration-300"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 ease-out duration-300"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;