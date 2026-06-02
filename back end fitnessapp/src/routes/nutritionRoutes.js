import { Hono } from 'hono';
import { generate, generatePremium, addToRoutine, getMe, getUsage, getHistory } from '../controllers/nutritionController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const nutritionRoutes = new Hono();

nutritionRoutes.get('/me',                authenticate, getMe);
nutritionRoutes.post('/generate',         authenticate, generate);
nutritionRoutes.post('/generate-premium', authenticate, generatePremium);
nutritionRoutes.post('/add-to-routine',   authenticate, addToRoutine);
nutritionRoutes.get('/usage',             authenticate, getUsage);
nutritionRoutes.get('/history',           authenticate, getHistory);

export default nutritionRoutes;