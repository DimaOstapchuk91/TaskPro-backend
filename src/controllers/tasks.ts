import { Request, Response } from 'express';
import {
  createTask,
  deleteTask,
  moveTaskService,
  updateTask,
} from '../services/tasks';
import { withTransaction } from '../utils/withTransactionWrapper';
import createHttpError from 'http-errors';

// ========================================================== CREATE TASK >>>

export const createTaskController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const boardId = Number(req.params.boardId);
  const columnId = Number(req.params.columnId);

  if (isNaN(boardId)) throw createHttpError(400, 'Invalid boardId');
  if (isNaN(columnId)) throw createHttpError(400, 'Invalid columnId');

  const task = await withTransaction((client) =>
    createTask(client, req.body, columnId, boardId, req.user.id),
  );

  res.status(201).json({
    status: 201,
    message: 'Create task successfully ',
    data: task,
  });
};

// ========================================================== UPDATE TASK >>>

export const updateTaskController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const boardId = Number(req.params.boardId);
  const columnId = Number(req.params.columnId);
  const taskId = Number(req.params.id);

  if (isNaN(boardId)) throw createHttpError(400, 'Invalid boardId');
  if (isNaN(columnId)) throw createHttpError(400, 'Invalid columnId');
  if (isNaN(taskId)) throw createHttpError(400, 'Invalid taskId');

  const task = await withTransaction((client) =>
    updateTask(client, req.body, columnId, boardId, req.user.id, taskId),
  );

  res.status(200).json({
    status: 200,
    message: 'Edit task successfully ',
    data: task,
  });
};

// ============================================================ MOVE TASK >>>

export const moveTaskController = async (req: Request, res: Response) => {
  const taskId = Number(req.params.id);
  const sourceColumnId = Number(req.params.columnId);
  const { destinationColumnId, oldPosition, newPosition } = req.body;

  if (isNaN(taskId)) throw createHttpError(400, 'Invalid taskId');

  const result = await withTransaction((client) =>
    moveTaskService(client, taskId, {
      sourceColumnId,
      destinationColumnId,
      oldPosition,
      newPosition,
    }),
  );

  res.status(200).json({
    status: 200,
    message: 'Task moved successfully',
    data: result,
  });
};

// ============================================================ DELETE TASK <<<

export const deleteTaskController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const boardId = Number(req.params.boardId);
  const columnId = Number(req.params.columnId);
  const taskId = Number(req.params.id);

  if (isNaN(boardId)) throw createHttpError(400, 'Invalid boardId');
  if (isNaN(columnId)) throw createHttpError(400, 'Invalid columnId');
  if (isNaN(taskId)) throw createHttpError(400, 'Invalid taskId');

  const deleted = await withTransaction((client) =>
    deleteTask(client, columnId, boardId, req.user.id, taskId),
  );

  res.status(200).json({
    status: 200,
    message: 'Delete task successfully ',
    data: deleted,
  });
};
