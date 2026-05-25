import React from "react";

// IMPORTANDO AS IMAGENS
import logo from "../../assets/logo.svg";
import ilustracao from "../../assets/ilustracao.svg";

const AuthLayout = ({
  title,
  primaryBtnText,
  secondaryBtnText,
  onSubmit,
  onNavigate,
  disablePrimaryBtn,
  children,
}) => {
  return (
    <main className="flex flex-row items-stretch h-screen overflow-hidden font-['Poppins',sans-serif]">
      
      {/* Seção do formulário */}
      <section className="flex flex-col items-center justify-center px-10 w-[420px] min-w-[340px] bg-white">
        
        {/* LOGO */}
        <div className="mb-6">
          <img
            src={logo}
            alt="Logo"
            className="w-28 object-contain"
          />
        </div>

        <h2 className="text-xl font-bold text-[#555555] mb-8 text-center">
          {title}
        </h2>

        <div className="w-full flex flex-col gap-5">
          {children}
        </div>

        {/* Botões */}
        <div className="flex flex-col items-center w-full gap-6 mt-8">
          <button
            onClick={onSubmit}
            disabled={disablePrimaryBtn}
            className="w-full rounded-lg text-base font-medium text-white bg-[#7001FD] px-6 py-3 shadow-[0px_8px_12px_#9440ff33] disabled:opacity-70 disabled:cursor-not-allowed hover:bg-[#5c00d4] transition-colors duration-200"
          >
            {primaryBtnText}
          </button>

          <div className="flex items-center justify-center gap-5 w-full text-sm text-[#EEEEEE] uppercase">
            <div className="flex-1 h-[2px] bg-[#EEEEEE]" />
            <span>ou</span>
            <div className="flex-1 h-[2px] bg-[#EEEEEE]" />
          </div>

          <button
            onClick={onNavigate}
            className="w-full rounded-lg text-base font-medium text-[#7001FD] border border-[#7001FD] bg-transparent px-6 py-3 hover:bg-[#f3e8ff] transition-colors duration-200"
          >
            {secondaryBtnText}
          </button>
        </div>
      </section>

      {/* Seção ilustrativa */}
      <section className="flex-1 flex flex-col items-center justify-center bg-[#EEEEEE] p-6 overflow-hidden">
        
        <h1 className="text-4xl font-bold text-[#1E2772] text-center leading-tight">
          Você deveria se mover!
        </h1>

        {/* IMAGEM ÚNICA */}
        <img
          src={ilustracao}
          alt="Ilustração"
          className="mt-6 max-w-[500px] max-h-[70vh] w-full object-contain"
        />
      </section>
    </main>
  );
};

export default AuthLayout;