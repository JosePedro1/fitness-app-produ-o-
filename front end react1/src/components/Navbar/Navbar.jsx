import React, { useState } from 'react';
import { Menu, X, Dumbbell, Timer, TrendingUp, Calendar, BookOpen, Home, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { logoutUser } from '../../services/api-login';

const NAV_ITEMS = [
  { name: 'Início',     link: '/home',              icon: Home },
  { name: 'Rotinas',    link: '/routines',           icon: Dumbbell },
  { name: 'Timer',      link: '/timer',              icon: Timer },
  { name: 'Progresso',  link: '/progress',           icon: TrendingUp },
  { name: 'Calendário', link: '/calendar',           icon: Calendar },
  { name: 'Exercícios', link: '/exercises-library',  icon: BookOpen },
  { name: 'Nutrição', link: '/nutrition', icon: Salad },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="w-full h-auto bg-[#1d1d1d] border-b border-white/5 lg:px-10 md:px-8 px-4 py-3 sticky top-0 left-0 z-50">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link to="/home" className="flex items-center gap-1.5 shrink-0">
          <span className="text-xl font-black text-white tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
            Fit<span className="text-[#5B4FFF]">Ness</span>
          </span>
          <span className="w-2 h-2 rounded-full bg-[#5B4FFF] animate-pulse" />
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ name, link, icon: Icon }) => {
            const active = location.pathname === link;
            return (
              <li key={link}>
                <Link
                  to={link}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    active
                      ? 'bg-[#5B4FFF]/20 text-[#7B6FFF] font-medium'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {name}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Logout (desktop) */}
        <button
          onClick={logoutUser}
          className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-400 hover:bg-red-400/10 border border-transparent hover:border-red-400/20 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sair
        </button>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-gray-400 hover:text-gray-200 transition-colors"
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden pt-3 pb-1 flex flex-col gap-1 border-t border-white/5 mt-3">
          {NAV_ITEMS.map(({ name, link, icon: Icon }) => {
            const active = location.pathname === link;
            return (
              <Link
                key={link} to={link} onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active ? 'bg-[#5B4FFF]/20 text-[#7B6FFF]' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" /> {name}
              </Link>
            );
          })}
          <button
            onClick={() => { setOpen(false); logoutUser(); }}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all mt-1"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;