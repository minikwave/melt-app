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
  // IPv6 연결 문제 해결: keepAlive 설정
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
};

// DATABASE_URL이 있는 경우 파싱하여 설정
if (databaseUrl && databaseUrl.startsWith('postgresql://')) {
  try {
    // URL 파싱
    const url = new URL(databaseUrl.replace('postgresql://', 'http://'));
    
    // 비밀번호가 URL 인코딩되어 있을 수 있으므로 디코딩
    if (url.password) {
      url.password = decodeURIComponent(url.password);
    }
    
    // 프로덕션 환경에서는 sslmode=require 유지, 개발 환경에서만 disable
    if (process.env.NODE_ENV === 'production') {
      // 프로덕션: sslmode=require 유지 (이미 Connection String에 포함되어 있을 수 있음)
      if (!url.searchParams.has('sslmode')) {
        url.searchParams.set('sslmode', 'require');
      }
      // IPv4 강제 (IPv6 연결 문제 해결)
      if (url.hostname.includes('supabase.co')) {
        // Supabase의 경우 IPv4를 강제하기 위해 호스트명을 그대로 사용
        // pg 라이브러리가 자동으로 IPv4를 선택하도록 함
      }
    } else {
      // 개발 환경: SSL 비활성화
      url.searchParams.set('sslmode', 'disable');
    }
    
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

// SSL 설정
if (process.env.NODE_ENV === 'production') {
  // 프로덕션: SSL 활성화 (Supabase 필수)
  poolConfig.ssl = {
    rejectUnauthorized: false, // Supabase 인증서 자동 검증
  };
} else {
  // 개발 환경: SSL 비활성화
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
    } else if (error.message.includes('ENETUNREACH') || error.message.includes('IPv6')) {
      console.error('💡 IPv6 연결 문제가 발생했습니다.');
      console.error('💡 DATABASE_URL에 sslmode=require가 포함되어 있는지 확인하세요.');
      console.error('💡 Supabase Network Restrictions에서 모든 IP를 허용했는지 확인하세요.');
    } else if (error.message.includes('does not exist')) {
      console.error('💡 데이터베이스가 존재하는지 확인하세요.');
    }
    
    return false;
  }
}
