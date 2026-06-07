import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import 'dotenv/config';

import authRoutes        from './src/routes/authRoutes.js';
import routineRoutes     from './src/routes/routineRoutes.js';
import exerciseRoutes    from './src/routes/exerciseRoutes.js';
import progressRoutes    from './src/routes/progressRoutes.js';
import calendarRoutes    from './src/routes/calendarRoutes.js';
import adminRoutes       from './src/routes/adminRoutes.js';
import nutritionRoutes   from './src/routes/nutritionRoutes.js';
import academyRoutes     from './src/routes/academyRoutes.js';

import { startSchedulers } from './src/services/scheduler.js';

const ALLOWED_ORIGINS = [
  'http://localhost:4200',
  'http://localhost:5173',
  'http://localhost:8080',
  'https://fitness-app-produ-o.vercel.app',
];

const app = new Hono();

app.use('*', cors({
  origin: ALLOWED_ORIGINS,
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-admin-password', 'x-auto-join'],
  credentials: true,
}));

app.get('/', (c) => c.json({ status: 'ok', message: 'Fitness App Backend' }));

app.route('/auth',        authRoutes);
app.route('/routines',    routineRoutes);
app.route('/exercises',   exerciseRoutes);
app.route('/progress',    progressRoutes);
app.route('/calendar',    calendarRoutes);
app.route('/admin',       adminRoutes);
app.route('/nutrition',   nutritionRoutes);

app.route('/',            academyRoutes);

startSchedulers();

const port = Number(process.env.PORT) || 3000;
serve({ fetch: app.fetch, port });
console.log(`Servidor rodando na porta ${port}`);