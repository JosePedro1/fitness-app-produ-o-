import { Hono } from 'hono';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  getProgram,
  updateProgram,
  getDayByWeekday,
  updateDay,
  addExerciseToDay,
  updateExercise,
  deleteExercise,
  completeDay,
  getCustomExercises,
  createCustomExercise,
  deleteCustomExercise,
  getRoutines,   // retrocompatibilidade
} from '../controllers/routineController.js';

const routineRoutes = new Hono();

routineRoutes.use('*', authenticate);

// ── Programa semanal ──────────────────────────────────────────
routineRoutes.get('/program',         getProgram);
routineRoutes.patch('/program',       updateProgram);

// ── Dias da semana ───────────────────────────────────────────
routineRoutes.get('/day/:weekday',         getDayByWeekday);
routineRoutes.put('/day/:weekday',         updateDay);
routineRoutes.post('/day/:weekday/exercise', addExerciseToDay);
routineRoutes.post('/day/:weekday/complete', completeDay);

// ── Exercícios ───────────────────────────────────────────────
routineRoutes.patch('/exercise/:id',  updateExercise);
routineRoutes.delete('/exercise/:id', deleteExercise);

// ── Exercícios customizados ──────────────────────────────────
routineRoutes.get('/custom-exercises',     getCustomExercises);
routineRoutes.post('/custom-exercises',    createCustomExercise);
routineRoutes.delete('/custom-exercises/:id', deleteCustomExercise);

// ── Retrocompatibilidade (NutritionPage usa GET /routines) ───
routineRoutes.get('/', getRoutines);

export default routineRoutes;