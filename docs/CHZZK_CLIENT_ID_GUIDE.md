# 치지직 클라이언트 ID 발급 가이드

## 1. 치지직 개발자 포털 접속

1. **치지직 개발자 포털 접속**
   ```
   https://developers.chzzk.naver.com/
   ```

2. **네이버 계정으로 로그인**
   - 네이버 계정이 필요합니다
   - 치지직 계정과 연동된 네이버 계정 사용

## 2. 애플리케이션 등록

### 2.1 새 애플리케이션 생성

1. **대시보드** 또는 **"애플리케이션 관리"** 메뉴 클릭
2. **"애플리케이션 등록"** 또는 **"새 애플리케이션 만들기"** 클릭

### 2.2 애플리케이션 정보 입력

필수 입력 항목:
- **애플리케이션 이름**: `Melt` (또는 원하는 이름)
- **애플리케이션 설명**: `방송 외 후원 플랫폼` (선택)
- **서비스 URL**: `https://[Vercel-도메인]` (프로덕션)
- **Redirect URI**: 
  - 개발: `http://localhost:3001/auth/chzzk/callback`
  - 프로덕션: `https://[Railway-도메인]/auth/chzzk/callback`

### 2.3 Redirect URI 설정

**중요**: Redirect URI는 정확히 일치해야 합니다!

**개발 환경**:
```
http://localhost:3001/auth/chzzk/callback
```

**프로덕션 환경**:
```
https://[Railway-백엔드-도메인]/auth/chzzk/callback
```

**여러 URI 등록 가능**:
- 개발용과 프로덕션용을 모두 등록할 수 있습니다
- 각각 다른 URI를 등록하면 개발/프로덕션 모두 사용 가능

## 3. Client ID 및 Client Secret 확인

### 3.1 발급된 정보 확인

애플리케이션 등록 후 다음 정보가 발급됩니다:

1. **Client ID**
   - 형식: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` (UUID 형식)
   - 예시: `adbe2be0-a1c7-43a5-bdfd-408491968f3b`
   - **공개 가능**: 프론트엔드에서 사용 가능

2. **Client Secret**
   - 형식: 랜덤 문자열
   - 예시: `ahHose2CWgcApBBrxtlmzPf5THLxEURXwr5s7uc2OFk`
   - **비공개**: 백엔드에서만 사용, 절대 노출 금지!

### 3.2 정보 확인 위치

1. **애플리케이션 관리** → **애플리케이션 목록**
2. 등록한 애플리케이션 클릭
3. **"애플리케이션 정보"** 또는 **"API 정보"** 탭에서 확인

## 4. 환경 변수에 설정

### 로컬 개발 환경

**backend/.env**:
```env
CHZZK_CLIENT_ID=adbe2be0-a1c7-43a5-bdfd-408491968f3b
CHZZK_CLIENT_SECRET=ahHose2CWgcApBBrxtlmzPf5THLxEURXwr5s7uc2OFk
CHZZK_REDIRECT_URI=http://localhost:3001/auth/chzzk/callback
```

**web/.env.local**:
```env
NEXT_PUBLIC_CHZZK_CLIENT_ID=adbe2be0-a1c7-43a5-bdfd-408491968f3b
```

### 프로덕션 환경

**Railway (백엔드)**:
```env
CHZZK_CLIENT_ID=adbe2be0-a1c7-43a5-bdfd-408491968f3b
CHZZK_CLIENT_SECRET=ahHose2CWgcApBBrxtlmzPf5THLxEURXwr5s7uc2OFk
CHZZK_REDIRECT_URI=https://[Railway-도메인]/auth/chzzk/callback
```

**Vercel (프론트엔드)**:
```env
NEXT_PUBLIC_CHZZK_CLIENT_ID=adbe2be0-a1c7-43a5-bdfd-408491968f3b
```

## 5. 주의사항

### 보안
- ✅ **Client ID**: 프론트엔드에서 사용 가능 (공개 가능)
- ❌ **Client Secret**: 백엔드에서만 사용, 절대 노출 금지!
- ❌ **Git에 커밋하지 마세요**: `.env` 파일은 `.gitignore`에 포함

### Redirect URI
- Redirect URI는 **정확히 일치**해야 합니다
- 프로토콜(`http` vs `https`), 도메인, 경로 모두 일치해야 함
- 개발/프로덕션용으로 각각 등록 가능

### 권한
- 기본 OAuth 스코프만 사용 (별도 권한 신청 불필요)
- 사용자 정보 조회, 채널 정보 조회 등 기본 기능 사용 가능

## 6. 문제 해결

### "Invalid redirect URI" 오류

**원인**: Redirect URI가 개발자 포털에 등록된 URI와 일치하지 않음

**해결**:
1. 치지직 개발자 포털에서 등록된 Redirect URI 확인
2. 환경 변수의 `CHZZK_REDIRECT_URI`와 정확히 일치하는지 확인
3. 프로토콜(`http`/`https`), 도메인, 경로 모두 확인

### "Invalid client" 오류

**원인**: Client ID 또는 Client Secret이 잘못됨

**해결**:
1. 개발자 포털에서 Client ID/Secret 재확인
2. 환경 변수에 올바르게 설정되었는지 확인
3. 공백이나 따옴표가 포함되지 않았는지 확인

### Client Secret 재발급

1. 개발자 포털 → 애플리케이션 관리
2. 해당 애플리케이션 선택
3. "Client Secret 재발급" 또는 유사한 옵션 클릭
4. **주의**: 재발급 시 기존 Secret은 무효화됨

## 7. 참고 자료

- [치지직 개발자 포털](https://developers.chzzk.naver.com/)
- [치지직 Open API 문서](https://chzzk.gitbook.io/chzzk)
- [OAuth 2.0 가이드](https://chzzk.gitbook.io/chzzk/chzzk-api/oauth)

## 8. 체크리스트

- [ ] 치지직 개발자 포털 계정 생성
- [ ] 애플리케이션 등록
- [ ] Client ID 발급 확인
- [ ] Client Secret 발급 확인
- [ ] Redirect URI 등록 (개발용)
- [ ] Redirect URI 등록 (프로덕션용)
- [ ] 로컬 환경 변수 설정
- [ ] 프로덕션 환경 변수 설정 (Railway, Vercel)
- [ ] OAuth 로그인 테스트
