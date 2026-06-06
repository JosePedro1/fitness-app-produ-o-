import React, { useState, useEffect } from 'react';
import { Plus, ChevronRight, Dumbbell, Zap, Info } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { getRoutines } from '../../services/api-routines';
import api from '../../services/api';

// ── Base CDN muscle.wiki ────────────────────────────────────────────────────
const MW = 'https://media.musclewiki.com/media/uploads/videos/branded';

// ── Catálogo rico (gif + metadados) ─────────────────────────────────────────
const CATALOG = {
  Peito: [
    { name: 'Supino Reto',         gifUrl: `${MW}/male-chest-Bench-Press-front.gif`,          muscles: 'Peitoral maior, Tríceps, Deltóide anterior', equipment: 'Barra',          difficulty: 'Intermediário', tip: 'Escápulas retraídas, lombar levemente arqueada.' },
    { name: 'Supino Inclinado',    gifUrl: `${MW}/male-chest-Incline-Bench-Press-front.gif`,   muscles: 'Peitoral superior, Tríceps',                  equipment: 'Barra',          difficulty: 'Intermediário', tip: 'Banco a 30–45°. Foco no feixe clavicular.' },
    { name: 'Supino Declinado',    gifUrl: `${MW}/male-chest-Decline-Bench-Press-front.gif`,   muscles: 'Peitoral inferior, Tríceps',                  equipment: 'Barra',          difficulty: 'Intermediário', tip: 'Ideal para definir a porção inferior do peitoral.' },
    { name: 'Crucifixo',          gifUrl: `${MW}/male-chest-Dumbbell-Fly-front.gif`,           muscles: 'Peitoral maior (estiramento)',                equipment: 'Halteres',       difficulty: 'Iniciante',     tip: 'Cotovelos levemente flexionados durante todo o movimento.' },
    { name: 'Crossover no Cabo',   gifUrl: `${MW}/male-chest-Cable-Crossover-front.gif`,       muscles: 'Peitoral maior, Serrátil',                    equipment: 'Cabo',           difficulty: 'Iniciante',     tip: 'Cruze as mãos no final para contração máxima.' },
    { name: 'Flexão de Braços',    gifUrl: `${MW}/male-chest-Push-Up-front.gif`,               muscles: 'Peitoral, Tríceps, Core',                     equipment: 'Peso corporal',  difficulty: 'Iniciante',     tip: 'Corpo reto da cabeça aos calcanhares. Core sempre contraído.' },
  ],
  Costas: [
    { name: 'Barra Fixa',          gifUrl: `${MW}/male-back-Pull-Up-front.gif`,                muscles: 'Latíssimo, Bíceps, Romboides',                equipment: 'Barra fixa',     difficulty: 'Avançado',      tip: 'Puxe até o queixo ultrapassar a barra. Controle a descida.' },
    { name: 'Remada Curvada',      gifUrl: `${MW}/male-back-Bent-Over-Row-front.gif`,          muscles: 'Latíssimo, Trapézio médio, Romboides',        equipment: 'Barra',          difficulty: 'Intermediário', tip: 'Tronco a ~45°. Puxe a barra ao umbigo, não ao peito.' },
    { name: 'Remada Unilateral',   gifUrl: `${MW}/male-back-Dumbbell-Row-front.gif`,           muscles: 'Latíssimo, Romboides, Bíceps',                equipment: 'Haltere',        difficulty: 'Iniciante',     tip: 'Apoie o joelho no banco. Cotovelo alto na subida.' },
    { name: 'Puxada Frontal',      gifUrl: `${MW}/male-back-Lat-Pulldown-front.gif`,           muscles: 'Latíssimo, Bíceps, Teres maior',              equipment: 'Pulley',         difficulty: 'Iniciante',     tip: 'Puxe à frente do rosto. Ligeira inclinação do tronco.' },
    { name: 'Remada Cavalinho',    gifUrl: `${MW}/male-back-T-Bar-Row-front.gif`,              muscles: 'Latíssimo, Trapézio, Lombares',               equipment: 'Barra T',        difficulty: 'Intermediário', tip: 'Ótima para espessura de costas. Mantenha lombar neutra.' },
    { name: 'Levantamento Terra',  gifUrl: `${MW}/male-back-Deadlift-front.gif`,               muscles: 'Lombares, Glúteos, Isquiotibiais, Trapézio',  equipment: 'Barra',          difficulty: 'Avançado',      tip: 'Barra rente à perna, quadril para trás na descida.' },
  ],
  Quadríceps: [
    { name: 'Agachamento Livre',   gifUrl: `${MW}/male-quads-Squat-front.gif`,                 muscles: 'Quadríceps, Glúteos, Isquiotibiais',          equipment: 'Barra',          difficulty: 'Intermediário', tip: 'Joelhos na linha dos pés. Desça até a coxa ficar paralela ao chão.' },
    { name: 'Leg Press',           gifUrl: `${MW}/male-quads-Leg-Press-front.gif`,             muscles: 'Quadríceps, Glúteos',                         equipment: 'Máquina',        difficulty: 'Iniciante',     tip: 'Pés no centro da plataforma. Não trave os joelhos no topo.' },
    { name: 'Cadeira Extensora',   gifUrl: `${MW}/male-quads-Leg-Extension-front.gif`,         muscles: 'Quadríceps (isolamento)',                     equipment: 'Máquina',        difficulty: 'Iniciante',     tip: 'Contração total no topo. Ideal como finalizador de treino.' },
    { name: 'Avanço',              gifUrl: `${MW}/male-quads-Lunge-front.gif`,                 muscles: 'Quadríceps, Glúteos, Isquiotibiais',          equipment: 'Halteres/Barra', difficulty: 'Intermediário', tip: 'Joelho da frente não deve ultrapassar a ponta do pé.' },
    { name: 'Agachamento Hack',    gifUrl: `${MW}/male-quads-Hack-Squat-front.gif`,            muscles: 'Quadríceps, Glúteos',                         equipment: 'Máquina',        difficulty: 'Intermediário', tip: 'Pés afastados na largura dos ombros. Enfatiza vasto medial.' },
    { name: 'Agachamento Búlgaro', gifUrl: `${MW}/male-quads-Bulgarian-Split-Squat-front.gif`, muscles: 'Quadríceps, Glúteos (unilateral)',             equipment: 'Halteres',       difficulty: 'Avançado',      tip: 'Pé traseiro elevado. Excelente para desequilíbrios musculares.' },
  ],
  Posterior: [
    { name: 'Mesa Flexora',              gifUrl: `${MW}/male-hamstrings-Lying-Leg-Curl-front.gif`,    muscles: 'Isquiotibiais (isolamento)',                  equipment: 'Máquina',   difficulty: 'Iniciante',     tip: 'Quadril pressionado no banco. Sem balanço no movimento.' },
    { name: 'Stiff',                     gifUrl: `${MW}/male-hamstrings-Romanian-Deadlift-front.gif`, muscles: 'Isquiotibiais, Glúteos, Lombares',            equipment: 'Barra',     difficulty: 'Intermediário', tip: 'Sinta o estiramento nos isquiotibiais. Joelhos levemente flexionados.' },
    { name: 'Leg Curl em Pé',            gifUrl: `${MW}/male-hamstrings-Standing-Leg-Curl-front.gif`, muscles: 'Isquiotibiais (unilateral)',                  equipment: 'Máquina',   difficulty: 'Iniciante',     tip: 'Ótimo para trabalhar cada perna individualmente.' },
    { name: 'Good Morning',              gifUrl: `${MW}/male-hamstrings-Good-Morning-front.gif`,      muscles: 'Isquiotibiais, Lombares, Glúteos',            equipment: 'Barra',     difficulty: 'Intermediário', tip: 'Incline o tronco até ficar paralelo ao chão. Costas neutras.' },
    { name: 'Levantamento Terra Romeno', gifUrl: `${MW}/male-hamstrings-Stiff-Leg-Deadlift-front.gif`,muscles: 'Isquiotibiais, Glúteos, Lombares',            equipment: 'Barra',     difficulty: 'Intermediário', tip: 'Descida controlada com estiramento completo dos isquiotibiais.' },
    { name: 'Ponte de Glúteo',           gifUrl: `${MW}/male-hamstrings-Glute-Bridge-front.gif`,      muscles: 'Isquiotibiais, Glúteos',                      equipment: 'Peso corporal', difficulty: 'Iniciante',  tip: 'Aperte os glúteos no topo. Ótimo para ativar a cadeia posterior.' },
  ],
  Panturrilha: [
    { name: 'Panturrilha em Pé',      gifUrl: `${MW}/male-calves-Standing-Calf-Raise-front.gif`,  muscles: 'Gastrocnêmio, Sóleo',          equipment: 'Barra/Máquina',    difficulty: 'Iniciante', tip: 'Desça o calcanhar abaixo da plataforma para amplitude total.' },
    { name: 'Panturrilha Sentado',    gifUrl: `${MW}/male-calves-Seated-Calf-Raise-front.gif`,    muscles: 'Sóleo (joelho dobrado)',       equipment: 'Máquina',          difficulty: 'Iniciante', tip: 'Joelho a 90° enfatiza o sóleo, músculo mais profundo.' },
    { name: 'Panturrilha no Leg Press', gifUrl: `${MW}/male-calves-Calf-Press-front.gif`,         muscles: 'Gastrocnêmio, Sóleo',          equipment: 'Leg Press',        difficulty: 'Iniciante', tip: 'Use apenas os dedos dos pés na plataforma. Movimento completo.' },
    { name: 'Panturrilha Unilateral', gifUrl: `${MW}/male-calves-Single-Leg-Calf-Raise-front.gif`, muscles: 'Gastrocnêmio (unilateral)',   equipment: 'Peso corporal',    difficulty: 'Iniciante', tip: 'Excelente para corrigir assimetrias entre as pernas.' },
  ],
  Ombros: [
    { name: 'Desenvolvimento com Barra', gifUrl: `${MW}/male-shoulders-Overhead-Press-front.gif`,          muscles: 'Deltóide anterior, Tríceps, Trapézio', equipment: 'Barra',     difficulty: 'Intermediário', tip: 'Barra parte da frente do pescoço. Core contraído durante todo o movimento.' },
    { name: 'Desenvolvimento Halteres',  gifUrl: `${MW}/male-shoulders-Dumbbell-Shoulder-Press-front.gif`, muscles: 'Deltóide anterior e médio, Tríceps',   equipment: 'Halteres',  difficulty: 'Iniciante',     tip: 'Maior amplitude que a barra. Pulsos neutros.' },
    { name: 'Elevação Lateral',          gifUrl: `${MW}/male-shoulders-Lateral-Raise-front.gif`,           muscles: 'Deltóide médio (isolamento)',           equipment: 'Halteres',  difficulty: 'Iniciante',     tip: 'Cotovelos levemente flexionados. Polegar ligeiramente abaixado.' },
    { name: 'Elevação Frontal',          gifUrl: `${MW}/male-shoulders-Front-Raise-front.gif`,             muscles: 'Deltóide anterior',                    equipment: 'Halteres',  difficulty: 'Iniciante',     tip: 'Suba até a altura dos olhos. Não use impulso do tronco.' },
    { name: 'Remada Alta',               gifUrl: `${MW}/male-shoulders-Upright-Row-front.gif`,             muscles: 'Deltóide médio, Trapézio superior',    equipment: 'Barra',     difficulty: 'Intermediário', tip: 'Cotovelos sempre acima dos punhos. Cuidado com a amplitude.' },
    { name: 'Face Pull',                 gifUrl: `${MW}/male-shoulders-Face-Pull-front.gif`,               muscles: 'Deltóide posterior, Trapézio médio',   equipment: 'Cabo',      difficulty: 'Iniciante',     tip: 'Puxe em direção à testa, cotovelos para fora. Essencial para saúde do ombro.' },
  ],
  Bíceps: [
    { name: 'Rosca Direta',       gifUrl: `${MW}/male-biceps-Barbell-Curl-front.gif`,         muscles: 'Bíceps braquial, Braquial',   equipment: 'Barra',    difficulty: 'Iniciante',     tip: 'Cotovelos fixos ao lado do corpo. Sem balanço de tronco.' },
    { name: 'Rosca Alternada',    gifUrl: `${MW}/male-biceps-Dumbbell-Curl-front.gif`,        muscles: 'Bíceps braquial, Braquial',   equipment: 'Halteres', difficulty: 'Iniciante',     tip: 'Gire o punho na subida (supinação). Aumenta o pico de contração.' },
    { name: 'Rosca Martelo',      gifUrl: `${MW}/male-biceps-Hammer-Curl-front.gif`,          muscles: 'Braquiorradial, Bíceps',      equipment: 'Halteres', difficulty: 'Iniciante',     tip: 'Punho neutro (polegar para cima). Trabalha mais o braquiorradial.' },
    { name: 'Rosca Concentrada',  gifUrl: `${MW}/male-biceps-Concentration-Curl-front.gif`,   muscles: 'Bíceps (isolamento)',         equipment: 'Haltere',  difficulty: 'Iniciante',     tip: 'Cotovelo apoiado na coxa. Máximo isolamento do bíceps.' },
    { name: 'Rosca Scott',        gifUrl: `${MW}/male-biceps-Preacher-Curl-front.gif`,        muscles: 'Bíceps (porção longa)',       equipment: 'Barra/Máquina', difficulty: 'Intermediário', tip: 'Braço totalmente apoiado. Evita trapaça e maximiza isolamento.' },
    { name: 'Rosca no Cabo',      gifUrl: `${MW}/male-biceps-Cable-Curl-front.gif`,           muscles: 'Bíceps (tensão constante)',   equipment: 'Cabo',     difficulty: 'Iniciante',     tip: 'Tensão constante em todo o arco do movimento.' },
  ],
  Tríceps: [
    { name: 'Tríceps Testa',                  gifUrl: `${MW}/male-triceps-Skull-Crusher-front.gif`,               muscles: 'Tríceps (porção longa e medial)',   equipment: 'Barra/Halteres', difficulty: 'Intermediário', tip: 'Cotovelos apontados para cima. Baixe a barra à testa.' },
    { name: 'Tríceps Corda',                  gifUrl: `${MW}/male-triceps-Tricep-Pushdown-front.gif`,             muscles: 'Tríceps (porção lateral)',         equipment: 'Cabo + corda',   difficulty: 'Iniciante',     tip: 'Separe a corda no final para maior ativação da cabeça lateral.' },
    { name: 'Tríceps Francês',                gifUrl: `${MW}/male-triceps-French-Press-front.gif`,                muscles: 'Tríceps (porção longa)',           equipment: 'Haltere',        difficulty: 'Intermediário', tip: 'Braços verticais. Foco total na cabeça longa do tríceps.' },
    { name: 'Mergulho no Banco',              gifUrl: `${MW}/male-triceps-Bench-Dip-front.gif`,                   muscles: 'Tríceps, Peitoral inferior',       equipment: 'Banco',          difficulty: 'Iniciante',     tip: 'Quadris próximos ao banco. Desça até o cotovelo a 90°.' },
    { name: 'Tríceps Coice',                  gifUrl: `${MW}/male-triceps-Tricep-Kickback-front.gif`,             muscles: 'Tríceps (porção lateral)',         equipment: 'Haltere',        difficulty: 'Iniciante',     tip: 'Cotovelo fixo ao lado do tronco. Extensão completa no final.' },
    { name: 'Extensão de Tríceps no Cabo',    gifUrl: `${MW}/male-triceps-Overhead-Tricep-Extension-front.gif`,  muscles: 'Tríceps (porção longa)',           equipment: 'Cabo',           difficulty: 'Iniciante',     tip: 'Cotovelos próximos à cabeça. Alongamento máximo da porção longa.' },
  ],
  Abdômen: [
    { name: 'Abdominal Crunch',  gifUrl: `${MW}/male-abs-Crunch-front.gif`,               muscles: 'Reto abdominal',                equipment: 'Peso corporal', difficulty: 'Iniciante',     tip: 'Enrole o tronco. Não puxe o pescoço com as mãos.' },
    { name: 'Prancha',           gifUrl: `${MW}/male-abs-Plank-front.gif`,                muscles: 'Core completo, Estabilizadores', equipment: 'Peso corporal', difficulty: 'Iniciante',     tip: 'Quadril neutro — não suba nem deixe cair. Respire normalmente.' },
    { name: 'Elevação de Pernas',gifUrl: `${MW}/male-abs-Leg-Raise-front.gif`,            muscles: 'Reto inferior, Flexores do quadril', equipment: 'Barra fixa', difficulty: 'Intermediário', tip: 'Suba as pernas à 90°. Controle a descida sem balanço.' },
    { name: 'Russian Twist',     gifUrl: `${MW}/male-abs-Russian-Twist-front.gif`,        muscles: 'Oblíquos, Reto abdominal',       equipment: 'Peso corporal', difficulty: 'Iniciante',     tip: 'Gire o tronco, não só os braços. Pés podem ser elevados.' },
    { name: 'Abdominal no Cabo', gifUrl: `${MW}/male-abs-Cable-Crunch-front.gif`,         muscles: 'Reto abdominal (carga alta)',    equipment: 'Cabo',          difficulty: 'Intermediário', tip: 'Quadril fixo. O movimento é só do tronco. Carga progressiva.' },
    { name: 'Mountain Climber',  gifUrl: `${MW}/male-abs-Mountain-Climbers-front.gif`,    muscles: 'Core, Quadríceps, Ombros',       equipment: 'Peso corporal', difficulty: 'Intermediário', tip: 'Cadência rápida para cardio, lenta para força de core.' },
  ],
  Glúteos: [
    { name: 'Hip Thrust',         gifUrl: `${MW}/male-glutes-Hip-Thrust-front.gif`,           muscles: 'Glúteo máximo (isolamento)',        equipment: 'Barra',          difficulty: 'Intermediário', tip: 'Aperte os glúteos no topo. Quadril paralelo ao chão.' },
    { name: 'Agachamento Sumô',   gifUrl: `${MW}/male-glutes-Sumo-Squat-front.gif`,           muscles: 'Glúteos, Adutores, Quadríceps',     equipment: 'Haltere/Barra',  difficulty: 'Iniciante',     tip: 'Pés bem abertos e virados para fora. Joelhos seguem a direção dos pés.' },
    { name: 'Stiff para Glúteos', gifUrl: `${MW}/male-glutes-Romanian-Deadlift-front.gif`,    muscles: 'Glúteos, Isquiotibiais',            equipment: 'Barra',          difficulty: 'Intermediário', tip: 'Empurre o quadril para trás na descida. Sinta o glúteo alongar.' },
    { name: 'Abdução no Cabo',    gifUrl: `${MW}/male-glutes-Cable-Hip-Abduction-front.gif`,  muscles: 'Glúteo médio e mínimo',             equipment: 'Cabo',           difficulty: 'Iniciante',     tip: 'Eleve a perna lateralmente. Corpo estável durante o movimento.' },
    { name: 'Glúteo no Cabo',     gifUrl: `${MW}/male-glutes-Cable-Kickback-front.gif`,       muscles: 'Glúteo máximo (unilateral)',        equipment: 'Cabo',           difficulty: 'Iniciante',     tip: 'Tronco levemente inclinado. Extensão completa do quadril.' },
    { name: 'Avanço Reverso',     gifUrl: `${MW}/male-glutes-Reverse-Lunge-front.gif`,        muscles: 'Glúteos, Quadríceps (menos carga no joelho)', equipment: 'Halteres', difficulty: 'Intermediário', tip: 'Passo para trás. Menos estresse no joelho que o avanço frontal.' },
  ],
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const difficultyColor = {
  'Iniciante':     'text-emerald-400',
  'Intermediário': 'text-yellow-400',
  'Avançado':      'text-red-400',
};

const findExerciseInCatalog = (name) => {
  if (!name) return null;
  const lower = name.toLowerCase();
  for (const [group, exercises] of Object.entries(CATALOG)) {
    const found = exercises.find(
      e => e.name.toLowerCase() === lower ||
           e.name.toLowerCase().includes(lower) ||
           lower.includes(e.name.toLowerCase())
    );
    if (found) return { group, exercise: found };
  }
  return null;
};

// ── Componente GIF ───────────────────────────────────────────────────────────
const ExerciseGif = ({ exerciseData }) => {
  const [status, setStatus] = useState('loading'); // 'loading' | 'ok' | 'error'

  useEffect(() => {
    setStatus('loading');
  }, [exerciseData.gifUrl]);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-gray-400 text-sm">Demonstração — <span className="text-white font-medium">{exerciseData.name}</span></p>

      {/* GIF */}
      <div className="w-full bg-black/40 rounded-xl overflow-hidden border border-white/5 min-h-[180px] flex items-center justify-center relative">
        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-7 h-7 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        )}
        {status !== 'error' && (
          <img
            src={exerciseData.gifUrl}
            alt={`Demonstração de ${exerciseData.name}`}
            className={`w-full object-contain transition-opacity duration-300 ${status === 'ok' ? 'opacity-100' : 'opacity-0'}`}
            onLoad={()  => setStatus('ok')}
            onError={() => setStatus('error')}
          />
        )}
        {status === 'error' && (
          <div className="p-8 text-center w-full">
            <div className="w-14 h-14 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Dumbbell className="w-7 h-7 text-indigo-400" />
            </div>
            <p className="text-gray-300 font-medium text-sm">{exerciseData.name}</p>
            <p className="text-gray-600 text-xs mt-1">GIF não disponível no momento</p>
          </div>
        )}
      </div>

      {/* Metadados */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-black/25 border border-white/5 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Músculos</p>
          <p className="text-xs text-gray-300 leading-snug">{exerciseData.muscles}</p>
        </div>
        <div className="bg-black/25 border border-white/5 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Equipamento</p>
          <p className="text-xs text-gray-300 leading-snug">{exerciseData.equipment}</p>
        </div>
        <div className="bg-black/25 border border-white/5 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Nível</p>
          <p className={`text-xs font-semibold leading-snug ${difficultyColor[exerciseData.difficulty] ?? 'text-gray-300'}`}>
            {exerciseData.difficulty}
          </p>
        </div>
      </div>

      {/* Dica de execução */}
      <div className="flex items-start gap-2.5 bg-indigo-600/10 border border-indigo-500/20 rounded-lg px-4 py-3">
        <Zap className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
        <p className="text-xs text-indigo-200 leading-relaxed">
          <span className="font-semibold text-indigo-300">Dica: </span>{exerciseData.tip}
        </p>
      </div>
    </div>
  );
};

// ── Página principal ──────────────────────────────────────────────────────────
const ExercisesLibraryPage = () => {
  const [selectedGroup,    setSelectedGroup]    = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null); // nome
  const [selectedData,     setSelectedData]     = useState(null); // objeto completo
  const [routines,         setRoutines]         = useState([]);
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [exerciseToAdd,    setExerciseToAdd]    = useState('');
  const [toast,            setToast]            = useState(null);
  const [deepLinkBanner,   setDeepLinkBanner]   = useState(null);

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const exerciseName = params.get('exercise');
    if (!exerciseName) return;
    const found = findExerciseInCatalog(exerciseName);
    if (found) {
      setSelectedGroup(found.group);
      setDeepLinkBanner(exerciseName);
      handleSelectExercise(found.exercise);
    } else {
      setDeepLinkBanner(exerciseName);
      showToast(`"${exerciseName}" não está no catálogo. Mostrando a biblioteca completa.`, 'info');
    }
  }, [location.search]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSelectExercise = (exercise) => {
    setSelectedExercise(exercise.name);
    setSelectedData(exercise);
  };

  const handleAddToRoutine = async (e, exerciseName) => {
    e.stopPropagation();
    setExerciseToAdd(exerciseName);
    const data = await getRoutines();
    setRoutines(data);
    setShowRoutineModal(true);
  };

  const handleConfirmAdd = async (routineId) => {
    try {
      await api.post('/exercises', { routine_id: routineId, exercise: exerciseToAdd, completed: false });
      showToast(`"${exerciseToAdd}" adicionado à rotina!`);
      setShowRoutineModal(false);
    } catch {
      showToast('Erro ao adicionar exercício.', 'error');
    }
  };

  return (
    <div className="w-full min-h-screen lg:py-16 md:py-14 sm:py-12 py-10 lg:px-24 md:px-16 sm:px-6 px-4">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
          toast.type === 'error' ? 'bg-red-500' : toast.type === 'info' ? 'bg-indigo-500' : 'bg-indigo-600'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="w-full flex flex-col gap-y-6">
        <h1 className="lg:text-2xl md:text-xl text-lg font-semibold text-gray-200 bg-black/20 rounded-md py-2 px-4 w-fit">
          Biblioteca de Exercícios
        </h1>

        {deepLinkBanner && (
          <div className="w-full bg-indigo-600/20 border border-indigo-500/40 rounded-xl px-5 py-3 flex items-center justify-between">
            <p className="text-indigo-300 text-sm">
              Você foi redirecionado para: <span className="font-semibold text-white">{deepLinkBanner}</span>
            </p>
            <button onClick={() => setDeepLinkBanner(null)} className="text-gray-500 hover:text-gray-300 text-xs ml-4">
              Fechar
            </button>
          </div>
        )}

        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Coluna 1 — grupos musculares */}
          <div className="flex flex-col gap-y-2">
            <p className="text-gray-400 text-sm mb-1">Grupo muscular</p>
            {Object.keys(CATALOG).map(group => (
              <button
                key={group}
                onClick={() => {
                  setSelectedGroup(group);
                  setSelectedExercise(null);
                  setSelectedData(null);
                  setDeepLinkBanner(null);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  selectedGroup === group ? 'bg-indigo-600 text-white' : 'bg-black/20 text-gray-300 hover:bg-black/40'
                }`}
              >
                {group}
                <ChevronRight className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* Coluna 2 — exercícios do grupo */}
          <div className="flex flex-col gap-y-2">
            {selectedGroup ? (
              <>
                <p className="text-gray-400 text-sm mb-1">Exercícios — {selectedGroup}</p>
                {CATALOG[selectedGroup].map(exercise => (
                  <div
                    key={exercise.name}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelectExercise(exercise)}
                    onKeyDown={e => e.key === 'Enter' && handleSelectExercise(exercise)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer select-none ${
                      selectedExercise === exercise.name
                        ? 'bg-indigo-600 text-white'
                        : 'bg-black/20 text-gray-300 hover:bg-black/40'
                    }`}
                  >
                    <span>{exercise.name}</span>
                    <div className="flex items-center gap-x-2">
                      <button
                        onClick={(e) => handleAddToRoutine(e, exercise.name)}
                        className="p-1 rounded bg-black/30 hover:bg-indigo-600/50 transition-colors"
                        title="Adicionar à rotina"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className="w-4 h-4 opacity-60" />
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 text-sm text-center">Selecione um grupo muscular</p>
              </div>
            )}
          </div>

          {/* Coluna 3 — GIF + metadados */}
          <div className="flex flex-col gap-y-3">
            {selectedData ? (
              <ExerciseGif exerciseData={selectedData} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full mt-8 gap-3">
                <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center">
                  <Info className="w-6 h-6 text-gray-600" />
                </div>
                <p className="text-gray-500 text-sm text-center">
                  Selecione um exercício<br />para ver a demonstração
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Modal — selecionar rotina */}
      {showRoutineModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="bg-[#1d1d1d] rounded-md p-6 w-full max-w-sm flex flex-col gap-y-4">
            <h3 className="text-gray-200 font-semibold text-lg">Adicionar à qual rotina?</h3>
            <p className="text-gray-400 text-sm">"{exerciseToAdd}"</p>
            {routines.length === 0 ? (
              <p className="text-gray-500 text-sm">Você não tem rotinas. Crie uma primeiro.</p>
            ) : (
              <div className="flex flex-col gap-y-2">
                {routines.map(routine => (
                  <button
                    key={routine.id}
                    onClick={() => handleConfirmAdd(routine.id)}
                    className="w-full px-4 py-2.5 bg-black/30 hover:bg-indigo-600/30 text-gray-200 text-sm rounded-md border border-gray-700 hover:border-indigo-500 text-left transition-all"
                  >
                    {routine.name}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowRoutineModal(false)}
              className="text-gray-500 hover:text-gray-300 text-sm text-center"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExercisesLibraryPage;