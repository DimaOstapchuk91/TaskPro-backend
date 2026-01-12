import createHttpError from 'http-errors';
import { pool } from '../db/db';
import {
  Board,
  BoardInputCreate,
  BoardInputUpdate,
  BoardWithColumnsAndTasks,
} from '../types/boards.types';
import { PoolClient } from 'pg';
import { Task } from '../types/task.stypes';

//============================================================== GET ALL BOARD <<<

export const getUserBoards = async (userId: number): Promise<Board[]> => {
  const getBoards = await pool.query(
    'SELECT * FROM boards WHERE owner_id = $1',
    [userId],
  );

  return getBoards.rows;
};

//========================================================= GET BOARD FOR ID <<<

// export const getOneBoards = async (
//   client: PoolClient,
//   boardId: number,
//   userId: number,
// ): Promise<BoardWithColumnsAndTasks> => {
//   const result = await client.query<{
//     board_id: number;
//     board_title: string;
//     column_id: number | null;
//     column_title: string | null;
//     column_board_id: number | null;
//     task_id: number | null;
//     task_title: string | null;
//     task_description: string | null;
//     task_priority: 'High' | 'Medium' | 'Low' | 'Without';
//     task_deadline: string | null;
//     task_created_at: string | null;
//     task_updated_at: string | null;
//     task_column_id: number | null;
//   }>(
//     `
//       SELECT
//         b.id AS board_id,
//         b.title AS board_title,

//         c.id AS column_id,
//         c.title AS column_title,
//         c.board_id AS column_board_id,

//         t.id AS task_id,
//         t.title AS task_title,
//         t.description AS task_description,
//         t.priority AS task_priority,
//         t.deadline AS task_deadline,
//         t.created_at AS task_created_at,
//         t.updated_at AS task_updated_at,
//         t.column_id AS task_column_id

//       FROM boards b
//       LEFT JOIN columns c ON c.board_id = b.id
//       LEFT JOIN tasks t ON t.column_id = c.id
//       WHERE b.id = $1 AND b.owner_id = $2
//       ORDER BY c.id, t.id;
//     `,
//     [boardId, userId],
//   );

//   if (result.rowCount === 0) {
//     throw createHttpError(404, 'Board not found');
//   }

//   const columnsMap = new Map<
//     number,
//     { id: number; title: string; board_id: number; tasks: Task[] }
//   >();

//   result.rows.forEach((row) => {
//     if (row.column_id === null) return;

//     if (!columnsMap.has(row.column_id)) {
//       columnsMap.set(row.column_id, {
//         id: row.column_id,
//         title: row.column_title!,
//         board_id: row.column_board_id!,
//         tasks: [],
//       });
//     }

//     if (row.task_id !== null) {
//       columnsMap.get(row.column_id)!.tasks.push({
//         id: row.task_id,
//         column_id: row.task_column_id!,
//         title: row.task_title!,
//         description: row.task_description!,
//         priority: row.task_priority!,
//         deadline: row.task_deadline!,
//         created_at: row.task_created_at!,
//         updated_at: row.task_updated_at!,
//       });
//     }
//   });

//   return {
//     id: result.rows[0].board_id,
//     title: result.rows[0].board_title,
//     columns: Array.from(columnsMap.values()),
//   };
// };

export const getOneBoards = async (
  client: PoolClient,
  boardId: number,
  userId: number,
): Promise<BoardWithColumnsAndTasks> => {
  const result = await client.query<BoardWithColumnsAndTasks>(
    `
    SELECT
      b.id,
      b.title,
      COALESCE(
        (SELECT json_agg(col_data) FROM (
          SELECT
            c.id,
            c.title,
            c.board_id,
            COALESCE(
              (SELECT json_agg(task_data) FROM (
                SELECT
                  t.id,
                  t.column_id,
                  t.title,
                  t.description,
                  t.priority,
                  t.deadline,
                  t.created_at,
                  t.updated_at
                FROM tasks t
                WHERE t.column_id = c.id
                ORDER BY t.id -- Тут пізніше додамо ORDER BY t.position
              ) task_data),
              '[]'::json
            ) AS tasks
          FROM columns c
          WHERE c.board_id = b.id
          ORDER BY c.id -- Тут пізніше додамо ORDER BY c.position
        ) col_data),
        '[]'::json
      ) AS columns
    FROM boards b
    WHERE b.id = $1 AND b.owner_id = $2;
    `,
    [boardId, userId],
  );

  if (result.rowCount === 0) {
    throw createHttpError(404, 'Board not found');
  }

  return result.rows[0];
};

//============================================================= CREATE BOARD <<<

export const createBoard = async (
  client: PoolClient,
  boardData: BoardInputCreate,
  userId: number,
): Promise<Board> => {
  const titleExists = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
         SELECT 1 FROM boards WHERE title = $1 AND  owner_id = $2
       ) AS "exists"`,
    [boardData.title, userId],
  );

  if (titleExists.rows[0].exists) {
    throw createHttpError(409, 'A board with this name already exists.');
  }

  console.log('Тест запита сервіс');

  const boardCreate = await client.query<Board>(
    'INSERT INTO boards (title, owner_id, icon, background) VALUES ($1, $2, $3,$4)  RETURNING *',
    [boardData.title, userId, boardData.icon, boardData.background],
  );

  return boardCreate.rows[0];
};

//============================================================= UPDATE BOARD <<<

export const updateBoard = async (
  client: PoolClient,
  boardId: number,
  boardData: BoardInputUpdate,
  userId: number,
): Promise<Board> => {
  const titleExists = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
         SELECT 1 FROM boards WHERE title = $1 AND owner_id = $2 AND id !=$3
       ) AS "exists"`,
    [boardData.title, userId, boardId],
  );

  if (titleExists.rows[0].exists) {
    throw createHttpError(409, 'A board with this title already exists.');
  }

  const newBoardTitle = await client.query<Board>(
    'UPDATE boards SET title = $1, icon = $2, background = $3 WHERE id = $4 RETURNING *',
    [boardData.title, boardData.icon, boardData.background, boardId],
  );

  if (!newBoardTitle.rows[0]) {
    throw createHttpError(404, 'Board not found');
  }

  return newBoardTitle.rows[0];
};

//============================================================= DELETE BOARD <<<

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
