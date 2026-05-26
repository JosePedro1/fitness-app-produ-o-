import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import AuthInput from "../../components/AuthLayout/AuthInput";
import axios from "axios";

const api = axios.create({ baseURL: "https://fitness-app-produ-o.onrender.com" });

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Digite um e-mail válido.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      showToast("Se o e-mail existir, você receberá as instruções em breve.");
      setTimeout(() => navigate("/login"), 3000);
    } catch {
      showToast("Erro ao enviar. Tente novamente.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-300 ${toast.type === "error" ? "bg-red-500" : "bg-[#7001FD]"}`}>
          {toast.message}
        </div>
      )}
      <AuthLayout
        title="Recuperar senha"
        primaryBtnText={loading ? "Enviando..." : "Enviar instruções"}
        secondaryBtnText="Voltar ao login"
        onSubmit={handleSubmit}
        onNavigate={() => navigate("/login")}
        disablePrimaryBtn={loading}
      >
        <p className="text-sm text-gray-500 text-center -mt-2 mb-1">
          Digite seu e-mail e enviaremos um link para redefinir sua senha.
        </p>
        <AuthInput
          label="E-mail"
          type="email"
          name="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(""); }}
          placeholder="seu@email.com"
          icon={Mail}
          error={error}
        />
      </AuthLayout>
    </div>
  );
};

export default ForgotPasswordPage;