import { PoolClient } from 'pg';
import { MoveTaskData, Task, TaskInput } from '../types/tasks.types';
import createHttpError from 'http-errors';

// ============================================================== CREATE TASK <<<

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

// =========================================================== UPDATE TASK <<<

export const updateTask = async (
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

// ============================================================== MOVE TASK <<<

export const moveTaskService = async (
  client: PoolClient,
  taskId: number,
  data: MoveTaskData,
) => {
  const { sourceColumnId, destinationColumnId, oldPosition, newPosition } =
    data;

  if (sourceColumnId === destinationColumnId) {
    if (newPosition < oldPosition) {
      await client.query(
        `UPDATE tasks SET position = position + 1
         WHERE column_id = $1 AND position >= $2 AND position < $3`,
        [sourceColumnId, newPosition, oldPosition],
      );
    } else if (newPosition > oldPosition) {
      await client.query(
        `UPDATE tasks SET position = position - 1
         WHERE column_id = $1 AND position > $2 AND position <= $3`,
        [sourceColumnId, oldPosition, newPosition],
      );
    }
  } else {
    await client.query(
      `UPDATE tasks SET position = position - 1
       WHERE column_id = $1 AND position > $2`,
      [sourceColumnId, oldPosition],
    );

    await client.query(
      `UPDATE tasks SET position = position + 1
       WHERE column_id = $1 AND position >= $2`,
      [destinationColumnId, newPosition],
    );
  }

  const result = await client.query(
    `UPDATE tasks
     SET column_id = $1, position = $2
     WHERE id = $3
     RETURNING *`,
    [destinationColumnId, newPosition, taskId],
  );

  return result.rows[0];
};

// ============================================================== DELETE TASK <<<

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

  const taskResult = await client.query<{ position: number }>(
    'SELECT position FROM tasks WHERE id = $1 AND column_id = $2',
    [taskId, columnId],
  );

  if (taskResult.rowCount === 0) {
    throw createHttpError(404, 'Task not found');
  }

  const deletedTaskPosition = taskResult.rows[0].position;

  const deleted = await client.query<{ id: number }>(
    'DELETE FROM tasks WHERE id = $1 RETURNING id',
    [taskId],
  );

  await client.query(
    `UPDATE tasks
     SET position = position - 1
     WHERE column_id = $1 AND position > $2`,
    [columnId, deletedTaskPosition],
  );

  return deleted.rows[0];
};
