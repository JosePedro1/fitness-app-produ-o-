import React, { useState } from 'react';
import { Dumbbell, ArrowRight, AlertCircle, TrendingUp, RotateCcw, Loader2 } from 'lucide-react';
import Label from '../../components/Label/Label';
import Input from '../../components/Form/Input';
import SecondaryBtn from '../../components/Button/SecondaryBtn';
import { useNavigate } from 'react-router-dom';
import { getRoutines } from '../../services/api-routines';
import { gerarTreinoPersonalizado } from '../../utils/imcTreinoEngine';

const IMC_CONFIG = {
  'Abaixo do peso':    { cor: 'text-blue-400',   corBorda: 'border-blue-400/40',   mensagem: 'Estar abaixo do peso pode impactar sua saúde e energia.', cta: 'Que tal uma rotina personalizada para ganho de massa?', labelBtn: 'Quero minha rotina de ganho de massa' },
  'Peso normal':       { cor: 'text-green-400',   corBorda: 'border-green-400/40',  mensagem: 'Parabéns! Você está com o peso ideal. Continue assim!', cta: 'Que tal uma rotina de manutenção e qualidade de vida?', labelBtn: 'Quero minha rotina de manutenção' },
  'Sobrepeso':         { cor: 'text-yellow-400',  corBorda: 'border-yellow-400/40', mensagem: 'Você está um pouco acima do ideal — mas a mudança começa hoje!', cta: 'Monte sua rotina de emagrecimento agora!', labelBtn: 'Quero minha rotina de emagrecimento' },
  'Obesidade grau 1':  { cor: 'text-orange-400',  corBorda: 'border-orange-400/40', mensagem: 'Cada passo conta. Você não precisa fazer isso sozinho!', cta: 'Comece agora com uma rotina adaptada para você.', labelBtn: 'Quero uma rotina adaptada' },
  'Obesidade grau 2':  { cor: 'text-red-400',     corBorda: 'border-red-400/40',    mensagem: 'Sua saúde é prioridade. Estamos aqui para te ajudar nessa jornada!', cta: 'Que tal começar com um treino leve hoje?', labelBtn: 'Iniciar rotina leve agora' },
  'Obesidade grau 3':  { cor: 'text-red-600',     corBorda: 'border-red-600/40',    mensagem: 'Recomendamos acompanhamento médico e profissional especializado.', cta: 'Preparamos uma rotina inicial super leve para você dar o primeiro passo.', labelBtn: 'Ver rotina inicial personalizada' },
};

const classificarIMC = (v) => {
  const n = parseFloat(v);
  if (n < 18.5) return 'Abaixo do peso';
  if (n < 25)   return 'Peso normal';
  if (n < 30)   return 'Sobrepeso';
  if (n < 35)   return 'Obesidade grau 1';
  if (n < 40)   return 'Obesidade grau 2';
  return 'Obesidade grau 3';
};

const IMC = () => {
  const [peso,         setPeso]         = useState('');
  const [altura,       setAltura]       = useState('');
  const [imc,          setImc]          = useState(null);
  const [classificacao,setClassificacao]= useState('');
  const [treinoGerado, setTreinoGerado] = useState(null);
  const [loadingTreino,setLoadingTreino]= useState(false);
  const [toastMsg,     setToastMsg]     = useState('');
  const navigate = useNavigate();

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const calcularIMC = async () => {
    if (!peso || !altura) { showToast('Preencha todos os campos do formulário IMC'); return; }
    const pesoNum   = parseFloat(peso);
    const alturaNum = parseFloat(altura);
    if (isNaN(pesoNum) || isNaN(alturaNum) || pesoNum <= 0 || alturaNum <= 0) {
      showToast('Insira valores numéricos válidos'); return;
    }
    const imcCalculado = (pesoNum / ((alturaNum / 100) ** 2)).toFixed(2);
    const classif      = classificarIMC(imcCalculado);
    setImc(imcCalculado);
    setClassificacao(classif);
    setTreinoGerado(null);
    setLoadingTreino(true);
    try {
      const rotinas = await getRoutines();
      setTreinoGerado(gerarTreinoPersonalizado(classif, rotinas));
    } catch { /* silencioso */ }
    finally { setLoadingTreino(false); }
  };

  const irParaRotina = () => {
    if (!treinoGerado) return;
    const params = new URLSearchParams({
      nome: treinoGerado.nomeSugerido,
      treinos: JSON.stringify(treinoGerado.exercises),
      imc,
      classificacao,
    });
    navigate(`/routines?${params.toString()}`);
  };

  const config = imc !== null ? IMC_CONFIG[classificacao] : null;

  return (
    <>
      {/* ✅ Toast substituindo alert() */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 px-5 py-3 bg-red-500 text-white text-sm font-medium rounded-lg shadow-lg animate-[slideIn_0.3s_ease]">
          {toastMsg}
        </div>
      )}

      <div className="w-full h-auto items-center lg:py-16 md:py-14 sm:py-12 py-10 lg:px-24 md:px-16 sm:px-6 px-4">
        <div className="w-full h-auto flex items-center justify-center mb-6">
          {/* ✅ Corrigido: text-lf → text-base */}
          <h6 className="lg:text-lg md:text-base sm:text-base text-base justify-center font-medium text-gray-200 flex items-center gap-x-2 bg-black/20 rounded-md py-2 px-4">
            <Dumbbell className="w-4 h-4 -rotate-45 text-[#5B4FFF]" />
            Calculadora IMC — Plano Personalizado
          </h6>
        </div>

        <div className="w-full h-auto flex items-end justify-center bg-black/20 rounded-md lg:gap-5 md:gap-5 sm:gap-3 gap-2 py-10 lg:px-0 md:px-0 sm:px-2 px-4 flex-wrap">
          <div className="lg:w-[25%] md:w-[40%] sm:w-[50%] w-full h-auto p-2">
            <Label htmlFor="peso">Peso (kg)</Label>
            <Input type="number" name="peso" id="peso" placeholder="Coloque seu peso" value={peso} onChange={e => setPeso(e.target.value)} />
          </div>
          <div className="lg:w-[25%] md:w-[40%] sm:w-[50%] w-full h-auto p-2">
            <Label htmlFor="altura">Altura (cm)</Label>
            <Input type="number" name="altura" id="altura" placeholder="Coloque sua altura" value={altura} onChange={e => setAltura(e.target.value)} />
          </div>
          <div className="lg:w-[20%] md:w-[35%] sm:w-[50%] w-full h-auto p-2">
            <SecondaryBtn type="button" className="w-full h-11 justify-center" onClick={calcularIMC}>
              Calcular IMC
            </SecondaryBtn>
          </div>

          {config && (
            <div className="w-full flex justify-center mt-2">
              <div className={`bg-black/60 border ${config.corBorda} rounded-xl px-6 py-5 text-center max-w-xl w-full flex flex-col gap-y-3 shadow-lg`}>
                <p className="text-indigo-400 text-lg">Seu IMC é: <span className="font-bold text-white">{imc}</span></p>
                <p className={`text-2xl font-bold ${config.cor}`}>{classificacao}</p>
                <p className="text-gray-300 text-sm leading-relaxed">{config.mensagem}</p>

                {loadingTreino && (
                  <div className="flex items-center justify-center gap-x-2 text-indigo-400 text-sm py-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Analisando seu histórico...
                  </div>
                )}

                {treinoGerado && !loadingTreino && (
                  <>
                    <div className="flex items-center justify-center gap-x-4 flex-wrap gap-y-2">
                      <span className="flex items-center gap-x-1.5 text-xs bg-indigo-600/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-600/30">
                        <TrendingUp className="w-3 h-3" /> Fase: {treinoGerado.faseLabel}
                      </span>
                      <span className="flex items-center gap-x-1.5 text-xs bg-black/30 text-gray-400 px-3 py-1 rounded-full border border-gray-700">
                        <RotateCcw className="w-3 h-3" /> {treinoGerado.diaLabel}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs">Objetivo: {treinoGerado.objetivo}</p>
                    <div className="bg-black/30 rounded-lg px-4 py-3 text-left">
                      <p className="text-gray-400 text-xs mb-2 font-medium uppercase tracking-wider">Treino de hoje</p>
                      <div className="flex flex-wrap gap-1.5">
                        {treinoGerado.exercises.map((ex, i) => (
                          <span key={i} className="text-xs bg-indigo-600/20 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-600/20">{ex}</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs">Próximo treino: <span className="text-gray-400">{treinoGerado.proximoDiaLabel}</span></p>
                    {treinoGerado.proximaFaseLabel
                      ? <p className="text-gray-500 text-xs">Faltam <span className="text-indigo-400 font-semibold">{treinoGerado.faltamParaProx} treino{treinoGerado.faltamParaProx !== 1 ? 's' : ''}</span> para a fase <span className="text-indigo-400 font-semibold">{treinoGerado.proximaFaseLabel}</span></p>
                      : <p className="text-indigo-400 text-xs font-semibold">🏆 Você está na fase máxima — Avançado!</p>
                    }
                  </>
                )}

                <div className="border-t border-white/10 pt-3">
                  <div className="flex items-start gap-x-2 text-gray-400 text-sm mb-3">
                    <AlertCircle className="w-4 h-4 mt-0.5 text-indigo-400 shrink-0" />
                    <span>{config.cta}</span>
                  </div>
                  <button
                    onClick={irParaRotina}
                    disabled={loadingTreino || !treinoGerado}
                    className="w-full flex items-center justify-center gap-x-2 bg-[#5B4FFF] hover:bg-[#7B6FFF] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm"
                  >
                    {loadingTreino
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Preparando treino...</>
                      : <>{config.labelBtn} <ArrowRight className="w-4 h-4" /></>
                    }
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default IMC;