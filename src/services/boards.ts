import createHttpError from 'http-errors';
import { pool } from '../db/db';
import { Board } from '../types/boards.types';

export const getUserBoards = async (userId: number) => {
  const getBoards = await pool.query(
    'SELECT * FROM boards WHERE owner_id = $1',
    [userId],
  );

  return getBoards.rows;
};

export const createBoard = async (boardTitle: string, userId: number) => {
  const existing = await pool.query<Board>(
    'SELECT * FROM boards WHERE title = $1 AND owner_id = $2',
    [boardTitle, userId],
  );

  if (existing.rowCount && existing.rowCount > 0) {
    throw createHttpError(409, 'A board with this name already exists.');
  }

  const boardCreate = await pool.query(
    'INSERT INTO boards (title, owner_id) VALUES ($1, $2)  RETURNING *',
    [boardTitle, userId],
  );

  return boardCreate.rows[0];
};

export const editBoard = async (
  boardId: number,
  newTitle: string,
  userId: number,
) => {
  const existing = await pool.query<Board>(
    'SELECT * FROM boards WHERE title = $1 AND owner_id = $2 AND  id != $3',
    [newTitle, userId, boardId],
  );

  if (existing.rowCount && existing.rowCount > 0) {
    throw createHttpError(409, 'A board with this id already exists.');
  }

  const newBoardTitle = await pool.query(
    'UPDATE boards SET title = $1 WHERE id = $2 RETURNING *',
    [newTitle, boardId],
  );

  if (!newBoardTitle.rows[0]) {
    throw createHttpError(404, 'Board not found');
  }

  return newBoardTitle.rows[0];
};

export const deleteBoard = async (boardId: number, userId: number) => {
  const existing = await pool.query<Board>(
    'SELECT * FROM boards WHERE id = $1 AND owner_id = $2',
    [boardId, userId],
  );

  if (existing.rowCount === 0) {
    throw createHttpError(404, 'Board not found');
  }

  const result = await pool.query(
    'DELETE FROM boards WHERE id = $1 RETURNING id',
    [boardId],
  );

  return result.rows[0];
};
