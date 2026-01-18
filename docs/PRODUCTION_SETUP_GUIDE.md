# Melt 프로덕션 환경 설정 가이드

이 문서는 Melt 프로젝트를 프로덕션 환경에서 운영하기 위한 완전한 설정 가이드입니다.

## 목차

1. [아키텍처 개요](#1-아키텍처-개요)
2. [로컬 vs 프로덕션 차이점](#2-로컬-vs-프로덕션-차이점)
3. [필수 서비스 준비](#3-필수-서비스-준비)
4. [환경 변수 설정](#4-환경-변수-설정)
5. [배포 단계](#5-배포-단계)
6. [OAuth 설정](#6-oauth-설정)
7. [문제 해결](#7-문제-해결)

---

## 1. 아키텍처 개요

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   사용자 브라우저  │────▶│   Vercel        │────▶│   Railway       │
│                 │     │   (프론트엔드)    │     │   (백엔드 API)   │
└─────────────────┘     └────────┬────────┘     └────────┬────────┘
                                 │                       │
                                 │                       ▼
                                 │              ┌─────────────────┐
                                 │              │   Supabase      │
                                 │              │   (PostgreSQL)  │
                                 │              └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │   치지직 OAuth   │
                        │   (네이버)       │
                        └─────────────────┘
```

### 구성 요소

| 서비스 | 역할 | 위치 |
|--------|------|------|
| **Vercel** | Next.js 프론트엔드 호스팅 + OAuth API Routes | 한국 Edge |
| **Railway** | Express.js 백엔드 API 서버 | 미국 (또는 다른 지역) |
| **Supabase** | PostgreSQL 데이터베이스 | 싱가포르/서울 권장 |
| **치지직 API** | OAuth 인증 + 사용자 정보 | 한국 |

### 왜 이런 구조인가?

**치지직 API 제한**: 치지직 API는 **한국 IP에서만** 정상 작동합니다. Railway가 미국에 있으면 `ECONNRESET` 오류가 발생합니다.

**해결책**: OAuth 토큰 교환은 **Vercel API Routes**(한국 Edge)에서 처리하고, 그 결과를 Railway 백엔드로 전달합니다.

---

## 2. 로컬 vs 프로덕션 차이점

| 항목 | 로컬 개발 | 프로덕션 |
|------|----------|----------|
| **URL** | `localhost:3000` / `localhost:3001` | `your-app.vercel.app` / `your-api.railway.app` |
| **HTTPS** | HTTP | HTTPS (필수) |
| **OAuth** | 개발자 모드 또는 테스트 콜백 | 실제 치지직 OAuth |
| **데이터베이스** | 로컬 PostgreSQL | Supabase (클라우드) |
| **환경 변수** | `.env.local` 파일 | 각 서비스 대시보드에서 설정 |
| **쿠키** | `secure: false` | `secure: true` (HTTPS 필수) |

---

## 3. 필수 서비스 준비

### 3.1 치지직 Developer 계정

1. [치지직 Developer](https://developers.chzzk.naver.com/) 접속
2. 애플리케이션 등록
3. **로그인 리디렉션 URL** 설정:
   ```
   https://your-app.vercel.app/api/auth/chzzk/callback
   ```
4. **Client ID**와 **Client Secret** 복사

### 3.2 Supabase 데이터베이스

1. [Supabase](https://supabase.com/) 계정 생성
2. 새 프로젝트 생성 (Region: **Northeast Asia - Singapore** 또는 **Seoul** 권장)
3. **Settings > Database > Connection string** 에서 URI 복사
4. SQL Editor에서 스키마 실행:
   - `backend/db/schema.sql`
   - `backend/db/migrations/*.sql` (순서대로)

### 3.3 Vercel 계정

1. [Vercel](https://vercel.com/) 계정 생성
2. GitHub 연동
3. 프로젝트 Import (Root Directory: `web`)

### 3.4 Railway 계정

1. [Railway](https://railway.app/) 계정 생성
2. GitHub 연동
3. 프로젝트 생성 (Root Directory: `backend`)

---

## 4. 환경 변수 설정

### 4.1 Vercel 환경 변수 (프론트엔드)

Vercel Dashboard > Settings > Environment Variables

| 변수명 | 설명 | 예시 값 |
|--------|------|---------|
| `CHZZK_CLIENT_ID` | 치지직 OAuth Client ID | `adbe2be0-a1c7-43a5-bdfd-...` |
| `CHZZK_CLIENT_SECRET` | 치지직 OAuth Client Secret | `ahHose2CWgcApBBrxtImzPf5...` |
| `CHZZK_REDIRECT_URI` | OAuth 콜백 URL | `https://your-app.vercel.app/api/auth/chzzk/callback` |
| `NEXT_PUBLIC_BASE_URL` | 프론트엔드 기본 URL | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_API_URL` | 백엔드 API URL | `https://your-api.railway.app` |

**선택 사항:**
| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `NEXT_PUBLIC_ENABLE_DEV_MODE` | 개발자 모드 활성화 | `false` |
| `NEXT_PUBLIC_DEV_PASSWORD` | 개발자 모드 비밀번호 | (미설정) |
| `NEXT_PUBLIC_FORCE_MOCK` | 강제 Mock 모드 | `false` |

### 4.2 Railway 환경 변수 (백엔드)

Railway Dashboard > Variables

| 변수명 | 설명 | 예시 값 |
|--------|------|---------|
| `DATABASE_URL` | PostgreSQL 연결 문자열 | `postgresql://postgres:password@db.xxx.supabase.co:5432/postgres` |
| `JWT_SECRET` | JWT 서명 키 (32자 이상) | `your-super-secret-jwt-key-32chars` |
| `ENCRYPTION_KEY` | 토큰 암호화 키 (64자 hex) | `openssl rand -hex 32` 로 생성 |
| `FRONTEND_URL` | 프론트엔드 URL | `https://your-app.vercel.app` |
| `CHZZK_CLIENT_ID` | 치지직 OAuth Client ID | (Vercel과 동일) |
| `CHZZK_CLIENT_SECRET` | 치지직 OAuth Client Secret | (Vercel과 동일) |
| `CHZZK_REDIRECT_URI` | OAuth 콜백 URL | (Vercel과 동일) |
| `NODE_ENV` | 환경 | `production` |

**선택 사항:**
| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `ENABLE_DEV_MODE` | 개발자 모드 API 활성화 | `false` |
| `PORT` | 서버 포트 | `3001` |

---

## 5. 배포 단계

### Step 1: 데이터베이스 설정

```sql
-- Supabase SQL Editor에서 실행
-- 1. schema.sql 실행
-- 2. migrations/*.sql 순서대로 실행
```

### Step 2: Railway 배포

1. Railway 대시보드에서 환경 변수 설정
2. GitHub에서 자동 배포 또는 수동 배포
3. 배포 완료 후 **도메인 확인**: `https://your-api.railway.app`
4. Health 체크: `https://your-api.railway.app/health`

### Step 3: Vercel 배포

1. Vercel 대시보드에서 환경 변수 설정
2. GitHub에서 자동 배포 또는 수동 배포
3. 배포 완료 후 **도메인 확인**: `https://your-app.vercel.app`

### Step 4: 치지직 Developer 설정 업데이트

1. 치지직 Developer 콘솔 접속
2. **로그인 리디렉션 URL**을 실제 Vercel 도메인으로 업데이트:
   ```
   https://your-app.vercel.app/api/auth/chzzk/callback
   ```

### Step 5: 테스트

1. `https://your-app.vercel.app` 접속
2. "치지직 계정으로 시작하기" 클릭
3. 치지직 로그인 → 권한 동의 → 콜백 → 온보딩 페이지

---

## 6. OAuth 설정

### 6.1 OAuth 플로우

```
1. 사용자가 "로그인" 버튼 클릭
   ↓
2. Vercel API Route (/api/auth/chzzk/login)
   - State 생성 및 저장
   - 치지직 OAuth URL로 리다이렉트
   ↓
3. 치지직 로그인 페이지
   - 사용자 인증 + 권한 동의
   ↓
4. Vercel API Route (/api/auth/chzzk/callback)
   - code와 state 수신
   - 치지직 API로 토큰 교환 (Vercel = 한국 Edge)
   - 사용자 정보 조회
   - Railway 백엔드로 사용자 정보 전송
   ↓
5. Railway 백엔드 (/auth/chzzk/complete)
   - 사용자 DB 저장/업데이트
   - JWT 발급
   ↓
6. Vercel에서 쿠키 설정 + 앱으로 리다이렉트
```

### 6.2 중요: Redirect URI 일치

**반드시 3곳의 URL이 정확히 일치해야 합니다:**

1. 치지직 Developer 콘솔의 "로그인 리디렉션 URL"
2. Vercel의 `CHZZK_REDIRECT_URI` 환경 변수
3. Railway의 `CHZZK_REDIRECT_URI` 환경 변수 (있는 경우)

```
https://your-app.vercel.app/api/auth/chzzk/callback
```

한 글자라도 다르면 OAuth가 실패합니다!

---

## 7. 문제 해결

### 7.1 OAuth 오류

| 오류 | 원인 | 해결 |
|------|------|------|
| `missing_params` | code 또는 state 누락 | OAuth 흐름 재시작 |
| `invalid_state` | CSRF 검증 실패 | 로그인 재시도 (5분 만료) |
| `token_exchange_failed` | 토큰 교환 실패 | Client ID/Secret 확인, Redirect URI 일치 확인 |
| `user_fetch_failed` | 사용자 정보 조회 실패 | 치지직 API 상태 확인 |
| `backend_error` | 백엔드 서버 오류 | Railway 로그 확인, DATABASE_URL 확인 |

### 7.2 환경 변수 디버깅

Vercel Functions 로그에서 확인:
```
🔐 OAuth Login - clientId: adbe2be0-...
🔐 OAuth Login - redirectUri: https://your-app.vercel.app/api/auth/chzzk/callback
```

redirectUri가 치지직 콘솔에 등록된 URL과 다르면 수정 필요

### 7.3 데이터베이스 연결 오류

Railway 로그에서 확인:
```
❌ 데이터베이스 연결 실패: ...
```

**해결:**
1. Supabase의 Connection String 확인
2. `?sslmode=require` 또는 `?sslmode=disable` 시도
3. Supabase Network Restrictions에서 모든 IP 허용 (0.0.0.0/0)

### 7.4 CORS 오류

백엔드 `FRONTEND_URL` 환경 변수가 Vercel 도메인과 일치하는지 확인

---

## 체크리스트

### 배포 전

- [ ] 치지직 Developer 애플리케이션 등록
- [ ] Supabase 프로젝트 생성 및 스키마 적용
- [ ] Railway 환경 변수 설정
- [ ] Vercel 환경 변수 설정

### 배포 후

- [ ] Railway `/health` 엔드포인트 정상 응답
- [ ] Vercel 사이트 정상 접속
- [ ] 로그인 버튼 클릭 시 치지직으로 리다이렉트
- [ ] OAuth 콜백 후 온보딩/앱 페이지 도착
- [ ] 개발자 모드 버튼 숨김 확인 (프로덕션)

---

## 참고 링크

- [치지직 Developer 문서](https://developers.chzzk.naver.com/)
- [Vercel 문서](https://vercel.com/docs)
- [Railway 문서](https://docs.railway.app/)
- [Supabase 문서](https://supabase.com/docs)
