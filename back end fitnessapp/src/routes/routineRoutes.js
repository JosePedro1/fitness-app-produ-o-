import { Hono } from 'hono';
import { createRoutine, getRoutines, deleteRoutine } from '../controllers/routineController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const routineRoutes = new Hono();

routineRoutes.use('*', authenticate);

routineRoutes.post('/', createRoutine);
routineRoutes.get('/', getRoutines);
routineRoutes.delete('/:id', deleteRoutine);

export default routineRoutes;
