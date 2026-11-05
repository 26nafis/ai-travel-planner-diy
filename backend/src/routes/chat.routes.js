import { Router } from 'express';
import * as c from '../controllers/chat.controller.js';

const r = Router();
r.post('/', c.send);
export default r;
