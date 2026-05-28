import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/Landing/LandingPage';
import HomePage from '../pages/Home/Home';
import TaskPage from '../pages/Task/TaskPage';
import RoutinePage from '../pages/Routine/RoutinePage';
import ProgressPage from '../pages/Progress/ProgressPage';
import TimerPage from '../pages/Timer/TimerPage';
import LoginPage from '../pages/Login/LoginPage';
import SignupPage from '../pages/Signup/SignupPage';
import ForgotPasswordPage from '../pages/ForgotPassword/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPassword/ResetPasswordPage';
import PrivateRoute from './PrivateRoute';
import ExercisesLibraryPage from '../pages/ExercisesLibrary/ExercisesLibraryPage';
import CalendarPage from '../pages/Calendar/CalendarPage';
import AdminPage from '../pages/Admin/AdminPage';

const AppRoutes = () => {
  return (
    
    <Routes>
      <Route path="/adm" element={<AdminPage />} />
      {/* Rota pública — landing page */}
      <Route path="/"                 element={<LandingPage />} />

      {/* Rotas de autenticação */}
      <Route path="/login"            element={<LoginPage />} />
      <Route path="/signup"           element={<SignupPage />} />
      <Route path="/forgot-password"  element={<ForgotPasswordPage />} />
      <Route path="/reset-password"   element={<ResetPasswordPage />} />

      {/* Rotas protegidas */}
      <Route element={<PrivateRoute />}>
        <Route path="/home"               element={<HomePage />} />
        <Route path="/tasks"              element={<TaskPage />} />
        <Route path="/routines"           element={<RoutinePage />} />
        <Route path="/progress"           element={<ProgressPage />} />
        <Route path="/timer"              element={<TimerPage />} />
        <Route path="/exercises-library"  element={<ExercisesLibraryPage />} />
        <Route path="/calendar"           element={<CalendarPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
