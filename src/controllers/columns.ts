import { Request, Response } from 'express';
import { createColumn, dellColumn, editColumn } from '../services/columns';
import createHttpError from 'http-errors';
import { withTransaction } from '../utils/withTransactionWrapper';

export const createColumnController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const boardId = Number(req.params.boardId);

  if (isNaN(boardId)) throw createHttpError(400, 'Invalid boardId');

  const column = await withTransaction((client) =>
    createColumn(client, req.body.title, boardId, req.user.id),
  );

  res.status(201).json({
    status: 201,
    message: 'Create column successfully ',
    data: column,
  });
};

export const editColumnController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const boardId = Number(req.params.boardId);
  const columnId = Number(req.params.id);

  if (isNaN(boardId)) throw createHttpError(400, 'Invalid boardId');

  const column = await withTransaction((client) =>
    editColumn(client, req.body.title, boardId, req.user.id, columnId),
  );

  res.status(200).json({
    status: 200,
    message: 'Edit column successfully ',
    data: column,
  });
};

export const deleteColumnController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const boardId = Number(req.params.boardId);
  const columnId = Number(req.params.id);

  if (isNaN(boardId)) throw createHttpError(400, 'Invalid boardId');
  if (isNaN(columnId)) throw createHttpError(400, 'Invalid columnId');

  const deletedColumn = await withTransaction((client) =>
    dellColumn(client, boardId, req.user.id, columnId),
  );

  res.status(200).json({
    status: 200,
    message: 'Delete column successfully ',
    data: deletedColumn,
  });
};
