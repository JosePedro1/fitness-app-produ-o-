import React, { useState } from 'react';
import { Search, Play, Plus } from 'lucide-react';
import { getRoutines } from '../../services/api-routines';
import axios from 'axios';

const api = axios.create({ baseURL: 'https://fitness-app-produ-o.onrender.com' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const MUSCLE_GROUPS = [
  { label: 'Peito', query: 'supino peito treino' },
  { label: 'Costas', query: 'remada costas treino' },
  { label: 'Pernas', query: 'agachamento pernas treino' },
  { label: 'Ombros', query: 'desenvolvimento ombros treino' },
  { label: 'Bíceps', query: 'rosca biceps treino' },
  { label: 'Tríceps', query: 'triceps treino extensão' },
  { label: 'Abdômen', query: 'abdomen core treino' },
  { label: 'Glúteos', query: 'gluteos hip thrust treino' },
];

const YOUTUBE_API_KEY = 'AIzaSyAOX0WpJo7LNSMJC7qXoBmtDaDQJI-tnjY'; // chave pública

const ExercisesLibraryPage = () => {
  const [search, setSearch] = useState('');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const searchVideos = async (query) => {
    setLoading(true);
    setSelectedVideo(null);
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=8&key=${YOUTUBE_API_KEY}&relevanceLanguage=pt`
      );
      const data = await res.json();
      setVideos(data.items || []);
    } catch {
      showToast('Erro ao buscar vídeos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) searchVideos(search);
  };

  const handleAddToRoutine = async (exerciseName) => {
    setSelectedExercise(exerciseName);
    const data = await getRoutines();
    setRoutines(data);
    setShowRoutineModal(true);
  };

  const handleConfirmAdd = async (routineId) => {
    try {
      await api.post('/exercises', {
        routine_id: routineId,
        exercise: selectedExercise,
        completed: false,
      });
      showToast(`"${selectedExercise}" adicionado à rotina!`);
      setShowRoutineModal(false);
    } catch {
      showToast('Erro ao adicionar exercício.', 'error');
    }
  };

  return (
    <div className="w-full min-h-screen lg:py-16 md:py-14 sm:py-12 py-10 lg:px-24 md:px-16 sm:px-6 px-4">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${toast.type === 'error' ? 'bg-red-500' : 'bg-indigo-600'}`}>
          {toast.message}
        </div>
      )}

      <div className="w-full flex flex-col items-center gap-y-8">

        {/* Header */}
        <div className="w-full flex justify-between items-center">
          <h1 className="lg:text-2xl md:text-xl text-lg font-semibold text-gray-200 bg-black/20 rounded-md py-2 px-4">
            Biblioteca de Exercícios
          </h1>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="w-full flex gap-x-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar exercício... ex: agachamento, supino"
            className="flex-1 px-4 py-2.5 bg-black/30 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 placeholder-gray-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center gap-x-2 transition-colors"
          >
            <Search className="w-4 h-4" />
            Buscar
          </button>
        </form>

        {/* Grupos musculares */}
        <div className="w-full">
          <p className="text-gray-400 text-sm mb-3">Ou explore por grupo muscular:</p>
          <div className="flex flex-wrap gap-2">
            {MUSCLE_GROUPS.map(group => (
              <button
                key={group.label}
                onClick={() => { setSearch(group.label); searchVideos(group.query); }}
                className="px-4 py-2 bg-black/30 hover:bg-indigo-600/40 text-gray-300 hover:text-white text-sm rounded-md border border-gray-700 hover:border-indigo-500 transition-all duration-200"
              >
                {group.label}
              </button>
            ))}
          </div>
        </div>

        {/* Player */}
        {selectedVideo && (
          <div className="w-full bg-black/30 rounded-md overflow-hidden">
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${selectedVideo}`}
                title="Exercício"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-x-3 text-gray-400">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            Buscando vídeos...
          </div>
        )}

        {/* Vídeos */}
        {!loading && videos.length > 0 && (
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {videos.map((video) => (
              <div
                key={video.id.videoId}
                className="bg-black/20 rounded-md overflow-hidden hover:bg-black/40 transition-all duration-200 flex flex-col"
              >
                <div
                  className="relative cursor-pointer group"
                  onClick={() => setSelectedVideo(video.id.videoId)}
                >
                  <img
                    src={video.snippet.thumbnails.medium.url}
                    alt={video.snippet.title}
                    className="w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="p-3 flex flex-col gap-y-2 flex-1">
                  <p className="text-gray-200 text-sm font-medium line-clamp-2">
                    {video.snippet.title}
                  </p>
                  <p className="text-gray-500 text-xs">{video.snippet.channelTitle}</p>
                  <button
                    onClick={() => handleAddToRoutine(video.snippet.title)}
                    className="mt-auto flex items-center justify-center gap-x-1.5 px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs rounded-md border border-indigo-600/50 hover:border-indigo-600 transition-all duration-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar à rotina
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && videos.length === 0 && (
          <p className="text-gray-500 text-center">Busque um exercício ou selecione um grupo muscular para ver vídeos.</p>
        )}
      </div>

      {/* Modal selecionar rotina */}
      {showRoutineModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="bg-[#1d1d1d] rounded-md p-6 w-full max-w-sm flex flex-col gap-y-4">
            <h3 className="text-gray-200 font-semibold text-lg">Adicionar à qual rotina?</h3>
            <p className="text-gray-400 text-sm">"{selectedExercise}"</p>
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