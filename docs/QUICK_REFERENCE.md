# 빠른 참조 가이드

## 치즈 후원 링크 확인 방법 요약

### 1. 브라우저 개발자 도구 (가장 확실한 방법)

**단계**:
1. `F12` → Network 탭 → "Preserve log" 체크
2. 치지직 채널 페이지에서 "치즈 보내기" 버튼 클릭
3. Network 탭에서 새로 나타나는 요청 확인
4. 요청 URL 또는 응답에서 후원 링크 추출

**상세 가이드**: [CHZZK_DONATE_LINK_DETAILED.md](./CHZZK_DONATE_LINK_DETAILED.md)

### 2. 치지직 개발자 포털

- https://developers.chzzk.naver.com/
- API 문서에서 후원 관련 엔드포인트 확인

### 3. 채널 정보 API

```javascript
GET https://api.chzzk.naver.com/open/v1/channels/{channelId}
```

응답에 `donateUrl` 또는 유사한 필드가 포함되어 있는지 확인

## DB 비밀번호 설정 위치

### 로컬 개발
```
backend/.env
```
```env
DATABASE_URL=postgresql://postgres:비밀번호@localhost:5432/melt
```

### Supabase
- Supabase 대시보드 → Settings → Database
- Connection string에서 비밀번호 확인
- 형식: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require`

### Railway
- Railway 대시보드 → PostgreSQL 서비스 → Variables
- `DATABASE_URL` 자동 생성됨

**상세 가이드**: [DB_PASSWORD_SETUP.md](./DB_PASSWORD_SETUP.md)

## 배포 가이드

### Supabase + Railway 배포

1. **Supabase**: 데이터베이스 설정
2. **Railway**: 백엔드 + 프론트엔드 배포
3. **OAuth**: 치지직 Redirect URI 업데이트

**상세 가이드**: [DEPLOY_SUPABASE_RAILWAY.md](./DEPLOY_SUPABASE_RAILWAY.md)

## 주요 문서 링크

- [DB 연결 오류 수정](./DB_CONNECTION_FIX.md)
- [수정/보강 필요한 기능](./IMPROVEMENTS_NEEDED.md)
- [치즈 후원 링크 상세 확인](./CHZZK_DONATE_LINK_DETAILED.md)
- [DB 비밀번호 설정](./DB_PASSWORD_SETUP.md)
- [Supabase + Railway 배포](./DEPLOY_SUPABASE_RAILWAY.md)
