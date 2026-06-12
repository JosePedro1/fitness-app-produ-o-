// src/routes/authRoutes.js
import { Hono } from 'hono';
import {
  register,
  login,
  validate,
  logout,
  forgotPassword,
  resetPassword,
  googleLogin,          // ← NOVO
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const authRoutes = new Hono();
authRoutes.post('/register',        register);
authRoutes.post('/login',           login);
authRoutes.get('/validate',         authenticate, validate);
authRoutes.post('/logout',          logout);
authRoutes.post('/forgot-password', forgotPassword);
authRoutes.post('/reset-password',  resetPassword);
authRoutes.post('/google',          googleLogin);  // ← NOVO: processa o login/cadastro com Google

// ← NOVO: endpoint público que entrega o Client ID pro frontend
// O Client ID do Google não é um segredo (aparece em qualquer rede request),
// mas expor via backend evita hardcode no código-fonte e alertas do GitHub.
authRoutes.get('/google/config', (c) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return c.json({ error: 'GOOGLE_CLIENT_ID não configurado no servidor.' }, 500);
  }
  return c.json({ clientId });
});

export default authRoutes;