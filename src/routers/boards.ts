import { Router } from 'express';
import express from 'express';
import { authenticate } from '../middlewares/authenticate';
import { validateBody } from '../middlewares/validateBody';
import { ctrlWrapper } from '../utils/ctrlWrapper';
import { createBoardController } from '../controllers/boards';

const jsonParser = express.json();

const router = Router();

router.post(
  '/create',
  jsonParser,
  authenticate,
  //   validateBody(registerSchema),
  ctrlWrapper(createBoardController),
);

export default router;
