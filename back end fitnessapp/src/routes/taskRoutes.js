import { Hono } from 'hono';
import { getTasks, addTask, updateTask, deleteTask } from '../controllers/taskController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const taskRoutes = new Hono();

taskRoutes.use('*', authenticate);

taskRoutes.get('/', getTasks);
// taskRoutes.get('/:id', getTaskById);
taskRoutes.post('/', addTask);
taskRoutes.put('/:id', updateTask);
taskRoutes.delete('/:id', deleteTask);

export default taskRoutes;
