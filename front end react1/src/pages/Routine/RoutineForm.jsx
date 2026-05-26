import React, { useState } from 'react';
import PrimaryBtn from '../../components/Button/PrimaryBtn';
import { createRoutine } from '../../services/api-routines';

const DAYS = [
  { label: 'Seg', value: 'segunda' },
  { label: 'Ter', value: 'terca' },
  { label: 'Qua', value: 'quarta' },
  { label: 'Qui', value: 'quinta' },
  { label: 'Sex', value: 'sexta' },
  { label: 'Sáb', value: 'sabado' },
  { label: 'Dom', value: 'domingo' },
];

const RoutineForm = ({ setFormVisible, setRefresh, refresh }) => {
  const [name, setName] = useState('');
  const [exercises, setExercises] = useState(['']);
  const [weekDays, setWeekDays] = useState([]);
  const [reminderTime, setReminderTime] = useState('');

  const toggleDay = (day) => {
    setWeekDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleAddExerciseField = () => setExercises([...exercises, '']);
  const handleRemoveExerciseField = () => {
    if (exercises.length > 1) setExercises(exercises.slice(0, -1));
  };

  const handleExerciseChange = (index, value) => {
    const updated = [...exercises];
    updated[index] = value;
    setExercises(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || exercises.some(ex => !ex)) {
      alert('Preencha o nome da rotina e todos os exercícios.');
      return;
    }

    try {
      await createRoutine({
        name,
        exercises,
        week_days: weekDays,
        reminder_time: reminderTime || null,
      });
      setName('');
      setExercises(['']);
      setWeekDays([]);
      setReminderTime('');
      setFormVisible(false);
      setRefresh(!refresh);
    } catch (error) {
      console.error('Erro ao criar rotina:', error.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-black/30 p-6 rounded-md shadow-md flex flex-col gap-y-4 mb-8"
    >
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Nome da Rotina</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 bg-black/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
          placeholder="Ex: Treino A - Peito e Tríceps"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Dias da Semana</label>
        <div className="flex flex-wrap gap-2">
          {DAYS.map(day => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                weekDays.includes(day.value)
                  ? 'bg-indigo-600 text-white'
                  : 'bg-black/50 text-gray-400 hover:bg-black/70'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Horário do lembrete <span className="text-gray-500 text-xs">(opcional)</span>
        </label>
        <input
          type="time"
          value={reminderTime}
          onChange={(e) => setReminderTime(e.target.value)}
          className="px-4 py-2 bg-black/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
      </div>

      {exercises.map((exercise, index) => (
        <div key={index} className="flex gap-x-2 items-center">
          <input
            type="text"
            value={exercise}
            onChange={(e) => handleExerciseChange(index, e.target.value)}
            className="flex-1 px-4 py-2 bg-black/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
            placeholder={`Exercício ${index + 1}`}
          />
        </div>
      ))}

      <div className="flex gap-x-4">
        <button
          type="button"
          onClick={handleAddExerciseField}
          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white text-sm"
        >
          Adicionar Campo
        </button>
        <button
          type="button"
          onClick={handleRemoveExerciseField}
          className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white text-sm"
        >
          Remover Campo
        </button>
      </div>

      <PrimaryBtn type="submit">Salvar Rotina</PrimaryBtn>
    </form>
  );
};

export default RoutineForm;