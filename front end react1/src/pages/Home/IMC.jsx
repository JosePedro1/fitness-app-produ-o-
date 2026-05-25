import React, { useState } from 'react';
import { Dumbbell } from 'lucide-react';
import Label from '../../components/Label/Label';
import Input from '../../components/Form/Input';
import SecondaryBtn from '../../components/Button/SecondaryBtn';

const IMC = () => {

  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [imc, setImc] = useState(null);
  const [classificacao, setClassificacao] = useState("");

  const calcularIMC = () => {
    if (peso === "" || altura === "") {
      alert("Preencha todos os campos do formulário IMC");
      return;
    }

    const pesoNum = parseFloat(peso);
    const alturaNum = parseFloat(altura);

    if (isNaN(pesoNum) || isNaN(alturaNum)) {
      alert("Insira valores numéricos válidos");
      return;
    }

    const imcCalculado = (pesoNum / ((alturaNum * alturaNum) / 10000)).toFixed(2);
    setImc(imcCalculado);
    setClassificacao(classificarIMC(imcCalculado));
  };

  const classificarIMC = (imc) => {
    const valor = parseFloat(imc);

    if (valor < 18.5) return "Abaixo do peso";
    if (valor >= 18.5 && valor < 24.9) return "Peso normal";
    if (valor >= 25 && valor < 29.9) return "Sobrepeso";
    if (valor >= 30 && valor < 34.9) return "Obesidade grau 1";
    if (valor >= 35 && valor < 39.9) return "Obesidade grau 2";
    return "Obesidade grau 3";
  };

  return (
    <>
      <div className="w-full h-auto items-center lg:py-16 
        md:py-14 sm:py-12 py-10 lg:px-24 md:px-16 sm:px-6 px-4">
        <div className="w-full h-auto flex-items-center justify-center flex-col">
          <div className="w-full h-auto flex items-center justify-center mb-6">
            <h6 className="lg:text-lg md:text-lf sm:text-base text-base justify-center font-medium
              text-gray-200 flex items-center gap-x-2 
              bg-black/20 rounded-md py-2 px-4">
              <Dumbbell className="w-4 h-4 -rotate-45 text-indigo-600"/>
              Calculadora IMC (Índice de Massa Corporal)
            </h6>
          </div>
          <div className="w-full h-auto flex items-end justify-center bg-black/20
            rounded-md lg:gap-5 md:gap-5 sm:gap-3 gap-2 py-10 lg:px-0 md:px-0 sm:px-2 px-4 
            flex-wrap">
            
            <div className="lg:w-[25%] md:w-[40%] sm:w-[50%] w-full h-auto p-2">
              <Label htmlFor="peso">Peso (kg)</Label>
              <Input 
                type="text"
                name="peso" 
                id="peso" 
                placeholder="Coloque seu peso"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
              />
            </div>
            
            <div className="lg:w-[25%] md:w-[40%] sm:w-[50%] w-full h-auto p-2">
              <Label htmlFor="altura">Altura (cm)</Label>
              <Input 
                type="text"
                name="altura" 
                id="altura" 
                placeholder="Coloque sua altura"
                value={altura}
                onChange={(e) => setAltura(e.target.value)}
              />
            </div>

            <div className="lg:w-[20%] md:w-[35%] sm:w-[50%] w-full h-auto p-2">
              <SecondaryBtn 
                type="button" 
                className="w-full h-11 justify-center"
                onClick={calcularIMC}
              >
                Calcular IMC   
              </SecondaryBtn>
            </div>  

            {imc !== null && (
              <div className="w-full flex justify-center mt-4">
                <div className="bg-black rounded-b-md px-6 py-4 text-center">
                  <p className="text-indigo-600 mb-2">
                    Seu IMC é: <span className="font-bold">{imc}</span>
                  </p>
                  <p className="text-gray-300">
                    Classificação: <span className="font-semibold">{classificacao}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default IMC;
