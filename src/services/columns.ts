import createHttpError from 'http-errors';
import { Columns } from '../types/columns.types';
import { PoolClient } from 'pg';

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

//================================================================Edit Column

export const editColumn = async (
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

  return updated.rows[0];
};

//================================================================Delete Column

export const dellColumn = async (
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

  const deleted = await client.query<{ id: number }>(
    'DELETE FROM columns WHERE id = $1 RETURNING id',
    [columnId],
  );

  if (deleted.rowCount === 0) {
    throw createHttpError(500, 'Failed to delete column');
  }

  return deleted.rows[0];
};
