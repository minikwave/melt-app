import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// DATABASE_URL 파싱 및 연결 설정
let databaseUrl = process.env.DATABASE_URL || '';

// DATABASE_URL이 없으면 경고
if (!databaseUrl) {
  console.warn('⚠️  DATABASE_URL이 설정되지 않았습니다. 데이터베이스 연결이 실패할 수 있습니다.');
}

// Pool 설정 객체
const poolConfig: PoolConfig = {
  // 연결 옵션
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20, // 최대 연결 수
};

// DATABASE_URL이 있는 경우 파싱하여 설정
if (databaseUrl && databaseUrl.startsWith('postgresql://')) {
  try {
    // URL 파싱하여 sslmode=disable 추가 (로컬 개발용)
    const url = new URL(databaseUrl.replace('postgresql://', 'http://'));
    
    // 비밀번호가 URL 인코딩되어 있을 수 있으므로 디코딩
    if (url.password) {
      url.password = decodeURIComponent(url.password);
    }
    
    // SSL 비활성화 (로컬 개발용)
    url.searchParams.set('sslmode', 'disable');
    databaseUrl = url.toString().replace('http://', 'postgresql://');
    
    poolConfig.connectionString = databaseUrl;
  } catch (e) {
    // URL 파싱 실패 시 connectionString만 설정
    console.warn('⚠️  DATABASE_URL 파싱 실패, 원본 URL 사용:', e);
    poolConfig.connectionString = databaseUrl;
  }
} else if (databaseUrl) {
  // postgresql://로 시작하지 않는 경우 그대로 사용
  poolConfig.connectionString = databaseUrl;
}

// 로컬 개발 환경에서는 SSL 완전 비활성화
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production') {
  poolConfig.ssl = false;
}

export const pool = new Pool(poolConfig);

// 연결 이벤트 핸들러
pool.on('connect', () => {
  console.log('✅ PostgreSQL 클라이언트 연결됨');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL 연결 오류:', err.message);
  console.error('💡 DATABASE_URL을 확인하세요:', process.env.DATABASE_URL ? '설정됨' : '설정되지 않음');
});

// 연결 테스트 함수
export async function testConnection(): Promise<boolean> {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ 데이터베이스 연결 성공:', result.rows[0].now);
    return true;
  } catch (error: any) {
    console.error('❌ 데이터베이스 연결 실패:', error.message);
    
    // 자세한 오류 정보 제공
    if (error.message.includes('password')) {
      console.error('💡 비밀번호 형식 오류일 수 있습니다. DATABASE_URL의 비밀번호를 확인하세요.');
      console.error('💡 형식: postgresql://username:password@host:port/database');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 PostgreSQL 서버가 실행 중인지 확인하세요.');
    } else if (error.message.includes('does not exist')) {
      console.error('💡 데이터베이스가 존재하는지 확인하세요.');
    }
    
    return false;
  }
}
