// src/routes/nutritionRoutes.js
import { Hono } from 'hono';
import { generate, getUsage, getHistory } from '../controllers/nutritionController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const nutritionRoutes = new Hono();

nutritionRoutes.post('/generate', authenticate, generate);
nutritionRoutes.get('/usage',    authenticate, getUsage);
nutritionRoutes.get('/history',  authenticate, getHistory);

export default nutritionRoutes;