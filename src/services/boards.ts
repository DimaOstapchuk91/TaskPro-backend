import createHttpError from 'http-errors';
import { pool } from '../db/db';
import { Board } from '../types/boards.types';
import { PoolClient } from 'pg';

export const getUserBoards = async (userId: number): Promise<Board[]> => {
  const getBoards = await pool.query(
    'SELECT * FROM boards WHERE owner_id = $1',
    [userId],
  );

  return getBoards.rows;
};

export const createBoard = async (
  client: PoolClient,
  boardTitle: string,
  userId: number,
) => {
  const titleExists = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
         SELECT 1 FROM boards WHERE title = $1 AND owner_id = $2
       ) AS "exists"`,
    [boardTitle, userId],
  );

  if (titleExists.rows[0].exists) {
    throw createHttpError(409, 'A board with this name already exists.');
  }

  const boardCreate = await client.query(
    'INSERT INTO boards (title, owner_id) VALUES ($1, $2)  RETURNING *',
    [boardTitle, userId],
  );

  return boardCreate.rows[0];
};

export const editBoard = async (
  client: PoolClient,
  boardId: number,
  newTitle: string,
  userId: number,
): Promise<Board> => {
  const titleExists = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
         SELECT 1 FROM columns WHERE title = $1 AND owner_id = $2 AND id !=$3
       ) AS "exists"`,
    [newTitle, userId, boardId],
  );

  if (titleExists.rows[0].exists) {
    throw createHttpError(409, 'A board with this id already exists.');
  }

  const newBoardTitle = await client.query<Board>(
    'UPDATE boards SET title = $1 WHERE id = $2 RETURNING *',
    [newTitle, boardId],
  );

  if (!newBoardTitle.rows[0]) {
    throw createHttpError(404, 'Board not found');
  }

  return newBoardTitle.rows[0];
};

export const deleteBoard = async (
  client: PoolClient,
  boardId: number,
  userId: number,
) => {
  const boardExists = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
         SELECT 1 FROM boards WHERE id = $1 AND owner_id = $2
       ) AS "exists"`,
    [boardId, userId],
  );

  if (!boardExists.rows[0].exists) {
    throw createHttpError(404, 'Board not found');
  }

  const deleted = await client.query(
    'DELETE FROM boards WHERE id = $1 RETURNING id',
    [boardId],
  );

  if (deleted.rowCount === 0) {
    throw createHttpError(500, 'Failed to delete column');
  }

  return deleted.rows[0];
};
