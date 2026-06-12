import React, { useState } from 'react';
import {
  ArrowRight, AlertCircle, TrendingUp,
  RotateCcw, Loader2, User, Target, Scale
} from 'lucide-react';
import Label from '../../components/Label/Label';
import Input from '../../components/Form/Input';
import SecondaryBtn from '../../components/Button/SecondaryBtn';
import { useNavigate } from 'react-router-dom';
import { getRoutines } from '../../services/api-routines';
import { gerarTreinoPersonalizado, OBJETIVO_LABEL } from '../../utils/imcTreinoEngine';

const IMC_CONFIG = {
  'Abaixo do peso':   { cor: 'text-blue-400',   corBorda: 'border-blue-400/40',   mensagem: 'Estar abaixo do peso pode impactar sua saúde e energia.' },
  'Peso normal':      { cor: 'text-green-400',  corBorda: 'border-green-400/40',  mensagem: 'Parabéns! Você está com o peso ideal. Continue assim!' },
  'Sobrepeso':        { cor: 'text-yellow-400', corBorda: 'border-yellow-400/40', mensagem: 'Você está um pouco acima do ideal — mas a mudança começa hoje!' },
  'Obesidade grau 1': { cor: 'text-orange-400', corBorda: 'border-orange-400/40', mensagem: 'Cada passo conta. Você não precisa fazer isso sozinho!' },
  'Obesidade grau 2': { cor: 'text-red-400',    corBorda: 'border-red-400/40',    mensagem: 'Sua saúde é prioridade. Estamos aqui para te ajudar nessa jornada!' },
  'Obesidade grau 3': { cor: 'text-red-600',    corBorda: 'border-red-600/40',    mensagem: 'Recomendamos acompanhamento médico e profissional especializado.' },
};

const OBJETIVOS = [
  { value: 'emagrecimento',    label: 'Emagrecimento',      icon: '🔥' },
  { value: 'hipertrofia',      label: 'Hipertrofia',        icon: '💪' },
  { value: 'recondicionamento',label: 'Recondicionamento',  icon: '🔄' },
  { value: 'saude',            label: 'Saúde',              icon: '❤️' },
  { value: 'forca',            label: 'Força',              icon: '🏋️' },
];

const IMC = () => {
  const [peso,          setPeso]          = useState('');
  const [altura,        setAltura]        = useState('');
  const [idade,         setIdade]         = useState('');
  const [sexo,          setSexo]          = useState('m');
  const [objetivo,      setObjetivo]      = useState('saude');
  const [imc,           setImc]           = useState(null);
  const [classificacao, setClassificacao] = useState('');
  const [treinoGerado,  setTreinoGerado]  = useState(null);
  const [loadingTreino, setLoadingTreino] = useState(false);
  const [toastMsg,      setToastMsg]      = useState('');
  const navigate = useNavigate();

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const calcularIMC = async () => {
    if (!peso || !altura || !idade) {
      showToast('Preencha peso, altura e idade');
      return;
    }
    const pesoNum   = parseFloat(peso);
    const alturaNum = parseFloat(altura);
    const idadeNum  = parseInt(idade);

    if (isNaN(pesoNum) || isNaN(alturaNum) || isNaN(idadeNum) || pesoNum <= 0 || alturaNum <= 0 || idadeNum <= 0) {
      showToast('Insira valores numéricos válidos');
      return;
    }

    const imcCalculado = (pesoNum / Math.pow(alturaNum / 100, 2)).toFixed(1);
    const classif      = (() => {
      const n = parseFloat(imcCalculado);
      if (n < 18.5) return 'Abaixo do peso';
      if (n < 25)   return 'Peso normal';
      if (n < 30)   return 'Sobrepeso';
      if (n < 35)   return 'Obesidade grau 1';
      if (n < 40)   return 'Obesidade grau 2';
      return 'Obesidade grau 3';
    })();

    setImc(imcCalculado);
    setClassificacao(classif);
    setTreinoGerado(null);
    setLoadingTreino(true);

    try {
      const rotinas = await getRoutines();
      const treino  = gerarTreinoPersonalizado({
        sexo,
        idade: idadeNum,
        peso: pesoNum,
        altura: alturaNum,
        objetivo,
        todasRotinas: rotinas,
      });
      setTreinoGerado(treino);
    } catch { /* silencioso */ }
    finally { setLoadingTreino(false); }
  };

  const irParaRotina = () => {
    if (!treinoGerado) return;
    const params = new URLSearchParams({
      nome:          treinoGerado.nomeSugerido,
      treinos:       JSON.stringify(treinoGerado.exercises),
      imc,
      classificacao,
      sexo,
      objetivo,
    });
    navigate(`/routines?${params.toString()}`);
  };

  const config = imc !== null ? IMC_CONFIG[classificacao] : null;

  return (
    <>
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 px-5 py-3 bg-red-500 text-white text-sm font-medium rounded-lg shadow-lg">
          {toastMsg}
        </div>
      )}

      <div className="w-full">

          {/* Linha 1: Dados físicos */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="lg:flex-1 md:flex-1 w-full">
              <Label htmlFor="peso"><Scale className="w-3.5 h-3.5 inline mr-1" />Peso (kg)</Label>
              <Input type="number" id="peso" placeholder="Ex: 75" value={peso} onChange={e => setPeso(e.target.value)} />
            </div>
            <div className="lg:flex-1 md:flex-1 w-full">
              <Label htmlFor="altura">Altura (cm)</Label>
              <Input type="number" id="altura" placeholder="Ex: 175" value={altura} onChange={e => setAltura(e.target.value)} />
            </div>
            <div className="lg:flex-1 md:flex-1 w-full">
              <Label htmlFor="idade">Idade</Label>
              <Input type="number" id="idade" placeholder="Ex: 28" value={idade} onChange={e => setIdade(e.target.value)} />
            </div>
          </div>

          {/* Linha 2: Sexo */}
          <div className="mb-4">
            <Label><User className="w-3.5 h-3.5 inline mr-1" />Sexo</Label>
            <div className="flex gap-3 mt-1">
              {[{ v: 'm', l: '♂ Masculino' }, { v: 'f', l: '♀ Feminino' }].map(s => (
                <button
                  key={s.v}
                  type="button"
                  onClick={() => setSexo(s.v)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sexo === s.v
                      ? 'bg-indigo-600 text-white'
                      : 'bg-black/40 text-gray-400 hover:bg-black/60 border border-gray-700'
                  }`}
                >
                  {s.l}
                </button>
              ))}
            </div>
          </div>

          {/* Linha 3: Objetivo */}
          <div className="mb-6">
            <Label><Target className="w-3.5 h-3.5 inline mr-1" />Objetivo</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {OBJETIVOS.map(o => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setObjetivo(o.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    objetivo === o.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-black/40 text-gray-400 hover:bg-black/60 border border-gray-700'
                  }`}
                >
                  <span>{o.icon}</span> {o.label}
                </button>
              ))}
            </div>
          </div>

          <SecondaryBtn type="button" className="w-full justify-center h-11" onClick={calcularIMC}>
            Calcular IMC e Gerar Treino
          </SecondaryBtn>

          {/* Resultado */}
          {config && (
            <div className={`mt-6 bg-black/60 border ${config.corBorda} rounded-xl px-6 py-5 flex flex-col gap-y-3 shadow-lg`}>
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <p className="text-indigo-400">IMC: <span className="font-bold text-white text-lg">{imc}</span></p>
                  <p className={`text-xl font-bold mt-0.5 ${config.cor}`}>{classificacao}</p>
                </div>
                <div className="flex-1 text-right text-xs text-gray-500">
                  {sexo === 'f' ? '♀ Feminino' : '♂ Masculino'} · {idade} anos<br/>
                  {peso}kg · {altura}cm
                </div>
              </div>

              <p className="text-gray-300 text-sm leading-relaxed">{config.mensagem}</p>

              {loadingTreino && (
                <div className="flex items-center gap-x-2 text-indigo-400 text-sm py-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Montando seu treino personalizado...
                </div>
              )}

              {treinoGerado && !loadingTreino && (
                <>
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="flex items-center gap-x-1.5 text-xs bg-indigo-600/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-600/30">
                      <TrendingUp className="w-3 h-3" /> {treinoGerado.faseLabel}
                    </span>
                    <span className="flex items-center gap-x-1.5 text-xs bg-black/30 text-gray-400 px-3 py-1 rounded-full border border-gray-700">
                      <RotateCcw className="w-3 h-3" /> {treinoGerado.diaLabel}
                    </span>
                    <span className="text-xs bg-violet-600/20 text-violet-300 px-3 py-1 rounded-full border border-violet-600/30">
                      {OBJETIVO_LABEL[treinoGerado.objetivoKey] || treinoGerado.objetivoKey}
                    </span>
                  </div>

                  <p className="text-gray-500 text-xs">Objetivo: {treinoGerado.objetivo}</p>

                  <div className="bg-black/30 rounded-lg px-4 py-3">
                    <p className="text-gray-400 text-xs mb-2 font-medium uppercase tracking-wider">Exercícios do treino de hoje</p>
                    <div className="flex flex-wrap gap-1.5">
                      {treinoGerado.exercises.map((ex, i) => (
                        <span key={i} className="text-xs bg-indigo-600/20 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-600/20">
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-gray-500 text-xs">
                    Próximo treino: <span className="text-gray-400">{treinoGerado.proximoDiaLabel}</span>
                  </p>

                  {treinoGerado.proximaFaseLabel
                    ? <p className="text-gray-500 text-xs">
                        Faltam <span className="text-indigo-400 font-semibold">{treinoGerado.faltamParaProx} treino{treinoGerado.faltamParaProx !== 1 ? 's' : ''}</span> para a fase{' '}
                        <span className="text-indigo-400 font-semibold">{treinoGerado.proximaFaseLabel}</span>
                      </p>
                    : <p className="text-indigo-400 text-xs font-semibold">🏆 Você está na fase máxima — Avançado!</p>
                  }

                  <div className="border-t border-white/10 pt-3">
                    <div className="flex items-start gap-x-2 text-gray-400 text-sm mb-3">
                      <AlertCircle className="w-4 h-4 mt-0.5 text-indigo-400 shrink-0" />
                      <span>Treino personalizado para seu objetivo e perfil. Edite à vontade antes de salvar!</span>
                    </div>
                    <button
                      onClick={irParaRotina}
                      disabled={loadingTreino || !treinoGerado}
                      className="w-full flex items-center justify-center gap-x-2 bg-[#5B4FFF] hover:bg-[#7B6FFF] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm"
                    >
                      {loadingTreino
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Preparando...</>
                        : <>Abrir minha rotina personalizada <ArrowRight className="w-4 h-4" /></>
                      }
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
      </div>
    </>
  );
};

export default IMC;