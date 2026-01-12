# Melt Web (프론트엔드)

Melt 웹앱 프론트엔드 - Next.js 14 기반

## 기능

- ✅ 네이버 소셜 로그인 (치지직 OAuth 연동)
- ✅ 치지직 계정 연동
- ✅ 메신저 UI (DM, 공개 메시지 구분)
- ✅ 채널 검색 및 이동
- ✅ 크리에이터 대시보드
- ✅ 모바일 최적화 (데스크톱 양옆 마스킹)

## 시작하기

### 설치

```bash
npm install
```

### 환경 변수 설정

`.env.local` 파일 생성:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CHZZK_CLIENT_ID=your-chzzk-client-id
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

### 빌드

```bash
npm run build
npm start
```

## 프로젝트 구조

```
web/
├── app/                    # Next.js App Router
│   ├── auth/              # 인증 페이지
│   │   ├── naver/         # 네이버 로그인
│   │   └── chzzk/         # 치지직 콜백
│   └── app/               # 메인 앱
│       ├── channels/      # 채널 페이지
│       └── creator/       # 크리에이터 대시보드
├── components/            # React 컴포넌트
│   ├── DonateButton.tsx   # 후원 버튼
│   ├── MessageList.tsx    # 메시지 목록
│   └── MessageInput.tsx   # 메시지 입력
├── lib/                   # 유틸리티
│   └── api.ts            # API 클라이언트
└── package.json
```

## 주요 기능 설명

### 메시지 시스템

- **일반 유저**: 메시지는 크리에이터에게만 전달 (비공개)
- **크리에이터**: 메시지는 모두에게 공개
- **RT 기능**: 크리에이터가 DM을 공개 피드로 전환 가능

### 로그인 플로우

1. 네이버 로그인 버튼 클릭
2. 치지직 OAuth로 리다이렉트
3. 로그인 및 동의
4. 콜백 처리 후 메인 화면으로 이동

## 기술 스택

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- React Query (TanStack Query)
- Axios
