import { Request, Response } from 'express';

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
