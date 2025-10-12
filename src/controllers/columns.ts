import { Request, Response } from 'express';

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
