import { ErrorRequestHandler } from 'express';
import { isHttpError } from 'http-errors';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.log('--- ERROR:', err);

  if (isHttpError(err)) {
    res.status(err.statusCode || 500).json({
      status: err.statusCode || 500,
      message: err.message,
      data: err,
    });
    return;
  }

  res.status(500).json({
    status: 500,
    message: 'Something went wrong',
    data: err instanceof Error ? err.message : 'Unknown error',
  });
};
