import createHttpError from 'http-errors';
import { Request, Response, NextFunction } from 'express';

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  next(createHttpError(404, 'Route not found'));
};
