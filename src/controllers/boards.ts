import { Request, Response } from 'express';
import {
  createBoard,
  deleteBoard,
  getOneBoards,
  getUserBoards,
  updateBoard,
} from '../services/boards';
import createHttpError from 'http-errors';
import { withTransaction } from '../utils/withTransactionWrapper';

export const getBoardsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log('Тест запита контроллер');
  const boards = await getUserBoards(req.user.id);

  if (!boards.length) {
    return void res.status(200).json({
      status: 200,
      message: "You don't have any boards yet.",
      data: [],
    });
  }

  res.status(200).json({
    status: 200,
    message: 'Successfully get user boards',
    data: boards,
  });
};

export const getOneBoardController = async (req: Request, res: Response) => {
  const boardId = Number(req.params.boardId);

  if (isNaN(boardId)) throw createHttpError(400, 'Invalid boardId');

  const board = await withTransaction((client) =>
    getOneBoards(client, boardId, req.user.id),
  );

  res.status(200).json({
    status: 200,
    message: 'Successfully get user boards',
    data: board,
  });
};

export const createBoardController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const board = await withTransaction((client) =>
    createBoard(client, req.body, req.user.id),
  );

  res.status(201).json({
    status: 201,
    message: 'Create board successfully',
    data: board,
  });
};

export const updateBoardController = async (req: Request, res: Response) => {
  const boardId = Number(req.params.boardId);

  if (isNaN(boardId)) throw createHttpError(400, 'Invalid boardId');

  const board = await withTransaction((client) =>
    updateBoard(client, boardId, req.body, req.user.id),
  );

  res.status(200).json({
    status: 200,
    message: 'Edit board successfully ',
    data: board,
  });
};

export const deleteBoardController = async (req: Request, res: Response) => {
  const boardId = Number(req.params.boardId);

  if (isNaN(boardId)) throw createHttpError(400, 'Invalid boardId');

  const board = await withTransaction((client) =>
    deleteBoard(client, boardId, req.user.id),
  );

  res.status(200).json({
    status: 200,
    message: 'Board deleted successfully',
    data: board,
  });
};
