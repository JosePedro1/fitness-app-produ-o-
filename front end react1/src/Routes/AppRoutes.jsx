/**
 * AppRoutes.jsx
 * MUDANÇA: removida rota /tasks e import de TaskPage
 *          (módulo de tarefas descontinuado — não aparece na navbar,
 *           não faz sentido expor ao usuário)
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage          from '../pages/Landing/LandingPage';
import HomePage             from '../pages/Home/Home';
import RoutinePage          from '../pages/Routine/RoutinePage';
import ProgressPage         from '../pages/Progress/ProgressPage';
import TimerPage            from '../pages/Timer/TimerPage';
import LoginPage            from '../pages/Login/LoginPage';
import SignupPage           from '../pages/Signup/SignupPage';
import ForgotPasswordPage   from '../pages/ForgotPassword/ForgotPasswordPage';
import ResetPasswordPage    from '../pages/ResetPassword/ResetPasswordPage';
import PrivateRoute         from './PrivateRoute';
import ExercisesLibraryPage from '../pages/ExercisesLibrary/ExercisesLibraryPage';
import CalendarPage         from '../pages/Calendar/CalendarPage';
import AdminPage            from '../pages/Admin/AdminPage';
import NutritionPage        from '../pages/Nutrition/NutritionPage';
import ProfilePage          from '../pages/Profile/ProfilePage';
import RankingPage          from '../pages/Ranking/RankingPage';
import FeaturesPage         from '../pages/Features/FeaturesPage';

// Redireciona a rota raiz dependendo do contexto:
// — PWA instalado (standalone): vai direto pro login ou home (sem landing)
// — Navegador normal: mostra a LandingPage normalmente
const RootRoute = () => {
  const isPWA = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;

  if (!isPWA) return <LandingPage />;

  // No PWA: se já tem token vai pra home, senão vai pro login
  const hasToken = !!localStorage.getItem('auth_token');
  return <Navigate to={hasToken ? '/home' : '/login'} replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/adm" element={<AdminPage />} />

      {/* Rota raiz — landing no browser, login/home no PWA */}
      <Route path="/"                element={<RootRoute />} />

      {/* Ranking público da academia (sem login) */}
      <Route path="/ranking/:slug"   element={<RankingPage />} />

      {/* Rotas de autenticação */}
      <Route path="/login"           element={<LoginPage />} />
      <Route path="/signup"          element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password"  element={<ResetPasswordPage />} />

      {/* Rotas protegidas */}
      <Route element={<PrivateRoute />}>
        <Route path="/home"              element={<HomePage />} />
        <Route path="/routines"          element={<RoutinePage />} />
        <Route path="/progress"          element={<ProgressPage />} />
        <Route path="/timer"             element={<TimerPage />} />
        <Route path="/exercises-library" element={<ExercisesLibraryPage />} />
        <Route path="/calendar"          element={<CalendarPage />} />
        <Route path="/nutrition"         element={<NutritionPage />} />
        <Route path="/profile"           element={<ProfilePage />} />
        <Route path="/features"          element={<FeaturesPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;