import { Router } from 'express';
import express from 'express';
import { authenticate } from '../middlewares/authenticate';
import { validateBody } from '../middlewares/validateBody';
import { ctrlWrapper } from '../utils/ctrlWrapper';
import {
  createBoardController,
  createColumnController,
  createTaskController,
  deleteColumnController,
  deleteTaskController,
  deletetBoardController,
  editBoardController,
  editColumnController,
  editTaskController,
  getBoardsController,
  getOneBoardsController,
} from '../controllers/boards';
import { createBoardSchema, editBoardSchema } from '../validation/boards';

const jsonParser = express.json();

const router = Router();

//================================================================Boards route<<<<

router.get('/', authenticate, ctrlWrapper(getBoardsController));

router.get('/:boardId', authenticate, ctrlWrapper(getOneBoardsController));

router.post(
  '/',
  authenticate,
  jsonParser,
  validateBody(createBoardSchema),
  ctrlWrapper(createBoardController),
);
router.patch(
  '/:boardId',
  authenticate,
  jsonParser,
  validateBody(editBoardSchema),
  ctrlWrapper(editBoardController),
);

router.delete('/:boardId', authenticate, ctrlWrapper(deletetBoardController));

//================================================================Column Routes<<<<

router.post(
  '/:boardId/columns/',
  authenticate,
  jsonParser,
  // validateBody(),
  ctrlWrapper(createColumnController),
);

router.patch(
  '/:boardId/columns/:id',
  authenticate,
  jsonParser,
  // validateBody(),
  ctrlWrapper(editColumnController),
);

router.delete(
  '/:boardId/columns/:id',
  authenticate,
  ctrlWrapper(deleteColumnController),
);

//================================================================Task Routes<<<

router.post(
  '/:boardId/columns/:columnId/tasks/',
  authenticate,
  jsonParser,
  // validateBody(),
  ctrlWrapper(createTaskController),
);

router.patch(
  '/:boardId/columns/:columnId/task/:id',
  authenticate,
  jsonParser,
  // validateBody(),
  ctrlWrapper(editTaskController),
);

router.delete(
  '/:boardId/columns/:columnId/task/:id',
  authenticate,
  ctrlWrapper(deleteTaskController),
);

export default router;
