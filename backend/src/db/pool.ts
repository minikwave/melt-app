import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // 로컬 개발 환경에서는 SSL 비활성화
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // 연결 옵션 추가
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});
