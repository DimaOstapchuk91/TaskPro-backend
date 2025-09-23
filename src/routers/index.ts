import { Router } from 'express';
import authRouter from './auth.js';
import resourcesRouter from './resources.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/resources', resourcesRouter);

export default router;
