import { Router } from 'express';
import express from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.ts';
import { validateBody } from '../middlewares/validateBody.ts';

const jsonParser = express.json();

const router = Router();

export default router;
