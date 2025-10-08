import { Router } from 'express';
import authRouter from './auth.js';
import boardsRouter from './boards.js';
import resourcesRouter from './resources.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/boards', boardsRouter);
router.use('/resources', resourcesRouter);

export default router;
