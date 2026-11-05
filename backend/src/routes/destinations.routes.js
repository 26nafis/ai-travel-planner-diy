import { Router } from 'express';
import * as c from '../controllers/destinations.controller.js';

const r = Router();
r.get('/', c.list);
export default r;
