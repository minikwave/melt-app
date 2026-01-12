# 🚀 프론트엔드 확인 방법

## ✅ 현재 상태
- 빌드 완료
- 프로덕션 서버 실행 중 (포트 3000)
- 더미 데이터 모드 활성화

## 🌐 브라우저에서 접속

**Cursor 브라우저에서 다음 URL을 열어주세요:**

1. **홈페이지**: http://localhost:3000
2. **개발 로그인**: http://localhost:3000/dev/login

## 📝 명령어

### 빌드 + 서버 시작
```powershell
cd web
$env:NEXT_PUBLIC_FORCE_MOCK="true"
npm run preview
```

### 서버만 시작 (이미 빌드된 경우)
```powershell
cd web
$env:NEXT_PUBLIC_FORCE_MOCK="true"
npm run start
```

## 💡 참고
- 백엔드 API 서버(3001)는 **필요 없습니다**
- 모든 API 요청은 더미 데이터로 응답합니다
- `NEXT_PUBLIC_FORCE_MOCK=true`로 서버 체크를 건너뜁니다
