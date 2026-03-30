import { Router } from 'express';
import express from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { getBackgroundsController } from '../controllers/resources.js';

const jsonParser = express.json();

const router = Router();

router.get('/icons', ctrlWrapper(getBackgroundsController));

export default router;
