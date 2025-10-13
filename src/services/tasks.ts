import { PoolClient } from 'pg';
import { Task, TaskInput } from '../types/task.stypes';
import createHttpError from 'http-errors';

export const createTask = async (
  client: PoolClient,
  taskData: TaskInput,
  columnId: number,
  boardId: number,
  userId: number,
): Promise<Task> => {
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

  const { title, description, priority, deadline } = taskData;

  const created = await client.query<Task>(
    'INSERT INTO tasks (column_id, title, description, priority, deadline) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [columnId, title, description, priority, deadline],
  );

  return created.rows[0];
};

export const editTask = async (
  client: PoolClient,
  taskData: TaskInput,
  columnId: number,
  boardId: number,
  userId: number,
  taskId: number,
): Promise<Task> => {
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

  const { title, description, priority, deadline } = taskData;

  const updated = await client.query(
    'UPDATE tasks SET title = $1, description = $2, priority = $3, deadline = $4 WHERE id = $5 RETURNING *',
    [title, description, priority, deadline, taskId],
  );

  if (!updated.rows[0]) {
    throw createHttpError(404, 'Task not found');
  }

  return updated.rows[0];
};

export const deleteTask = async (
  client: PoolClient,
  columnId: number,
  boardId: number,
  userId: number,
  taskId: number,
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
    'DELETE FROM tasks WHERE id = $1 RETURNING id',
    [taskId],
  );

  if (deleted.rowCount === 0) {
    throw createHttpError(404, 'Task not found');
  }

  return deleted.rows[0];
};
