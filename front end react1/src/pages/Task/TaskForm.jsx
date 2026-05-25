import React, { useState, useEffect } from 'react';
import { createTask, updateTask } from '../../services/api-task';

const TaskForm = ({ onTaskSaved, taskToEdit, onCancelEdit }) => {
  const [formData, setFormData] = useState({
    title: '',
    start_date: '',
    end_date: '',
    category: '',
    status: '',
  });

  useEffect(() => {
    if (taskToEdit) {
      setFormData({
        title: taskToEdit.title,
        start_date: taskToEdit.start_date,
        end_date: taskToEdit.end_date,
        category: taskToEdit.category,
        status: taskToEdit.status,
      });
    } else {
      resetForm();
    }
  }, [taskToEdit]);

  const resetForm = () => {
    setFormData({
      title: '',
      start_date: '',
      end_date: '',
      category: '',
      status: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { title, start_date, end_date, category, status } = formData;

    if (!title || !start_date || !end_date || !category || !status) {
      alert('Preencha todos os campos!');
      return;
    }

    try {
      if (taskToEdit) {
        await updateTask(taskToEdit.id, formData);
      } else {
        await createTask(formData);
      }

      onTaskSaved();
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar a tarefa:', error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full h-auto flex items-end justify-center bg-black/20 rounded-md lg:gap-5 md:gap-5 sm:gap-3 gap-2 py-10 lg:px-0 md:px-0 sm:px-2 px-4 flex-wrap"
    >
      <div className="lg:w-[25%] md:w-[40%] sm:w-[50%] w-full h-auto p-2">
        <input
          type="text"
          name="title"
          placeholder="Título"
          value={formData.title}
          onChange={handleChange}
          className="w-full h-11 px-4 rounded-md bg-black/30 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          required
        />
      </div>

      <div className="lg:w-[25%] md:w-[40%] sm:w-[50%] w-full h-auto p-2">
        <label className="block text-sm text-gray-300 mb-1">Data de Início</label>
        <input
          type="date"
          name="start_date"
          value={formData.start_date}
          onChange={handleChange}
          className="w-full h-11 px-4 rounded-md bg-black/30 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          required
        />
      </div>

      <div className="lg:w-[25%] md:w-[40%] sm:w-[50%] w-full h-auto p-2">
        <label className="block text-sm text-gray-300 mb-1">Prazo Final</label>
        <input
          type="date"
          name="end_date"
          value={formData.end_date}
          onChange={handleChange}
          className="w-full h-11 px-4 rounded-md bg-black/30 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          required
        />
      </div>

      <div className="lg:w-[25%] md:w-[40%] sm:w-[50%] w-full h-auto p-2">
        <input
          type="text"
          name="category"
          placeholder="Categoria"
          value={formData.category}
          onChange={handleChange}
          className="w-full h-11 px-4 rounded-md bg-black/30 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          required
        />
      </div>

      <div className="lg:w-[25%] md:w-[40%] sm:w-[50%] w-full h-auto p-2">
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full h-11 px-4 rounded-md bg-black/30 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          required
        >
          <option value="">Selecione o status</option>
          <option value="pendente">Pendente</option>
          <option value="concluída">Concluída</option>
        </select>
      </div>

      <div className="lg:w-[20%] md:w-[35%] sm:w-[50%] w-full h-auto p-2 flex space-x-2">
        <button
          type="submit"
          className="w-full h-11 justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
        >
          {taskToEdit ? 'Atualizar' : 'Criar'}
        </button>

        {taskToEdit && (
          <button
            type="button"
            onClick={() => {
              onCancelEdit();
              resetForm();
            }}
            className="w-full h-11 justify-center bg-gray-400 hover:bg-gray-500 text-white rounded-md"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};

export default TaskForm;
