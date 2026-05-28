import { Dumbbell } from 'lucide-react';
import React from 'react';

const About = () => (
  <div className="w-full h-auto flex items-center justify-between gap-7 lg:py-16 md:py-14 sm:py-12 py-10 lg:px-24 md:px-16 sm:px-6 px-4 flex-wrap-reverse">
    <div className="lg:w-[38%] md:w-full sm:w-full w-full h-auto relative overflow-hidden rounded-lg">
      <img
        src="https://images.unsplash.com/photo-1526314149856-d8cf115d62f1?q=80&w=1949&auto=format&fit=crop"
        alt="Sobre o FitTrack"
        className="w-full lg:h-[70vh] md:h-[68vh] sm:h-[60vh] h-[55vh] object-cover"
      />
    </div>
    <div className="lg:w-[50%] md:w-full sm:w-full w-full h-auto lg:text-start md:text-start sm:text-start text-center">
      <h6 className="text-lg font-medium text-gray-200 flex items-center lg:justify-start md:justify-start sm:justify-start justify-center gap-x-2 mb-3">
        <Dumbbell className="w-4 h-4 -rotate-45 text-[#5B4FFF]" />
        Sobre o FitTrack
      </h6>

      {/* ✅ Corrigido: text-xk → text-2xl */}
      <h1 className="lg:text-3xl md:text-3xl sm:text-2xl text-2xl font-semibold text-gray-200 mb-4 leading-normal lg:pe-5 md:pe-4 sm:pe-1 pe-0">
        Resultados reais, sem complicação: gerencie seus treinos e conquiste seus objetivos
      </h1>

      <p className="lg:text-base md:text-base sm:text-sm text-sm text-gray-500 font-medium mb-4 text-justify">
        O FitTrack é um app de fitness pessoal gratuito e completo. Com ele você cria rotinas de treino personalizadas,
        acompanha seu progresso corporal ao longo do tempo, usa o cronômetro HIIT com alertas sonoros, consulta a biblioteca
        de exercícios com vídeos integrados e visualiza sua constância no calendário com heatmap estilo GitHub.
      </p>
      <p className="lg:text-base md:text-base sm:text-sm text-sm text-gray-500 font-medium mb-4 text-justify">
        Seus dados são armazenados com segurança via Supabase, com autenticação JWT e privacidade garantida.
        Seja você iniciante ou avançado, o FitTrack tem as ferramentas para manter o foco e a constância.
      </p>
    </div>
  </div>
);

export default About;