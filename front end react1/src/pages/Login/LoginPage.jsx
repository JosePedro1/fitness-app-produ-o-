import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import AuthInput from "../../components/AuthLayout/AuthInput";
import { loginUser } from "../../services/api-login";

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = "E-mail é obrigatório.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "E-mail inválido.";
    if (!form.password) newErrors.password = "Senha é obrigatória.";
    else if (form.password.length < 6) newErrors.password = "Mínimo 6 caracteres.";
    return newErrors;
  };

  const isFormValid = () => {
    return (
      form.email &&
      /\S+@\S+\.\S+/.test(form.email) &&
      form.password.length >= 6
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await loginUser({ email: form.email, password: form.password });
      showToast("Login realizado com sucesso!");
      setTimeout(() => navigate("/home"), 800);
    } catch (err) {
      console.error("Erro no login:", err);
      showToast("E-mail ou senha incorretos!", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-300 ${
            toast.type === "error" ? "bg-red-500" : "bg-[#7001FD]"
          }`}
        >
          {toast.message}
        </div>
      )}

      <AuthLayout
        title="Faça login em sua conta"
        primaryBtnText={loading ? "Entrando..." : "Entrar"}
        secondaryBtnText="Criar conta"
        onSubmit={handleSubmit}
        onNavigate={() => navigate("/signup")}
        disablePrimaryBtn={!isFormValid() || loading}
      >
        <AuthInput
          label="E-mail"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="seu@email.com"
          icon={Mail}
          error={errors.email}
        />
        <AuthInput
          label="Senha"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="senha"
          icon={Lock}
          error={errors.password}
        />
        <span
          onClick={() => navigate("/forgot-password")}
          className="text-sm text-[#7001FD] cursor-pointer hover:underline self-start"
        >
          Esqueceu sua senha?
        </span>
      </AuthLayout>
    </div>
  );
};

export default LoginPage;