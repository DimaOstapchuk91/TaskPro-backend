import { Router } from 'express';
import express from 'express';
import { authenticate } from '../middlewares/authenticate';
import { validateBody } from '../middlewares/validateBody';
import { ctrlWrapper } from '../utils/ctrlWrapper';
import {
  createBoardController,
  deleteBoardController,
  getBoardsController,
  getOneBoardController,
  updateBoardController,
} from '../controllers/boards';
import { boardSchema } from '../validation/boards';
import {
  createColumnController,
  deleteColumnController,
  updateColumnController,
} from '../controllers/columns';
import {
  createTaskController,
  deleteTaskController,
  moveTaskController,
  updateTaskController,
} from '../controllers/tasks';
import { columnSchema } from '../validation/columns';
import { taskSchema } from '../validation/tasks';

const jsonParser = express.json();

const router = Router();

//================================================================Boards route<<<<

router.get('/', authenticate, ctrlWrapper(getBoardsController));

router.get('/:boardId', authenticate, ctrlWrapper(getOneBoardController));

router.post(
  '/',
  authenticate,
  jsonParser,
  validateBody(boardSchema),
  ctrlWrapper(createBoardController),
);

router.patch(
  '/:boardId',
  authenticate,
  jsonParser,
  validateBody(boardSchema),
  ctrlWrapper(updateBoardController),
);

router.delete('/:boardId', authenticate, ctrlWrapper(deleteBoardController));

//================================================================Column Routes<<<<

router.post(
  '/:boardId/columns/',
  authenticate,
  jsonParser,
  validateBody(columnSchema),
  ctrlWrapper(createColumnController),
);

router.patch(
  '/:boardId/columns/:id',
  authenticate,
  jsonParser,
  validateBody(columnSchema),
  ctrlWrapper(updateColumnController),
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
  validateBody(taskSchema),
  ctrlWrapper(createTaskController),
);

router.patch(
  '/:boardId/columns/:columnId/task/:id',
  authenticate,
  jsonParser,
  validateBody(taskSchema),
  ctrlWrapper(updateTaskController),
);

router.patch(
  '/:boardId/columns/:columnId/tasks/:id/move',
  authenticate,
  jsonParser,
  // validateBody(taskSchema)
  ctrlWrapper(moveTaskController),
);

router.delete(
  '/:boardId/columns/:columnId/task/:id',
  authenticate,
  ctrlWrapper(deleteTaskController),
);

export default router;
