import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as c from '../controllers/auth.controller.js';

const r = Router();
r.patch('/', requireAuth, c.updateProfile);
export default r;
