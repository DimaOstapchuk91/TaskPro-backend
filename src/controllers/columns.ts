import { Request, Response } from 'express';
import { createColumn } from '../services/columns';
import createHttpError from 'http-errors';

export const createColumnController = async (req: Request, res: Response) => {
  const boardId = Number(req.params.boardId);

  if (isNaN(boardId)) throw createHttpError(400, 'Invalid boardId');

  const column = await createColumn(req.body.title, boardId, req.user.id);

  res.status(200).json({
    status: 200,
    message: 'Create column successfully ',
    data: column,
  });
};

export const editColumnController = async (req: Request, res: Response) => {
  res.status(200).json({
    status: 200,
    message: 'Edit column successfully ',
    data: column,
  });
};

export const deleteColumnController = async (req: Request, res: Response) => {
  res.status(200).json({
    status: 200,
    message: 'Delete column successfully ',
    data: column,
  });
};
