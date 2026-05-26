import { Dumbbell, ArrowRight, LineChart, Timer, BookOpen, Calendar, Utensils, TrendingUp } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Services = () => {
  const navigate = useNavigate();

  const services = [
    {
      id: 1,
      serviceImg: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=870&auto=format&fit=crop",
      title: "Rotinas de Treino",
      desc: "Crie suas próprias rotinas de treino, adicione exercícios e mantenha o foco nos seus objetivos.",
      link: "/routines",
      icon: <Dumbbell className="w-6 h-6 text-white" />,
      btnText: "Ver Minhas Rotinas",
    },
    {
      id: 2,
      serviceImg: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=870&auto=format&fit=crop",
      title: "Progresso Corporal",
      desc: "Registre suas medições corporais, acompanhe seu peso e visualize a evolução ao longo do tempo.",
      link: "/progress",
      icon: <LineChart className="w-6 h-6 text-white" />,
      btnText: "Ver Meu Progresso",
    },
    {
      id: 3,
      serviceImg: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=870&auto=format&fit=crop",
      title: "Cronômetro de Treino",
      desc: "Cronômetro HIIT com séries, descanso e alertas sonoros. Presets prontos para qualquer modalidade.",
      link: "/timer",
      icon: <Timer className="w-6 h-6 text-white" />,
      btnText: "Iniciar Cronômetro",
    },
    {
      id: 4,
      serviceImg: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=870&auto=format&fit=crop",
      title: "Biblioteca de Exercícios",
      desc: "Explore vídeos de exercícios por grupo muscular e adicione diretamente nas suas rotinas de treino.",
      link: "/exercises-library",
      icon: <BookOpen className="w-6 h-6 text-white" />,
      btnText: "Explorar Exercícios",
    },
    {
      id: 5,
      serviceImg: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=870&auto=format&fit=crop",
      title: "Calendário de Treinos",
      desc: "Visualize seu histórico de treinos, monitore sua sequência e veja quantas horas você treinou por dia.",
      link: "/calendar",
      icon: <Calendar className="w-6 h-6 text-white" />,
      btnText: "Ver Calendário",
    },
    {
      id: 6,
      serviceImg: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=870&auto=format&fit=crop",
      title: "Plano de Refeição IA",
      desc: "Informe os ingredientes que tem em casa e seu objetivo. A IA cria uma receita personalizada com tabela nutricional.",
      link: "/nutrition",
      icon: <Utensils className="w-6 h-6 text-white" />,
      btnText: "Gerar Receita",
    },
    {
      id: 7,
      serviceImg: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=870&auto=format&fit=crop",
      title: "Calculadora IMC",
      desc: "Calcule seu IMC, descubra sua classificação e receba um plano de treino personalizado automaticamente.",
      link: "/home",
      icon: <TrendingUp className="w-6 h-6 text-white" />,
      btnText: "Calcular IMC",
      scroll: "imc",
    },
    {
      id: 8,
      serviceImg: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=870&auto=format&fit=crop",
      title: "Evolução de Treino",
      desc: "Acompanhe sua evolução comparando medidas, frequência de treinos e progresso ao longo dos meses.",
      link: "/progress",
      icon: <LineChart className="w-6 h-6 text-white" />,
      btnText: "Ver Evolução",
    },
  ];

  const handleClick = (data) => {
    if (data.scroll) {
      navigate(data.link);
      setTimeout(() => {
        const el = document.getElementById(data.scroll);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      navigate(data.link);
    }
  };

  return (
    <div className="w-full h-auto flex items-center justify-center flex-col lg:py-16 md:py-14 sm:py-12 py-10 lg:px-24 md:px-16 sm:px-6 px-4">
      <h6 className="text-lg font-medium text-gray-200 flex items-center gap-x-2 mb-6">
        <Dumbbell className="w-4 h-4 -rotate-45 text-indigo-600" />
        Serviços
      </h6>
      <div className="w-full h-auto grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4 mb-10">
        {services.map((data) => (
          <div
            key={data.id}
            className="w-full lg:h-[46vh] md:h-[50vh] sm:h-[55vh] h-[58vh] rounded-xl bg-black relative overflow-hidden cursor-pointer z-10 hover:-translate-y-2 ease-out duration-500"
            style={{
              backgroundImage: `url(${data.serviceImg})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="w-full h-full bg-black/80 absolute top-0 left-0 -z-10"></div>
            <div className="w-full h-full flex items-center justify-center flex-col text-white p-4 z-50">
              <div className="w-14 h-14 rounded-full bg-indigo-600/80 border-4 border-indigo-600 flex items-center justify-center mb-5">
                {data.icon}
              </div>
              <h1 className="text-lg text-gray-100 font-semibold text-center mb-3">
                {data.title}
              </h1>
              <p className="text-sm text-gray-300 font-normal text-center mb-5">
                {data.desc}
              </p>
              <button
                onClick={() => handleClick(data)}
                className="flex items-center gap-x-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors duration-300"
              >
                {data.btnText}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;
