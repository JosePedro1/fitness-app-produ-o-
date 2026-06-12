/**
 * BottomNav.jsx
 *
 * Navegação inferior fixa para mobile (md:hidden).
 * Substitui a necessidade de abrir o menu hamburger para as 5 rotas
 * mais usadas, mantendo tudo dentro do alcance do polegar.
 *
 * Itens: Início, Rotinas, Timer, Progresso, Perfil.
 * Os demais destinos (Nutrição, Biblioteca, Calendário) ficam acessíveis
 * pelos Quick Actions da Home ou pelo menu "Mais" da Navbar.
 */

import React from 'react';
import { Home, Dumbbell, Timer, TrendingUp, UserCircle2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const BOTTOM_NAV_ITEMS = [
  { name: 'Início',    link: '/home',     icon: Home },
  { name: 'Rotinas',   link: '/routines', icon: Dumbbell },
  { name: 'Timer',     link: '/timer',    icon: Timer },
  { name: 'Progresso', link: '/progress', icon: TrendingUp },
  { name: 'Perfil',    link: '/profile',  icon: UserCircle2 },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1d1d1d] border-t border-white/5 pb-[env(safe-area-inset-bottom)]"
      aria-label="Navegação principal"
    >
      <ul className="flex items-stretch justify-between">
        {BOTTOM_NAV_ITEMS.map(({ name, link, icon: Icon }) => {
          const active = location.pathname === link;
          return (
            <li key={link} className="flex-1">
              <Link
                to={link}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center justify-center gap-1 h-16 w-full text-[11px] transition-colors ${
                  active ? 'text-[#7B6FFF]' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={active ? 2.4 : 2} />
                <span className={active ? 'font-medium' : ''}>{name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomNav;
