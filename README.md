# Melt (멜트)

방송이 꺼진 뒤에도 후원이 흐르도록 설계된 치지직 기반 후원·메시지 웹앱

## 프로젝트 구조

```
cheese3/
├── backend/          # 백엔드 API 서버 (Node.js/Express)
├── web/             # 프론트엔드 웹앱 (Next.js)
├── docs/            # 문서 및 스펙
└── README.md
```

## 핵심 기능

- **치즈 후원**: 방송 중이 아니어도 치즈(도네이션) + 메시지 전송 가능
- **메시지 시스템**: 
  - 치즈로 보낸 메시지 = 전체 공개
  - 스트리머 메시지 = 전체 공개
  - 일반 유저 메시지 = 스트리머에게만 비공개
- **RT 기능**: 스트리머가 비공개 메시지를 공개로 전환
- **뱃지 시스템**: 누적 치즈 기반 자체 뱃지 (Phase 2)
- **통계 및 선정산**: 후원 데이터 집계 및 선정산 서비스 (Phase 3)

## 기술 스택

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Auth**: 치지직 OAuth 2.0

## 개발 원칙

1. **치지직 채팅과 완전 분리**: Melt 메시지는 치지직 채팅에 남지 않음
2. **치즈 결제는 치지직 공식 UI 사용**: API로 직접 결제 실행하지 않음
3. **후원 상태 모델**: PENDING → OCCURRED → CONFIRMED
4. **모바일 최적화**: 웹에서도 좌우 마스킹으로 모바일 UI 유지

## 시작하기

### 빠른 테스트 (더미 데이터)

```bash
# 1. 데이터베이스 설정
createdb melt
psql -U postgres -d melt -f backend/db/schema.sql
psql -U postgres -d melt -f backend/db/migrations/001_add_channel_urls.sql
psql -U postgres -d melt -f backend/db/migrations/002_add_follows_and_reads.sql

# 2. 더미 데이터 생성
cd backend
npm install
npm run seed

# 3. 백엔드 실행
npm run dev

# 4. 프론트엔드 실행 (새 터미널)
cd ../web
npm install
npm run dev

# 5. 브라우저에서 http://localhost:3000/dev/login 접속
```

자세한 내용은 [TEST_SETUP.md](TEST_SETUP.md) 참조

### 실제 환경 설정

#### 백엔드 설정

```bash
cd backend
npm install
cp .env.example .env
# .env 파일에 치지직 OAuth 정보 입력
npm run dev
```

#### 프론트엔드 설정

```bash
cd web
npm install
cp .env.example .env.local
# .env.local 파일에 API URL 입력
npm run dev
```

#### 데이터베이스 설정

```bash
# PostgreSQL 실행 후
psql -U postgres -d melt
\i backend/db/schema.sql
\i backend/db/migrations/001_add_channel_urls.sql
\i backend/db/migrations/002_add_follows_and_reads.sql
```

## 문서

- [아키텍처 문서](docs/ARCHITECTURE.md) - 전체 시스템 구조
- [API 문서](docs/API.md) - Melt API 엔드포인트
- [설정 가이드](docs/SETUP.md) - 개발 환경 설정
- [치지직 API 가이드](docs/CHZZK_API.md) - 치지직 API 연동
- [API 참조 문서](docs/API_REFERENCES.md) - 필요한 API 문서 링크
- [개발 가이드](docs/DEVELOPMENT_GUIDE.md) - 개발자 가이드

## 치지직 API 문서

- **공식 Open API 문서**: https://chzzk.gitbook.io/chzzk
- **개발자 포털**: https://developers.chzzk.naver.com/
- **오픈소스 프로젝트**: https://github.com/dokdo2013/awesome-chzzk

## 라이선스

MIT
