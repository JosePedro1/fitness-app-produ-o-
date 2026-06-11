import React, { useState, useEffect } from 'react';
import About          from './About';
import IMC            from './IMC';
import Services       from './Services';
import Footer         from './Footer';
import WorkoutBanner  from '../../components/WorkoutTimer/WorkoutBanner';
import FeedbackWidget from '../../components/FeedbackWidget/FeedbackWidget'; // ← NOVO
import { getProfile } from '../../services/api-profile';

/**
 * Home — dashboard interno do app (rota /home, protegida).
 * A landing pública está em /pages/Landing/LandingPage.jsx (rota /).
 */
const Home = () => {
  const [greeting, setGreeting] = useState('Atleta');

  useEffect(() => {
    getProfile()
      .then(data => {
        if (data?.display_name?.trim()) {
          setGreeting(data.display_name.trim());
        }
      })
      .catch(() => {});
  }, []);

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

      {/* Widget flutuante de feedback — aparece em todas as páginas via /home */}
      <FeedbackWidget />
    </div>
  );
};

export default Home;