import React, { useState, useEffect, useCallback } from 'react';
import PrimaryBtn from '../../components/Button/PrimaryBtn';
import { getProgress, deleteProgress } from '../../services/api-progress';
import ProgressForm from './ProgressForm';
import ProgressList from './ProgressList';
import ProgressChart from './ProgressChart';

const ProgressPage = () => {
  const [progressList, setProgressList] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  const fetchProgressData = useCallback(async () => {
    try {
      const data = await getProgress();
      setProgressList(data);
    } catch (error) {
      console.error('Erro ao buscar progresso:', error.message);
    }
  }, []);

  useEffect(() => {
    fetchProgressData();
  }, [refresh, fetchProgressData]);

  const handleDeleteProgress = async (progressId) => {
    const confirmDelete = window.confirm('Deseja realmente excluir este registro de progresso?');
    if (!confirmDelete) return;

    try {
      await deleteProgress(progressId);
      setProgressList(prev => prev.filter(p => p.id !== progressId));
    } catch (error) {
      console.error('Erro ao excluir progresso:', error.message);
    }
  };

  return (
    <div className="w-full h-auto items-center lg:py-16 md:py-14 sm:py-12 py-10 lg:px-24 md:px-16 sm:px-6 px-4">
      <div className="w-full h-auto flex flex-col items-center justify-center">

        <div className="w-full flex justify-between items-center mb-6">
          <h1 className="lg:text-2xl md:text-xl sm:text-lg text-lg font-semibold text-gray-200 flex items-center gap-x-2 bg-black/20 rounded-md py-2 px-4">
            Meus Registros de Progresso
          </h1>
          <PrimaryBtn onClick={() => setFormVisible(prev => !prev)}>
            {formVisible ? 'Fechar' : 'Novo Progresso'}
          </PrimaryBtn>
        </div>

        {formVisible && (
          <ProgressForm
            setFormVisible={setFormVisible}
            setRefresh={setRefresh}
            refresh={refresh}
          />
        )}

        {/* Gráfico */}
        {progressList.length >= 2 && (
          <ProgressChart progressList={progressList} />
        )}

        <ProgressList
          progresses={progressList}
          handleDeleteProgress={handleDeleteProgress}
        />
      </div>
    </div>
  );
};

export default ProgressPage;
