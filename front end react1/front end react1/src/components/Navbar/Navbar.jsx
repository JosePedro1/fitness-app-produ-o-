import React, { useState } from "react";
import { Dumbbell, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import PrimaryBtn from "../Button/PrimaryBtn";
import { logoutUser } from "../../services/api-login";

const Navbar = () => {
  const [navbar, setNavbar] = useState(false);
  const navItems = [
    { name: "Inicio", link: "home" },
    { name: "Sobre", link: "about" },
    { name: "IMC", link: "imc" },
    { name: "Serviços", link: "services" },
    { name: "Contatos", link: "contatos" },
  ];

  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth" });
    setNavbar(false);
  };

  return (
    <nav className="w-full h-auto bg-[#1d1d1d] shadow-none lg:px-24 md:px-16 sm:px-6 px-4 py-3 sticky top-0 left-0 z-50">
      <div className="justify-between mx-auto lg:w-full md:items-center md:flex">
        <div>
          <div className="flex items-center justify-between py-1 md:py-1 md:block">
            <Link
              to="/"
              className="text-3xl text-indigo-600 font-semibold tracking-[0.1rem] flex items-end gap-x-1 relative"
            >
              G<span className="text-xl font-bold text-gray-300">Y</span>M
              <Dumbbell className="w-5 h-4 text-indigo-600 -rotate-45 absolute top-0 left-[46%] translate-x-[-50%]" />
            </Link>
            <div className="md:hidden">
              <button
                className="p-2 text-gray-700 rounded-md outline-none border border-transparent focus:border-gray-400 focus:border"
                onClick={() => setNavbar(!navbar)}
              >
                {navbar ? (
                  <X className="text-gray-400 cursor-pointer" size={24} />
                ) : (
                  <Menu className="text-gray-400 cursor-pointer" size={24} />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className={`flex justify-between items-center md:block ${navbar ? "block" : "hidden"}`}>
          <ul className="list-none lg:flex md:flex sm:block block items-center gap-x-5 gap-y-16">
            {navItems.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => handleScroll(item.link)}
                  className="text-gray-500 text-lg font-medium hover:text-indigo-600 ease-out duration-700"
                >
                  {item.name}
                </button>
              </li>
            ))}
            <PrimaryBtn onClick={logoutUser}>SAIR</PrimaryBtn>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
