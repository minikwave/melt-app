# 후원 링크 설정 가이드

## 개요

Melt는 스트리머가 자신의 채널에 대한 후원 링크를 직접 등록할 수 있는 기능을 제공합니다.

## 설정 가능한 링크

### 1. 채널 페이지 URL
- **기본값**: `https://chzzk.naver.com/live/{channelId}`
- **용도**: 치지직 채널 메인 페이지
- **자동 생성**: 채널 ID만 입력하면 자동으로 생성됩니다

### 2. 후원 딥링크 (선택사항)
- **기본값**: 없음 (채널 페이지로 이동)
- **용도**: 치즈 후원 페이지로 직접 이동
- **예시**: 
  - `https://chzzk.naver.com/live/{channelId}/donate`
  - `chzzk://donate?channelId={channelId}` (딥링크)

### 3. 치즈 충전 링크
- **기본값**: `https://game.naver.com/profile#cash`
- **용도**: 치즈 충전 페이지
- **참고**: [네이버 프로필 페이지](https://game.naver.com/profile#cash)에서 치즈 충전 가능

## 설정 방법

### 크리에이터 대시보드에서

1. 크리에이터 대시보드 접속
2. "채널 설정" 버튼 클릭
3. 채널 ID 입력
4. 후원 링크 입력 (선택사항)
5. "설정 저장" 클릭

### API로 직접 설정

```http
PUT /channels/{chzzkChannelId}/settings
Authorization: Bearer {token}

{
  "channelUrl": "https://chzzk.naver.com/live/abc123",
  "donateUrl": "https://chzzk.naver.com/live/abc123/donate",
  "chargeUrl": "https://game.naver.com/profile#cash"
}
```

## 후원 플로우

### 후원 딥링크가 있는 경우
1. 사용자가 "치즈 보내기" 클릭
2. 등록된 후원 딥링크로 직접 이동
3. 치지직에서 후원 완료
4. Melt로 돌아와서 메시지 등록

### 후원 딥링크가 없는 경우
1. 사용자가 "치즈 보내기" 클릭
2. Melt 후원 페이지에서 메시지 입력
3. "치지직에서 후원하기" 클릭
4. 채널 페이지로 이동
5. 사용자가 수동으로 치즈 버튼 클릭
6. 후원 완료 후 Melt로 돌아와서 메시지 등록

## 치즈 충전 링크

### 기본 링크
- **URL**: https://game.naver.com/profile#cash
- **조건**: 네이버 로그인 필요
- **용도**: 치즈 충전

### 사용 시나리오
1. 사용자가 치즈가 부족한 경우
2. 치즈 충전 링크로 이동
3. 네이버 프로필에서 치즈 충전
4. 후원 페이지로 돌아와서 후원 완료

## 딥링크 찾기

### 치지직 후원 딥링크
현재 치지직에서 공식적으로 제공하는 후원 딥링크는 확인이 필요합니다.

**확인 방법**:
1. 치지직 개발자 포털 문의
2. 치지직 고객센터 문의
3. 커뮤니티/포럼 확인

**예상 형태**:
- 웹: `https://chzzk.naver.com/live/{channelId}/donate`
- 앱: `chzzk://donate?channelId={channelId}`

### 네이버 치즈 충전
- **확인됨**: https://game.naver.com/profile#cash
- 네이버 로그인 상태에서 접근 가능
- 치즈 충전 및 잔액 확인 가능

## 권장 설정

### 최소 설정
```
채널 ID: abc123def456
채널 URL: (자동 생성)
후원 딥링크: (비워둠)
치즈 충전: https://game.naver.com/profile#cash
```

### 최적 설정 (딥링크 확인 후)
```
채널 ID: abc123def456
채널 URL: https://chzzk.naver.com/live/abc123def456
후원 딥링크: https://chzzk.naver.com/live/abc123def456/donate
치즈 충전: https://game.naver.com/profile#cash
```

## 문제 해결

### 후원 링크가 작동하지 않는 경우
1. URL이 올바른지 확인
2. 치지직 페이지가 정상적으로 열리는지 확인
3. 딥링크 형식이 올바른지 확인

### 치즈 충전 링크 문제
1. 네이버 로그인 상태 확인
2. URL이 정확한지 확인: `https://game.naver.com/profile#cash`
3. 브라우저 호환성 확인

## 참고 링크

- [네이버 프로필 (치즈 충전)](https://game.naver.com/profile#cash)
- [치지직 개발자 포털](https://developers.chzzk.naver.com/)
- [치지직 Open API 문서](https://chzzk.gitbook.io/chzzk)
