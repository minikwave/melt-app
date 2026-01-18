# Admin 설정 가이드

## Admin 역할 설정 방법

### 방법 1: SQL 직접 실행 (첫 번째 Admin 설정)

프로덕션 환경에서 최초의 Admin을 설정하려면 Supabase SQL Editor 또는 직접 데이터베이스에 접속하여 다음 쿼리를 실행합니다.

```sql
-- 특정 네이버 치지직 유저 ID를 admin으로 설정
-- 예: alex1381을 admin으로 설정하고 싶은 경우
UPDATE users 
SET role = 'admin', updated_at = now() 
WHERE chzzk_user_id = 'alex1381';

-- 또는 display_name으로 찾아서 설정
UPDATE users 
SET role = 'admin', updated_at = now() 
WHERE display_name = '원하는닉네임';

-- 설정 확인
SELECT id, chzzk_user_id, display_name, role 
FROM users 
WHERE role = 'admin';
```

### 방법 2: 환경 변수로 초기 Admin 지정

`backend/.env`에 다음 환경 변수를 추가하면, 해당 유저가 처음 가입할 때 자동으로 admin이 됩니다:

```env
# 쉼표로 구분하여 여러 유저 지정 가능
INITIAL_ADMIN_USERS=alex1381,다른유저id
```

백엔드 코드에서 이를 처리하려면 `routes/onboarding.ts`에서 역할 설정 시 확인합니다.

### 방법 3: 기존 Admin이 새 Admin 지정

이미 Admin이 있는 경우:

1. Admin 계정으로 로그인
2. 프로필 → 관리자 페이지 → 유저 관리
3. 원하는 유저 검색
4. "역할 변경" 버튼 클릭
5. `admin` 입력 후 확인

## 주의사항

### 보안

- **Admin 권한은 신중하게 부여하세요**
- Admin은 모든 유저의 역할을 변경할 수 있습니다
- Admin은 모든 메시지를 삭제할 수 있습니다
- Admin은 자기 자신의 역할을 변경할 수 없습니다 (실수 방지)

### Admin 기능

Admin이 할 수 있는 것:
- 전체 통계 조회 (유저 수, 메시지 수, 후원 통계)
- 유저 목록 조회 및 검색
- 유저 역할 변경 (viewer ↔ creator ↔ admin)
- 채널 목록 조회
- 메시지 모더레이션 (삭제)

## API 엔드포인트

### 유저 역할 변경

```http
PUT /admin/users/:userId/role
Authorization: Bearer {token}
Content-Type: application/json

{
  "role": "admin" | "creator" | "viewer"
}
```

### 치지직 유저 ID로 역할 변경

```http
PUT /admin/users/by-chzzk-id/:chzzkUserId/role
Authorization: Bearer {token}
Content-Type: application/json

{
  "role": "admin" | "creator" | "viewer"
}
```

## 예시: alex1381을 Admin으로 설정

### Supabase SQL Editor에서:

```sql
-- 먼저 유저가 존재하는지 확인
SELECT * FROM users WHERE chzzk_user_id LIKE '%alex1381%';

-- admin으로 설정 (정확한 chzzk_user_id 사용)
UPDATE users 
SET role = 'admin', updated_at = now() 
WHERE chzzk_user_id = 'alex1381';

-- 확인
SELECT id, chzzk_user_id, display_name, role FROM users WHERE chzzk_user_id = 'alex1381';
```

### 주의: chzzk_user_id 찾기

네이버 치지직의 유저 ID는 로그인 시 OAuth 응답에서 받아오는 값입니다. 
이는 네이버 아이디(alex1381)와 동일할 수도 있고, 치지직 내부 ID일 수도 있습니다.

정확한 ID를 확인하려면:
1. 해당 계정으로 Melt에 로그인
2. 개발자 도구 → Network 탭
3. `/auth/me` API 응답에서 `chzzk_user_id` 확인

또는 DB에서:
```sql
SELECT chzzk_user_id, display_name FROM users ORDER BY created_at DESC LIMIT 10;
```
