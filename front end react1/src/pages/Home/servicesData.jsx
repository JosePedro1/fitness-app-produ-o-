/**
 * servicesData.jsx
 *
 * Catálogo único das funcionalidades do app. Usado por:
 *  - QuickActions.jsx (Home) — exibe os 4 primeiros em grid 2x2
 *  - FeaturesPage.jsx (/features) — exibe todos em grade "Ver tudo"
 *
 * Mantido fora dos componentes para evitar duplicação (antes vivia
 * apenas em Services.jsx).
 */

import { Dumbbell, LineChart, Timer, BookOpen, Calendar, Play, Salad } from 'lucide-react';

export const services = [
  {
    id: 1,
    serviceImg: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=60',
    title: 'Treino Geral',
    desc: 'Cronômetro que acompanha todo o seu treino — fica ativo enquanto você navega e salva no calendário ao finalizar.',
    icon: <Play className="w-5 h-5 text-white ml-0.5" />,
    isWorkoutTimer: true,
    accent: 'bg-[#5B4FFF]/15 text-[#7B6FFF]',
  },
  {
    id: 2,
    serviceImg: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&auto=format&fit=crop&q=60',
    title: 'Nutrição com IA',
    desc: 'Informe seus ingredientes e objetivo — a IA monta um plano alimentar completo com macros, refeições e lista de compras.',
    link: '/nutrition',
    icon: <Salad className="w-5 h-5 text-white" />,
    btnText: 'Gerar Plano Alimentar',
    accent: 'bg-emerald-500/15 text-emerald-400',
  },
  {
    id: 3,
    serviceImg: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=870&auto=format&fit=crop',
    title: 'Rotinas de Treino',
    desc: 'Crie rotinas personalizadas, adicione exercícios por grupo muscular e organize por dias da semana.',
    link: '/routines',
    icon: <Dumbbell className="w-5 h-5 text-white" />,
    btnText: 'Ver Minhas Rotinas',
    accent: 'bg-amber-500/15 text-amber-400',
  },
  {
    id: 4,
    serviceImg: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=870&auto=format&fit=crop',
    title: 'Progresso Corporal',
    desc: 'Registre peso e medidas corporais e visualize sua evolução com gráficos de barras ao longo do tempo.',
    link: '/progress',
    icon: <LineChart className="w-5 h-5 text-white" />,
    btnText: 'Ver Meu Progresso',
    accent: 'bg-blue-500/15 text-blue-400',
  },
  {
    id: 5,
    serviceImg: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=870&auto=format&fit=crop',
    title: 'Cronômetro HIIT',
    desc: 'Timer com séries e descanso configuráveis, alertas sonoros e presets prontos: Tabata, Força, HIIT.',
    link: '/timer',
    icon: <Timer className="w-5 h-5 text-white" />,
    btnText: 'Iniciar Cronômetro',
  },
  {
    id: 6,
    serviceImg: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=870&auto=format&fit=crop',
    title: 'Biblioteca de Exercícios',
    desc: 'Explore vídeos por grupo muscular e adicione exercícios diretamente nas suas rotinas de treino.',
    link: '/exercises-library',
    icon: <BookOpen className="w-5 h-5 text-white" />,
    btnText: 'Explorar Exercícios',
  },
  {
    id: 7,
    serviceImg: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=870&auto=format&fit=crop',
    title: 'Calendário de Treinos',
    desc: 'Heatmap com streak, estatísticas mensais e histórico completo. Registre sessões manualmente.',
    link: '/calendar',
    icon: <Calendar className="w-5 h-5 text-white" />,
    btnText: 'Ver Calendário',
  },
];

/** IDs exibidos no grid 2x2 "Acesso Rápido" da Home (regra de Pareto: 80% dos casos de uso). */
export const QUICK_ACTION_IDS = [1, 2, 3, 4];

export default services;
