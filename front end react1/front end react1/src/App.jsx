import React from "react";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import AppRoutes from "./Routes/AppRoutes";

const AppLayout = () => {
  const location = useLocation();
  const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];
  const isAuthPage = authRoutes.includes(location.pathname);

  return (
    <div className={`w-full min-h-screen h-auto ${isAuthPage ? "" : "bg-[#171717]"}`}>
      {!isAuthPage && <Navbar />}
      <AppRoutes />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;