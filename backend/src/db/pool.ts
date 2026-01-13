import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// DATABASE_URL 파싱 및 SSL 비활성화 (로컬 개발용)
let databaseUrl = process.env.DATABASE_URL || '';

// 로컬 개발 환경에서는 SSL 완전 비활성화
if (databaseUrl && databaseUrl.startsWith('postgresql://')) {
  try {
    // URL 파싱하여 sslmode=disable 추가
    const url = new URL(databaseUrl.replace('postgresql://', 'http://'));
    url.searchParams.set('sslmode', 'disable');
    databaseUrl = url.toString().replace('http://', 'postgresql://');
  } catch (e) {
    // URL 파싱 실패 시 그대로 사용
    console.warn('Failed to parse DATABASE_URL:', e);
  }
}

export const pool = new Pool({
  connectionString: databaseUrl,
  // 로컬 개발 환경에서는 SSL 완전 비활성화
  ssl: false,
  // 연결 옵션
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});
