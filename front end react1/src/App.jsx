import React from "react";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import AppRoutes from "./Routes/AppRoutes";
import FloatingTimer from "./components/FloatingTimer/FloatingTimer";
import { TimerProvider } from "./context/TimerContext";

const AppLayout = () => {
  const location = useLocation();
  const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];
  const isAuthPage = authRoutes.includes(location.pathname);

  return (
    <div className={`w-full min-h-screen h-auto ${isAuthPage ? "" : "bg-[#171717]"}`}>
      {!isAuthPage && <Navbar />}
      <AppRoutes />
      {!isAuthPage && <FloatingTimer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <TimerProvider>
        <AppLayout />
      </TimerProvider>
    </Router>
  );
}

export default App;
