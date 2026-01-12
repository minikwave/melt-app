# 치지직 API 연동 가이드

## 개요

Melt는 치지직 Open API를 사용하여 OAuth 인증 및 유저 정보를 가져옵니다.

## 사용하는 API

### 1. OAuth 인증

#### Authorization URL
```
https://chzzk.naver.com/account-interlock
```

**Query Parameters**:
- `clientId`: 치지직 Client ID
- `redirectUri`: 콜백 URI
- `state`: CSRF 방지용 state

#### Token 교환
```
POST https://api.chzzk.naver.com/auth/v1/token
```

**Body** (application/x-www-form-urlencoded):
- `grant_type`: "authorization_code"
- `client_id`: Client ID
- `client_secret`: Client Secret
- `code`: Authorization code
- `redirect_uri`: Redirect URI

**Response**:
```json
{
  "access_token": "string",
  "refresh_token": "string",
  "expires_in": 86400
}
```

### 2. 유저 정보 조회

```
GET https://api.chzzk.naver.com/open/v1/users/me
```

**Headers**:
- `Authorization: Bearer {access_token}`

**Response**:
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

## Melt에서의 사용

### OAuth 플로우

1. 사용자가 "치지직으로 로그인" 클릭
2. `/auth/chzzk/login`으로 리다이렉트
3. 치지직 OAuth 페이지로 이동
4. 사용자 로그인 및 동의
5. `/auth/chzzk/callback`으로 리다이렉트 (code 포함)
6. Backend에서 code를 token으로 교환
7. `users/me`로 유저 정보 조회
8. DB에 유저 저장/업데이트
9. Melt JWT 세션 생성
10. 프론트엔드로 리다이렉트

### 토큰 관리

- Access Token과 Refresh Token은 DB에 저장
- 실제 운영 환경에서는 암호화 저장 권장
- Token 만료 시 Refresh Token으로 갱신

## 주의사항

1. **권한 신청 없이 사용**: 현재는 기본 OAuth 스코프만 사용
2. **비공식 API 사용 안 함**: 핵심 기능에는 비공식 API 사용하지 않음
3. **Rate Limit**: 과도한 호출 시 보호조치 가능
4. **Token 보안**: Access Token은 서버에만 저장, 클라이언트에 노출하지 않음

## 참고 링크

- [치지직 Open API 문서](https://chzzk.gitbook.io/chzzk)
- [치지직 개발자 포털](https://developers.chzzk.naver.com/)
- [awesome-chzzk](https://github.com/dokdo2013/awesome-chzzk)
