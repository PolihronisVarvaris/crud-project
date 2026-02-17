import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const isTest = process.env.NODE_ENV === 'test';

const config: PoolConfig = {
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: isTest
    ? (process.env.TEST_DB_NAME || 'courses_test_db')
    : (process.env.DB_NAME     || 'courses_db'),
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

export const pool = new Pool(config);

export async function connectDB(): Promise<void> {
  const client = await pool.connect();
  client.release();
  console.log(`Connected to PostgreSQL [${config.database}]`);
}
