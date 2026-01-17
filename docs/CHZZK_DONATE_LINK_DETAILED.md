# 치지직 치즈 후원 링크 상세 확인 가이드

## 1. 브라우저 개발자 도구로 후원 링크 확인하기

### 단계별 절차

#### 1단계: 개발자 도구 준비
1. **브라우저에서 치지직 채널 페이지 열기**
   ```
   https://chzzk.naver.com/live/{channelId}
   ```

2. **개발자 도구 열기**
   - `F12` 또는 `Ctrl+Shift+I` (Windows/Linux)
   - `Cmd+Option+I` (Mac)

3. **Network 탭 설정**
   - Network 탭 클릭
   - **"Preserve log" 체크** (중요: 페이지 전환 시에도 로그 유지)
   - **"Disable cache" 체크** (캐시 무시)

#### 2단계: 후원 버튼 클릭 전 준비
1. Network 탭에서 **Clear 버튼** 클릭하여 기존 로그 삭제
2. 필터 옵션:
   - `XHR` 또는 `Fetch` 선택 (AJAX 요청만 보기)
   - 또는 `All` 선택 (모든 요청 보기)

#### 3단계: 후원 버튼 클릭 및 관찰
1. **"치즈 보내기" 또는 "후원하기" 버튼 클릭**
2. Network 탭에서 새로 나타나는 요청 확인:
   - 요청 이름 (Name)
   - 요청 URL (URL)
   - 요청 방법 (Method: GET, POST 등)
   - 요청 헤더 (Headers)
   - 요청 본문 (Payload)
   - 응답 내용 (Response)

#### 4단계: 링크 추출
확인해야 할 항목:
- **요청 URL**: 후원 처리 API 엔드포인트
- **리다이렉트 URL**: 응답에 포함된 후원 페이지 링크
- **딥링크**: `chzzk://` 또는 특정 URL 패턴

### Elements 탭에서 확인하기

1. **Elements 탭으로 전환**
2. **"치즈 보내기" 버튼 찾기**
   - `Ctrl+F`로 "치즈" 또는 "후원" 검색
   - 또는 버튼에 마우스 오버 후 우클릭 → "Inspect"

3. **버튼 요소 확인**
   ```html
   <!-- 예시 1: 직접 링크 -->
   <a href="https://chzzk.naver.com/live/{id}/donate">치즈 보내기</a>
   
   <!-- 예시 2: JavaScript 이벤트 -->
   <button onclick="donate()">치즈 보내기</button>
   ```

4. **이벤트 리스너 확인**
   - Elements 탭에서 버튼 선택
   - 오른쪽 패널의 **"Event Listeners"** 탭 확인
   - `click` 이벤트에 연결된 함수 찾기

5. **JavaScript 소스 확인**
   - Event Listeners에서 함수 클릭
   - Sources 탭으로 이동하여 실제 코드 확인
   - `window.location.href`, `fetch`, `axios` 등으로 요청하는 URL 찾기

### 메시지 입력 및 후원 플로우 확인

#### 전체 플로우 추적
1. **메시지 입력 페이지 접속**
   - 치지직 채널 페이지에서 "치즈 보내기" 클릭
   - 또는 직접 URL: `https://chzzk.naver.com/live/{channelId}/donate`

2. **Network 탭에서 전체 플로우 관찰**
   ```
   [1] GET /live/{channelId}/donate  (후원 페이지 로드)
   [2] POST /api/donate  (메시지 입력 후 전송)
   [3] GET /payment/...  (결제 페이지로 리다이렉트)
   [4] POST /payment/confirm  (결제 확인)
   ```

3. **각 단계별 확인 사항**
   - **페이지 로드 시**: 채널 정보 API 호출 확인
   - **메시지 입력 후**: 전송 API 요청 확인
   - **결제 페이지**: 리다이렉트 URL 확인
   - **결제 완료**: 콜백 URL 확인

#### 구체적인 확인 방법

**방법 1: Network 탭에서 요청 필터링**
```
1. Network 탭 → Filter 입력란에 "donate" 또는 "payment" 입력
2. 후원 관련 요청만 필터링하여 확인
3. 각 요청의 Response 탭에서 JSON 데이터 확인
```

**방법 2: Console 탭에서 로그 확인**
```
1. Console 탭 열기
2. 후원 버튼 클릭
3. JavaScript 로그에서 URL 또는 리다이렉트 정보 확인
```

**방법 3: Application/Storage 탭 확인**
```
1. Application 탭 → Local Storage 또는 Session Storage
2. 후원 관련 데이터 저장 여부 확인
3. 저장된 URL 또는 딥링크 정보 확인
```

## 2. 치지직 개발자 포털에서 확인하기

### 접속 및 확인 절차

1. **치지직 개발자 포털 접속**
   ```
   https://developers.chzzk.naver.com/
   ```

2. **API 문서 확인**
   - 메뉴에서 "API 문서" 또는 "Documentation" 클릭
   - "후원", "Donation", "Payment" 키워드로 검색
   - 관련 API 엔드포인트 확인

3. **딥링크 문서 확인**
   - "딥링크" 또는 "Deep Link" 섹션 확인
   - 후원 관련 딥링크 스키마 확인
   - 예: `chzzk://donate?channelId={id}`

4. **채널 정보 API 확인**
   ```
   GET /open/v1/channels/{channelId}
   ```
   - 응답에 후원 링크 필드가 포함되어 있는지 확인
   - 예: `donateUrl`, `donationLink`, `sponsorUrl` 등

### 확인해야 할 API 엔드포인트

#### 채널 정보 조회
```http
GET https://api.chzzk.naver.com/open/v1/channels/{channelId}
Authorization: Bearer {access_token}
```

**응답 예시 (예상)**:
```json
{
  "content": {
    "channelId": "string",
    "channelName": "string",
    "donateUrl": "https://chzzk.naver.com/live/{channelId}/donate",
    "donateDeepLink": "chzzk://donate?channelId={channelId}"
  }
}
```

#### 후원 Intent 생성 (예상)
```http
POST https://api.chzzk.naver.com/open/v1/donations/intent
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "channelId": "string",
  "amount": 1000,
  "message": "string"
}
```

## 3. 치지직 API로 채널 정보 조회

### API 호출 방법

#### 방법 1: 브라우저에서 직접 호출
1. 개발자 도구 → Console 탭
2. 다음 코드 실행:
```javascript
// 채널 ID를 실제 값으로 변경
const channelId = 'your-channel-id';

fetch(`https://api.chzzk.naver.com/open/v1/channels/${channelId}`, {
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
  }
})
.then(res => res.json())
.then(data => {
  console.log('채널 정보:', data);
  console.log('후원 링크:', data.content?.donateUrl);
});
```

#### 방법 2: Postman 또는 curl 사용
```bash
curl -X GET \
  "https://api.chzzk.naver.com/open/v1/channels/{channelId}" \
  -H "Authorization: Bearer {access_token}"
```

#### 방법 3: Melt 백엔드에서 확인
Melt 백엔드에 임시 엔드포인트 추가:
```typescript
// backend/src/routes/channels.ts에 추가
router.get('/:id/chzzk-info', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get(
      `https://api.chzzk.naver.com/open/v1/channels/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.CHZZK_ACCESS_TOKEN}`
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 4. 메시지 입력 및 후원 플로우 상세 확인

### Melt 현재 구현 확인

#### 현재 플로우
1. **사용자가 "치즈 보내기" 클릭**
   - `DonateButton.tsx`: 후원 딥링크가 있으면 직접 이동, 없으면 Melt 후원 페이지로

2. **Melt 후원 페이지** (`/app/channels/{id}/donate`)
   - 메시지 입력
   - "치지직에서 후원하기" 버튼 클릭

3. **Intent 생성**
   ```typescript
   POST /donations/intent
   {
     "chzzkChannelId": "string"
   }
   ```

4. **치지직으로 이동**
   - 등록된 `donateUrl` 또는 기본 채널 페이지로 이동

5. **후원 완료 후 복귀**
   - `donate/complete` 페이지로 이동
   - 메시지 자동 등록 (구현 필요)

### 확인해야 할 실제 치지직 플로우

#### 단계별 Network 요청 확인

**1단계: 후원 페이지 접속**
```
GET https://chzzk.naver.com/live/{channelId}/donate
```
- 확인: 페이지 HTML에서 후원 폼 확인
- 확인: JavaScript에서 API 엔드포인트 확인

**2단계: 메시지 입력 후 전송**
```
POST https://api.chzzk.naver.com/.../donate
{
  "channelId": "string",
  "message": "string",
  "amount": 1000
}
```
- 확인: 요청 URL
- 확인: 요청 본문 구조
- 확인: 응답에 포함된 결제 링크

**3단계: 결제 페이지로 이동**
```
GET https://payment.naver.com/... 또는
GET https://chzzk.naver.com/payment/...
```
- 확인: 리다이렉트 URL
- 확인: 결제 페이지 URL 패턴

**4단계: 결제 완료**
```
POST https://api.chzzk.naver.com/.../confirm
```
- 확인: 콜백 URL
- 확인: 후원 완료 후 리다이렉트 URL

### 구체적인 확인 스크립트

#### 브라우저 Console에서 실행
```javascript
// 1. 후원 버튼 요소 찾기
const donateButton = document.querySelector('button[class*="donate"], a[href*="donate"]');
console.log('후원 버튼:', donateButton);

// 2. 버튼의 href 또는 onclick 확인
if (donateButton) {
  console.log('href:', donateButton.href);
  console.log('onclick:', donateButton.onclick);
  console.log('이벤트 리스너:', getEventListeners(donateButton));
}

// 3. Network 요청 모니터링
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('Fetch 요청:', args);
  return originalFetch.apply(this, args);
};

const originalXHR = window.XMLHttpRequest;
window.XMLHttpRequest = function() {
  const xhr = new originalXHR();
  const originalOpen = xhr.open;
  xhr.open = function(...args) {
    console.log('XHR 요청:', args);
    return originalOpen.apply(this, args);
  };
  return xhr;
};
```

## 5. 확인된 링크를 Melt에 적용하기

### 확인된 링크 형식에 따른 적용 방법

#### 경우 1: 웹 URL 형식
```
https://chzzk.naver.com/live/{channelId}/donate
```
**적용 방법**:
```typescript
// web/components/DonateButton.tsx
const donateUrl = `https://chzzk.naver.com/live/${chzzkChannelId}/donate`;
```

#### 경우 2: 딥링크 형식
```
chzzk://donate?channelId={channelId}
```
**적용 방법**:
```typescript
// 딥링크는 모바일에서만 작동하므로 웹 URL도 함께 제공
const donateUrl = isMobile 
  ? `chzzk://donate?channelId=${chzzkChannelId}`
  : `https://chzzk.naver.com/live/${chzzkChannelId}/donate`;
```

#### 경우 3: API로 동적 생성
```typescript
// API 응답에서 후원 링크 가져오기
const channelInfo = await api.get(`/channels/${chzzkChannelId}`);
const donateUrl = channelInfo.data.donateUrl || 
  `https://chzzk.naver.com/live/${chzzkChannelId}/donate`;
```

## 6. 체크리스트

### 확인 완료 체크리스트
- [ ] 개발자 도구 Network 탭에서 후원 버튼 클릭 시 요청 확인
- [ ] Elements 탭에서 버튼의 href 또는 이벤트 핸들러 확인
- [ ] 메시지 입력 후 전송 시 API 요청 확인
- [ ] 결제 페이지로의 리다이렉트 URL 확인
- [ ] 치지직 개발자 포털에서 API 문서 확인
- [ ] 채널 정보 API 응답에 후원 링크 포함 여부 확인
- [ ] 확인된 링크를 Melt에 적용
- [ ] 실제 후원 플로우 테스트

## 7. 참고 자료

- [치지직 개발자 포털](https://developers.chzzk.naver.com/)
- [치지직 Open API 문서](https://chzzk.gitbook.io/chzzk)
- [awesome-chzzk 프로젝트](https://github.com/dokdo2013/awesome-chzzk)
- [Melt 후원 링크 설정 가이드](./DONATE_LINKS.md)
