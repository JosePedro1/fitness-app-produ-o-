import React, { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { validateToken, removeAuthToken } from "../services/api-login";

const PrivateRoute = () => {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isValid = await validateToken();
        console.log("Token válido?", isValid);

        if (!isValid) {
          removeAuthToken();
        }

        setIsAuthenticated(isValid);
      } catch (error) {
        console.error("Erro ao validar token:", error);
        removeAuthToken();
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#171717]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#7001FD] border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400 text-sm">Verificando autenticação...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("Usuário não autenticado. Redirecionando para /login");
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
