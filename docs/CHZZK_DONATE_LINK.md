# 치지직 치즈 후원 링크 정보

## 현재 상황

제공하신 HTML 소스는 치지직 웹사이트의 React 앱 래퍼입니다. 실제 후원 버튼의 링크는 JavaScript로 동적으로 생성되므로, HTML 소스만으로는 정확한 링크를 찾을 수 없습니다.

## 치지직 후원 링크 조사 결과

### 1. 공식 문서 확인 필요

치지직에서 공식적으로 제공하는 후원 딥링크는 다음을 통해 확인할 수 있습니다:
- [치지직 개발자 포털](https://developers.chzzk.naver.com/)
- [치지직 Open API 문서](https://chzzk.gitbook.io/chzzk)
- 치지직 고객센터 문의

### 2. 예상되는 링크 형식

#### 웹 링크 (예상)
```
https://chzzk.naver.com/live/{channelId}/donate
https://chzzk.naver.com/live/{channelId}?tab=donate
```

#### 딥링크 (예상)
```
chzzk://donate?channelId={channelId}
chzzk://live/{channelId}/donate
```

### 3. 현재 Melt 구현 상태

Melt는 이미 후원 링크를 유연하게 처리할 수 있도록 구현되어 있습니다:

#### 코드 위치
- `web/components/DonateButton.tsx`: 후원 버튼 컴포넌트
- `web/app/app/channels/[chzzkChannelId]/donate/page.tsx`: 후원 페이지
- `web/app/app/creator/settings/page.tsx`: 크리에이터 설정 페이지

#### 현재 동작 방식
1. **후원 딥링크가 등록된 경우**: 등록된 링크로 직접 이동
2. **후원 딥링크가 없는 경우**: 채널 페이지로 이동 후 사용자가 수동으로 후원

```typescript
// DonateButton.tsx에서의 로직
const donateUrl = channel?.data?.channel?.donate_url
const channelUrl = channel?.data?.channel?.channel_url || `https://chzzk.naver.com/live/${chzzkChannelId}`

if (donateUrl) {
  // 등록된 후원 딥링크 사용
  return <a href={donateUrl}>💰 치즈 보내기</a>
} else {
  // Melt 후원 페이지로 이동
  return <Link href={`/app/channels/${chzzkChannelId}/donate`}>💰 치즈 보내기</Link>
}
```

## 치즈 후원 링크 찾는 방법

### 방법 1: 브라우저 개발자 도구 사용

1. 치지직 채널 페이지 접속: `https://chzzk.naver.com/live/{channelId}`
2. F12로 개발자 도구 열기
3. Network 탭 열기
4. "치즈 보내기" 버튼 클릭
5. Network 탭에서 요청 URL 확인

### 방법 2: 페이지 소스 검사

1. 치지직 채널 페이지 접속
2. F12로 개발자 도구 열기
3. Elements 탭에서 "치즈 보내기" 버튼 찾기
4. 버튼의 `href` 속성 또는 `onClick` 이벤트 확인

### 방법 3: 치지직 API 확인

치지직 Open API에서 채널 정보를 조회하면 후원 링크가 포함되어 있을 수 있습니다:

```typescript
// 예상 API 엔드포인트
GET https://api.chzzk.naver.com/open/v1/channels/{channelId}
```

### 방법 4: 치지직 개발자 포털 문의

공식적인 후원 딥링크가 있는지 직접 문의:
- [치지직 개발자 포털](https://developers.chzzk.naver.com/)
- 치지직 고객센터

## 현재 권장 설정

### 최소 설정 (안전한 방법)
```
채널 ID: {channelId}
채널 URL: https://chzzk.naver.com/live/{channelId}
후원 딥링크: (비워둠)
치즈 충전: https://game.naver.com/profile#cash
```

이 설정으로:
1. 사용자가 "치즈 보내기" 클릭
2. Melt 후원 페이지에서 메시지 입력
3. "치지직에서 후원하기" 클릭
4. 채널 페이지로 이동
5. 사용자가 수동으로 치즈 버튼 클릭
6. 후원 완료 후 Melt로 돌아와서 메시지 등록

### 최적 설정 (딥링크 확인 후)
```
채널 ID: {channelId}
채널 URL: https://chzzk.naver.com/live/{channelId}
후원 딥링크: {확인된 딥링크 URL}
치즈 충전: https://game.naver.com/profile#cash
```

## 치즈 충전 링크 (확인됨)

### 네이버 프로필 페이지
```
https://game.naver.com/profile#cash
```

이 링크는 네이버 로그인 상태에서 치즈 충전 및 잔액 확인이 가능합니다.

## 구현된 기능

Melt는 이미 다음 기능을 구현했습니다:

1. **크리에이터가 후원 링크 등록 가능**
   - 크리에이터 설정 페이지에서 후원 딥링크 입력
   - API: `PUT /channels/{chzzkChannelId}/settings`

2. **유연한 후원 플로우**
   - 딥링크가 있으면 직접 이동
   - 딥링크가 없으면 채널 페이지로 이동

3. **치즈 충전 링크 지원**
   - 기본값: `https://game.naver.com/profile#cash`
   - 크리에이터가 커스터마이징 가능

## 다음 단계

1. **치지직 개발자 포털 확인**
   - 공식 후원 딥링크 문서 확인
   - API에서 후원 링크 제공 여부 확인

2. **실제 채널 페이지에서 링크 추출**
   - 개발자 도구로 실제 링크 확인
   - 여러 채널에서 패턴 확인

3. **커뮤니티/포럼 확인**
   - 치지직 관련 커뮤니티에서 정보 수집
   - 오픈소스 프로젝트 확인: [awesome-chzzk](https://github.com/dokdo2013/awesome-chzzk)

4. **테스트 및 검증**
   - 확인된 링크로 실제 후원 테스트
   - 다양한 환경에서 동작 확인

## 참고 자료

- [치지직 개발자 포털](https://developers.chzzk.naver.com/)
- [치지직 Open API 문서](https://chzzk.gitbook.io/chzzk)
- [awesome-chzzk 프로젝트](https://github.com/dokdo2013/awesome-chzzk)
- [Melt 후원 링크 설정 가이드](./DONATE_LINKS.md)

## 결론

현재 Melt는 후원 링크를 유연하게 처리할 수 있도록 구현되어 있습니다. 정확한 치지직 공식 후원 딥링크를 찾으면, 크리에이터 설정 페이지에서 등록하여 사용할 수 있습니다.

**임시 해결책**: 후원 딥링크를 비워두고 채널 페이지로 이동하는 방식으로도 충분히 작동합니다.
