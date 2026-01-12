# 🚀 프론트엔드만 즉시 테스트하기

서버 없이 더미 데이터로 프론트엔드만 테스트하는 방법입니다.

## ⚡ 즉시 실행

```powershell
cd web
npm run dev:mock
```

브라우저에서 `http://localhost:3000` 접속

## ✅ 특징

- ✅ **서버 체크 완전 스킵** - 백엔드 서버 연결 확인 안 함
- ✅ **즉시 더미 데이터 모드** - 바로 더미 데이터 사용
- ✅ **빠른 시작** - 서버 대기 시간 없음
- ✅ **모든 GET 요청 작동** - 더미 데이터로 즉시 응답

## 📱 테스트 페이지

1. **홈**: http://localhost:3000
2. **개발 로그인**: http://localhost:3000/dev/login
   - `viewer_1` 또는 `creator_1` 선택
3. **메인 대시보드**: http://localhost:3000/app
4. **대화방 목록**: http://localhost:3000/app/conversations
5. **크리에이터 검색**: http://localhost:3000/app/search
6. **채널 메신저**: http://localhost:3000/app/channels/channel_creator_1

## 🔧 일반 모드와의 차이

- **일반 모드** (`npm run dev`): 서버 연결 체크 후 더미 데이터 사용
- **강제 모드** (`npm run dev:mock`): 서버 체크 없이 바로 더미 데이터 사용

## 💡 팁

- POST 요청(메시지 전송 등)은 에러가 나지만 UI는 정상 표시됩니다
- 모든 GET 요청은 더미 데이터로 즉시 응답합니다
- 브라우저 콘솔에서 `🔧 Mock data mode FORCED` 메시지 확인 가능
