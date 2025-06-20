import { Request, Response, NextFunction, RequestHandler } from 'express';

export const ctrlWrapper = (controller: RequestHandler) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await controller(req, res, next);
    } catch (err) {
      next(err);
    }
  };
};
