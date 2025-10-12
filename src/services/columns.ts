import createHttpError from 'http-errors';
import { pool } from '../db/db';
import { Columns } from '../types/columns.types';

export const createColumn = async (
  columnTitle: string,
  boardId: number,
  userId: number,
) => {
  const boardCheck = await pool.query(
    'SELECT id FROM boards WHERE id = $1 AND owner_id = $2',
    [boardId, userId],
  );

  if (boardCheck.rowCount === 0) {
    throw createHttpError(
      403,
      'Access denied. This board does not belong to you.',
    );
  }

  const existing = await pool.query<Columns>(
    'SELECT * FROM columns WHERE title = $1 AND board_id = $2',
    [columnTitle, boardId],
  );

  if (existing.rowCount && existing.rowCount > 0) {
    throw createHttpError(409, 'A board with this name already exists.');
  }

  const columnCreate = await pool.query(
    'INSERT INTO columns (title, board_id) VALUES ($1, $2) RETURNING *',
    [columnTitle, boardId],
  );

  return columnCreate.rows[0];
};
