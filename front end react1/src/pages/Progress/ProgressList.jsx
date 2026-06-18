import React from 'react';

const ProgressList = ({ progresses, handleDeleteProgress }) => {
  return (
    <div className="w-full flex flex-col gap-y-4">
      {progresses.length === 0 && (
        <p className="text-gray-400 text-center">Nenhum progresso cadastrado.</p>
      )}

      {progresses.map((progress) => {
        const measurementEntries = progress.measurements
          ? Object.entries(progress.measurements).filter(([, value]) => value !== '' && value !== null && value !== undefined)
          : [];

        return (
          <div
            key={progress.id}
            className="bg-black/20 rounded-md p-4 sm:p-6 flex flex-col gap-y-4 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex flex-wrap justify-between items-center gap-2">
              <h2 className="text-lg sm:text-xl font-semibold text-indigo-500 min-w-0 truncate">
                Data: {progress.date}
              </h2>

              <button
                onClick={() => handleDeleteProgress(progress.id)}
                className="shrink-0 text-red-500 text-sm hover:text-red-600 transition"
              >
                Excluir
              </button>
            </div>

            <div className="flex flex-col gap-y-2">
              <div className="flex items-center gap-x-1">
                <span className="text-gray-400">Peso:</span>
                <span className="text-white">{progress.weight} kg</span>
              </div>

              {measurementEntries.length > 0 && (
                <>
                  <h3 className="text-gray-300 text-sm mt-4">Medidas:</h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {measurementEntries.map(([part, value], index) => (
                      <div
                        key={index}
                        className="flex flex-col gap-y-0.5 px-3 py-2 bg-black/30 rounded-md text-gray-200 text-sm min-w-0"
                      >
                        <span className="text-gray-400 text-xs truncate" title={part}>{part}</span>
                        <span className="font-medium">{value} cm</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProgressList;