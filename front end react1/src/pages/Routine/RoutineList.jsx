import React from 'react';
import { Clock, Calendar } from 'lucide-react';

const DAYS_LABEL = {
  segunda: 'Seg', terca: 'Ter', quarta: 'Qua',
  quinta: 'Qui', sexta: 'Sex', sabado: 'Sáb', domingo: 'Dom'
};

const RoutineList = ({ routines, exercisesMap, handleDeleteRoutine, handleToggleExercise }) => {
  return (
    <div className="w-full flex flex-col gap-y-4">
      {routines.length === 0 && (
        <p className="text-gray-400 text-center">Nenhuma rotina cadastrada.</p>
      )}

      {routines.map((routine) => (
        <div
          key={routine.id}
          className="bg-black/20 rounded-md p-6 flex flex-col gap-y-4 shadow-sm hover:shadow-md transition-all duration-300"
        >
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-y-1">
              <h2 className="text-xl font-semibold text-indigo-500">{routine.name}</h2>

              {routine.week_days?.length > 0 && (
                <div className="flex items-center gap-x-1 flex-wrap">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {routine.week_days.map(d => (
                    <span key={d} className="text-xs bg-indigo-600/30 text-indigo-300 px-2 py-0.5 rounded-full">
                      {DAYS_LABEL[d]}
                    </span>
                  ))}
                </div>
              )}

              {routine.reminder_time && (
                <div className="flex items-center gap-x-1 text-gray-400 text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  Lembrete às {routine.reminder_time.slice(0, 5)}
                </div>
              )}
            </div>

            <button
              onClick={() => handleDeleteRoutine(routine.id)}
              className="text-red-500 text-sm hover:text-red-600"
            >
              Excluir
            </button>
          </div>

          <div className="flex flex-col gap-y-2">
            {exercisesMap[routine.id]?.length === 0 && (
              <p className="text-gray-400 text-sm">Nenhum exercício cadastrado.</p>
            )}
            {exercisesMap[routine.id]?.map((exercise) => (
              <div
                key={exercise.id}
                className={`px-4 py-2 rounded-md text-gray-200 text-sm flex justify-between items-center ${
                  exercise.completed ? 'bg-green-600/50' : 'bg-black/30'
                }`}
              >
                <span className={exercise.completed ? 'line-through' : ''}>
                  {exercise.exercise}
                </span>
                <button
                  onClick={() => handleToggleExercise(exercise)}
                  className={`text-xs rounded-md px-2 py-1 ${
                    exercise.completed
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {exercise.completed ? 'Desfazer' : 'Completar'}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoutineList;