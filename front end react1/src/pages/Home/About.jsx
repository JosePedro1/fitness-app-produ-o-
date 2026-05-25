import { Dumbbell } from "lucide-react";
import React from "react";
import SecondaryBtn from "../../components/Button/SecondaryBtn";

const About = () => {
  return (
    <>
    <div className="w-full h-auto flex items-center justify-between gap-7 lg:py-16 
    md:py-14 sm:py-12 py-10 lg:px-24 md:px-16 sm:px-6 px-4 flex-wrap-reverse">
      <div className ="lg:w-[38%] md:w-full sm:w-full w-full h-auto relative 
      overflow-hidden rounded-lg">
        <img
          src = "https://images.unsplash.com/photo-1526314149856-d8cf115d62f1?q=80&w=1949&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt = "About image"
          className = "w-full lg:h-[70vh] md:h-[68vh] sm:h-[60vh] h-[55vh] object-cover"
        />
      </div>
      <div className ="lg:w-[50%] md:w-full sm:w-full w-full h-auto lg:text-star md:text-star sm:text-star text-center">
        <h6 className="text-lg font-medium text-gray-200 flex items-center lg:justify-start md:justify-start sm:justify-start justify-center gap-x-2 mb-3">
          <Dumbbell className = "w-4 h-4 -rotate-45 text-indigo-600"/>
          Sobre nós
        </h6>

        <h1 className="lg:text-3xl md:text-3xl sn:text-2xl text-xk font-semibold
        text-gray-200 mb-4 leading-normal lg:pe-5 md:pe-4 sm:pe-1 pe-0">
          Resultados sem esforço, ganhos eficientes: construa seu corpo ideal, mais rápido e com eficácia
        </h1>

        <p className="lg:text-base md:text-base sm:text-sm text-sm text-gray-500 font-medium mb-4 text-justify">
          Gerencie sua rotina e alcance seus objetivos com facilidade usando a nossa plataforma segura e intuitiva.
          Com um sistema inteligente e desenvolvido para todos os perfis de usuários, oferecemos organização de tarefas, criação de rotinas personalizadas e acompanhamento detalhado do seu progresso, tudo em um só lugar.
          Segurança em primeiro lugar: seus dados e informações pessoais são protegidos por um ambiente confiável, com autenticação segura e armazenamento de dados através do Supabase, garantindo integridade e privacidade em todas as operações.
          Seja você alguém que está começando ou um usuário experiente buscando mais eficiência, aqui você encontra as ferramentas essenciais para manter o foco e a constância nas suas atividades do dia a dia.
          Junte-se agora mesmo à nossa comunidade e experimente um jeito simples e eficiente de organizar suas metas, acompanhar sua evolução e conquistar resultados de forma prática e segura.
        </p>

        {/* <SecondaryBtn className="lg:w-auto md:w-auto sm:w-full w-full px-7 py-2 text-base font-medium uppercase justify-center">Torne-se Membro</SecondaryBtn> */}
      </div>
    </div>
    </>
  );
};

export default About;