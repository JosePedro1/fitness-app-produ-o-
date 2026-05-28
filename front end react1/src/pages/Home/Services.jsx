import { Dumbbell, ArrowRight, LineChart, Timer, BookOpen, Calendar, Play, Calculator } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutTimer } from '../../context/WorkoutTimerContext';

const Services = () => {
  const navigate = useNavigate();
  const { isVisible, isRunning, elapsedFormatted, start, resume, setIsMinimized } = useWorkoutTimer();

  const handleStartWorkout = () => {
    if (isVisible) { setIsMinimized(false); if (!isRunning) resume(); }
    else start();
  };

  const services = [
    {
      id: 1,
      serviceImg: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=60',
      title: 'Treino Geral',
      desc: 'Cronômetro que acompanha todo o seu treino — fica ativo enquanto você navega e salva no calendário ao finalizar.',
      icon: <Play className="w-6 h-6 text-white ml-0.5" />,
      isWorkoutTimer: true,
    },
    {
      id: 2,
      serviceImg: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=870&auto=format&fit=crop',
      title: 'Rotinas de Treino',
      desc: 'Crie rotinas personalizadas, adicione exercícios por grupo muscular e organize por dias da semana.',
      link: '/routines',
      icon: <Dumbbell className="w-6 h-6 text-white" />,
      btnText: 'Ver Minhas Rotinas',
    },
    {
      id: 3,
      serviceImg: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=870&auto=format&fit=crop',
      title: 'Progresso Corporal',
      desc: 'Registre peso e medidas corporais e visualize sua evolução com gráficos de barras ao longo do tempo.',
      link: '/progress',
      icon: <LineChart className="w-6 h-6 text-white" />,
      btnText: 'Ver Meu Progresso',
    },
    {
      id: 4,
      serviceImg: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=870&auto=format&fit=crop',
      title: 'Cronômetro HIIT',
      desc: 'Timer com séries e descanso configuráveis, alertas sonoros e presets prontos: Tabata, Força, HIIT.',
      link: '/timer',
      icon: <Timer className="w-6 h-6 text-white" />,
      btnText: 'Iniciar Cronômetro',
    },
    {
      id: 5,
      serviceImg: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=870&auto=format&fit=crop',
      title: 'Biblioteca de Exercícios',
      desc: 'Explore vídeos por grupo muscular e adicione exercícios diretamente nas suas rotinas de treino.',
      link: '/exercises-library',
      icon: <BookOpen className="w-6 h-6 text-white" />,
      btnText: 'Explorar Exercícios',
    },
    {
      id: 6,
      serviceImg: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=870&auto=format&fit=crop',
      title: 'Calendário de Treinos',
      desc: 'Heatmap com streak, estatísticas mensais e histórico completo. Registre sessões manualmente.',
      link: '/calendar',
      icon: <Calendar className="w-6 h-6 text-white" />,
      btnText: 'Ver Calendário',
    },
  ];

  return (
    <div className="w-full h-auto flex items-center justify-center flex-col lg:py-16 md:py-14 sm:py-12 py-10 lg:px-24 md:px-16 sm:px-6 px-4">
      <h6 className="text-lg font-medium text-gray-200 flex items-center gap-x-2 mb-6">
        <Dumbbell className="w-4 h-4 -rotate-45 text-[#5B4FFF]" />
        Funcionalidades
      </h6>
      <div className="w-full flex items-center justify-center gap-4 flex-wrap mb-10">
        {services.map((data) => (
          <div
            key={data.id}
            className="lg:w-[22%] md:w-[48%] sm:w-[48%] w-full lg:h-[50vh] md:h-[53vh] sm:h-[58vh] h-[60vh] rounded-xl bg-black relative overflow-hidden cursor-pointer z-10 hover:-translate-y-2 ease-out duration-500"
            style={{ backgroundImage: `url(${data.serviceImg})`, backgroundPosition: 'center', backgroundSize: 'cover' }}
          >
            <div className="w-full h-full bg-black/80 absolute top-0 left-0 -z-10" />
            <div className="w-full h-full flex items-center justify-center flex-col text-white p-4 z-50">
              <div className="w-14 h-14 rounded-full bg-[#5B4FFF]/80 border-4 border-[#5B4FFF] flex items-center justify-center mb-5">
                {data.icon}
              </div>
              <h1 className="text-xl text-gray-100 font-semibold text-center mb-4">{data.title}</h1>
              <p className="text-base text-gray-300 font-normal text-center mb-6">{data.desc}</p>

              {data.isWorkoutTimer ? (
                <div className="flex flex-col items-center gap-2 w-full">
                  {isVisible && (
                    <span className="text-indigo-300 font-bold tabular-nums text-lg">{elapsedFormatted}</span>
                  )}
                  <button onClick={handleStartWorkout}
                    className="flex items-center gap-x-2 bg-[#5B4FFF] hover:bg-[#7B6FFF] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
                    {isVisible && isRunning ? <>Ver treino ativo <ArrowRight className="w-4 h-4" /></>
                      : isVisible ? <>Retomar treino <ArrowRight className="w-4 h-4" /></>
                      : <>Iniciar treino <Play className="w-4 h-4 ml-0.5" /></>}
                  </button>
                </div>
              ) : (
                <button onClick={() => navigate(data.link)}
                  className="flex items-center gap-x-2 bg-[#5B4FFF] hover:bg-[#7B6FFF] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
                  {data.btnText} <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;