import { Hono } from 'hono';
import { getCalendar, createCalendar, patchCalendar, deleteCalendar } from '../controllers/calendarController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const calendarRoutes = new Hono();

calendarRoutes.use('*', authenticate);

calendarRoutes.get('/',       getCalendar);
calendarRoutes.post('/',      createCalendar);   // INSERT — não mais upsert
calendarRoutes.patch('/:id',  patchCalendar);
calendarRoutes.delete('/:id', deleteCalendar);

export default calendarRoutes;
