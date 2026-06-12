import React from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import BottomNav from './components/BottomNav/BottomNav';
import AppRoutes from './Routes/AppRoutes';
import { WorkoutTimerProvider } from './context/WorkoutTimerContext';
import FloatingWorkoutTimer from './components/WorkoutTimer/FloatingWorkoutTimer';
import InstallPWA from './components/InstallPWA/InstallPWA';

const AUTH_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password'];
const PUBLIC_ROUTES = ['/'];

const AppLayout = () => {
  const location = useLocation();
  const isAuthPage   = AUTH_ROUTES.includes(location.pathname);
  const isPublicPage = PUBLIC_ROUTES.includes(location.pathname);
  const hideChrome   = isAuthPage || isPublicPage;

  return (
    <div className={`w-full min-h-screen h-auto ${hideChrome ? '' : 'bg-[#171717]'}`}>
      {!hideChrome && <Navbar />}

      <AppRoutes />

      {/*
        FloatingWorkoutTimer fica montado em todas as rotas protegidas.
        Só aparece na tela quando o usuário inicia um treino (isVisible = true).
        Não interfere em nenhum layout existente pois é position: fixed.
      */}
      {!hideChrome && <FloatingWorkoutTimer />}

      {/*
        BottomNav fixa (mobile, md:hidden) com os 5 destinos mais usados —
        substitui o drawer hamburger como navegação primária no celular.
      */}
      {!hideChrome && <BottomNav />}

      {/*
        Banner flutuante de instalação PWA — aparece em todas as rotas.
        Se posiciona acima do BottomNav em rotas protegidas.
      */}
      <InstallPWA />
    </div>
  );
};

function App() {
  return (
    <Router>
      {/*
        WorkoutTimerProvider envolve o Router para que o estado
        (elapsed, isRunning, etc.) persista entre todas as navegações.
      */}
      <WorkoutTimerProvider>
        <AppLayout />
      </WorkoutTimerProvider>
    </Router>
  );
}

export default App;