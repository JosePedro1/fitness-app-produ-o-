import React from 'react';
import { Dumbbell } from 'lucide-react';

const Contatos = () => {

    const contatoData = [
        {
          // id: 1,
          // contatoImg: "https://avatars.githubusercontent.com/u/129105584?v=4",
          // name: "Matheus Loran",
          // // Profissão: "Dev. Back-end",
          // github: "https://github.com/MatheusLoran573" 
        },
        {
            id: 2,
            contatoImg: "https://avatars.githubusercontent.com/u/137945031?s=400&v=4",
            name: "José Pedro",
            // Profissão: "Dev. Back-end",
            github: "https://github.com/JosePedro1" 
          
        },   
         {
            // id: 3,
            // contatoImg: "https://avatars.githubusercontent.com/u/136371023?v=4",
            // name: "Rodrigo Alves",
            // // Profissão: "Dev. Back-end",
            // github: "https://github.com/Rodrigoaaalves" 
          
        }        
      ];
  return (
    <>
        <div className="w-full h-auto flex items-center justify-center flex-col lg:py-16 
      md:py-14 sm:py-12 py-10 lg:px-24 md:px-16 sm:px-6 px-4 ">
        <h6 className="text-lg font-medium text-gray-200 flex items-center gap-x-2 mb-6">
          <Dumbbell className="w-4 h-4 -rotate-45 text-indigo-600"/>
          Contatos  
        </h6>
        <div className="w-full h-auto flex items-center justify-center lg:gap-x-8 md:gap-x-6 sm:gap-x-4 gap-x-3 lg:gap-y-8 md:gap-y-6 sm:gap-y-4 gap-y-3 flex-wrap mb-10">
          {contatoData.map((data) => (
            <div key={data.id} className="lg:w-[23%] md:w-[48%] sm:w-[48%] w-full lg:h-[50vh] md:h-[53vh] sm:h-[58vh] h-[60vh] rounded-xl overflow-hidden relative">
              <img 
                src={data.contatoImg} 
                alt="contato image" 
                className="w-full h-full object-cover" 
              />
              <div className="w-full h-auto bg-gray-900/70 absolute bottom-0 left-0 py-4 px-2 flex items-center justify-center flex-col">
                  <a href={data.github} target="_blank" rel="noopener noreferrer">
                    <h1 className="text-xl text-white font-semibold hover:underline">{data.name}</h1>
                  </a>
                  <p className="text-sm text-gray-300">{data.Profissão}</p>
              </div>
            </div>
          ))}
        </div>
    </div>
    </>
  )
}

export default Contatos;