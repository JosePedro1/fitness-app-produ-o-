/**
 * FeaturesPage.jsx — rota /features
 *
 * Destino do link "Ver todas as funções" da Home. Reúne os 7 serviços
 * que antes eram exibidos como cards de h-[60vh] (≈4.200px de scroll)
 * diretamente na Home. Aqui eles têm espaço para respirar sem competir
 * com o conteúdo prioritário do dashboard.
 */

import React from 'react';
import { ArrowLeft, ArrowRight, Dumbbell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutTimer } from '../../context/WorkoutTimerContext';
import { services } from '../Home/servicesData';

const FeaturesPage = () => {
  const navigate = useNavigate();
  const { isVisible, isRunning, elapsedFormatted, start, resume, setIsMinimized } = useWorkoutTimer();

  const handleStartWorkout = () => {
    if (isVisible) { setIsMinimized(false); if (!isRunning) resume(); }
    else start();
  };

  return (
    <div className="w-full min-h-screen bg-[#171717] lg:px-24 md:px-16 sm:px-6 px-4 py-8 pb-24 md:pb-12">
      <button
        onClick={() => navigate('/home')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Início
      </button>

      <h1
        className="text-2xl font-bold text-gray-100 flex items-center gap-2 mb-1"
        style={{ fontFamily: 'Syne, sans-serif' }}
      >
        <Dumbbell className="w-5 h-5 -rotate-45 text-[#5B4FFF]" />
        Funcionalidades
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Todas as ferramentas do FitTrack em um só lugar.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((data) => (
          <div
            key={data.id}
            className="relative h-56 rounded-xl bg-black overflow-hidden"
            style={{ backgroundImage: `url(${data.serviceImg})`, backgroundPosition: 'center', backgroundSize: 'cover' }}
          >
            <div className="absolute inset-0 bg-black/75" />
            <div className="relative h-full flex flex-col p-4">
              <div className="w-10 h-10 rounded-full bg-[#5B4FFF]/80 border-2 border-[#5B4FFF] flex items-center justify-center mb-3 shrink-0">
                {data.icon}
              </div>
              <h2 className="text-base font-semibold text-gray-100 mb-1.5">{data.title}</h2>
              <p className="text-sm text-gray-400 leading-snug mb-3 line-clamp-3">{data.desc}</p>

              <div className="mt-auto">
                {data.isWorkoutTimer ? (
                  <div className="flex items-center gap-2">
                    {isVisible && (
                      <span className="text-indigo-300 font-bold tabular-nums text-sm">{elapsedFormatted}</span>
                    )}
                    <button
                      onClick={handleStartWorkout}
                      className="flex items-center gap-x-1.5 bg-[#5B4FFF] hover:bg-[#7B6FFF] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                    >
                      {isVisible && isRunning ? <>Ver treino ativo <ArrowRight className="w-4 h-4" /></>
                        : isVisible ? <>Retomar treino <ArrowRight className="w-4 h-4" /></>
                        : <>Iniciar treino <ArrowRight className="w-4 h-4" /></>}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => navigate(data.link)}
                    className="flex items-center gap-x-1.5 bg-[#5B4FFF] hover:bg-[#7B6FFF] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    {data.btnText} <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturesPage;
