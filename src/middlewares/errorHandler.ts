import { HttpError } from 'http-errors';
import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      status: err.status,
      message: err.name,
      data: err,
    });
    return;
  }

  const message =
    err &&
    typeof err === 'object' &&
    'message' in err &&
    typeof (err as any).message === 'string'
      ? (err as any).message
      : 'Unknown error';

  res.status(500).json({
    status: 500,
    message: 'Something went wrong',
    data: message,
  });
};
