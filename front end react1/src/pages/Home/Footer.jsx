import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Instagram, Linkedin, MailOpen, MapPin } from 'lucide-react';

const Footer = () => (
  <div className="w-full h-auto flex items-center justify-center bg-black/10 flex-col py-16 lg:px-24 md:px-16 sm:px-6 px-4">
    <div className="w-full h-auto flex items-start lg:justify-between md:justify-between sm:justify-center justify-center gap-5 mb-10 flex-wrap">

      {/* Brand */}
      <div className="lg:w-[30%] md:w-[30%] sm:w-full w-full h-auto p-2 flex lg:items-start md:items-start sm:items-center items-center flex-col justify-center">
        <span className="text-2xl font-black text-white tracking-tight mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
          Fit<span className="text-[#5B4FFF]">Track</span>
        </span>
        <p className="text-base text-gray-500 font-normal mb-4 lg:text-start md:text-start sm:text-center text-center">
          Seu app de fitness pessoal — organize treinos, acompanhe progresso e conquiste resultados de forma prática.
        </p>
        <div className="w-full h-auto space-y-2">
          <div className="flex items-center lg:justify-start md:justify-start sm:justify-center justify-center gap-x-2 text-gray-400">
            <MapPin className="w-4 h-4 shrink-0" />
            <p className="text-sm">Picos — PI, Brasil</p>
          </div>
          <div className="flex items-center lg:justify-start md:justify-start sm:justify-center justify-center gap-x-2 text-gray-400">
            <MailOpen className="w-4 h-4 shrink-0" />
            <p className="text-sm">fitnessgymap@gmail.com</p>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="lg:w-[65%] md:w-[65%] sm:w-full w-full h-auto p-2 flex items-center lg:justify-end md:justify-end sm:justify-center justify-center flex-wrap gap-8">
        <div className="flex items-center flex-col justify-center">
          <h2 className="text-lg text-gray-200 font-medium mb-4">Funcionalidades</h2>
          <ul className="space-y-2 text-center">
            {[['Rotinas','/routines'],['Progresso','/progress'],['Timer','/timer'],['Calendário','/calendar'],['Exercícios','/exercises-library']].map(([name,link]) => (
              <li key={link}>
                <Link to={link} className="text-gray-400 hover:text-[#5B4FFF] ease-out duration-300 text-sm">{name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center flex-col justify-center">
          <h2 className="text-lg text-gray-200 font-medium mb-4">Navegação</h2>
          <ul className="space-y-2 text-center">
            {[['Início','/home'],['Calculadora IMC','#imc'],['Sobre','#about']].map(([name,href]) => (
              <li key={href}>
                {href.startsWith('#')
                  ? <a href={href} className="text-gray-400 hover:text-[#5B4FFF] ease-out duration-300 text-sm">{name}</a>
                  : <Link to={href} className="text-gray-400 hover:text-[#5B4FFF] ease-out duration-300 text-sm">{name}</Link>
                }
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>

    <div className="w-full flex flex-col items-center justify-between py-4 border-t border-gray-800">
      <p className="text-sm text-gray-500">© 2025 FitTrack</p>
      <div className="flex items-center justify-center gap-4 mt-2">
        <a href="https://github.com/JosePedro1" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-gray-300 transition-colors"><Github className="w-4 h-4" /></a>
        <a href="https://www.instagram.com/fitness/" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-gray-300 transition-colors"><Instagram className="w-4 h-4" /></a>
        <a href="https://www.linkedin.com/in/josepedro1/" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-gray-300 transition-colors"><Linkedin className="w-4 h-4" /></a>
      </div>
    </div>
  </div>
);

export default Footer;