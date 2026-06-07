
import React, { useState, useEffect } from 'react';
import { Plus, ChevronRight, Dumbbell, Zap } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { getRoutines } from '../../services/api-routines';
import api from '../../services/api';

// ── Imagens: free-exercise-db (GitHub, sem API key, 100% gratuito) ────────────
// Cada exercício tem 2 fotos: posição inicial (0) e posição final (1).
// O componente ExerciseImages alterna entre elas criando efeito de animação.
const BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';
const img = (id) => [`${BASE}/${id}/0.jpg`, `${BASE}/${id}/1.jpg`];

// ── Catálogo rico ─────────────────────────────────────────────────────────────
const CATALOG = {
  Peito: [
    { name: 'Supino Reto',        imgs: img('Barbell_Bench_Press_-_Medium_Grip'),         muscles: 'Peitoral maior, Tríceps, Deltóide anterior',     equipment: 'Barra',          difficulty: 'Intermediário', tip: 'Escápulas retraídas, lombar levemente arqueada. Cotovelos a 75°.' },
    { name: 'Supino Inclinado',   imgs: img('Barbell_Incline_Bench_Press_-_Medium_Grip'), muscles: 'Peitoral superior, Tríceps',                     equipment: 'Barra',          difficulty: 'Intermediário', tip: 'Banco a 30–45°. Foco no feixe clavicular do peitoral.' },
    { name: 'Supino Declinado',   imgs: img('Decline_Barbell_Bench_Press'),               muscles: 'Peitoral inferior, Tríceps',                     equipment: 'Barra',          difficulty: 'Intermediário', tip: 'Define a porção inferior do peitoral. Cuidado com o pescoço.' },
    { name: 'Crucifixo',         imgs: img('Decline_Dumbbell_Flyes'),                    muscles: 'Peitoral maior (estiramento)',                   equipment: 'Halteres',       difficulty: 'Iniciante',     tip: 'Cotovelos levemente flexionados durante todo o arco.' },
    { name: 'Crossover no Cabo',  imgs: img('Cable_Crossover'),                           muscles: 'Peitoral maior, Serrátil anterior',              equipment: 'Cabo',           difficulty: 'Iniciante',     tip: 'Cruze as mãos ao final para contração máxima.' },
    { name: 'Flexão de Braços',   imgs: img('Clock_Push-Up'),                             muscles: 'Peitoral, Tríceps, Core',                        equipment: 'Peso corporal',  difficulty: 'Iniciante',     tip: 'Corpo reto da cabeça ao calcanhar. Core sempre contraído.' },
  ],
  Costas: [
    { name: 'Barra Fixa',         imgs: img('Band_Assisted_Pull-Up'),                     muscles: 'Latíssimo, Bíceps, Romboides',                  equipment: 'Barra fixa',     difficulty: 'Avançado',      tip: 'Puxe até o queixo ultrapassar a barra. Controle a descida.' },
    { name: 'Remada Curvada',     imgs: img('Bent_Over_Barbell_Row'),                     muscles: 'Latíssimo, Trapézio médio, Romboides',          equipment: 'Barra',          difficulty: 'Intermediário', tip: 'Tronco a ~45°. Puxe a barra ao umbigo, não ao peito.' },
    { name: 'Remada Unilateral',  imgs: img('One-Arm_Dumbbell_Row'),                      muscles: 'Latíssimo, Romboides, Bíceps',                  equipment: 'Haltere',        difficulty: 'Iniciante',     tip: 'Apoie o joelho e mão no banco. Cotovelo alto na subida.' },
    { name: 'Puxada Frontal',     imgs: img('Wide-Grip_Lat_Pulldown'),                    muscles: 'Latíssimo, Bíceps, Teres maior',                equipment: 'Pulley',         difficulty: 'Iniciante',     tip: 'Puxe à frente do rosto. Ligeira inclinação do tronco para trás.' },
    { name: 'Remada Cavalinho',   imgs: img('T-Bar_Row_with_Handle'),                     muscles: 'Latíssimo, Trapézio, Lombares',                 equipment: 'Barra T',        difficulty: 'Intermediário', tip: 'Excelente para espessura de costas. Mantenha lombar neutra.' },
    { name: 'Levantamento Terra', imgs: img('Barbell_Deadlift'),                          muscles: 'Lombares, Glúteos, Isquiotibiais, Trapézio',    equipment: 'Barra',          difficulty: 'Avançado',      tip: 'Barra rente à perna, quadril empurra para trás na descida.' },
  ],
  Quadríceps: [
    { name: 'Agachamento Livre',   imgs: img('Barbell_Full_Squat'),                        muscles: 'Quadríceps, Glúteos, Isquiotibiais',            equipment: 'Barra',          difficulty: 'Intermediário', tip: 'Joelhos na linha dos pés. Desça até a coxa ficar paralela ao chão.' },
    { name: 'Leg Press',           imgs: img('Leg_Press'),                                 muscles: 'Quadríceps, Glúteos',                           equipment: 'Máquina',        difficulty: 'Iniciante',     tip: 'Pés no centro da plataforma. Não trave os joelhos no topo.' },
    { name: 'Cadeira Extensora',   imgs: img('Leg_Extensions'),                            muscles: 'Quadríceps (isolamento)',                       equipment: 'Máquina',        difficulty: 'Iniciante',     tip: 'Contração total no topo. Ideal como finalizador de treino.' },
    { name: 'Avanço',              imgs: img('Barbell_Lunge'),                             muscles: 'Quadríceps, Glúteos, Isquiotibiais',            equipment: 'Halteres/Barra', difficulty: 'Intermediário', tip: 'Joelho da frente não deve ultrapassar a ponta do pé.' },
    { name: 'Agachamento Hack',    imgs: img('Smith_Machine_Squat'),                        muscles: 'Quadríceps, Glúteos',                           equipment: 'Máquina',        difficulty: 'Intermediário', tip: 'Enfatiza o vasto medial (teardrop). Pés afastados na largura dos ombros.' },
    { name: 'Agachamento Búlgaro', imgs: img('Split_Squat_with_Dumbbells'),                muscles: 'Quadríceps, Glúteos (unilateral)',              equipment: 'Halteres',       difficulty: 'Avançado',      tip: 'Pé traseiro elevado. Excelente para corrigir desequilíbrios.' },
  ],
  Posterior: [
    { name: 'Mesa Flexora',              imgs: img('Lying_Leg_Curls'),              muscles: 'Isquiotibiais (isolamento)',               equipment: 'Máquina',        difficulty: 'Iniciante',     tip: 'Quadril pressionado no banco. Sem balanço no movimento.' },
    { name: 'Stiff',                     imgs: img('Romanian_Deadlift'),            muscles: 'Isquiotibiais, Glúteos, Lombares',        equipment: 'Barra',          difficulty: 'Intermediário', tip: 'Sinta o estiramento nos isquiotibiais. Joelhos levemente flexionados.' },
    { name: 'Leg Curl em Pé',            imgs: img('Standing_Leg_Curl'),            muscles: 'Isquiotibiais (unilateral)',              equipment: 'Máquina',        difficulty: 'Iniciante',     tip: 'Ideal para trabalhar cada perna individualmente.' },
    { name: 'Good Morning',              imgs: img('Good_Morning'),                 muscles: 'Isquiotibiais, Lombares, Glúteos',        equipment: 'Barra',          difficulty: 'Intermediário', tip: 'Incline o tronco até ficar paralelo ao chão. Costas neutras.' },
    { name: 'Levantamento Terra Romeno', imgs: img('Romanian_Deadlift'),            muscles: 'Isquiotibiais, Glúteos, Lombares',        equipment: 'Barra',          difficulty: 'Intermediário', tip: 'Descida controlada com estiramento total dos isquiotibiais.' },
    { name: 'Ponte de Glúteo',           imgs: img('Barbell_Glute_Bridge'),         muscles: 'Isquiotibiais, Glúteos',                  equipment: 'Peso corporal',  difficulty: 'Iniciante',     tip: 'Aperte os glúteos no topo. Ótimo para ativar a cadeia posterior.' },
  ],
  Panturrilha: [
    { name: 'Panturrilha em Pé',       imgs: img('Standing_Calf_Raises'),                    muscles: 'Gastrocnêmio, Sóleo',         equipment: 'Barra/Máquina',  difficulty: 'Iniciante', tip: 'Desça o calcanhar abaixo da plataforma para amplitude total.' },
    { name: 'Panturrilha Sentado',     imgs: img('Seated_Calf_Raise'),                       muscles: 'Sóleo (joelho dobrado)',      equipment: 'Máquina',        difficulty: 'Iniciante', tip: 'Joelho a 90° enfatiza o sóleo, músculo mais profundo da panturrilha.' },
    { name: 'Panturrilha no Leg Press',imgs: img('Calf_Press_On_The_Leg_Press_Machine'),     muscles: 'Gastrocnêmio, Sóleo',         equipment: 'Leg Press',      difficulty: 'Iniciante', tip: 'Apenas os dedos dos pés na plataforma. Movimento completo.' },
    { name: 'Panturrilha Unilateral',  imgs: img('Donkey_Calf_Raises'),                      muscles: 'Gastrocnêmio (unilateral)',   equipment: 'Peso corporal',  difficulty: 'Iniciante', tip: 'Excelente para corrigir assimetrias entre as pernas.' },
  ],
  Ombros: [
    { name: 'Desenvolvimento com Barra', imgs: img('Barbell_Shoulder_Press'),          muscles: 'Deltóide anterior, Tríceps, Trapézio',   equipment: 'Barra',     difficulty: 'Intermediário', tip: 'Barra parte da frente do pescoço. Core contraído no movimento.' },
    { name: 'Desenvolvimento Halteres',  imgs: img('Dumbbell_Shoulder_Press'),         muscles: 'Deltóide anterior e médio, Tríceps',     equipment: 'Halteres',  difficulty: 'Iniciante',     tip: 'Maior amplitude que a barra. Pulsos neutros durante todo o movimento.' },
    { name: 'Elevação Lateral',          imgs: img('Cable_Seated_Lateral_Raise'),      muscles: 'Deltóide médio (isolamento)',             equipment: 'Halteres',  difficulty: 'Iniciante',     tip: 'Cotovelos levemente flexionados. Polegar ligeiramente abaixado.' },
    { name: 'Elevação Frontal',          imgs: img('Front_Raise_And_Pullover'),        muscles: 'Deltóide anterior',                      equipment: 'Halteres',  difficulty: 'Iniciante',     tip: 'Suba até a altura dos olhos. Não use impulso do tronco.' },
    { name: 'Remada Alta',               imgs: img('Dumbbell_One-Arm_Upright_Row'),    muscles: 'Deltóide médio, Trapézio superior',      equipment: 'Barra',     difficulty: 'Intermediário', tip: 'Cotovelos sempre acima dos punhos. Cuidado com a amplitude.' },
    { name: 'Face Pull',                 imgs: img('Face_Pull'),                       muscles: 'Deltóide posterior, Trapézio médio',     equipment: 'Cabo',      difficulty: 'Iniciante',     tip: 'Puxe em direção à testa, cotovelos para fora. Essencial para saúde do ombro.' },
  ],
  Bíceps: [
    { name: 'Rosca Direta',       imgs: img('Barbell_Curl'),                       muscles: 'Bíceps braquial, Braquial',    equipment: 'Barra',    difficulty: 'Iniciante',     tip: 'Cotovelos fixos ao lado do corpo. Sem balanço de tronco.' },
    { name: 'Rosca Alternada',    imgs: img('Dumbbell_Alternate_Bicep_Curl'),      muscles: 'Bíceps braquial, Braquial',    equipment: 'Halteres', difficulty: 'Iniciante',     tip: 'Gire o punho na subida (supinação). Aumenta o pico de contração.' },
    { name: 'Rosca Martelo',      imgs: img('Alternate_Hammer_Curl'),              muscles: 'Braquiorradial, Bíceps',       equipment: 'Halteres', difficulty: 'Iniciante',     tip: 'Punho neutro (polegar para cima). Trabalha mais o braquiorradial.' },
    { name: 'Rosca Concentrada',  imgs: img('Concentration_Curls'),                muscles: 'Bíceps (isolamento)',          equipment: 'Haltere',  difficulty: 'Iniciante',     tip: 'Cotovelo apoiado na coxa. Máximo isolamento do bíceps.' },
    { name: 'Rosca Scott',        imgs: img('Preacher_Curl'),                      muscles: 'Bíceps (porção longa)',        equipment: 'Barra/Máquina', difficulty: 'Intermediário', tip: 'Braço totalmente apoiado. Evita trapaça e maximiza isolamento.' },
    { name: 'Rosca no Cabo',      imgs: img('High_Cable_Curls'),                   muscles: 'Bíceps (tensão constante)',    equipment: 'Cabo',     difficulty: 'Iniciante',     tip: 'Tensão constante em todo o arco do movimento.' },
  ],
  Tríceps: [
    { name: 'Tríceps Testa',                 imgs: img('Band_Skull_Crusher'),                      muscles: 'Tríceps (porção longa e medial)',   equipment: 'Barra/Halteres', difficulty: 'Intermediário', tip: 'Cotovelos apontados para cima. Baixe a barra à testa com controle.' },
    { name: 'Tríceps Corda',                 imgs: img('Cable_Rope_Overhead_Triceps_Extension'),   muscles: 'Tríceps (porção lateral)',         equipment: 'Cabo + corda',   difficulty: 'Iniciante',     tip: 'Separe a corda no final para maior ativação da cabeça lateral.' },
    { name: 'Tríceps Francês',               imgs: img('Dumbbell_Tricep_Extension_-Pronated_Grip'),muscles: 'Tríceps (porção longa)',           equipment: 'Haltere',        difficulty: 'Intermediário', tip: 'Braços verticais. Foco total na cabeça longa do tríceps.' },
    { name: 'Mergulho no Banco',             imgs: img('Bench_Dips'),                              muscles: 'Tríceps, Peitoral inferior',       equipment: 'Banco',          difficulty: 'Iniciante',     tip: 'Quadris próximos ao banco. Desça até o cotovelo a 90°.' },
    { name: 'Tríceps Coice',                 imgs: img('Tricep_Dumbbell_Kickback'),                muscles: 'Tríceps (porção lateral)',         equipment: 'Haltere',        difficulty: 'Iniciante',     tip: 'Cotovelo fixo ao lado do tronco. Extensão completa no final.' },
    { name: 'Extensão de Tríceps no Cabo',   imgs: img('Kneeling_Cable_Triceps_Extension'),        muscles: 'Tríceps (porção longa)',           equipment: 'Cabo',           difficulty: 'Iniciante',     tip: 'Cotovelos próximos à cabeça. Alongamento máximo da porção longa.' },
  ],
  Abdômen: [
    { name: 'Abdominal Crunch',  imgs: img('Ab_Crunch_Machine'),      muscles: 'Reto abdominal',                   equipment: 'Máquina/Chão', difficulty: 'Iniciante',     tip: 'Enrole o tronco. Não puxe o pescoço com as mãos.' },
    { name: 'Prancha',           imgs: img('Plank'),                   muscles: 'Core completo, Estabilizadores',  equipment: 'Peso corporal', difficulty: 'Iniciante',     tip: 'Quadril neutro — não suba nem deixe cair. Respire normalmente.' },
    { name: 'Elevação de Pernas',imgs: img('Hanging_Leg_Raise'),       muscles: 'Reto inferior, Flexores do quadril',equipment: 'Barra fixa', difficulty: 'Intermediário', tip: 'Suba as pernas à 90°. Controle a descida sem balanço.' },
    { name: 'Russian Twist',     imgs: img('Russian_Twist'),           muscles: 'Oblíquos, Reto abdominal',        equipment: 'Peso corporal', difficulty: 'Iniciante',     tip: 'Gire o tronco, não só os braços. Pés podem ser elevados.' },
    { name: 'Abdominal no Cabo', imgs: img('Cable_Crunch'),            muscles: 'Reto abdominal (carga alta)',     equipment: 'Cabo',          difficulty: 'Intermediário', tip: 'Quadril fixo. O movimento é só do tronco. Carga progressiva.' },
    { name: 'Mountain Climber',  imgs: img('Mountain_Climbers'),       muscles: 'Core, Quadríceps, Ombros',        equipment: 'Peso corporal', difficulty: 'Intermediário', tip: 'Cadência rápida para cardio, lenta para força de core.' },
  ],
  Glúteos: [
    { name: 'Hip Thrust',         imgs: img('Barbell_Hip_Thrust'),         muscles: 'Glúteo máximo (isolamento)',              equipment: 'Barra',         difficulty: 'Intermediário', tip: 'Aperte os glúteos no topo. Quadril paralelo ao chão.' },
    { name: 'Agachamento Sumô',   imgs: img('Plie_Dumbbell_Squat'),        muscles: 'Glúteos, Adutores, Quadríceps',           equipment: 'Haltere/Barra', difficulty: 'Iniciante',     tip: 'Pés bem abertos e virados para fora. Joelhos seguem a direção dos pés.' },
    { name: 'Stiff para Glúteos', imgs: img('Romanian_Deadlift'),          muscles: 'Glúteos, Isquiotibiais',                  equipment: 'Barra',         difficulty: 'Intermediário', tip: 'Empurre o quadril para trás na descida. Sinta o glúteo alongar.' },
    { name: 'Abdução no Cabo',    imgs: img('Side_Leg_Raises'),            muscles: 'Glúteo médio e mínimo',                   equipment: 'Cabo',          difficulty: 'Iniciante',     tip: 'Eleve a perna lateralmente. Corpo estável durante o movimento.' },
    { name: 'Glúteo no Cabo',     imgs: img('One-Legged_Cable_Kickback'),  muscles: 'Glúteo máximo (unilateral)',              equipment: 'Cabo',          difficulty: 'Iniciante',     tip: 'Tronco levemente inclinado. Extensão completa do quadril.' },
    { name: 'Avanço Reverso',     imgs: img('Crossover_Reverse_Lunge'),   muscles: 'Glúteos, Quadríceps (menos carga no joelho)',equipment: 'Halteres',    difficulty: 'Intermediário', tip: 'Passo para trás. Menos estresse no joelho que o avanço frontal.' },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
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

// ── Animação flip entre posição inicial e final ───────────────────────────────
const ExerciseImages = ({ exerciseData }) => {
  const [frame, setFrame]     = useState(0);   // 0 = posição inicial, 1 = final
  const [loaded, setLoaded]   = useState([false, false]);
  const [errored, setErrored] = useState([false, false]);

  // Reset ao trocar de exercício
  useEffect(() => {
    setFrame(0);
    setLoaded([false, false]);
    setErrored([false, false]);
  }, [exerciseData.name]);

  // Só começa a animar quando pelo menos as 2 imagens carregaram
  useEffect(() => {
    if (!loaded[0] || !loaded[1]) return;
    const id = setInterval(() => setFrame(f => (f === 0 ? 1 : 0)), 1400);
    return () => clearInterval(id);
  }, [loaded]);

  const handleLoad  = (i) => setLoaded(prev => { const a = [...prev]; a[i] = true;  return a; });
  const handleError = (i) => setErrored(prev => { const a = [...prev]; a[i] = true; return a; });

  const bothErrored = errored[0] && errored[1];
  const anyLoaded   = loaded[0] || loaded[1];

  return (
    <div className="flex flex-col gap-3">
      <p className="text-gray-400 text-sm">
        Demonstração — <span className="text-white font-medium">{exerciseData.name}</span>
      </p>

      {/* Viewer */}
      <div className="relative w-full bg-black/40 rounded-xl overflow-hidden border border-white/5"
           style={{ minHeight: 200 }}>

        {/* Spinner enquanto carrega */}
        {!anyLoaded && !bothErrored && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-7 h-7 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        )}

        {/* Fallback quando ambas as imagens falham */}
        {bothErrored && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
            <div className="w-14 h-14 bg-indigo-600/20 rounded-full flex items-center justify-center">
              <Dumbbell className="w-7 h-7 text-indigo-400" />
            </div>
            <p className="text-gray-400 text-sm text-center">{exerciseData.name}</p>
          </div>
        )}

        {/* Imagens: animação flip entre frame 0 e frame 1 */}
        {exerciseData.imgs.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${exerciseData.name} — posição ${i === 0 ? 'inicial' : 'final'}`}
            className="w-full object-contain transition-opacity duration-700"
            style={{
              position: i === 0 ? 'relative' : 'absolute',
              top: 0, left: 0,
              opacity: frame === i && !errored[i] ? 1 : 0,
              display: errored[i] ? 'none' : 'block',
            }}
            onLoad={()  => handleLoad(i)}
            onError={() => handleError(i)}
          />
        ))}

        {/* Indicador de frame */}
        {anyLoaded && !bothErrored && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${frame === 0 ? 'bg-indigo-400' : 'bg-white/20'}`} />
            <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${frame === 1 ? 'bg-indigo-400' : 'bg-white/20'}`} />
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
          <p className={`text-xs font-semibold ${difficultyColor[exerciseData.difficulty] ?? 'text-gray-300'}`}>
            {exerciseData.difficulty}
          </p>
        </div>
      </div>

      {/* Dica */}
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
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [selectedData,     setSelectedData]     = useState(null);
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
      showToast(`"${exerciseName}" não está no catálogo.`, 'info');
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
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
          toast.type === 'error' ? 'bg-red-500' : toast.type === 'info' ? 'bg-indigo-500' : 'bg-indigo-600'
        }`}>{toast.message}</div>
      )}

      <div className="w-full flex flex-col gap-y-6">
        <h1 className="lg:text-2xl md:text-xl text-lg font-semibold text-gray-200 bg-black/20 rounded-md py-2 px-4 w-fit">
          Biblioteca de Exercícios
        </h1>

        {deepLinkBanner && (
          <div className="w-full bg-indigo-600/20 border border-indigo-500/40 rounded-xl px-5 py-3 flex items-center justify-between">
            <p className="text-indigo-300 text-sm">
              Redirecionado para: <span className="font-semibold text-white">{deepLinkBanner}</span>
            </p>
            <button onClick={() => setDeepLinkBanner(null)} className="text-gray-500 hover:text-gray-300 text-xs ml-4">Fechar</button>
          </div>
        )}

        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Coluna 1 — grupos musculares */}
          <div className="flex flex-col gap-y-2">
            <p className="text-gray-400 text-sm mb-1">Grupo muscular</p>
            {Object.keys(CATALOG).map(group => (
              <button
                key={group}
                onClick={() => { setSelectedGroup(group); setSelectedExercise(null); setSelectedData(null); setDeepLinkBanner(null); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  selectedGroup === group ? 'bg-indigo-600 text-white' : 'bg-black/20 text-gray-300 hover:bg-black/40'
                }`}
              >
                {group}<ChevronRight className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* Coluna 2 — exercícios */}
          <div className="flex flex-col gap-y-2">
            {selectedGroup ? (
              <>
                <p className="text-gray-400 text-sm mb-1">Exercícios — {selectedGroup}</p>
                {CATALOG[selectedGroup].map(exercise => (
                  <div
                    key={exercise.name}
                    role="button" tabIndex={0}
                    onClick={() => handleSelectExercise(exercise)}
                    onKeyDown={e => e.key === 'Enter' && handleSelectExercise(exercise)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer select-none ${
                      selectedExercise === exercise.name ? 'bg-indigo-600 text-white' : 'bg-black/20 text-gray-300 hover:bg-black/40'
                    }`}
                  >
                    <span>{exercise.name}</span>
                    <div className="flex items-center gap-x-2">
                      <button
                        onClick={(e) => handleAddToRoutine(e, exercise.name)}
                        className="p-1 rounded bg-black/30 hover:bg-indigo-600/50 transition-colors"
                        title="Adicionar à rotina"
                      ><Plus className="w-3.5 h-3.5" /></button>
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

          {/* Coluna 3 — demonstração */}
          <div className="flex flex-col gap-y-3">
            {selectedData ? (
              <ExerciseImages exerciseData={selectedData} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full mt-8 gap-3">
                <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center">
                  <Dumbbell className="w-6 h-6 text-gray-600" />
                </div>
                <p className="text-gray-500 text-sm text-center">Selecione um exercício<br />para ver a demonstração</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Modal rotina */}
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
                  <button key={routine.id} onClick={() => handleConfirmAdd(routine.id)}
                    className="w-full px-4 py-2.5 bg-black/30 hover:bg-indigo-600/30 text-gray-200 text-sm rounded-md border border-gray-700 hover:border-indigo-500 text-left transition-all">
                    {routine.name}
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => setShowRoutineModal(false)} className="text-gray-500 hover:text-gray-300 text-sm text-center">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExercisesLibraryPage;