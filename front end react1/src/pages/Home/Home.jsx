import React from 'react';
import About    from './About';
import IMC      from './IMC';
import Services from './Services';
import Footer   from './Footer';
import WorkoutBanner from '../../components/WorkoutTimer/WorkoutBanner';

/**
 * Home — dashboard interno do app (rota /home, protegida).
 * A landing pública está em /pages/Landing/LandingPage.jsx (rota /).
 */
const Home = () => {
  const email = localStorage.getItem('email') || '';
  const name  = email.split('@')[0];
  const greeting = name ? name.charAt(0).toUpperCase() + name.slice(1) : 'Atleta';

  return (
    <div className="bg-[#171717] min-h-screen">
      {/* Saudação */}
      <div className="lg:px-24 md:px-16 px-4 pt-8 pb-2">
        <h1 className="text-2xl font-bold text-gray-100" style={{ fontFamily: 'Syne, sans-serif' }}>
          Olá, <span className="text-[#7B6FFF]">{greeting}</span> 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">Pronto para o treino de hoje?</p>
      </div>

      {/* Banner de treino */}
      <div className="lg:px-24 md:px-16 px-4 pt-4 pb-0">
        <WorkoutBanner />
      </div>

      {/* Seções */}
      <section id="imc">
        <IMC />
      </section>

      <section id="services">
        <Services />
      </section>

      <section id="about">
        <About />
      </section>

      <section id="footer">
        <Footer />
      </section>
    </div>
  );
};

export default Home;