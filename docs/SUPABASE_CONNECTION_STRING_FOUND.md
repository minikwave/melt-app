# Supabase Connection String 찾기 완료

## 현재 화면 분석

보여주신 화면에서:
- ✅ **Connection String** 탭 선택됨
- ✅ **Direct connection** 선택됨
- ⚠️ **"Not IPv4 compatible"** 경고 표시
- 💡 **"Use Session Pooler if on a IPv4 network"** 안내

## Connection Pooling URL 확인 방법

### 1단계: Method 드롭다운 변경

1. 화면 상단의 **"Method"** 드롭다운 클릭
2. **"Session Pooler"** 또는 **"Connection Pooling"** 선택
3. Connection String이 자동으로 변경됩니다

### 2단계: Connection Pooling URL 확인

**Method를 "Session Pooler"로 변경하면**:
- 호스트명이 `.pooler.supabase.com`으로 변경됨
- 사용자명이 `postgres.[PROJECT-REF]` 형식으로 변경됨
- 포트가 `6543` (Session mode)로 변경됨

**예상되는 Connection String**:
```
postgresql://postgres.pqafhdeeooxpyuocydxa:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
```

### 3단계: 비밀번호 교체 및 Railway에 설정

1. Connection String에서 `[YOUR-PASSWORD]`를 실제 비밀번호로 교체
   - 비밀번호: `blockwave0806!`
   - URL 인코딩: `blockwave0806%21`
2. `sslmode=require` 추가:
   ```
   postgresql://postgres.pqafhdeeooxpyuocydxa:blockwave0806%21@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require
   ```
3. Railway → Settings → Variables → `DATABASE_URL` 업데이트

## Pooler Settings 버튼

화면의 **"Pooler settings"** 버튼을 클릭하면:
- Connection Pooling 설정 페이지로 이동
- Pool Size, Max Client Connections 등 확인 가능

## 중요 사항

✅ **Method를 "Session Pooler"로 변경**하면 IPv4 호환 문제 해결  
✅ **사용자명 형식**: `postgres.pqafhdeeooxpyuocydxa` (점 포함)  
✅ **호스트명**: `.pooler.supabase.com` 포함  
✅ **포트**: `6543` (Session mode)

## 다음 단계

1. Method 드롭다운에서 "Session Pooler" 선택
2. 표시된 Connection String 복사
3. 비밀번호 교체 및 `sslmode=require` 추가
4. Railway `DATABASE_URL` 업데이트
