import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import authRoutes from './src/routes/authRoutes.js';
import routineRoutes from './src/routes/routineRoutes.js';
import exerciseRoutes from './src/routes/exerciseRoutes.js';
import progressRoutes from './src/routes/progressRoutes.js';
import taskRoutes from './src/routes/taskRoutes.js';
import { checkTasksDeadlines } from './src/services/taskNotifier.js';

import 'dotenv/config';

const app = new Hono();

app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:8080'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.route('/auth', authRoutes);
app.route('/routines', routineRoutes);
app.route('/exercises', exerciseRoutes);
app.route('/progress', progressRoutes);
app.route('/tasks', taskRoutes);

app.get('/', (c) => {
  return c.text('Bem-vindo ao Fitness App Backend!');
});

console.log('começando verificação automática de prazos');
checkTasksDeadlines();

const port = 3000;
serve({
  fetch: app.fetch,
  port,
});

console.log(`Servidor rodando na porta ${port}`);
