import { Hono } from 'hono';
import { register, login, validate, logout } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const authRoutes = new Hono();

authRoutes.post('/register', register);

authRoutes.post('/login', login);

authRoutes.get('/validate', authenticate, validate);

authRoutes.post('/logout', logout);

export default authRoutes;
