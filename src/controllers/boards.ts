import { Request, Response } from 'express';
import { createBoard, editBoard, getUserBoards } from '../services/boards';
import { CreateBoardBody } from '../types/boards.types';
import createHttpError from 'http-errors';

export const getBoardsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
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

export const getOneBoardsController = async (req: Request, res: Response) => {
  res.status(200).json({
    status: 200,
    message: 'Successfully get user boards',
    data: boards,
  });
};

export const createBoardController = async (
  req: Request<{}, {}, CreateBoardBody>,
  res: Response,
): Promise<void> => {
  console.log('test req', req.user);
  const board = await createBoard(req.body.title, req.user.id);

  res.status(201).json({
    status: 201,
    message: 'Create board successfully ',
    data: board,
  });
};

export const editBoardController = async (req: Request, res: Response) => {
  const boardId = Number(req.params.boardId);

  if (isNaN(boardId)) throw createHttpError(400, 'Invalid boardId');

  const board = await editBoard(boardId, req.body.title, req.user.id);

  res.status(200).json({
    status: 200,
    message: 'Edit board successfully ',
    data: board,
  });
};

export const deletetBoardController = async (req: Request, res: Response) => {
  res.status(200).json({
    status: 200,
    message: 'Edit board successfully ',
    data: board,
  });
};

export const createColumnController = async (req: Request, res: Response) => {
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

export const createTaskController = async (req: Request, res: Response) => {
  res.status(200).json({
    status: 200,
    message: 'Create task successfully ',
    data: task,
  });
};

export const editTaskController = async (req: Request, res: Response) => {
  res.status(200).json({
    status: 200,
    message: 'Edit task successfully ',
    data: task,
  });
};

export const deleteTaskController = async (req: Request, res: Response) => {
  res.status(200).json({
    status: 200,
    message: 'Delete task successfully ',
    data: task,
  });
};
