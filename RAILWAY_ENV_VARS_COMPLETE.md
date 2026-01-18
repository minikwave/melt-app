# Railway 환경 변수 설정 완료 가이드

## ✅ 도메인
**Railway 도메인**: `melt-app-production.up.railway.app`

## ✅ 빌드 오류 수정 완료
- `auth.ts`의 JWT 타입 오류 수정 완료
- 빌드 성공 확인

---

## 환경 변수 설정 (Railway → Settings → Variables)

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
SL/YR9mE14xSZhnZk/Hd7qax6NBly1+qT9V4tQazoGs=
```

### 5. ENCRYPTION_KEY
```
a05cd69b8fe23741
```
**참고**: 더 긴 키가 필요하면 아래 명령어로 64자 생성:
```powershell
-join ((48..57) + (97..102) | Get-Random -Count 64 | ForEach-Object { [char]$_ })
```

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
https://placeholder.vercel.app
```
**⚠️ 중요**: Vercel 배포 후 실제 도메인으로 업데이트 필요

---

## 설정 순서

1. ✅ 도메인 생성 완료: `melt-app-production.up.railway.app`
2. ✅ 빌드 오류 수정 완료
3. ⏳ 환경 변수 9개 추가
4. ⏳ 배포 확인
5. ⏳ Vercel 배포 후 FRONTEND_URL 업데이트

---

## 비밀 키 생성 (PowerShell)

```powershell
# JWT_SECRET 생성
$bytes = 1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }
[Convert]::ToBase64String($bytes)

# ENCRYPTION_KEY 생성
-join ((48..57) + (97..102) | Get-Random -Count 64 | ForEach-Object { [char]$_ })
```

생성된 값을 복사하여 Railway 환경 변수에 설정하세요.

---

## 배포 확인

환경 변수 설정 후:

1. **Deployments** 탭에서 배포 상태 확인
2. **View Logs**에서 로그 확인
3. Health Check:
   ```
   https://melt-app-production.up.railway.app/health
   ```

**예상 응답**:
```json
{
  "status": "ok",
  "database": "connected"
}
```
