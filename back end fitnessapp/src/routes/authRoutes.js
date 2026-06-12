// src/routes/authRoutes.js
import { Hono } from 'hono';
import {
  register,
  login,
  validate,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  googleLogin,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const authRoutes = new Hono();

authRoutes.post('/register',          register);
authRoutes.post('/login',             login);
authRoutes.get('/validate',           authenticate, validate);
authRoutes.post('/logout',            logout);
authRoutes.post('/forgot-password',   forgotPassword);
authRoutes.post('/reset-password',    resetPassword);
authRoutes.get('/verify-email',       verifyEmail);   // GET /auth/verify-email?token=xxx
authRoutes.post('/google',            googleLogin);

// Endpoint público que entrega o Client ID do Google para o frontend
authRoutes.get('/google/config', (c) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return c.json({ error: 'GOOGLE_CLIENT_ID não configurado no servidor.' }, 500);
  }
  return c.json({ clientId });
});

export default authRoutes;