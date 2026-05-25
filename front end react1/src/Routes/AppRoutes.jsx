import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/Home/Home";
import TaskPage from "../pages/Task/TaskPage";
import RoutinePage from "../pages/Routine/RoutinePage";
import ProgressPage from "../pages/Progress/ProgressPage";
import TimerPage from "../pages/Timer/TimerPage";
import LoginPage from "../pages/Login/LoginPage";
import SignupPage from "../pages/Signup/SignupPage";
import PrivateRoute from "./PrivateRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rotas públicas - login e registro */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Rota raiz: redireciona para /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Rotas protegidas - requerem autenticação */}
      <Route element={<PrivateRoute />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/tasks" element={<TaskPage />} />
        <Route path="/routines" element={<RoutinePage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/timer" element={<TimerPage />} />
      </Route>

      {/* Fallback: qualquer rota desconhecida vai para login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
