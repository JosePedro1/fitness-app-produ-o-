import React, { useState, useEffect, useRef } from 'react';
import PrimaryBtn from '../../components/Button/PrimaryBtn';
import { createRoutine } from '../../services/api-routines';
import { Search, X, ChevronDown } from 'lucide-react';

const DAYS = [
  { label: 'Seg', value: 'segunda' },
  { label: 'Ter', value: 'terca' },
  { label: 'Qua', value: 'quarta' },
  { label: 'Qui', value: 'quinta' },
  { label: 'Sex', value: 'sexta' },
  { label: 'Sáb', value: 'sabado' },
  { label: 'Dom', value: 'domingo' },
];

// Catálogo completo da biblioteca — mesmo do ExercisesLibraryPage
const CATALOG = {
  Peito: ['Supino Reto','Supino Inclinado','Supino Declinado','Crucifixo','Crossover','Flexão de Braços'],
  Costas: ['Barra Fixa','Remada Curvada','Remada Unilateral','Puxada Frontal','Remada Cavalinho','Levantamento Terra'],
  Pernas: ['Agachamento Livre','Leg Press','Cadeira Extensora','Mesa Flexora','Avanço','Panturrilha em Pé'],
  Ombros: ['Desenvolvimento com Barra','Desenvolvimento Halteres','Elevação Lateral','Elevação Frontal','Remada Alta','Face Pull'],
  Bíceps: ['Rosca Direta','Rosca Alternada','Rosca Martelo','Rosca Concentrada','Rosca Scott','Rosca no Cabo'],
  Tríceps: ['Tríceps Testa','Tríceps Corda','Tríceps Francês','Mergulho no Banco','Tríceps Coice','Tríceps Testa Unilateral'],
  Abdômen: ['Abdominal Crunch','Prancha','Abdominal Infra','Russian Twist','Abdominal no Cabo','Elevação de Pernas'],
  Glúteos: ['Hip Thrust','Agachamento Sumô','Stiff','Abdução no Cabo','Glúteo no Cabo','Avanço Reverso'],
};

// Lista plana de todos os exercícios com grupo
const ALL_EXERCISES = Object.entries(CATALOG).flatMap(([group, exercises]) =>
  exercises.map(name => ({ name, group }))
);

const getDiaAtual = () => {
  const map = ['domingo','segunda','terca','quarta','quinta','sexta','sabado'];
  return map[new Date().getDay()];
};

// Componente de busca/autocomplete por exercício da biblioteca
const ExercisePicker = ({ value, onChange, placeholder, index }) => {
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Sincroniza quando value muda por fora (prefill)
  useEffect(() => { setQuery(value || ''); }, [value]);

  const filtered = query.length > 0
    ? ALL_EXERCISES.filter(e => e.name.toLowerCase().includes(query.toLowerCase()))
    : ALL_EXERCISES;

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (exercise) => {
    setQuery(exercise.name);
    onChange(exercise.name);
    setOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    onChange('');
  };

  return (
    <div ref={ref} className="relative flex-1">
      <div className="flex items-center bg-black/50 rounded-md border border-transparent focus-within:border-indigo-600/60 transition-colors">
        <Search className="w-4 h-4 text-gray-500 ml-3 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="flex-1 px-3 py-2 bg-transparent text-white text-sm focus:outline-none placeholder-gray-500"
          placeholder={placeholder || `Buscar exercício ${index + 1}...`}
        />
        {query && (
          <button type="button" onClick={handleClear} className="mr-2 text-gray-500 hover:text-gray-300">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <button type="button" onClick={() => setOpen(!open)} className="mr-2 text-gray-500 hover:text-gray-300">
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-gray-700 rounded-md shadow-xl max-h-56 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-gray-500 text-xs px-3 py-2">Nenhum exercício encontrado na biblioteca.</p>
          ) : (
            Object.entries(CATALOG).map(([group, exercises]) => {
              const filteredGroup = exercises.filter(name =>
                name.toLowerCase().includes(query.toLowerCase())
              );
              if (filteredGroup.length === 0) return null;
              return (
                <div key={group}>
                  <p className="text-gray-500 text-xs px-3 pt-2 pb-1 uppercase tracking-wider">{group}</p>
                  {filteredGroup.map(name => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleSelect({ name, group })}
                      className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-indigo-600/30 transition-colors"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

const RoutineForm = ({ setFormVisible, setRefresh, refresh, prefill, onSaved }) => {
  const [name, setName] = useState('');
  const [exercises, setExercises] = useState(['']);
  const [weekDays, setWeekDays] = useState([]);
  const [reminderTime, setReminderTime] = useState('');

  useEffect(() => {
    if (prefill) {
      setName(prefill.nome || '');
      setExercises(prefill.exercises?.length > 0 ? prefill.exercises : ['']);
      setWeekDays([getDiaAtual()]);
    }
  }, [prefill]);

  const toggleDay = (day) => {
    setWeekDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
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
    if (!name || exercises.some(ex => !ex.trim())) {
      alert('Preencha o nome da rotina e todos os exercícios.');
      return;
    }
    try {
      await createRoutine({ name, exercises, week_days: weekDays, reminder_time: reminderTime || null });
      setName(''); setExercises(['']); setWeekDays([]); setReminderTime('');
      setFormVisible(false);
      setRefresh(!refresh);
      if (onSaved) onSaved();
    } catch (error) {
      console.error('Erro ao criar rotina:', error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full bg-black/30 p-6 rounded-md shadow-md flex flex-col gap-y-4 mb-8">
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
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Dias da Semana
          {prefill && <span className="ml-2 text-xs text-indigo-400 font-normal">(hoje marcado automaticamente)</span>}
        </label>
        <div className="flex flex-wrap gap-2">
          {DAYS.map(day => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                weekDays.includes(day.value) ? 'bg-indigo-600 text-white' : 'bg-black/50 text-gray-400 hover:bg-black/70'
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

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Exercícios
          <span className="ml-2 text-xs text-gray-500 font-normal">(apenas exercícios da biblioteca)</span>
        </label>
        {exercises.map((exercise, index) => (
          <div key={index} className="flex gap-x-2 items-center mb-2">
            <ExercisePicker
              value={exercise}
              onChange={(val) => handleExerciseChange(index, val)}
              index={index}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-x-4">
        <button type="button" onClick={handleAddExerciseField}
          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white text-sm">
          Adicionar Campo
        </button>
        <button type="button" onClick={handleRemoveExerciseField}
          className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white text-sm">
          Remover Campo
        </button>
      </div>

      <PrimaryBtn type="submit">Salvar Rotina</PrimaryBtn>
    </form>
  );
};

export default RoutineForm;
