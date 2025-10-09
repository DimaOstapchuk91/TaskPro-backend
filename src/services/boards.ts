import { pool } from '../db/db';

export const createBoard = async (boardTitle: string, userId: number) => {
  const boardCreate = await pool.query(
    'INSERT INTO boards (title, owner_id) VALUES ($1, $2)  RETURNING *',
    [boardTitle, userId],
  );

  return boardCreate.rows[0];
};
