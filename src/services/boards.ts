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
    throw new Error('A board with this name already exists.');
  }

  const boardCreate = await pool.query(
    'INSERT INTO boards (title, owner_id) VALUES ($1, $2)  RETURNING *',
    [boardTitle, userId],
  );

  return boardCreate.rows[0];
};
