import React from "react";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import AppRoutes from "./Routes/AppRoutes";
import { WorkoutTimerProvider } from "./context/WorkoutTimerContext";
import FloatingWorkoutTimer from "./components/WorkoutTimer/FloatingWorkoutTimer";

const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];

const AppLayout = () => {
  const location   = useLocation();
  const isAuthPage = AUTH_ROUTES.includes(location.pathname);

  return (
    <div className={`w-full min-h-screen h-auto ${isAuthPage ? "" : "bg-[#171717]"}`}>
      {!isAuthPage && <Navbar />}

      <AppRoutes />

      {/*
        FloatingWorkoutTimer fica montado em todas as rotas protegidas.
        Só aparece na tela quando o usuário inicia um treino (isVisible = true).
        Não interfere em nenhum layout existente pois é position: fixed.
      */}
      {!isAuthPage && <FloatingWorkoutTimer />}
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
