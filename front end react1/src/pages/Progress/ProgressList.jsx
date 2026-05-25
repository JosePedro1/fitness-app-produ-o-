import React from 'react';

const ProgressList = ({ progresses, handleDeleteProgress }) => {
  return (
    <div className="w-full flex flex-col gap-y-4">
      {progresses.length === 0 && (
        <p className="text-gray-400 text-center">Nenhum progresso cadastrado.</p>
      )}

      {progresses.map((progress) => (
        <div
          key={progress.id}
          className="bg-black/20 rounded-md p-6 flex flex-col gap-y-4 shadow-sm hover:shadow-md transition-all duration-300"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-indigo-500">
              Data: {progress.date}
            </h2>

            <button
              onClick={() => handleDeleteProgress(progress.id)}
              className="text-red-500 text-sm hover:text-red-600 transition"
            >
              Excluir
            </button>
          </div>

          <div className="flex flex-col gap-y-2">
            <div className="flex items-center gap-x-1">
              <span className="text-gray-400">Peso:</span>
              <span className="text-white">{progress.weight} kg</span>
            </div>

            <h3 className="text-gray-300 text-sm mt-4">Medidas:</h3>

            {progress.measurements && Object.entries(progress.measurements).map(([part, value], index) => (
              <div
                key={index}
                className="flex justify-between items-center px-4 py-2 bg-black/30 rounded-md text-gray-200 text-sm"
              >
                <span>{part}</span>
                <span>{value} cm</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProgressList;
