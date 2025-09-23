import { Router } from 'express';
import express from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper';
import { getBackgroundsController } from '../controllers/resources';

const jsonParser = express.json();

const router = Router();

router.get('/icons', ctrlWrapper(getBackgroundsController));

export default router;
