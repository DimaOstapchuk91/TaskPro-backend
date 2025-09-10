import { Pool } from 'pg';
import { env } from '../utils/env';

// Створюємо пул з'єднань
export const pool = new Pool({
  user: env('PG_USER'),
  host: env('PG_HOST'),
  database: env('PG_DATABASE'),
  password: env('PG_PASSWORD'),
  port: Number(env('PG_PORT')),
});

export const checkDbConnection = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('DB connection is OK');
  } catch (err) {
    console.error('DB connection failed', err);
    process.exit(1);
  }
};

pool.on('connect', () => {
  console.log('PostgreSQL connected');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});
