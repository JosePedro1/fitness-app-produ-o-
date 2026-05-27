import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import { CATALOG, ALL_EXERCISES } from '../../utils/exerciseCatalog';

/**
 * Autocomplete com a biblioteca de exercícios.
 * Reutilizado em RoutineForm, FloatingWorkoutTimer e CalendarPage.
 *
 * Props:
 *   value        string   — valor controlado
 *   onChange     fn       — callback (name: string) => void
 *   placeholder  string   — placeholder do input
 */
const ExercisePicker = ({ value, onChange, placeholder }) => {
  const [query, setQuery] = useState(value || '');
  const [open,  setOpen]  = useState(false);
  const ref = useRef(null);

  useEffect(() => { setQuery(value || ''); }, [value]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = query.trim()
    ? ALL_EXERCISES.filter(e => e.name.toLowerCase().includes(query.toLowerCase()))
    : ALL_EXERCISES;

  return (
    <div ref={ref} className="relative w-full">
      <div className="flex items-center bg-[#252525] rounded-xl border border-gray-700 focus-within:border-indigo-500 transition-colors">
        <Search className="w-4 h-4 text-gray-500 ml-3 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder || 'Buscar na biblioteca de exercícios…'}
          className="flex-1 px-3 py-2.5 bg-transparent text-gray-200 text-sm focus:outline-none placeholder-gray-600"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); onChange(''); }}
            className="mr-2 text-gray-500 hover:text-gray-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="mr-3 text-gray-500 hover:text-gray-300"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-2xl max-h-52 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-gray-500 text-xs px-3 py-2">Nenhum exercício encontrado.</p>
          ) : (
            Object.entries(CATALOG).map(([group, exercises]) => {
              const list = exercises.filter(n =>
                n.toLowerCase().includes(query.toLowerCase())
              );
              if (!list.length) return null;
              return (
                <div key={group}>
                  <p className="text-gray-500 text-xs px-3 pt-2 pb-1 uppercase tracking-wider">
                    {group}
                  </p>
                  {list.map(name => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => { setQuery(name); onChange(name); setOpen(false); }}
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

export default ExercisePicker;
