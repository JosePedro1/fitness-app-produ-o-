import React, { useState, useEffect } from 'react';
import { getTasks, deleteTask } from '../../services/api-task';

const TaskList = ({ onEditTask, refresh }) => {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadTasks();
  }, [refresh]);

  const loadTasks = async () => {
    try {
      const response = await getTasks();
      setTasks(response);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja realmente excluir essa tarefa?')) return;

    try {
      await deleteTask(id);
      loadTasks();
    } catch (error) {
      console.error('Erro ao excluir a tarefa:', error);
    }
  };

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full h-auto flex flex-col bg-black/20 rounded-md py-10 lg:px-0 md:px-0 sm:px-2 px-4">
  
    <div className="flex justify-between items-center mb-6 px-4">
      <h2 className="lg:text-lg md:text-base sm:text-base text-base font-medium text-gray-200 flex items-center gap-x-2">
        Minhas Tarefas
      </h2>
  
      <input
        type="text"
        placeholder="Pesquisar..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border border-gray-600 bg-black/30 text-gray-200 placeholder-gray-400 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 w-1/3"
      />
    </div>
  
    <ul className="space-y-4">
      {filteredTasks.map((task) => (
        <li
          key={task.id}
          className="bg-black/30 p-4 rounded-md flex justify-between items-start text-gray-200"
        >
          <div>
            <p className="font-semibold text-lg">{task.title}</p>
            <p className="text-sm text-gray-400">Categoria: {task.category}</p>
            <p className="text-sm text-gray-400">Status: {task.status}</p>
            <p className="text-xs text-gray-500">
              {task.start_date} até {task.end_date}
            </p>
          </div>
  
          <div className="flex space-x-2">
            <button
              onClick={() => onEditTask(task)}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-md"
            >
              Editar
            </button>
  
            <button
              onClick={() => handleDelete(task.id)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md"
            >
              Excluir
            </button>
          </div>
        </li>
      ))}
    </ul>
  
    {filteredTasks.length === 0 && (
      <p className="text-center text-gray-400 mt-4">Nenhuma tarefa encontrada.</p>
    )}
  </div>
  
  );
};

export default TaskList;
