import React from "react";
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
    <main className="flex flex-col md:flex-row md:h-screen md:overflow-hidden font-['Poppins',sans-serif]">

      {/* Seção ilustrativa — topo em mobile */}
      <section className="flex md:hidden flex-col items-center justify-center bg-[#7001FD] px-6 py-8">
        <h1 className="text-2xl font-bold text-white text-center leading-tight mb-4">
          Você deveria se mover!
        </h1>
        <img src={ilustracao} alt="Ilustração" className="max-w-[180px] w-full object-contain" />
      </section>

      {/* Formulário */}
      <section className="flex flex-col items-center justify-center px-6 md:px-10 py-8 w-full md:w-[440px] md:min-w-[380px] bg-white md:overflow-y-auto">
        <div className="mb-5">
          <img src={logo} alt="Logo" className="w-24 md:w-28 object-contain" />
        </div>

        <h2 className="text-lg md:text-xl font-bold text-[#555555] mb-5 text-center">
          {title}
        </h2>

        <div className="w-full flex flex-col gap-4">
          {children}
        </div>

        <div className="flex flex-col items-center w-full gap-4 mt-6">
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

{/* Ilustrativa — direita no desktop */}
<section className="hidden md:flex flex-1 flex-col items-center justify-center bg-[#7001FD] p-6 overflow-hidden">
  <h1 className="text-4xl font-bold text-white text-center leading-tight">
    Você deveria se mover!
  </h1>
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