import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock } from "lucide-react";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import AuthInput from "../../components/AuthLayout/AuthInput";
import axios from "axios";

const api = axios.create({ baseURL: "https://fitness-app-produ-o.onrender.com" });

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [form, setForm] = useState({ password: "", passwordConfirm: "" });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!form.password || form.password.length < 6) newErrors.password = "Mínimo 6 caracteres.";
    if (form.password !== form.passwordConfirm) newErrors.passwordConfirm = "As senhas não coincidem.";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password: form.password });
      showToast("Senha redefinida com sucesso!");
      setTimeout(() => navigate("/login"), 2000);
    } catch {
      showToast("Link inválido ou expirado.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#171717]">
        <p className="text-red-400">Link inválido. Solicite uma nova recuperação de senha.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {toast && (
        <div className={`fixed top-5 right-5 left-5 sm:left-auto sm:max-w-sm z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium break-words transition-all duration-300 ${toast.type === "error" ? "bg-red-500" : "bg-[#7001FD]"}`}>
          {toast.message}
        </div>
      )}
      <AuthLayout
        title="Redefinir senha"
        primaryBtnText={loading ? "Salvando..." : "Salvar nova senha"}
        secondaryBtnText="Voltar ao login"
        onSubmit={handleSubmit}
        onNavigate={() => navigate("/login")}
        disablePrimaryBtn={loading}
      >
        <AuthInput label="Nova senha" type="password" name="password" value={form.password} onChange={handleChange} icon={Lock} error={errors.password} />
        <AuthInput label="Confirmar nova senha" type="password" name="passwordConfirm" value={form.passwordConfirm} onChange={handleChange} icon={Lock} error={errors.passwordConfirm} />
      </AuthLayout>
    </div>
  );
};

export default ResetPasswordPage;