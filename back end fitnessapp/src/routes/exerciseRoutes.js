import { Hono } from 'hono';
import { postExercise, getExercises, putExercise, getExercisesByRoutine } from '../controllers/exerciseController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const exerciseRoutes = new Hono();

exerciseRoutes.use('*', authenticate);

exerciseRoutes.post('/', postExercise);
exerciseRoutes.get('/', getExercises);
exerciseRoutes.get('/routine/:routine_id', getExercisesByRoutine);
exerciseRoutes.put('/:id', putExercise);    

export default exerciseRoutes;
