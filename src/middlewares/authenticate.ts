import createHttpError from 'http-errors';
import { pool } from '../db/db';
import { Request, Response, NextFunction } from 'express';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
      next(createHttpError(401, 'The authorization header is missing'));
      return;
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      next(createHttpError(401, 'Auth header should be of type Bearer'));
      return;
    }

    const session = await pool.query(
      'SELECT * FROM sessions WHERE access_token = $1',
      [token],
    );

    if (session.rowCount === 0) {
      next(createHttpError(401, 'Session not found'));
      return;
    }

    const isAccessTokenExpired =
      new Date() > new Date(session.rows[0].access_token_valid_until);

    if (isAccessTokenExpired) {
      next(createHttpError(401, 'Access token expired'));
      return;
    }

    const user = await pool.query('SELECT id FROM users WHERE id = $1', [
      session.rows[0].user_id,
    ]);

    if (user.rowCount === 0) {
      next(createHttpError(401, 'User not found'));
      return;
    }

    req.user = user.rows[0];

    next();
  } catch (error) {
    next(error);
  }
};
