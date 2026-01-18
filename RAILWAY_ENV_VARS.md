# Railway 환경 변수 설정 가이드

## 도메인
**Railway 도메인**: `melt-app-production.up.railway.app`

## 환경 변수 목록 (9개)

Railway → Settings → Variables에서 다음 변수들을 추가하세요:

### 1. PORT
```
3001
```

### 2. NODE_ENV
```
production
```

### 3. DATABASE_URL
```
postgresql://postgres:blockkwave0806%21@db.pqafhdeeooxpyuocydxa.supabase.co:5432/postgres?sslmode=require
```

### 4. JWT_SECRET
```
aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5zA7bC9dE1fG3hI5jK7lM9nO1pQ3rS5tU7vW9xY1zA3=
```
**참고**: 실제로는 랜덤하게 생성된 값을 사용하세요.

### 5. ENCRYPTION_KEY
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890ab
```
**참고**: 실제로는 랜덤하게 생성된 값을 사용하세요.

### 6. CHZZK_CLIENT_ID
```
adbe2be0-a1c7-43a5-bdfd-408491968f3b
```

### 7. CHZZK_CLIENT_SECRET
```
ahHose2CWgcApBBrxtlmzPf5THLxEURXwr5s7uc2OFk
```

### 8. CHZZK_REDIRECT_URI
```
https://melt-app-production.up.railway.app/auth/chzzk/callback
```

### 9. FRONTEND_URL
```
https://[Vercel-도메인]
```
**참고**: Vercel 배포 후 업데이트 필요

---

## 비밀 키 생성 방법

PowerShell에서 실행:

```powershell
# JWT_SECRET 생성
$bytes = 1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }
[Convert]::ToBase64String($bytes)

# ENCRYPTION_KEY 생성
-join ((48..57) + (97..102) | Get-Random -Count 64 | ForEach-Object { [char]$_ })
```

---

## 설정 순서

1. ✅ 도메인 생성 완료: `melt-app-production.up.railway.app`
2. ⏳ 환경 변수 9개 추가
3. ⏳ CHZZK_REDIRECT_URI 업데이트 (이미 위에 포함됨)
4. ⏳ 배포 확인
5. ⏳ Vercel 배포 후 FRONTEND_URL 업데이트
