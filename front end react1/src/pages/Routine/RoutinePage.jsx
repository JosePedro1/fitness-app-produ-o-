import React, { useState, useEffect } from 'react';
import PrimaryBtn from '../../components/Button/PrimaryBtn';
import { getRoutines, deleteRoutine } from '../../services/api-routines';
import { getExercisesByRoutine, toggleExerciseCompleted } from '../../services/api-exercises';
import RoutineForm from './RoutineForm';
import RoutineList from './RoutineList';

const RoutinePage = () => {
  const [routines, setRoutines] = useState([]);
  const [exercisesMap, setExercisesMap] = useState({});
  const [refresh, setRefresh] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    fetchRoutines();
  }, [refresh]);

  const fetchRoutines = async () => {
    try {
      const data = await getRoutines();
      setRoutines(data);

      const exercisesPerRoutine = {};
      for (let routine of data) {
        const exercises = await getExercisesByRoutine(routine.id);
        exercisesPerRoutine[routine.id] = exercises;
      }

      setExercisesMap(exercisesPerRoutine);
    } catch (error) {
      console.error('Erro ao buscar rotinas:', error.message);
    }
  };

  const handleDeleteRoutine = async (routineId) => {
    if (!window.confirm('Deseja realmente excluir esta rotina?')) return;
    try {
      await deleteRoutine(routineId);
      setRefresh(!refresh);
    } catch (error) {
      console.error('Erro ao excluir rotina:', error.message);
    }
  };

  const handleToggleExercise = async (exercise) => {
    try {
      await toggleExerciseCompleted(exercise.id, !exercise.completed);
      setRefresh(!refresh);
    } catch (error) {
      console.error('Erro ao atualizar exercício:', error.message);
    }
  };

  return (
    <div className="w-full h-auto items-center lg:py-16 md:py-14 sm:py-12 py-10 lg:px-24 md:px-16 sm:px-6 px-4">
      <div className="w-full h-auto flex flex-col items-center justify-center">
        <div className="w-full flex justify-between items-center mb-6">
          <h1 className="lg:text-2xl md:text-xl sm:text-lg text-lg font-semibold text-gray-200 flex items-center gap-x-2 bg-black/20 rounded-md py-2 px-4">
            Minhas Rotinas
          </h1>

          <PrimaryBtn onClick={() => setFormVisible(!formVisible)}>
            {formVisible ? 'Fechar' : 'Nova Rotina'}
          </PrimaryBtn>
        </div>

        {formVisible && (
          <RoutineForm
            setFormVisible={setFormVisible}
            setRefresh={setRefresh}
            refresh={refresh}
          />
        )}

        <RoutineList
          routines={routines}
          exercisesMap={exercisesMap}
          handleDeleteRoutine={handleDeleteRoutine}
          handleToggleExercise={handleToggleExercise}
        />
      </div>
    </div>
  );
};

export default RoutinePage;
