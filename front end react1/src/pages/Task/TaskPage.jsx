import React, { useState } from 'react';
import TaskList from './TaskList';
import TaskForm from './TaskForm'; 
import PrimaryBtn from '../../components/Button/PrimaryBtn';

const TaskPage = () => {
  const [refresh, setRefresh] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [formVisible, setFormVisible] = useState(false);

  const handleTaskSaved = () => {
    setFormVisible(false);
    setTaskToEdit(null);
    setRefresh(!refresh);
  };

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setFormVisible(true);
  };

  const handleCancelEdit = () => {
    setTaskToEdit(null);
    setFormVisible(false);
  };

  return (
    <div className="w-full h-auto items-center lg:py-16 
    md:py-14 sm:py-12 py-10 lg:px-24 md:px-16 sm:px-6 px-4">
    
    <div className="w-full h-auto flex flex-col items-center justify-center">
      <div className="w-full flex justify-between items-center mb-6">
        <h1 className="lg:text-2xl md:text-xl sm:text-lg text-lg font-semibold text-gray-200 flex items-center gap-x-2 bg-black/20 rounded-md py-2 px-4">
          Minhas Tarefas
        </h1>
  
        <PrimaryBtn onClick={() => setFormVisible(!formVisible)}>
          {formVisible ? 'Fechar' : 'Nova Tarefa'}
        </PrimaryBtn>
      </div>
  
      {formVisible && (
        <TaskForm
          onTaskSaved={handleTaskSaved}
          taskToEdit={taskToEdit}
          onCancelEdit={handleCancelEdit}
        />
      )}
  
      <TaskList onEditTask={handleEditTask} refresh={refresh} />
    </div>
  </div>
  
  );
};

export default TaskPage;
