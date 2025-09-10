import createHttpError from 'http-errors';
import { pool } from '../db/db';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { THIRTY_DAY, TWO_HOURS } from '../constans/constans';
import {
  LoginPayload,
  RegisterPayload,
  ResponseLogin,
  ResponseUser,
  Session,
} from '../types/auth.types';

export const registerUser = async (
  payload: RegisterPayload,
): Promise<ResponseUser> => {
  const checkUser = await pool.query<{ exists: boolean }>(
    'SELECT EXISTS (SELECT 1 FROM users WHERE email = $1) AS "exists"',
    [payload.email],
  );

  if (checkUser.rows[0].exists) {
    throw createHttpError(409, 'Email in use');
  }

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  const user = await pool.query<ResponseUser>(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING name, email',
    [payload.name, payload.email, encryptedPassword],
  );

  return user.rows[0];
};

//=====================================================================

export const createSession = async (userId: string) => {
  const result = await pool.query<Session>(
    `INSERT INTO sessions
      (user_id, access_token, refresh_token, access_token_valid_until, refresh_token_valid_until)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, access_token, refresh_token`,
    [
      userId,
      randomBytes(30).toString('base64'),
      randomBytes(30).toString('base64'),
      new Date(Date.now() + TWO_HOURS),
      new Date(Date.now() + THIRTY_DAY),
    ],
  );

  return result.rows[0];
};

//=====================================================================

export const loginUser = async (
  payload: LoginPayload,
): Promise<ResponseLogin> => {
  const user = await pool.query('SELECT * FROM users WHERE email = $1', [
    payload.email,
  ]);

  if (user.rowCount === 0) {
    throw createHttpError(404, 'Authentication failed. No such user exists');
  }

  const isPasswordMatch = await bcrypt.compare(
    payload.password,
    user.rows[0].password,
  );

  if (!isPasswordMatch)
    throw createHttpError(401, 'Authentication failed. Invalid password');

  const newSession = await createSession(user.rows[0].id);

  return {
    id: user.rows[0].id,
    accessToken: newSession.access_token,
    refreshToken: newSession.refresh_token,
  };
};
