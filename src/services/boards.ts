import createHttpError from 'http-errors';
import { pool } from '../db/db';
import { Board, BoardWithColumnsAndTasks } from '../types/boards.types';
import { PoolClient } from 'pg';
import { Task } from '../types/task.stypes';

export const getUserBoards = async (userId: number): Promise<Board[]> => {
  const getBoards = await pool.query(
    'SELECT * FROM boards WHERE owner_id = $1',
    [userId],
  );

  return getBoards.rows;
};

export const getOneBoards = async (
  client: PoolClient,
  boardId: number,
  userId: number,
): Promise<BoardWithColumnsAndTasks> => {
  const result = await client.query<{
    board_id: number;
    board_title: string;
    column_id: number | null;
    column_title: string | null;
    task_id: number | null;
    task_title: string | null;
    task_description: string | null;
    task_priority: 'High' | 'Medium' | 'Low' | 'Without';
    task_deadline: string | null;
    task_created_at: string | null;
    task_updated_at: string | null;
  }>(
    `
      SELECT
        b.id AS board_id,
        b.title AS board_title,
        c.id AS column_id,
        c.title AS column_title,
        t.id AS task_id,
        t.title AS task_title,
        t.description AS task_description,
        t.priority AS task_priority,
        t.deadline AS task_deadline,
        t.created_at AS task_created_at,
        t.updated_at AS task_updated_at
      FROM boards b
      LEFT JOIN columns c ON c.board_id = b.id
      LEFT JOIN tasks t ON t.column_id = c.id
      WHERE b.id = $1 AND b.owner_id = $2
      ORDER BY c.id, t.id
    `,
    [boardId, userId],
  );

  if (result.rowCount === 0) {
    throw createHttpError(404, 'Board not found');
  }

  const columnsMap = new Map<
    number,
    { id: number; title: string; tasks: Task[] }
  >();

  result.rows.forEach((row) => {
    if (row.column_id === null) return;

    if (!columnsMap.has(row.column_id)) {
      columnsMap.set(row.column_id, {
        id: row.column_id,
        title: row.column_title!,
        tasks: [],
      });
    }

    if (row.task_id !== null) {
      columnsMap.get(row.column_id)!.tasks.push({
        id: row.task_id,
        column_id: row.column_id,
        title: row.task_title!,
        description: row.task_description!,
        priority: row.task_priority!,
        deadline: row.task_deadline!,
        created_at: row.task_created_at!,
        updated_at: row.task_updated_at!,
      });
    }
  });

  return {
    id: result.rows[0].board_id,
    title: result.rows[0].board_title,
    columns: Array.from(columnsMap.values()),
  };
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
