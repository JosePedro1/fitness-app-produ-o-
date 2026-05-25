import React from "react";
import PrimaryBtn from "../../components/Button/PrimaryBtn";

import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import { Autoplay, Navigation } from 'swiper/modules';

const Hero = () => {
    const swiperData = [
        {
          id: 1,
          bgImg: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDF8fHxlbnwwfHx8fHw%3D",
          slogan: "Mantenha seu corpo saudável",
          title: "Constância",
          desc: "Prepare-se para queimar muita gordura com nossos produtos de alta qualidade.",
        },
        {
          id: 2,
          bgImg: "https://images.unsplash.com/photo-1484452330304-377cdeb05340?q=80&w=1771&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          slogan: "Apenas acredite em",
          title: "Você Mesmo",
          desc: "Estamos aqui para ajudá-lo a alcançar seus objetivos.",
        },
        {
          id: 3,
          bgImg: "https://images.unsplash.com/photo-1519505907962-0a6cb0167c73?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          slogan: "Faça seu corpo crescer",
          title: "Força",
          desc: "Deixe seu corpo mais forte com nossos produtos de alta qualidade.",
        },
      ];
       
    return(
        <><div className="w-full h-auto">
            <Swiper
            spaceBetween={30}
            centeredSlides={true}
            loop = {true}
            autoplay={{
            delay: 2500,
            disableOnInteraction: false,
            }}
            navigation={true}
            modules={[Autoplay, Navigation]}
            className="mySwiper w-full h-auto"
        >
            {swiperData.map((data) => (
              <SwiperSlide 
                key={data.id}
                className="w-full h-[70vh] relative" 
                style={{ 
                  backgroundImage: `url(${data.bgImg})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat" }}
              >

                <div className="w-full h-full bg-black/80 absolute top-0 left-0 -z-10"></div>

                <div className="w-full h-full flex justify-center items-center flex-col z-10 lg:px-24 md:px-16 sm:px-6 px-4">
                  <h5 className="lg:text-4xl md:text-3xl sm:text-2xl text-2xl text-indigo-400 font-semibold mb-2 uppercase">
                    {data.slogan}
                  </h5>
                  <h1 className="lg:text-8xl md:text-7xl sm:text-5xl text-5xl text-white font-bold mb-4 uppercase">
                    {data.title}
                  </h1>
                  <p className="lg:text-lg md:text-base sm:text-base text-base text-gray-500 font-medium mb-6 text-center">
                    {data.desc}
                  </p>
                  {/* <PrimaryBtn className="lg:w-[15%] md:w-[35%] sm:w-[75%] w-[80%] h-14 mt-5 text-xl font-semibold rounded-full">
                    Saiba mais
                  </PrimaryBtn> */}
                </div>
              </SwiperSlide>

            ))}
        </Swiper>
        
        <div className="w-full h-auto flex items-center lg:justify-between
        md:justify-between sm:justify-center justify-center lg:gap-7 md:gap-7 sm:gap-5 
        gap-5 lg:px-24 md:px-16 sm:px-6 px-6 mt-6 flex-wrap">

            <div className="flex items-center justify-center flex-col lg:w-fit md:w-[48%]
            sm:w-[48%] w-full lg:py-6 md:py-7 sm:py-8 py-9 px-10 bg-black/10
            hover:bg-black/30 rounded-md ease-out duration-700 cursor-pointer">
              <h5 className="text-4xl mb-2 text-indigo-400 font-semibold uppercase">
                1500+
              </h5>
              <p className="text-lg text-gray-600 font-medium">Membros</p>
            </div>

            <div className="flex items-center justify-center flex-col lg:w-fit md:w-[48%]
            sm:w-[48%] w-full lg:py-6 md:py-7 sm:py-8 py-9 px-10 bg-black/10
            hover:bg-black/30 rounded-md ease-out duration-700 cursor-pointer">
              <h5 className="text-4xl mb-2 text-indigo-400 font-semibold uppercase">
                75+
              </h5>
              <p className="text-lg text-gray-600 font-medium">Treinadores profissionais</p>
            </div>

            <div className="flex items-center justify-center flex-col lg:w-fit md:w-[48%]
            sm:w-[48%] w-full lg:py-6 md:py-7 sm:py-8 py-9 px-10 bg-black/10
            hover:bg-black/30 rounded-md ease-out duration-700 cursor-pointer">
              <h5 className="text-4xl mb-2 text-indigo-400 font-semibold uppercase">
                10+
              </h5>
              <p className="text-lg text-gray-600 font-medium">Anos de Funcionamento</p>
            </div>

            <div className="flex items-center justify-center flex-col lg:w-fit md:w-[48%]
            sm:w-[48%] w-full lg:py-6 md:py-7 sm:py-8 py-9 px-10 bg-black/10
            hover:bg-black/30 rounded-md ease-out duration-700 cursor-pointer">
              <h5 className="text-4xl mb-2 text-indigo-400 font-semibold uppercase">
                5+
              </h5>
              <p className="text-lg text-gray-600 font-medium">Academias de Treino</p>
            </div>

          </div>
    </div>
    </>
    )
}

export default Hero;