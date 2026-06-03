// src/routes/authRoutes.js
import { Hono } from 'hono';
import { register, login, validate, logout, forgotPassword, resetPassword } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const authRoutes = new Hono();
authRoutes.post('/register',       register);
authRoutes.post('/login',          login);
authRoutes.get('/validate',        authenticate, validate);
authRoutes.post('/logout',         logout);
authRoutes.post('/forgot-password', forgotPassword);
authRoutes.post('/reset-password', resetPassword);

export default authRoutes;