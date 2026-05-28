import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PrimaryBtn from '../../components/Button/PrimaryBtn';
import { getRoutines, deleteRoutine } from '../../services/api-routines';
import { getExercisesByRoutine, toggleExerciseCompleted } from '../../services/api-exercises';
import RoutineForm from './RoutineForm';
import RoutineList from './RoutineList';
import { BookOpen, Dumbbell, X } from 'lucide-react';
import { useConfirm } from '../../hooks/useConfirm';
import ConfirmModal from '../../components/Confirm/ConfirmModal';

const RoutinePage = () => {
  const [routines, setRoutines] = useState([]);
  const [exercisesMap, setExercisesMap] = useState({});
  const [refresh, setRefresh] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [imcPrefill, setImcPrefill] = useState(null);
  const [imcBannerVisible, setImcBannerVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { confirm, confirmProps } = useConfirm();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const nome = params.get('nome');
    const treinos = params.get('treinos');
    const imc = params.get('imc');
    const classificacao = params.get('classificacao');

    if (nome && treinos) {
      try {
        const exercises = JSON.parse(treinos);
        setImcPrefill({ nome, exercises, imc, classificacao });
        setImcBannerVisible(true);
        setFormVisible(true);
        navigate('/routines', { replace: true });
      } catch (e) {
        console.error('Erro ao ler parâmetros do IMC:', e);
      }
    }
  }, [location.search]);

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
    const ok = await confirm('Deseja realmente excluir esta rotina?');
    if (!ok) return;
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

  const handleToggleForm = () => {
    setFormVisible(!formVisible);
    if (formVisible) {
      setImcPrefill(null);
      setImcBannerVisible(false);
    }
  };

  return (
    <>
      <ConfirmModal {...confirmProps} />

      <div className="w-full h-auto items-center lg:py-16 md:py-14 sm:py-12 py-10 lg:px-24 md:px-16 sm:px-6 px-4">
        <div className="w-full h-auto flex flex-col items-center justify-center">
          <div className="w-full flex justify-between items-center mb-6">
            <h1 className="lg:text-2xl md:text-xl sm:text-lg text-lg font-semibold text-gray-200 flex items-center gap-x-2 bg-black/20 rounded-md py-2 px-4">
              Minhas Rotinas
            </h1>
            <PrimaryBtn onClick={handleToggleForm}>
              {formVisible ? 'Fechar' : 'Nova Rotina'}
            </PrimaryBtn>
          </div>

          {imcBannerVisible && imcPrefill && (
            <div className="w-full mb-4 bg-indigo-600/20 border border-indigo-500/40 rounded-xl px-5 py-4 flex items-start gap-x-3">
              <Dumbbell className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0 -rotate-45" />
              <div className="flex-1">
                <p className="text-indigo-300 font-semibold text-sm">
                  Treino preparado com base no seu IMC ({imcPrefill.imc} — {imcPrefill.classificacao})
                </p>
                <p className="text-gray-400 text-xs mt-0.5">
                  Preencha os campos abaixo com seu treino pré-definido. Edite à vontade antes de salvar!
                </p>
              </div>
              <button onClick={() => setImcBannerVisible(false)} className="text-gray-500 hover:text-gray-300">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {formVisible && (
            <>
              <div className="w-full mb-3 bg-black/20 border border-indigo-600/20 rounded-xl px-5 py-3 flex items-center gap-x-3">
                <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
                <p className="text-gray-400 text-sm">
                  Está em dúvida sobre qual exercício adicionar?{' '}
                  <a
                    href="/exercises-library"
                    className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 font-medium transition-colors"
                  >
                    Visite nossa Biblioteca de Exercícios
                  </a>
                  {' '}e encontre o treino ideal para você!
                </p>
              </div>

              <RoutineForm
                setFormVisible={setFormVisible}
                setRefresh={setRefresh}
                refresh={refresh}
                prefill={imcPrefill}
                onSaved={() => {
                  setImcPrefill(null);
                  setImcBannerVisible(false);
                }}
              />
            </>
          )}

          <RoutineList
            routines={routines}
            exercisesMap={exercisesMap}
            handleDeleteRoutine={handleDeleteRoutine}
            handleToggleExercise={handleToggleExercise}
          />
        </div>
      </div>
    </>
  );
};

export default RoutinePage;
