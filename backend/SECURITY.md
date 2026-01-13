# 보안 가이드

## 구현된 보안 기능

### 1. 토큰 암호화
- OAuth Access Token과 Refresh Token은 AES-256-GCM으로 암호화하여 DB에 저장
- 암호화 키는 `ENCRYPTION_KEY` 환경 변수에서 관리
- 키를 잃어버리면 복호화 불가능 (의도된 설계)

### 2. OAuth State 검증
- CSRF 공격 방지를 위한 State 검증 구현
- State는 10분 후 자동 만료
- 현재는 메모리 저장소 사용 (프로덕션에서는 Redis 권장)

### 3. Refresh Token 자동 갱신
- Access Token 만료 5분 전에 자동 갱신
- Refresh Token이 만료되면 재인증 필요
- 토큰 갱신 실패 시 자동으로 토큰 삭제

### 4. JWT 세션 관리
- HttpOnly 쿠키 사용 (XSS 공격 방지)
- SameSite=Lax 설정 (CSRF 공격 완화)
- 프로덕션에서는 Secure 플래그 활성화

## 보안 체크리스트

### 개발 환경
- [x] OAuth 토큰 암호화
- [x] State 검증
- [x] Refresh Token 갱신
- [x] JWT HttpOnly 쿠키
- [ ] HTTPS (로컬 개발에서는 선택사항)

### 프로덕션 환경
- [ ] HTTPS 필수
- [ ] 강력한 JWT_SECRET 사용
- [ ] 강력한 ENCRYPTION_KEY 사용
- [ ] Redis를 사용한 State 저장 (선택사항)
- [ ] Rate Limiting 구현 (선택사항)
- [ ] CORS 설정 제한
- [ ] 환경 변수 보안 관리 (KMS, Secrets Manager 등)

## 추가 권장 사항

### 1. Redis 사용
현재 State 검증은 메모리 저장소를 사용합니다. 프로덕션에서는 Redis를 사용하는 것을 권장합니다:

```typescript
// backend/src/utils/oauthState.ts (Redis 버전 예시)
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

export async function saveState(state: string): Promise<void> {
  await redis.setex(`oauth:state:${state}`, 600, '1'); // 10분
}

export async function verifyAndDeleteState(state: string): Promise<boolean> {
  const result = await redis.del(`oauth:state:${state}`);
  return result === 1;
}
```

### 2. Rate Limiting
과도한 요청을 방지하기 위해 Rate Limiting을 구현할 수 있습니다:

```bash
npm install express-rate-limit
```

### 3. 로깅 및 모니터링
- OAuth 실패 로그 기록
- 토큰 갱신 실패 알림
- 비정상적인 접근 패턴 감지

### 4. 토큰 만료 정책
- Access Token: 1시간 (치지직 기본값)
- Refresh Token: 30일 (치지직 기본값)
- JWT 세션: 7일 (설정 가능)

## 보안 취약점 보고

보안 취약점을 발견하셨다면, 즉시 프로젝트 관리자에게 연락해주세요.
