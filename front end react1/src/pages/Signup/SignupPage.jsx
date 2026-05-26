import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import AuthInput from "../../components/AuthLayout/AuthInput";
import { registerUser } from "../../services/api-login";

const SignupPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", passwordConfirm: "" });
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
    if (!form.passwordConfirm) newErrors.passwordConfirm = "Confirme sua senha.";
    else if (form.password !== form.passwordConfirm) newErrors.passwordConfirm = "As senhas não coincidem!";
    return newErrors;
  };

  const isFormValid = () => {
    return (
      form.email &&
      /\S+@\S+\.\S+/.test(form.email) &&
      form.password.length >= 6 &&
      form.passwordConfirm.length >= 6 &&
      form.password === form.passwordConfirm
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
      await registerUser({ email: form.email, password: form.password });
      showToast("Cadastro realizado com sucesso!");
      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      console.error("Erro no cadastro:", err);
      const message = err?.response?.data?.error || "Erro inesperado! Tente novamente.";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = () => {
    navigate("/login");
  };

  return (
    <div className="relative">
      {/* Toast notification */}
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
        title="Entre e comece hoje mesmo!"
        primaryBtnText={loading ? "Cadastrando..." : "Criar conta"}
        secondaryBtnText="Entrar"
        onSubmit={handleSubmit}
        onNavigate={handleNavigate}
        disablePrimaryBtn={!isFormValid() || loading}
      >
        <AuthInput
          label="Email"
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
          placeholder="Defina Sua Senha"
          icon={Lock}
          error={errors.password}
        />
        <AuthInput
          label="Confirme Sua Senha"
          type="password"
          name="passwordConfirm"
          value={form.passwordConfirm}
          onChange={handleChange}
          placeholder="Confirme Sua Senha"
          icon={Lock}
          error={errors.passwordConfirm}
        />
      </AuthLayout>
    </div>
  );
};

export default SignupPage;
