import createHttpError from 'http-errors';
import { pool } from '../db/db';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { THIRTY_DAY, TWO_HOURS } from '../constans/constans';
import {
  AllSessionData,
  AllUserData,
  LoginPayload,
  RefreshCookies,
  RegisterPayload,
  ResponseLoginSession,
  ResponseUser,
  SessionPart,
} from '../types/auth.types';

// ==========================Register User======================================

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

//=========================Create Session====================================

export const createSession = async (userId: string): Promise<SessionPart> => {
  const result = await pool.query<SessionPart>(
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

//===========================Login User=====================================

export const loginUser = async (
  payload: LoginPayload,
): Promise<ResponseLoginSession> => {
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
    id: newSession.id,
    accessToken: newSession.access_token,
    refreshToken: newSession.refresh_token,
  };
};

// ===========================Refresh Session=====================================

export const updateSession = async (sesionId: string): Promise<SessionPart> => {
  const result = await pool.query<SessionPart>(
    `UPDATE sessions
     SET access_token = $1,
         refresh_token = $2,
         access_token_valid_until = $3,
         refresh_token_valid_until = $4
     WHERE id = $5
     RETURNING id, access_token, refresh_token`,
    [
      randomBytes(30).toString('base64'),
      randomBytes(30).toString('base64'),
      new Date(Date.now() + TWO_HOURS),
      new Date(Date.now() + THIRTY_DAY),
      sesionId,
    ],
  );

  return result.rows[0];
};

export const refreshUserSession = async ({
  sessionId,
  refreshToken,
}: RefreshCookies): Promise<ResponseLoginSession> => {
  const session = await pool.query<AllSessionData>(
    'SELECT * FROM sessions WHERE id = $1 AND refresh_token = $2',
    [sessionId, refreshToken],
  );

  if (session.rowCount === 0)
    throw createHttpError(401, 'Authentication failed. Session not found');

  const isSessionTokenEpired =
    new Date() > new Date(session.rows[0].refresh_token_valid_until);

  if (isSessionTokenEpired) {
    await pool.query('DELETE FROM sessions WHERE id = $1', [sessionId]);
    throw createHttpError(401, 'Authentication failed. Session token expired');
  }
  const updatedSession = await updateSession(sessionId);

  return {
    id: updatedSession.id,
    accessToken: updatedSession.access_token,
    refreshToken: updatedSession.refresh_token,
  };
};

// ==========================LogOut======================================

export const logoutUser = async (sessionId: string): Promise<void> => {
  const result = await pool.query('DELETE FROM sessions WHERE id = $1', [
    sessionId,
  ]);
  if (result.rowCount === 0) {
    throw createHttpError(401, 'Authentication failed. Session not found');
  }
};

// ==========================Get User======================================

export const getUser = async (userId: string) => {
  const userData = await pool.query<AllUserData>(
    'SELECT id, name, email, avatar_url, theme FROM users WHERE id= $1',
    [userId],
  );

  if (userData.rowCount === 0) throw createHttpError(404, 'User not found');

  return userData.rows[0];
};
