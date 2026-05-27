import { Hono } from 'hono';
import { getCalendar, upsertCalendar, deleteCalendar } from '../controllers/calendarController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const calendarRoutes = new Hono();

calendarRoutes.use('*', authenticate);

calendarRoutes.get('/', getCalendar);
calendarRoutes.post('/', upsertCalendar);
calendarRoutes.delete('/:id', deleteCalendar);

export default calendarRoutes;
