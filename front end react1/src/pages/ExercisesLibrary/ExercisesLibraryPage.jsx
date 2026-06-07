import React, { useState, useEffect, useRef } from 'react';
import { Plus, ChevronRight, Dumbbell, Zap, Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { getRoutines } from '../../services/api-routines';
import api from '../../services/api';

// ── URL base do SEU backend (mesma instância do axios já configurada) ─────────
// As chamadas passam por /exercise-db/gif?name=... no seu Render/backend.
// Isso resolve o CORS porque o backend chama a ExerciseDB server-side.
const PROXY_PATH = '/exercise-db/gif';

// ── Normalização ──────────────────────────────────────────────────────────────
const normalize = (s) =>
  s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_]/g, ' ')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

// ── Busca direta por searchName normalizado ───────────────────────────────────
const findGifUrl = (searchName, gifMap) => {
  if (!searchName || !Object.keys(gifMap).length) return null;
  return gifMap[normalize(searchName)] ?? null;
};

// ── Catálogo ──────────────────────────────────────────────────────────────────
const CATALOG = {
  Peito: [
    { name: 'Supino Reto',        searchName: 'barbell bench press',                 muscles: 'Peitoral maior, Tríceps, Deltóide anterior',  equipment: 'Barra',          difficulty: 'Intermediário', tip: 'Escápulas retraídas, lombar levemente arqueada. Cotovelos a 75°.' },
    { name: 'Supino Inclinado',   searchName: 'barbell incline bench press',          muscles: 'Peitoral superior, Tríceps',                  equipment: 'Barra',          difficulty: 'Intermediário', tip: 'Banco a 30–45°. Foco no feixe clavicular do peitoral.' },
    { name: 'Supino Declinado',   searchName: 'decline barbell bench press',          muscles: 'Peitoral inferior, Tríceps',                  equipment: 'Barra',          difficulty: 'Intermediário', tip: 'Define a porção inferior do peitoral. Cuidado com o pescoço.' },
    { name: 'Crucifixo',          searchName: 'dumbbell fly',                         muscles: 'Peitoral maior (estiramento)',                equipment: 'Halteres',       difficulty: 'Iniciante',     tip: 'Cotovelos levemente flexionados durante todo o arco.' },
    { name: 'Crossover no Cabo',  searchName: 'cable crossover',                      muscles: 'Peitoral maior, Serrátil anterior',           equipment: 'Cabo',           difficulty: 'Iniciante',     tip: 'Cruze as mãos ao final para contração máxima.' },
    { name: 'Flexão de Braços',   searchName: 'push up',                              muscles: 'Peitoral, Tríceps, Core',                    equipment: 'Peso corporal',  difficulty: 'Iniciante',     tip: 'Corpo reto da cabeça ao calcanhar. Core sempre contraído.' },
  ],
  Costas: [
    { name: 'Barra Fixa',         searchName: 'pull up',                              muscles: 'Latíssimo, Bíceps, Romboides',                equipment: 'Barra fixa',     difficulty: 'Avançado',      tip: 'Puxe até o queixo ultrapassar a barra. Controle a descida.' },
    { name: 'Remada Curvada',     searchName: 'barbell bent over row',                muscles: 'Latíssimo, Trapézio médio, Romboides',       equipment: 'Barra',          difficulty: 'Intermediário', tip: 'Tronco a ~45°. Puxe a barra ao umbigo, não ao peito.' },
    { name: 'Remada Unilateral',  searchName: 'dumbbell one arm row',                 muscles: 'Latíssimo, Romboides, Bíceps',               equipment: 'Haltere',        difficulty: 'Iniciante',     tip: 'Apoie o joelho e mão no banco. Cotovelo alto na subida.' },
    { name: 'Puxada Frontal',     searchName: 'wide grip lat pulldown',               muscles: 'Latíssimo, Bíceps, Teres maior',             equipment: 'Pulley',         difficulty: 'Iniciante',     tip: 'Puxe à frente do rosto. Ligeira inclinação do tronco para trás.' },
    { name: 'Remada Cavalinho',   searchName: 't bar row',                            muscles: 'Latíssimo, Trapézio, Lombares',              equipment: 'Barra T',        difficulty: 'Intermediário', tip: 'Excelente para espessura de costas. Mantenha lombar neutra.' },
    { name: 'Levantamento Terra', searchName: 'barbell deadlift',                     muscles: 'Lombares, Glúteos, Isquiotibiais, Trapézio', equipment: 'Barra',          difficulty: 'Avançado',      tip: 'Barra rente à perna, quadril empurra para trás na descida.' },
  ],
  Quadríceps: [
    { name: 'Agachamento Livre',   searchName: 'barbell squat',                       muscles: 'Quadríceps, Glúteos, Isquiotibiais',         equipment: 'Barra',          difficulty: 'Intermediário', tip: 'Joelhos na linha dos pés. Desça até a coxa ficar paralela ao chão.' },
    { name: 'Leg Press',           searchName: 'leg press',                           muscles: 'Quadríceps, Glúteos',                        equipment: 'Máquina',        difficulty: 'Iniciante',     tip: 'Pés no centro da plataforma. Não trave os joelhos no topo.' },
    { name: 'Cadeira Extensora',   searchName: 'leg extension',                       muscles: 'Quadríceps (isolamento)',                    equipment: 'Máquina',        difficulty: 'Iniciante',     tip: 'Contração total no topo. Ideal como finalizador de treino.' },
    { name: 'Avanço',              searchName: 'barbell lunge',                       muscles: 'Quadríceps, Glúteos, Isquiotibiais',         equipment: 'Halteres/Barra', difficulty: 'Intermediário', tip: 'Joelho da frente não deve ultrapassar a ponta do pé.' },
    { name: 'Agachamento Hack',    searchName: 'hack squat',                          muscles: 'Quadríceps, Glúteos',                        equipment: 'Máquina',        difficulty: 'Intermediário', tip: 'Enfatiza o vasto medial (teardrop). Pés afastados na largura dos ombros.' },
    { name: 'Agachamento Búlgaro', searchName: 'split squat',                         muscles: 'Quadríceps, Glúteos (unilateral)',           equipment: 'Halteres',       difficulty: 'Avançado',      tip: 'Pé traseiro elevado. Excelente para corrigir desequilíbrios.' },
  ],
  Posterior: [
    { name: 'Mesa Flexora',              searchName: 'lying leg curl',                muscles: 'Isquiotibiais (isolamento)',                 equipment: 'Máquina',        difficulty: 'Iniciante',     tip: 'Quadril pressionado no banco. Sem balanço no movimento.' },
    { name: 'Stiff',                     searchName: 'romanian deadlift',             muscles: 'Isquiotibiais, Glúteos, Lombares',          equipment: 'Barra',          difficulty: 'Intermediário', tip: 'Sinta o estiramento nos isquiotibiais. Joelhos levemente flexionados.' },
    { name: 'Leg Curl em Pé',            searchName: 'standing leg curl',             muscles: 'Isquiotibiais (unilateral)',                equipment: 'Máquina',        difficulty: 'Iniciante',     tip: 'Ideal para trabalhar cada perna individualmente.' },
    { name: 'Good Morning',              searchName: 'good morning',                  muscles: 'Isquiotibiais, Lombares, Glúteos',          equipment: 'Barra',          difficulty: 'Intermediário', tip: 'Incline o tronco até ficar paralelo ao chão. Costas neutras.' },
    { name: 'Levantamento Terra Romeno', searchName: 'dumbbell romanian deadlift',    muscles: 'Isquiotibiais, Glúteos, Lombares',          equipment: 'Barra',          difficulty: 'Intermediário', tip: 'Descida controlada com estiramento total dos isquiotibiais.' },
    { name: 'Ponte de Glúteo',           searchName: 'barbell glute bridge',          muscles: 'Isquiotibiais, Glúteos',                    equipment: 'Peso corporal',  difficulty: 'Iniciante',     tip: 'Aperte os glúteos no topo. Ótimo para ativar a cadeia posterior.' },
  ],
  Panturrilha: [
    { name: 'Panturrilha em Pé',        searchName: 'standing calf raise',            muscles: 'Gastrocnêmio, Sóleo',                       equipment: 'Barra/Máquina',  difficulty: 'Iniciante', tip: 'Desça o calcanhar abaixo da plataforma para amplitude total.' },
    { name: 'Panturrilha Sentado',      searchName: 'seated calf raise',              muscles: 'Sóleo (joelho dobrado)',                    equipment: 'Máquina',        difficulty: 'Iniciante', tip: 'Joelho a 90° enfatiza o sóleo, músculo mais profundo da panturrilha.' },
    { name: 'Panturrilha no Leg Press', searchName: 'calf press on leg press',         muscles: 'Gastrocnêmio, Sóleo',                       equipment: 'Leg Press',      difficulty: 'Iniciante', tip: 'Apenas os dedos dos pés na plataforma. Movimento completo.' },
    { name: 'Panturrilha Unilateral',   searchName: 'donkey calf raise',              muscles: 'Gastrocnêmio (unilateral)',                 equipment: 'Peso corporal',  difficulty: 'Iniciante', tip: 'Excelente para corrigir assimetrias entre as pernas.' },
  ],
  Ombros: [
    { name: 'Desenvolvimento com Barra', searchName: 'barbell shoulder press',        muscles: 'Deltóide anterior, Tríceps, Trapézio',      equipment: 'Barra',     difficulty: 'Intermediário', tip: 'Barra parte da frente do pescoço. Core contraído no movimento.' },
    { name: 'Desenvolvimento Halteres',  searchName: 'dumbbell shoulder press',       muscles: 'Deltóide anterior e médio, Tríceps',        equipment: 'Halteres',  difficulty: 'Iniciante',     tip: 'Maior amplitude que a barra. Pulsos neutros durante todo o movimento.' },
    { name: 'Elevação Lateral',          searchName: 'lateral raise',                 muscles: 'Deltóide médio (isolamento)',               equipment: 'Halteres',  difficulty: 'Iniciante',     tip: 'Cotovelos levemente flexionados. Polegar ligeiramente abaixado.' },
    { name: 'Elevação Frontal',          searchName: 'front raise',                   muscles: 'Deltóide anterior',                        equipment: 'Halteres',  difficulty: 'Iniciante',     tip: 'Suba até a altura dos olhos. Não use impulso do tronco.' },
    { name: 'Remada Alta',               searchName: 'upright row',                   muscles: 'Deltóide médio, Trapézio superior',        equipment: 'Barra',     difficulty: 'Intermediário', tip: 'Cotovelos sempre acima dos punhos. Cuidado com a amplitude.' },
    { name: 'Face Pull',                 searchName: 'face pull',                     muscles: 'Deltóide posterior, Trapézio médio',       equipment: 'Cabo',      difficulty: 'Iniciante',     tip: 'Puxe em direção à testa, cotovelos para fora. Essencial para saúde do ombro.' },
  ],
  Bíceps: [
    { name: 'Rosca Direta',       searchName: 'barbell curl',                         muscles: 'Bíceps braquial, Braquial',                 equipment: 'Barra',         difficulty: 'Iniciante',     tip: 'Cotovelos fixos ao lado do corpo. Sem balanço de tronco.' },
    { name: 'Rosca Alternada',    searchName: 'alternate dumbbell bicep curl',        muscles: 'Bíceps braquial, Braquial',                 equipment: 'Halteres',      difficulty: 'Iniciante',     tip: 'Gire o punho na subida (supinação). Aumenta o pico de contração.' },
    { name: 'Rosca Martelo',      searchName: 'hammer curl',                          muscles: 'Braquiorradial, Bíceps',                   equipment: 'Halteres',      difficulty: 'Iniciante',     tip: 'Punho neutro (polegar para cima). Trabalha mais o braquiorradial.' },
    { name: 'Rosca Concentrada',  searchName: 'concentration curl',                  muscles: 'Bíceps (isolamento)',                       equipment: 'Haltere',       difficulty: 'Iniciante',     tip: 'Cotovelo apoiado na coxa. Máximo isolamento do bíceps.' },
    { name: 'Rosca Scott',        searchName: 'preacher curl',                        muscles: 'Bíceps (porção longa)',                    equipment: 'Barra/Máquina', difficulty: 'Intermediário', tip: 'Braço totalmente apoiado. Evita trapaça e maximiza isolamento.' },
    { name: 'Rosca no Cabo',      searchName: 'cable curl',                           muscles: 'Bíceps (tensão constante)',                equipment: 'Cabo',          difficulty: 'Iniciante',     tip: 'Tensão constante em todo o arco do movimento.' },
  ],
  Tríceps: [
    { name: 'Tríceps Testa',               searchName: 'skull crusher',               muscles: 'Tríceps (porção longa e medial)',           equipment: 'Barra/Halteres', difficulty: 'Intermediário', tip: 'Cotovelos apontados para cima. Baixe a barra à testa com controle.' },
    { name: 'Tríceps Corda',               searchName: 'rope pushdown',               muscles: 'Tríceps (porção lateral)',                 equipment: 'Cabo + corda',   difficulty: 'Iniciante',     tip: 'Separe a corda no final para maior ativação da cabeça lateral.' },
    { name: 'Tríceps Francês',             searchName: 'dumbbell tricep extension',   muscles: 'Tríceps (porção longa)',                   equipment: 'Haltere',        difficulty: 'Intermediário', tip: 'Braços verticais. Foco total na cabeça longa do tríceps.' },
    { name: 'Mergulho no Banco',           searchName: 'bench dip',                   muscles: 'Tríceps, Peitoral inferior',               equipment: 'Banco',          difficulty: 'Iniciante',     tip: 'Quadris próximos ao banco. Desça até o cotovelo a 90°.' },
    { name: 'Tríceps Coice',               searchName: 'dumbbell kickback',           muscles: 'Tríceps (porção lateral)',                 equipment: 'Haltere',        difficulty: 'Iniciante',     tip: 'Cotovelo fixo ao lado do tronco. Extensão completa no final.' },
    { name: 'Extensão de Tríceps no Cabo', searchName: 'cable triceps pushdown',      muscles: 'Tríceps (porção longa)',                   equipment: 'Cabo',           difficulty: 'Iniciante',     tip: 'Cotovelos fixos. Contração máxima no final do movimento.' },
  ],
  Abdômen: [
    { name: 'Abdominal Crunch',  searchName: 'crunch',                                muscles: 'Reto abdominal',                            equipment: 'Máquina/Chão',  difficulty: 'Iniciante',     tip: 'Enrole o tronco. Não puxe o pescoço com as mãos.' },
    { name: 'Prancha',           searchName: 'plank',                                 muscles: 'Core completo, Estabilizadores',           equipment: 'Peso corporal', difficulty: 'Iniciante',     tip: 'Quadril neutro — não suba nem deixe cair. Respire normalmente.' },
    { name: 'Elevação de Pernas',searchName: 'hanging leg raise',                     muscles: 'Reto inferior, Flexores do quadril',       equipment: 'Barra fixa',    difficulty: 'Intermediário', tip: 'Suba as pernas à 90°. Controle a descida sem balanço.' },
    { name: 'Russian Twist',     searchName: 'russian twist',                         muscles: 'Oblíquos, Reto abdominal',                 equipment: 'Peso corporal', difficulty: 'Iniciante',     tip: 'Gire o tronco, não só os braços. Pés podem ser elevados.' },
    { name: 'Abdominal no Cabo', searchName: 'cable crunch',                          muscles: 'Reto abdominal (carga alta)',              equipment: 'Cabo',          difficulty: 'Intermediário', tip: 'Quadril fixo. O movimento é só do tronco. Carga progressiva.' },
    { name: 'Mountain Climber',  searchName: 'mountain climber',                      muscles: 'Core, Quadríceps, Ombros',                 equipment: 'Peso corporal', difficulty: 'Intermediário', tip: 'Cadência rápida para cardio, lenta para força de core.' },
  ],
  Glúteos: [
    { name: 'Hip Thrust',         searchName: 'barbell hip thrust',                   muscles: 'Glúteo máximo (isolamento)',               equipment: 'Barra',         difficulty: 'Intermediário', tip: 'Aperte os glúteos no topo. Quadril paralelo ao chão.' },
    { name: 'Agachamento Sumô',   searchName: 'plie squat',                           muscles: 'Glúteos, Adutores, Quadríceps',            equipment: 'Haltere/Barra', difficulty: 'Iniciante',     tip: 'Pés bem abertos e virados para fora. Joelhos seguem a direção dos pés.' },
    { name: 'Stiff para Glúteos', searchName: 'barbell stiff leg deadlift',           muscles: 'Glúteos, Isquiotibiais',                   equipment: 'Barra',         difficulty: 'Intermediário', tip: 'Empurre o quadril para trás na descida. Sinta o glúteo alongar.' },
    { name: 'Abdução no Cabo',    searchName: 'cable hip abduction',                  muscles: 'Glúteo médio e mínimo',                   equipment: 'Cabo',          difficulty: 'Iniciante',     tip: 'Eleve a perna lateralmente. Corpo estável durante o movimento.' },
    { name: 'Glúteo no Cabo',     searchName: 'cable kickback',                       muscles: 'Glúteo máximo (unilateral)',               equipment: 'Cabo',          difficulty: 'Iniciante',     tip: 'Tronco levemente inclinado. Extensão completa do quadril.' },
    { name: 'Avanço Reverso',     searchName: 'reverse lunge',                        muscles: 'Glúteos, Quadríceps (menos carga no joelho)', equipment: 'Halteres',  difficulty: 'Intermediário', tip: 'Passo para trás. Menos estresse no joelho que o avanço frontal.' },
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

// ── Componente GIF ────────────────────────────────────────────────────────────
const ExerciseGif = ({ exerciseData, gifMap, apiLoading }) => {
  const [imgLoaded,  setImgLoaded]  = useState(false);
  const [imgErrored, setImgErrored] = useState(false);

  const gifUrl = findGifUrl(exerciseData.searchName, gifMap);

  useEffect(() => {
    setImgLoaded(false);
    setImgErrored(false);
  }, [exerciseData.name]);

  const showSpinner  = apiLoading || (!imgLoaded && !imgErrored && !!gifUrl);
  const showFallback = !apiLoading && (!gifUrl || imgErrored);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-gray-400 text-sm">
        Demonstração — <span className="text-white font-medium">{exerciseData.name}</span>
      </p>

      <div
        className="relative w-full bg-black/40 rounded-xl overflow-hidden border border-white/5 flex items-center justify-center"
        style={{ minHeight: 220 }}
      >
        {showSpinner && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
          </div>
        )}

        {gifUrl && !imgErrored && (
          <img
            key={gifUrl}
            src={gifUrl}
            alt={`Demonstração: ${exerciseData.name}`}
            className="w-full object-contain transition-opacity duration-500"
            style={{ opacity: imgLoaded ? 1 : 0 }}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgErrored(true)}
          />
        )}

        {showFallback && (
          <div className="flex flex-col items-center justify-center gap-3 p-6">
            <div className="w-14 h-14 bg-indigo-600/20 rounded-full flex items-center justify-center">
              <Dumbbell className="w-7 h-7 text-indigo-400" />
            </div>
            <p className="text-gray-400 text-sm text-center">GIF não disponível</p>
          </div>
        )}
      </div>

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

  const [gifMap,      setGifMap]      = useState({});
  const [apiLoading,  setApiLoading]  = useState(true);
  const [apiError,    setApiError]    = useState(false);
  const [totalLoaded, setTotalLoaded] = useState(0);
  const fetchedRef = useRef(false);

  const location = useLocation();

  // ── Carrega GIFs via proxy do backend (evita CORS) ─────────────────────────
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const loadCatalogGifs = async () => {
      try {
        const allExercises = Object.values(CATALOG).flat();
        const searches     = allExercises.map(ex => ex.searchName);
        // BATCH menor + delay entre batches → evita rate limit da ExerciseDB
        const BATCH        = 5;
        const DELAY_MS     = 400;
        const map          = {};

        for (let i = 0; i < searches.length; i += BATCH) {
          const batch = searches.slice(i, i + BATCH);
          await Promise.all(
            batch.map(async (searchName) => {
              try {
                // Usa a instância axios (api) que já tem o baseURL do backend
                const res = await api.get(PROXY_PATH, {
                  params: { name: searchName },
                });
                const gifUrl = res.data?.gifUrl;
                if (gifUrl) {
                  map[normalize(searchName)] = gifUrl;
                  setTotalLoaded(prev => prev + 1);
                }
              } catch {
                // silencia erro individual
              }
            })
          );
          // Pausa entre batches para não estourar o rate limit da ExerciseDB
          if (i + BATCH < searches.length) {
            await new Promise(resolve => setTimeout(resolve, DELAY_MS));
          }
        }

        setGifMap(map);
      } catch (err) {
        console.warn('[GIFs] erro geral:', err.message);
        setApiError(true);
      } finally {
        setApiLoading(false);
      }
    };

    loadCatalogGifs();
  }, []);

  // ── Deep link ──────────────────────────────────────────────────────────────
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
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="lg:text-2xl md:text-xl text-lg font-semibold text-gray-200 bg-black/20 rounded-md py-2 px-4 w-fit">
            Biblioteca de Exercícios
          </h1>
          <span className={`text-xs px-2 py-1 rounded-full border ${
            apiError
              ? 'bg-red-500/10 text-red-400 border-red-500/20'
              : apiLoading
              ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}>
            {apiError
              ? 'GIFs offline'
              : apiLoading
              ? `Carregando GIFs… ${totalLoaded}/${Object.values(CATALOG).flat().length}`
              : `${totalLoaded} GIFs prontos`}
          </span>
        </div>

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
                onClick={() => {
                  setSelectedGroup(group);
                  setSelectedExercise(null);
                  setSelectedData(null);
                  setDeepLinkBanner(null);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  selectedGroup === group
                    ? 'bg-indigo-600 text-white'
                    : 'bg-black/20 text-gray-300 hover:bg-black/40'
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

          {/* Coluna 3 — GIF demonstrativo */}
          <div className="flex flex-col gap-y-3">
            {selectedData ? (
              <ExerciseGif
                exerciseData={selectedData}
                gifMap={gifMap}
                apiLoading={apiLoading}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full mt-8 gap-3">
                <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center">
                  <Dumbbell className="w-6 h-6 text-gray-600" />
                </div>
                <p className="text-gray-500 text-sm text-center">
                  Selecione um exercício<br />para ver a demonstração
                </p>
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