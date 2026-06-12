/**
 * Accordion.jsx
 *
 * Seção recolhível genérica usada para esconder, por padrão, conteúdo de
 * alta utilidade mas baixa frequência de uso (ex.: Calculadora IMC na Home).
 * Padrão familiar em apps mobile (iFood — filtros, Mercado Livre — specs).
 */

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const Accordion = ({ title, icon, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="w-full bg-black/20 border border-white/10 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 px-4 min-h-[52px] py-3 text-left"
      >
        <span className="flex items-center gap-x-2 text-sm font-medium text-gray-200">
          {icon}
          {title}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        className="overflow-hidden transition-[max-height] duration-300 ease-out"
        style={{ maxHeight: open ? '3000px' : '0px' }}
      >
        <div className="border-t border-white/5 px-4 pb-4 pt-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Accordion;
