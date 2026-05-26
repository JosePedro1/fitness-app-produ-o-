import React, { useState, useEffect } from 'react';
import { Play, Plus, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { getRoutines } from '../../services/api-routines';
import axios from 'axios';

const api = axios.create({ baseURL: 'https://fitness-app-produ-o.onrender.com' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const YOUTUBE_API_KEY = 'AIzaSyAOX0WpJo7LNSMJC7qXoBmtDaDQJI-tnjY';

const CATALOG = {
  Peito: [
    { name: 'Supino Reto', query: 'supino reto com barra execução correta' },
    { name: 'Supino Inclinado', query: 'supino inclinado halteres execução' },
    { name: 'Supino Declinado', query: 'supino declinado execução correta' },
    { name: 'Crucifixo', query: 'crucifixo peitoral halteres execução' },
    { name: 'Crossover', query: 'crossover peitoral cabo execução' },
    { name: 'Flexão de Braços', query: 'flexão de braços peito execução correta' },
  ],
  Costas: [
    { name: 'Barra Fixa', query: 'barra fixa execução correta costas' },
    { name: 'Remada Curvada', query: 'remada curvada barra execução' },
    { name: 'Remada Unilateral', query: 'remada unilateral haltere execução' },
    { name: 'Puxada Frontal', query: 'puxada frontal pulley execução costas' },
    { name: 'Remada Cavalinho', query: 'remada cavalinho execução costas' },
    { name: 'Levantamento Terra', query: 'levantamento terra execução correta' },
  ],
  Pernas: [
    { name: 'Agachamento Livre', query: 'agachamento livre barra execução correta' },
    { name: 'Leg Press', query: 'leg press execução correta pernas' },
    { name: 'Cadeira Extensora', query: 'cadeira extensora quadríceps execução' },
    { name: 'Mesa Flexora', query: 'mesa flexora posterior execução' },
    { name: 'Avanço', query: 'avanço lunges execução correta pernas' },
    { name: 'Panturrilha em Pé', query: 'panturrilha em pé execução correta' },
  ],
  Ombros: [
    { name: 'Desenvolvimento com Barra', query: 'desenvolvimento barra ombros execução' },
    { name: 'Desenvolvimento Halteres', query: 'desenvolvimento halteres ombros execução' },
    { name: 'Elevação Lateral', query: 'elevação lateral ombros execução correta' },
    { name: 'Elevação Frontal', query: 'elevação frontal ombros execução' },
    { name: 'Remada Alta', query: 'remada alta trapézio ombros execução' },
    { name: 'Face Pull', query: 'face pull posterior ombro execução' },
  ],
  Bíceps: [
    { name: 'Rosca Direta', query: 'rosca direta bíceps barra execução correta' },
    { name: 'Rosca Alternada', query: 'rosca alternada halteres bíceps execução' },
    { name: 'Rosca Martelo', query: 'rosca martelo halteres execução correta' },
    { name: 'Rosca Concentrada', query: 'rosca concentrada bíceps execução' },
    { name: 'Rosca Scott', query: 'rosca scott bíceps execução correta' },
    { name: 'Rosca no Cabo', query: 'rosca bíceps cabo pulley execução' },
  ],
  Tríceps: [
    { name: 'Tríceps Testa', query: 'tríceps testa barra execução correta' },
    { name: 'Tríceps Corda', query: 'tríceps corda cabo execução correta' },
    { name: 'Tríceps Francês', query: 'tríceps francês haltere execução' },
    { name: 'Mergulho no Banco', query: 'mergulho banco tríceps execução' },
    { name: 'Tríceps Coice', query: 'tríceps coice haltere execução correta' },
    { name: 'Tríceps Testa Unilateral', query: 'tríceps testa unilateral cabo execução' },
  ],
  Abdômen: [
    { name: 'Abdominal Crunch', query: 'abdominal crunch execução correta' },
    { name: 'Prancha', query: 'prancha abdominal execução correta plank' },
    { name: 'Abdominal Infra', query: 'abdominal inferior infra execução' },
    { name: 'Russian Twist', query: 'russian twist oblíquo execução' },
    { name: 'Abdominal no Cabo', query: 'abdominal cabo pulley execução' },
    { name: 'Elevação de Pernas', query: 'elevação de pernas abdominal execução' },
  ],
  Glúteos: [
    { name: 'Hip Thrust', query: 'hip thrust glúteo execução correta' },
    { name: 'Agachamento Sumô', query: 'agachamento sumô glúteo execução' },
    { name: 'Stiff', query: 'stiff posterior glúteo execução correta' },
    { name: 'Abdução no Cabo', query: 'abdução quadril cabo glúteo execução' },
    { name: 'Glúteo no Cabo', query: 'glúteo cabo coice execução correta' },
    { name: 'Avanço Reverso', query: 'avanço reverso glúteo execução' },
  ],
};

// Encontra o exercício no catálogo pelo nome (case-insensitive, parcial)
const findExerciseInCatalog = (name) => {
  if (!name) return null;
  const lower = name.toLowerCase();
  for (const [group, exercises] of Object.entries(CATALOG)) {
    const found = exercises.find(e => e.name.toLowerCase() === lower || e.name.toLowerCase().includes(lower) || lower.includes(e.name.toLowerCase()));
    if (found) return { group, exercise: found };
  }
  return null;
};

const ExercisesLibraryPage = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [exerciseToAdd, setExerciseToAdd] = useState('');
  const [toast, setToast] = useState(null);
  const [deepLinkBanner, setDeepLinkBanner] = useState(null);

  const location = useLocation();

  // Detecta ?exercise= na URL e abre automaticamente
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
      // Exercício não encontrado no catálogo — mostra aviso mas não quebra
      setDeepLinkBanner(exerciseName);
      setToast({ message: `"${exerciseName}" ainda não está no catálogo. Mostrando a biblioteca completa.`, type: 'info' });
      setTimeout(() => setToast(null), 4000);
    }
  }, [location.search]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSelectExercise = async (exercise) => {
    setSelectedExercise(exercise.name);
    setSelectedVideoId(null);
    setVideos([]);
    setLoading(true);
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(exercise.query)}&type=video&maxResults=6&key=${YOUTUBE_API_KEY}&relevanceLanguage=pt&regionCode=BR`
      );
      const data = await res.json();
      setVideos(data.items || []);
    } catch {
      showToast('Erro ao buscar vídeos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToRoutine = async (exerciseName) => {
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

        {/* Banner de deep link — aparece quando vem da rotina */}
        {deepLinkBanner && (
          <div className="w-full bg-indigo-600/20 border border-indigo-500/40 rounded-xl px-5 py-3 flex items-center justify-between">
            <p className="text-indigo-300 text-sm">
              Você foi redirecionado para ver: <span className="font-semibold text-white">{deepLinkBanner}</span>
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
                onClick={() => { setSelectedGroup(group); setSelectedExercise(null); setVideos([]); setSelectedVideoId(null); setDeepLinkBanner(null); }}
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
                  <button
                    key={exercise.name}
                    onClick={() => handleSelectExercise(exercise)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                      selectedExercise === exercise.name ? 'bg-indigo-600 text-white' : 'bg-black/20 text-gray-300 hover:bg-black/40'
                    }`}
                  >
                    {exercise.name}
                    <div className="flex items-center gap-x-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAddToRoutine(exercise.name); }}
                        className="p-1 rounded bg-black/30 hover:bg-indigo-600/50 transition-colors"
                        title="Adicionar à rotina"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>
                ))}
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 text-sm text-center">Selecione um grupo muscular</p>
              </div>
            )}
          </div>

          {/* Coluna 3 — vídeos */}
          <div className="flex flex-col gap-y-3">
            {selectedExercise && <p className="text-gray-400 text-sm mb-1">Vídeos — {selectedExercise}</p>}

            {loading && (
              <div className="flex items-center gap-x-3 text-gray-400 mt-4">
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                Buscando vídeos...
              </div>
            )}

            {selectedVideoId && (
              <div className="w-full bg-black/30 rounded-md overflow-hidden mb-2">
                <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${selectedVideoId}`}
                    title="Exercício"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {!loading && videos.map(video => (
              <div
                key={video.id.videoId}
                className={`flex gap-x-3 p-2 rounded-md cursor-pointer transition-all duration-200 ${
                  selectedVideoId === video.id.videoId ? 'bg-indigo-600/20 border border-indigo-600/50' : 'bg-black/20 hover:bg-black/40'
                }`}
                onClick={() => setSelectedVideoId(video.id.videoId)}
              >
                <div className="relative flex-shrink-0 w-24 h-16 rounded overflow-hidden group">
                  <img src={video.snippet.thumbnails.medium.url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex flex-col justify-center gap-y-1 flex-1 min-w-0">
                  <p className="text-gray-200 text-xs font-medium line-clamp-2">{video.snippet.title}</p>
                  <p className="text-gray-500 text-xs">{video.snippet.channelTitle}</p>
                </div>
              </div>
            ))}

            {!loading && !selectedExercise && (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 text-sm text-center">Selecione um exercício para ver os vídeos</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal selecionar rotina */}
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
            <button onClick={() => setShowRoutineModal(false)} className="text-gray-500 hover:text-gray-300 text-sm text-center">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExercisesLibraryPage;
