import { Router } from 'express';
import express from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper';
import { validateBody } from '../middlewares/validateBody';
import { authSchema } from '../validation/auth';
import {
  loginUserController,
  registerUserController,
} from '../controllers/auth';

const jsonParser = express.json();

const router = Router();

router.post(
  '/register',
  jsonParser,
  validateBody(authSchema),
  ctrlWrapper(registerUserController),
);

router.post(
  '/login',
  jsonParser,
  validateBody(authSchema),
  ctrlWrapper(loginUserController),
);

export default router;
