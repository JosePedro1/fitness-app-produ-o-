/**
 * exerciseDbRoutes.js
 * Rota pública (sem autenticação) para o proxy da ExerciseDB.
 */
import { Hono } from 'hono';
import { getExerciseGif } from '../controllers/exerciseDbController.js';

const exerciseDbRoutes = new Hono();

// GET /exercise-db/gif?name=barbell+bench+press
exerciseDbRoutes.get('/gif', getExerciseGif);

export default exerciseDbRoutes;