import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import authRoutes from './src/routes/authRoutes.js';
import routineRoutes from './src/routes/routineRoutes.js';
import exerciseRoutes from './src/routes/exerciseRoutes.js';
import progressRoutes from './src/routes/progressRoutes.js';
import taskRoutes from './src/routes/taskRoutes.js';
import calendarRoutes from './src/routes/calendarRoutes.js'; // ← novo
import { checkTasksDeadlines } from './src/services/taskNotifier.js';
import 'dotenv/config';
import adminRoutes from './src/routes/adminRoutes.js';  // ← adiciona
import nutritionRoutes from './src/routes/nutritionRoutes.js';





const app = new Hono();

app.use('*', cors({
  origin: [
    'http://localhost:4200',
    'http://localhost:8080',
    'https://fitness-app-produ-o.vercel.app'
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-admin-password'],
  credentials: true,
}));

app.route('/auth', authRoutes);
app.route('/routines', routineRoutes);
app.route('/exercises', exerciseRoutes);
app.route('/progress', progressRoutes);
app.route('/tasks', taskRoutes);
app.route('/calendar', calendarRoutes); // ← novo
app.route('/admin', adminRoutes); 

app.use('/nutrition', authenticate); // protege com o middleware existente
app.route('/nutrition', nutritionRoutes);


app.get('/', (c) => {
  return c.text('Bem-vindo ao Fitness App Backend!');
});

checkTasksDeadlines();

const port = 3000;
serve({ fetch: app.fetch, port });

console.log(`Servidor rodando na porta ${port}`);
