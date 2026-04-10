import { Request, Response } from 'express';
import {
  getUser,
  loginUser,
  logoutUser,
  refreshUserSession,
  registerUser,
  updateUser,
} from '../services/auth.js';
import { THIRTY_DAY } from '../constans/constans.js';
import {
  LoginPayload,
  RefreshCookies,
  RegisterPayload,
  ResponseLoginSession,
} from '../types/auth.types.js';
import createHttpError from 'http-errors';
import { uploadToCloudinary } from '../utils/uploadToCloudinary.js';

export const registerUserController = async (
  req: Request<{}, {}, RegisterPayload>,
  res: Response,
): Promise<void> => {
  const user = await registerUser(req.body);

  console.log('Registered user success:', user);

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user',
    data: user,
  });
};

//=====================================================================

export const loginUserController = async (
  req: Request<{}, {}, LoginPayload>,
  res: Response,
): Promise<void> => {
  const session = await loginUser(req.body);

  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    expires: new Date(Date.now() + THIRTY_DAY),
  });

  res.cookie('sessionId', session.id, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    expires: new Date(Date.now() + THIRTY_DAY),
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: { accessToken: session.accessToken },
  });
};

// ====================================================================

export const setupSession = (res: Response, session: ResponseLoginSession) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    expires: new Date(Date.now() + THIRTY_DAY),
  });

  res.cookie('sessionId', session.id, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    expires: new Date(Date.now() + THIRTY_DAY),
  });
};

export const refreshUserSessionController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const cookies = req.cookies as RefreshCookies;

  const session = await refreshUserSession({
    sessionId: cookies.sessionId,
    refreshToken: cookies.refreshToken,
  });

  setupSession(res, session);

  console.log('спрацював рефреш');

  res.status(200).json({
    status: 200,
    secure: true,
    message: 'Successfully refreshed a session',
    data: { accessToken: session.accessToken },
  });
};

// ====================================================================
export const logoutUserController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const cookies = req.cookies as RefreshCookies;

  await logoutUser(cookies.sessionId);

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });
  res.clearCookie('sessionId', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });

  res.status(200).end();
};

export const getUserController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw createHttpError(401, 'Unauthorized');
  }

  const userData = await getUser(req.user.id);

  res.status(200).json({
    status: 200,
    message: 'User found successfully!',
    data: userData,
  });
};

export const updateUserController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw createHttpError(401, 'Unauthorized');
  }

  const updateData = { ...req.body };

  if (req.file) {
    const avatarUrl = await uploadToCloudinary(req.file.path);

    updateData.avatar_url = avatarUrl;
  }

  const updatedUser = await updateUser(req.user.id, updateData);

  res.status(200).json({
    status: 200,
    message: 'User updated successfully!',
    data: updatedUser,
  });
};
