import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as c from '../controllers/trips.controller.js';

const r = Router();
r.use(requireAuth);
r.post('/generate', c.generate);
r.get('/', c.list);
r.get('/:id', c.get);
r.put('/:id', c.update);
r.post('/:id/save', c.save);
r.post('/:id/regenerate', c.regenerate);
r.delete('/:id', c.remove);
export default r;
