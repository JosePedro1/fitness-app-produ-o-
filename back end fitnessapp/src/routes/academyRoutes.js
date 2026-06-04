/**
 * academyRoutes.js
 * Conecte ao index.js com:
 *   import academyRoutes from './src/routes/academyRoutes.js';
 *   app.route('/ranking',   academyRoutes);
 *   app.route('/profile',   academyRoutes);
 *   app.route('/academies', academyRoutes);
 */

import { Hono } from 'hono';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  getRanking,
  getProfile,
  updateProfile,
  joinAcademy,
  listAcademies,
  createAcademy,
  deleteAcademy,
} from '../controllers/academyController.js';

/** Helper para validação de admin (reutiliza lógica do adminRoutes) */
const requireAdmin = (c) => {
  const pwd = c.req.header('x-admin-password');
  return !!(process.env.ADMIN_PASSWORD && pwd === process.env.ADMIN_PASSWORD);
};

const academyRoutes = new Hono();

// ── PÚBLICAS (sem auth) ───────────────────────────────────────────────────────
// GET /ranking/:slug — página pública do ranking da academia
academyRoutes.get('/ranking/:slug', getRanking);

// ── AUTENTICADAS ──────────────────────────────────────────────────────────────
academyRoutes.use('/profile/*', authenticate);
academyRoutes.use('/academies', authenticate);

// Perfil do usuário
academyRoutes.get('/profile',            getProfile);
academyRoutes.put('/profile',            updateProfile);
academyRoutes.post('/profile/join/:slug', joinAcademy);

// Listar academias (para o select no perfil)
academyRoutes.get('/academies', listAcademies);

// ── ADMIN ─────────────────────────────────────────────────────────────────────
academyRoutes.post('/admin/academies', async (c) => {
  if (!requireAdmin(c)) return c.json({ error: 'Não autorizado.' }, 401);
  return createAcademy(c);
});

academyRoutes.delete('/admin/academies/:id', async (c) => {
  if (!requireAdmin(c)) return c.json({ error: 'Não autorizado.' }, 401);
  return deleteAcademy(c);
});

export default academyRoutes;
