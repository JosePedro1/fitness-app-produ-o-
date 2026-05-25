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

console.log('=== INICIANDO SERVIDOR ===');
console.log('EMAIL_USER:', process.env.EMAIL_USER ?? 'NÃO DEFINIDO');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'DEFINIDO' : 'NÃO DEFINIDO');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ?? 'NÃO DEFINIDO');

const app = new Hono();

app.use('*', cors({
  origin: [
    'http://localhost:4200',
    'http://localhost:8080',
    'https://fitness-app-produ-o.vercel.app'
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
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