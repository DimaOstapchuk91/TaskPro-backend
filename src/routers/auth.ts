import { Router } from 'express';
import express from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  loginSchema,
  registerSchema,
  updateUserSchema,
} from '../validation/auth.js';
import {
  getUserController,
  loginUserController,
  logoutUserController,
  refreshUserSessionController,
  registerUserController,
  updateUserController,
} from '../controllers/auth.js';
import { authenticate } from '../middlewares/authenticate.js';
import { upload } from '../middlewares/upload.js';

const jsonParser = express.json();

const router = Router();

router.post(
  '/register',
  jsonParser,
  validateBody(registerSchema),
  ctrlWrapper(registerUserController),
);

router.post(
  '/login',
  jsonParser,
  validateBody(loginSchema),
  ctrlWrapper(loginUserController),
);

router.get('/profile', authenticate, ctrlWrapper(getUserController));

router.post('/refresh', ctrlWrapper(refreshUserSessionController));
router.post('/logout', ctrlWrapper(logoutUserController));
router.patch(
  '/profile',
  authenticate,
  upload.single('avatar'),
  validateBody(updateUserSchema),
  ctrlWrapper(updateUserController),
);

export default router;
