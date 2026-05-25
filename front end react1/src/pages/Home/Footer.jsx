import React from 'react'
import {Link} from 'react-router-dom'
import { Dumbbell, Github, Instagram, Linkedin, MailOpen, MapPin, Phone } from 'lucide-react'

const Footer  = () => {
  return (
    <>
      <div className="w-full h-auto flex items-center justify-center bg-black/10 
      flex-col py-16 lg:px-24 md:px-16 sm:px-6 px-4">
        <div className="w-full h-auto flex items-start lg:justify-between 
        md:justify-between sm:justify-center justify-center gap-5 mb-10 flex-wrap">
          <div className="lg:w-[30%] md:w-[30%] sm:w-full w-full h-auto p-2 flex 
          lg:items-start md:items-start sm:items-center items-center flex-col 
          justify-center">
            <Link className="w-fit h-auto text-3xl text-indigo-600 font-semibold tracking-[0.1rem] flex items-end gap-x-1 relative">
              G<span className="text-xl font-bold text-gray-300">Y</span>M
              <Dumbbell className="w-5 h-4 text-indigo-600 -rotate-45 absolute top-0 left-[46%] translate-x-[-50%]" />
            </Link>
            <p className="text-base text-gray-500 font-normal mb-4 lg:text-start md:text-start sm:text-center text-center">
              Fitness App - Seu guia para uma vida saudável e equilibrada. Acompanhe seu progresso e conquiste seus objetivos com a gente!
            </p>
            <div className="w-full h-auto space-y-2">
              <div className="w-full h-auto flex items-center lg:justify-start md:justify-start sm:justify-center justify-center gap-x-2 text-gray-400 hover:text-indigo-600 ease-out duration-300 cursor-pointer">
                <MapPin className="w-5 h-5" />
                <p className="text-base">Av Pedro Marques de Medeiros - Parque Industrial, Picos - PI</p>
              </div>
              <div className="w-full h-auto flex items-center lg:justify-start md:justify-start sm:justify-center justify-center gap-x-2 text-gray-400 hover:text-indigo-600 ease-out duration-300 cursor-pointer">
                <MailOpen className="w-5 h-5" />
                <p className="text-base">IFPI@example.com</p>
              </div>
              <div className="w-full h-auto flex items-center lg:justify-start md:justify-start sm:justify-center justify-center gap-x-2 text-gray-400 hover:text-indigo-600 ease-out duration-300 cursor-pointer">
                <Phone className="w-5 h-5" />
                <p className="text-base">(89)99999-9999</p>
              </div>
            </div>
          </div>
          <div className="lg:w-[65%] md:w-[65%] sm:w-full w-full h-auto p-2 flex items-center lg:justify-end md:justify-end sm:justify-center justify-center flex-wrap gap-">
            <div className="lg:w-[30%] md:w-[48%] sm:w-[48%] w-full h-auto flex items-center flex-col justify-center">
              <h2 className="text-lg text-gray-200 font-medium mb-4">
                Principais Serviços
              </h2>
              <div className="w-full h-auto">
                <ul className="w-full h-auto space-y-2">
                  <li className="w-full h-auto text-gray-400 hover:text-indigo-600 ease-out duration-300 cursor-pointer text-center">
                  <Link to="/tasks">Gerenciador de Tarefas</Link>
                  </li>
                  <li className="w-full h-auto text-gray-400 hover:text-indigo-600 ease-out duration-300 cursor-pointer text-center">
                    <Link to="/routines">Rotinas de Treino </Link>
                  </li>
                  <li className="w-full h-auto text-gray-400 hover:text-indigo-600 ease-out duration-300 cursor-pointer text-center">
                    <Link to="/progress">Progresso Corporal</Link>
                  </li>
                  {/* <li className="w-full h-auto text-gray-400 hover:text-indigo-600 ease-out duration-300 cursor-pointer text-center">
                    <a href="#services">CrossFit</a>
                  </li>
                  <li className="w-full h-auto text-gray-400 hover:text-indigo-600 ease-out duration-300 cursor-pointer text-center">
                    <a href="#services">Corrida</a>
                  </li>
                  <li className="w-full h-auto text-gray-400 hover:text-indigo-600 ease-out duration-300 cursor-pointer text-center">
                    <a href="#services">Dança</a>
                  </li>
                  <li className="w-full h-auto text-gray-400 hover:text-indigo-600 ease-out duration-300 cursor-pointer text-center">
                    <a href="#services">Boxe</a>
                  </li>
                  <li className="w-full h-auto text-gray-400 hover:text-indigo-600 ease-out duration-300 cursor-pointer text-center">
                    <a href="#services">Yoga</a>
                  </li> */}
                </ul>
              </div>
            </div>
            <div className="lg:w-[30%] md:w-[48%] sm:w-[48%] w-full h-auto flex items-center flex-col justify-center">
              <h2 className="text-lg text-gray-200 font-medium mb-4">
                Links de Navegação
              </h2>
              <div className="w-full h-auto">
                <ul className="w-full h-auto space-y-2">
                  <li className="w-full h-auto text-gray-400 hover:text-indigo-600 ease-out duration-300 cursor-pointer text-center">
                    <a href="#hero">Início</a>
                  </li>
                  <li className="w-full h-auto text-gray-400 hover:text-indigo-600 ease-out duration-300 cursor-pointer text-center">
                    <a href="#about">Sobre</a>
                  </li>
                  <li className="w-full h-auto text-gray-400 hover:text-indigo-600 ease-out duration-300 cursor-pointer text-center">
                    <a href="#imc">IMC</a>
                  </li>
                  <li className="w-full h-auto text-gray-400 hover:text-indigo-600 ease-out duration-300 cursor-pointer text-center">
                    <a href="#services">Serviços</a>
                  </li>
                  <li className="w-full h-auto text-gray-400 hover:text-indigo-600 ease-out duration-300 cursor-pointer text-center">
                    <a href="#contatos">Contatos</a>
                  </li>
                  {/* <li className="w-full h-auto text-gray-400 hover:text-indigo-600 ease-out duration-300 cursor-pointer text-center">
                    <a href="#login">Login</a>
                  </li> */}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="w-full flex flex-col items-center justify-between py-4 border-t mt-auto border-gray-400" style={{ position: 'relative', bottom: 0 }} >
          <p className="text-sm text-gray-400 font-normal">
            © 2025 Matheus
          </p>
          
          <div className="flex items-center justify-center gap-4 mt-2">
            <a href="https://github.com/Matheusloran573" target="_blank" className="w-8 h-8 flex items-center justify-center bg-transparent text-white hover:text-gray-400">
              <Github className="w-5 h-5" />
            </a>
            <a href="https://www.instagram.com/m_lorannn/" target="_blank" className="w-8 h-8 flex items-center justify-center bg-transparent text-white hover:text-gray-400">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://www.linkedin.com/in/matheus-lorannn-84537b34a/" target="_blank" className="w-8 h-8 flex items-center justify-center bg-transparent text-white hover:text-gray-400">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

export default Footer