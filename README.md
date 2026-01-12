# Melt (멜트)

방송이 꺼진 뒤에도 후원이 흐르도록 설계된 치지직 기반 후원·메시지 웹앱

## 🚀 빠른 시작

### 개발 모드 (백엔드 없이 테스트)

```powershell
# 프론트엔드만 실행
cd web
npm install
npm run dev
```

브라우저에서 `http://localhost:3000/dev/login` 접속하여 더미 유저로 테스트

### 전체 환경 (백엔드 + 프론트엔드)

```powershell
# 1. 백엔드 실행
cd backend
npm install
npm run dev

# 2. 프론트엔드 실행 (새 터미널)
cd web
npm install
npm run dev
```

## 📁 프로젝트 구조

```
cheese3/
├── backend/          # 백엔드 API 서버 (Node.js/Express)
├── web/             # 프론트엔드 웹앱 (Next.js)
├── docs/            # 문서 및 스펙
└── README.md
```

## ✨ 핵심 기능

- **치즈 후원**: 방송 중이 아니어도 치즈(도네이션) + 메시지 전송 가능
- **메시지 시스템**: 
  - 치즈로 보낸 메시지 = 전체 공개
  - 스트리머 메시지 = 전체 공개
  - 일반 유저 메시지 = 스트리머에게만 비공개
- **RT 기능**: 스트리머가 비공개 메시지를 공개로 전환
- **인기 크리에이터**: 둘러보기 페이지에서 인기 크리에이터 목록
- **검색 기능**: 크리에이터 검색 및 팔로우
- **읽지 않은 메시지 수**: 대화방 및 인박스에 배지 표시
- **프로필 설정**: 이름 변경 및 로그아웃

## 🛠️ 기술 스택

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Auth**: 치지직 OAuth 2.0

## 📋 구현 상태

### ✅ Phase 0 (MVP) - 완료
- 기본 메시징
- 후원 Intent/Event
- Creator 인박스
- 검색 및 팔로우
- 인기 크리에이터 목록

### ✅ Phase 1.1 - 완료
- 읽지 않은 메시지 수 표시
- 후원 완료 후 메시지 자동 등록
- 프로필 설정 기능

### 🔄 Phase 1.2 - 진행 예정
- 메시지 상태 표시
- 크리에이터 대시보드 통계
- 실시간 피드 업데이트 개선

### 📅 Phase 2 - 계획
- 뱃지 시스템
- 메시지 모더레이션
- 고급 통계 및 분석

## 🧪 개발 모드 테스트

모든 기능은 개발 모드에서 Mock 데이터로 테스트 가능합니다:

1. `http://localhost:3000/dev/login` 접속
2. 더미 유저 선택 (예: `creator_1`, `viewer_1`)
3. 모든 기능 테스트

## 📚 문서

- [프로젝트 평가](PROJECT_EVALUATION.md) - 현재 상태 평가
- [구현 계획](IMPLEMENTATION_PLAN.md) - 상세 구현 계획
- [구현 로드맵](IMPLEMENTATION_ROADMAP.md) - 단계별 구현 순서
- [추가 기능](web/ADDITIONAL_FEATURES.md) - 추가 구현 필요 기능
- [아키텍처 문서](docs/ARCHITECTURE.md) - 전체 시스템 구조
- [API 문서](docs/API.md) - Melt API 엔드포인트

## 🔗 치지직 API 문서

- **공식 Open API 문서**: https://chzzk.gitbook.io/chzzk
- **개발자 포털**: https://developers.chzzk.naver.com/
- **오픈소스 프로젝트**: https://github.com/dokdo2013/awesome-chzzk

## 📝 개발 원칙

1. **치지직 채팅과 완전 분리**: Melt 메시지는 치지직 채팅에 남지 않음
2. **치즈 결제는 치지직 공식 UI 사용**: API로 직접 결제 실행하지 않음
3. **후원 상태 모델**: PENDING → OCCURRED → CONFIRMED
4. **모바일 최적화**: 웹에서도 좌우 마스킹으로 모바일 UI 유지
5. **개발 모드 우선**: 모든 기능은 Mock 데이터로 먼저 구현 및 테스트

## 🐛 문제 해결

### 빌드 오류
```powershell
cd web
$env:NODE_ENV='production'
npm run build
```

### 서버 실행
```powershell
# 개발 서버
cd web
npm run dev

# 프로덕션 서버
cd web
npm run build
npm start
```

## 📄 라이선스

MIT
