import React, { useState } from 'react';
import { Dumbbell, ArrowRight, AlertCircle } from 'lucide-react';
import Label from '../../components/Label/Label';
import Input from '../../components/Form/Input';
import SecondaryBtn from '../../components/Button/SecondaryBtn';
import { useNavigate } from 'react-router-dom';

const IMC_CONFIG = {
  'Abaixo do peso': {
    cor: 'text-blue-400',
    corBorda: 'border-blue-400/40',
    emoji: '⚠️',
    mensagem: 'Seu corpo precisa de atenção! Estar abaixo do peso pode impactar sua saúde e energia.',
    cta: 'Que tal uma rotina personalizada para ganho de massa? Vamos montar isso pra você!',
    labelBtn: 'Quero minha rotina de ganho de massa',
    treinoSugerido: ['Supino Reto', 'Agachamento Livre', 'Remada Curvada', 'Rosca Direta', 'Tríceps Testa'],
    nomeSugerido: 'Rotina Ganho de Massa (IMC)',
  },
  'Peso normal': {
    cor: 'text-green-400',
    corBorda: 'border-green-400/40',
    emoji: '✅',
    mensagem: 'Parabéns! Você está com o peso ideal. Continue assim!',
    cta: 'Para manter essa forma, que tal uma rotina de manutenção e qualidade de vida?',
    labelBtn: 'Quero minha rotina de manutenção',
    treinoSugerido: ['Agachamento Livre', 'Flexão de Braços', 'Prancha', 'Elevação Lateral', 'Abdominal Crunch'],
    nomeSugerido: 'Rotina Manutenção (IMC)',
  },
  'Sobrepeso': {
    cor: 'text-yellow-400',
    corBorda: 'border-yellow-400/40',
    emoji: '📊',
    mensagem: 'Você está um pouco acima do ideal — mas a mudança começa hoje!',
    cta: 'Não está satisfeito com esse resultado? Venha conhecer nossos serviços ou monte sua rotina de emagrecimento agora!',
    labelBtn: 'Quero minha rotina de emagrecimento',
    treinoSugerido: ['Agachamento Sumô', 'Prancha', 'Flexão de Braços', 'Abdominal Crunch', 'Elevação de Pernas'],
    nomeSugerido: 'Rotina Emagrecimento (IMC)',
  },
  'Obesidade grau 1': {
    cor: 'text-orange-400',
    corBorda: 'border-orange-400/40',
    emoji: '🎯',
    mensagem: 'Sabemos que não é fácil, mas cada passo conta. Você não precisa fazer isso sozinho!',
    cta: 'Venha conhecer nossos planos personalizados ou comece agora com uma rotina adaptada para você.',
    labelBtn: 'Quero uma rotina adaptada',
    treinoSugerido: ['Agachamento Livre', 'Elevação Lateral', 'Abdominal Crunch', 'Prancha', 'Leg Press'],
    nomeSugerido: 'Rotina Adaptada Obesidade G1 (IMC)',
  },
  'Obesidade grau 2': {
    cor: 'text-red-400',
    corBorda: 'border-red-400/40',
    emoji: '💪',
    mensagem: 'Sua saúde é prioridade. Estamos aqui para te ajudar nessa jornada!',
    cta: 'Recomendamos fortemente nosso acompanhamento personalizado. Que tal começar com um treino leve hoje?',
    labelBtn: 'Iniciar rotina leve agora',
    treinoSugerido: ['Agachamento Livre', 'Flexão de Braços', 'Abdominal Crunch', 'Prancha', 'Elevação Lateral'],
    nomeSugerido: 'Rotina Leve Obesidade G2 (IMC)',
  },
  'Obesidade grau 3': {
    cor: 'text-red-600',
    corBorda: 'border-red-600/40',
    emoji: '🏥',
    mensagem: 'Sua saúde é a nossa missão. Recomendamos acompanhamento médico e profissional especializado.',
    cta: 'Venha conhecer nosso suporte especializado! Também preparamos uma rotina inicial super leve para você dar o primeiro passo.',
    labelBtn: 'Ver rotina inicial personalizada',
    treinoSugerido: ['Flexão de Braços', 'Abdominal Crunch', 'Prancha', 'Agachamento Livre'],
    nomeSugerido: 'Rotina Inicial Obesidade G3 (IMC)',
  },
};

const IMC = () => {
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [imc, setImc] = useState(null);
  const [classificacao, setClassificacao] = useState('');
  const navigate = useNavigate();

  const calcularIMC = () => {
    if (peso === '' || altura === '') {
      alert('Preencha todos os campos do formulário IMC');
      return;
    }
    const pesoNum = parseFloat(peso);
    const alturaNum = parseFloat(altura);
    if (isNaN(pesoNum) || isNaN(alturaNum)) {
      alert('Insira valores numéricos válidos');
      return;
    }
    const imcCalculado = (pesoNum / ((alturaNum * alturaNum) / 10000)).toFixed(2);
    setImc(imcCalculado);
    setClassificacao(classificarIMC(imcCalculado));
  };

  const classificarIMC = (imc) => {
    const valor = parseFloat(imc);
    if (valor < 18.5) return 'Abaixo do peso';
    if (valor < 24.9) return 'Peso normal';
    if (valor < 29.9) return 'Sobrepeso';
    if (valor < 34.9) return 'Obesidade grau 1';
    if (valor < 39.9) return 'Obesidade grau 2';
    return 'Obesidade grau 3';
  };

  const irParaRotina = () => {
    const config = IMC_CONFIG[classificacao];
    if (!config) return;
    const params = new URLSearchParams({
      nome: config.nomeSugerido,
      treinos: JSON.stringify(config.treinoSugerido),
      imc: imc,
      classificacao: classificacao,
    });
    navigate(`/routines?${params.toString()}`);
  };

  const config = imc !== null ? IMC_CONFIG[classificacao] : null;

  return (
    <>
      <div className="w-full h-auto items-center lg:py-16 md:py-14 sm:py-12 py-10 lg:px-24 md:px-16 sm:px-6 px-4">
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

            {config && (
              <div className={`w-full flex justify-center mt-2`}>
                <div className={`bg-black/60 border ${config.corBorda} rounded-xl px-6 py-5 text-center max-w-xl w-full flex flex-col gap-y-3 shadow-lg`}>
                  <p className="text-indigo-400 text-lg">
                    Seu IMC é: <span className="font-bold text-white">{imc}</span>
                  </p>
                  <p className={`text-2xl font-bold ${config.cor}`}>
                    {config.emoji} {classificacao}
                  </p>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {config.mensagem}
                  </p>
                  <div className="border-t border-white/10 pt-3">
                    <div className="flex items-start gap-x-2 text-gray-400 text-sm mb-3">
                      <AlertCircle className="w-4 h-4 mt-0.5 text-indigo-400 shrink-0" />
                      <span>{config.cta}</span>
                    </div>
                    <button
                      onClick={irParaRotina}
                      className="w-full flex items-center justify-center gap-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm"
                    >
                      {config.labelBtn}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <p className="text-gray-500 text-xs mt-2">
                      Você será redirecionado para a aba Rotina com um treino já preparado para hoje!
                    </p>
                  </div>
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
