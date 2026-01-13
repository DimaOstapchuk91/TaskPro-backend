import createHttpError from 'http-errors';
import { Columns } from '../types/columns.types';
import { PoolClient } from 'pg';

//============================================================= CREATE COLUMN <<<

export const createColumn = async (
  client: PoolClient,
  columnTitle: string,
  boardId: number,
  userId: number,
): Promise<Columns> => {
  const boardExists = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
         SELECT 1 FROM boards WHERE id = $1 AND owner_id = $2
       ) AS "exists"`,
    [boardId, userId],
  );

  if (!boardExists.rows[0].exists) {
    throw createHttpError(404, 'Board not found');
  }

  const titleExists = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
         SELECT 1 FROM columns WHERE title = $1 AND board_id = $2
       ) AS "exists"`,
    [columnTitle, boardId],
  );
  if (titleExists.rows[0].exists) {
    throw createHttpError(409, 'A column with this name already exists.');
  }

  const columnCreate = await client.query<Columns>(
    'INSERT INTO columns (title, board_id) VALUES ($1, $2) RETURNING *',
    [columnTitle, boardId],
  );

  return columnCreate.rows[0];
};

//============================================================= UPDATE COLUMN <<<

export const updateColumn = async (
  client: PoolClient,
  newTitle: string,
  boardId: number,
  userId: number,
  columnId: number,
): Promise<Columns> => {
  const boardExists = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
         SELECT 1 FROM boards WHERE id = $1 AND owner_id = $2
       ) AS "exists"`,
    [boardId, userId],
  );

  if (!boardExists.rows[0].exists) {
    throw createHttpError(404, 'Board not found');
  }

  const titleExists = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
         SELECT 1 FROM columns WHERE title = $1 AND board_id = $2
       ) AS "exists"`,
    [newTitle, boardId],
  );
  if (titleExists.rows[0].exists) {
    throw createHttpError(409, 'A column with this name already exists.');
  }

  const columnExists = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
         SELECT 1 FROM columns WHERE id = $1 AND board_id = $2
       ) AS "exists"`,
    [columnId, boardId],
  );
  if (!columnExists.rows[0].exists) {
    throw createHttpError(404, 'This column not found');
  }

  const updated = await client.query<Columns>(
    'UPDATE columns SET title = $1 WHERE id = $2 RETURNING *',
    [newTitle, columnId],
  );

  if (!updated.rows[0]) {
    throw createHttpError(404, 'Column not found');
  }

  return updated.rows[0];
};

// ============================================================ MOVE COLUMN <<<

export const moveColumnService = async (
  client: PoolClient,
  boardId: number,
  columnId: number,
  oldPosition: number,
  newPosition: number,
) => {
  if (newPosition < oldPosition) {
    await client.query(
      `UPDATE columns SET position = position + 1
       WHERE board_id = $1 AND position >= $2 AND position < $3`,
      [boardId, newPosition, oldPosition],
    );
  } else if (newPosition > oldPosition) {
    await client.query(
      `UPDATE columns SET position = position - 1
       WHERE board_id = $1 AND position > $2 AND position <= $3`,
      [boardId, oldPosition, newPosition],
    );
  }

  const result = await client.query(
    `UPDATE columns SET position = $1 WHERE id = $2 RETURNING *`,
    [newPosition, columnId],
  );

  return result.rows[0];
};

//============================================================= DELETE COLUMN <<<

export const deleteColumn = async (
  client: PoolClient,
  boardId: number,
  userId: number,
  columnId: number,
): Promise<{ id: number }> => {
  const boardExists = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
         SELECT 1 FROM boards WHERE id = $1 AND owner_id = $2
       ) AS "exists"`,
    [boardId, userId],
  );

  if (!boardExists.rows[0].exists) {
    throw createHttpError(404, 'Board not found');
  }

  const columnExists = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
         SELECT 1 FROM columns WHERE id = $1 AND board_id = $2
       ) AS "exists"`,
    [columnId, boardId],
  );

  if (!columnExists.rows[0].exists) {
    throw createHttpError(404, 'This column not found');
  }

  const colRes = await client.query(
    'SELECT position FROM columns WHERE id = $1',
    [columnId],
  );
  const deletedPos = colRes.rows[0].position;

  const deleted = await client.query<{ id: number }>(
    'DELETE FROM columns WHERE id = $1 RETURNING id',
    [columnId],
  );

  if (deleted.rowCount === 0) {
    throw createHttpError(404, 'Column not found');
  }

  await client.query(
    `UPDATE columns SET position = position - 1
   WHERE board_id = $1 AND position > $2`,
    [boardId, deletedPos],
  );

  return deleted.rows[0];
};
