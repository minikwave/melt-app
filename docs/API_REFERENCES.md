# Melt API 참조 문서

## 치지직 (CHZZK) API

### 공식 문서
- **Open API 문서**: https://chzzk.gitbook.io/chzzk
- **개발자 포털**: https://developers.chzzk.naver.com/
- **오픈소스 프로젝트 모음**: https://github.com/dokdo2013/awesome-chzzk

### 현재 Melt에서 사용하는 API

#### 1. OAuth 인증
```
GET https://chzzk.naver.com/account-interlock
POST https://api.chzzk.naver.com/auth/v1/token
```

**사용 위치**: `backend/src/routes/auth.ts`

**필요한 정보**:
- Client ID
- Client Secret
- Redirect URI

**문서 위치**: https://chzzk.gitbook.io/chzzk/authorization

#### 2. 유저 정보 조회
```
GET https://api.chzzk.naver.com/open/v1/users/me
```

**사용 위치**: `backend/src/routes/auth.ts`

**응답 예시**:
```json
{
  "content": {
    "userId": "string",
    "nickname": "string",
    "channelId": "string",
    "channelName": "string"
  }
}
```

**문서 위치**: https://chzzk.gitbook.io/chzzk/user

#### 3. Session API (후원 이벤트 구독) - 향후 사용 예정
```
GET https://api.chzzk.naver.com/open/v1/sessions/auth
POST https://api.chzzk.naver.com/open/v1/sessions/events/subscribe/donation
```

**현재 상태**: Phase 1에서는 미사용, Phase 2에서 자동화용으로 사용 예정

**문서 위치**: https://chzzk.gitbook.io/chzzk/session

### 현재 미사용이지만 유용한 API

#### 1. 채널 정보 조회
```
GET https://api.chzzk.naver.com/open/v1/channels/{channelId}
```

**용도**: 채널 이름, 썸네일 등 메타데이터 조회

**문서 위치**: https://chzzk.gitbook.io/chzzk/channel

#### 2. 라이브 상태 조회
```
GET https://api.chzzk.naver.com/open/v1/channels/{channelId}/live-status
```

**용도**: 방송 중 여부 확인

**문서 위치**: https://chzzk.gitbook.io/chzzk/channel

#### 3. 채팅 API (선택적)
```
POST https://api.chzzk.naver.com/open/v1/chats/send
```

**용도**: Melt에서는 사용하지 않음 (Melt 메시지는 치지직 채팅과 분리)

**문서 위치**: https://chzzk.gitbook.io/chzzk/chat

### 치지직 후원 딥링크/URL

**현재 구현**: 채널 페이지로 이동 후 사용자가 수동으로 치즈 버튼 클릭

**필요한 정보** (확인 필요):
- 치즈 충전 페이지 직접 링크
- 치즈 후원 페이지 직접 링크
- 딥링크 스킴 (chzzk://)

**참고**: 치지직 고객센터 문서나 개발자 포럼에서 확인 필요

### 비공식 API (참고용)

**주의**: 비공식 API는 핵심 기능에 사용하지 않음

- `api.chzzk.naver.com` 기반 비공식 엔드포인트
- 커뮤니티에서 사용 중이지만 보호조치 가능
- Melt에서는 UX 보조용으로만 선택적 사용

**참고 링크**: https://github.com/dokdo2013/awesome-chzzk

## 네이버 API

### 네이버 로그인 API

**현재 구현**: 치지직 OAuth를 통해 네이버 계정으로 로그인

**만약 네이버 로그인을 별도로 구현한다면**:
- 네이버 개발자 센터: https://developers.naver.com/
- 네이버 로그인 API: https://developers.naver.com/docs/login/overview/

**현재는 필요 없음**: 치지직 OAuth가 네이버 계정을 사용하므로 별도 구현 불필요

## 추가로 필요한 정보

### 1. 치지직 후원 딥링크
```
확인 필요:
- 치즈 충전 페이지 URL
- 치즈 후원 페이지 URL  
- 딥링크 스킴 (chzzk://cheese?channelId=xxx)
```

**확인 방법**:
- 치지직 개발자 포털 문의
- 치지직 고객센터
- 커뮤니티/포럼

### 2. Session API 스코프
```
확인 필요:
- 후원 이벤트 구독에 필요한 스코프
- 권한 신청 없이 사용 가능한지
```

**문서**: https://chzzk.gitbook.io/chzzk/session

### 3. Rate Limit
```
확인 필요:
- API 호출 제한
- 보호조치 기준
```

**참고**: 개발자 포럼에서 "과도한 호출" 기준 논의 있음

## 개발자 포털 설정

### 1. 애플리케이션 등록
1. https://developers.chzzk.naver.com/ 접속
2. 새 애플리케이션 생성
3. Redirect URI 설정: `http://localhost:3001/auth/chzzk/callback`
4. Client ID, Client Secret 발급

### 2. 필요한 스코프
현재는 기본 OAuth 스코프만 사용:
- 유저 정보 조회
- (향후) 후원 이벤트 구독 (Session API)

### 3. 환경 변수 설정
```env
CHZZK_CLIENT_ID=your-client-id
CHZZK_CLIENT_SECRET=your-client-secret
CHZZK_REDIRECT_URI=http://localhost:3001/auth/chzzk/callback
```

## 문제 해결

### OAuth 오류
- Redirect URI가 정확히 일치하는지 확인
- Client ID/Secret이 올바른지 확인
- 개발자 포털에서 애플리케이션 상태 확인

### API 호출 실패
- Rate Limit 확인
- 토큰 만료 확인 (Refresh Token 사용)
- 네트워크 오류 확인

### 후원 이벤트 미수신
- Session API 스코프 확인
- 권한 신청 필요 여부 확인
- 현재는 수동 확인 방식 사용

## 참고 자료

1. **치지직 공식 문서**: https://chzzk.gitbook.io/chzzk
2. **개발자 포털**: https://developers.chzzk.naver.com/
3. **오픈소스 프로젝트**: https://github.com/dokdo2013/awesome-chzzk
4. **개발자 포럼**: 치지직 개발자 커뮤니티

## 다음 단계

1. ✅ OAuth 로그인 구현 완료
2. ✅ 유저 정보 조회 구현 완료
3. ⏳ 치지직 후원 딥링크 확인 필요
4. ⏳ Session API 테스트 (Phase 2)
5. ⏳ 채널 메타데이터 조회 (선택적)
