# 치지직 후원 링크 확인 실전 가이드

## 현재 확인된 요소들

스크린샷에서 확인된 후원 관련 요소:
- `button#send_chat_or_donate` - 후원/채팅 전송 버튼
- `div.live_chatting_popup_donation_...` - 후원 팝업 컨테이너
- `div.live_chatting_donation_messag...` - 후원 메시지 입력 영역

## 1단계: Elements 탭에서 버튼 확인하기

### 1.1 버튼 요소 찾기

1. **Elements 탭**에서 `Ctrl+F` (또는 `Cmd+F` on Mac)
2. 검색창에 입력: `send_chat_or_donate`
3. 버튼 요소 클릭하여 선택

### 1.2 버튼 속성 확인

선택된 버튼에서 확인할 항목:

#### A. href 속성 확인 (직접 링크인 경우)
```html
<button id="send_chat_or_donate" href="https://...">
```
→ `href` 속성이 있으면 그게 후원 링크입니다!

#### B. 이벤트 리스너 확인 (JavaScript로 동작하는 경우)
1. 선택된 버튼에서 오른쪽 패널 확인
2. **"Event Listeners"** 탭 클릭
3. `click` 이벤트 확인
4. 연결된 함수 클릭 → Sources 탭으로 이동
5. JavaScript 코드에서 다음을 찾기:
   - `window.location.href = "..."`
   - `window.open("...")`
   - `fetch("...")` 또는 `axios.post("...")`
   - `router.push("...")` (Next.js인 경우)

### 1.3 버튼 클릭 시 동작 추적

**방법 1: Breakpoint 설정**
1. Sources 탭에서 버튼 클릭 함수 찾기
2. 함수 시작 부분에 Breakpoint 설정 (라인 번호 클릭)
3. 버튼 클릭
4. Breakpoint에서 멈춘 후 변수 값 확인

**방법 2: Console에서 함수 호출**
1. Console 탭 열기
2. 버튼 요소 선택 후:
```javascript
// 버튼 요소 가져오기
const btn = document.querySelector('#send_chat_or_donate');

// 이벤트 리스너 확인
getEventListeners(btn);

// 클릭 이벤트 직접 트리거하여 확인
btn.click();
```

## 2단계: Network 탭에서 API 요청 확인하기

### 2.1 Network 탭 준비

1. **Network 탭** 열기
2. **"Preserve log" 체크** (중요! 페이지 전환 시에도 로그 유지)
3. **"Disable cache" 체크**
4. **Clear 버튼** 클릭하여 기존 로그 삭제

### 2.2 필터 설정

스크린샷에서 보이는 요청들을 필터링:

#### A. "benefit" 요청 확인
- Network 탭에서 `benefit` 검색
- `benefit?channelId=...` 요청 클릭
- **Headers 탭** 확인:
  - Request URL: 전체 URL 확인
  - Request Method: GET/POST 확인
- **Payload 탭** 확인 (POST인 경우):
  - 전송되는 데이터 구조 확인
- **Response 탭** 확인:
  - 응답에 후원 링크가 포함되어 있는지 확인
  - JSON 구조에서 `donateUrl`, `donationLink` 등 검색

#### B. 후원 관련 키워드로 필터링
Network 탭 필터에 입력:
- `donate`
- `donation`
- `payment`
- `charge`
- `cheese`

### 2.3 메시지 입력 후 전송 플로우 추적

#### 전체 과정:
1. **후원 팝업 열기**
   - Network 탭 Clear
   - "치즈 보내기" 버튼 클릭
   - 새로 나타나는 요청 확인

2. **메시지 입력**
   - 후원 팝업에서 메시지 입력
   - Network 탭에서 실시간 요청 확인

3. **전송 버튼 클릭**
   - `send_chat_or_donate` 버튼 클릭
   - Network 탭에서 새 요청 확인:
     - 요청 이름 (Name)
     - 요청 URL
     - 요청 방법 (Method)
     - 요청 본문 (Payload)

4. **결제 페이지로 이동**
   - 리다이렉트 요청 확인
   - 최종 결제 페이지 URL 확인

## 3단계: 구체적인 확인 방법

### 방법 1: Console에서 직접 확인

Console 탭에서 다음 코드 실행:

```javascript
// 1. 후원 버튼 요소 찾기
const donateBtn = document.querySelector('#send_chat_or_donate');
console.log('후원 버튼:', donateBtn);

// 2. 버튼의 모든 속성 확인
console.log('버튼 속성:', donateBtn.attributes);

// 3. 이벤트 리스너 확인
const listeners = getEventListeners(donateBtn);
console.log('이벤트 리스너:', listeners);

// 4. 클릭 이벤트 함수 확인
if (listeners.click) {
  listeners.click.forEach(listener => {
    console.log('클릭 핸들러:', listener.listener.toString());
  });
}

// 5. 후원 팝업 요소 확인
const popup = document.querySelector('.live_chatting_popup_donation_');
console.log('후원 팝업:', popup);

// 6. 메시지 입력 필드 확인
const messageInput = document.querySelector('.live_chatting_donation_messag input, .live_chatting_donation_messag textarea');
console.log('메시지 입력 필드:', messageInput);
```

### 방법 2: Network 요청 모니터링

Console 탭에서 다음 코드 실행:

```javascript
// 모든 fetch 요청 가로채기
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('🔵 Fetch 요청:', args[0], args[1]);
  return originalFetch.apply(this, args).then(response => {
    console.log('🟢 Fetch 응답:', response.url, response.status);
    return response;
  });
};

// 모든 XHR 요청 가로채기
const originalXHR = window.XMLHttpRequest;
window.XMLHttpRequest = function() {
  const xhr = new originalXHR();
  const originalOpen = xhr.open;
  xhr.open = function(method, url, ...args) {
    console.log('🔵 XHR 요청:', method, url);
    return originalOpen.apply(this, [method, url, ...args]);
  };
  const originalSend = xhr.send;
  xhr.send = function(...args) {
    console.log('📤 XHR 전송:', args);
    return originalSend.apply(this, args);
  };
  return xhr;
};

console.log('✅ 네트워크 모니터링 시작됨. 이제 후원 버튼을 클릭하세요.');
```

### 방법 3: Elements에서 직접 확인

1. **Elements 탭**에서 `send_chat_or_donate` 검색
2. 버튼 요소 선택
3. 오른쪽 패널에서:
   - **Styles**: CSS 확인 (중요하지 않음)
   - **Computed**: 계산된 스타일 (중요하지 않음)
   - **Event Listeners**: 클릭 이벤트 확인 ⭐
   - **DOM Breakpoints**: Breakpoint 설정 가능

4. **Event Listeners** 탭에서:
   - `click` 이벤트 확장
   - 핸들러 함수 클릭
   - Sources 탭으로 자동 이동
   - JavaScript 코드에서 URL 찾기

## 4단계: 확인해야 할 구체적인 정보

### 후원 버튼 클릭 시

1. **직접 링크인 경우**
   ```
   href="https://chzzk.naver.com/live/{channelId}/donate"
   또는
   href="chzzk://donate?channelId={channelId}"
   ```

2. **API 호출인 경우**
   ```
   POST https://api.chzzk.naver.com/.../donate
   또는
   POST https://chzzk.naver.com/api/.../donate
   ```

3. **JavaScript 리다이렉트인 경우**
   ```javascript
   window.location.href = "https://..."
   또는
   router.push("/donate/...")
   ```

### 메시지 입력 후 전송 시

1. **API 엔드포인트**
   ```
   POST https://api.chzzk.naver.com/.../donations
   또는
   POST https://chzzk.naver.com/api/.../donations
   ```

2. **요청 본문 구조**
   ```json
   {
     "channelId": "...",
     "message": "...",
     "amount": 1000
   }
   ```

3. **응답에 포함된 정보**
   - 결제 페이지 URL
   - 후원 Intent ID
   - 리다이렉트 URL

## 5단계: 실전 확인 절차

### 추천 순서:

1. **Elements 탭에서 버튼 확인** (가장 빠름)
   - `send_chat_or_donate` 검색
   - Event Listeners 확인
   - JavaScript 코드에서 URL 찾기

2. **Network 탭에서 실시간 추적** (가장 확실함)
   - Preserve log 체크
   - Clear 클릭
   - 후원 버튼 클릭
   - 새 요청 확인

3. **Console에서 코드 실행** (디버깅용)
   - 네트워크 모니터링 코드 실행
   - 버튼 클릭
   - Console에서 요청 확인

## 6단계: 확인된 정보를 Melt에 적용

### 확인된 링크 형식에 따라:

#### 경우 1: 웹 URL
```typescript
// web/components/DonateButton.tsx
const donateUrl = `https://chzzk.naver.com/live/${chzzkChannelId}/donate`;
```

#### 경우 2: 딥링크
```typescript
const donateUrl = `chzzk://donate?channelId=${chzzkChannelId}`;
```

#### 경우 3: API 엔드포인트
```typescript
// API를 통해 후원 Intent 생성
const response = await fetch('https://api.chzzk.naver.com/.../donate', {
  method: 'POST',
  body: JSON.stringify({ channelId, message })
});
const { paymentUrl } = await response.json();
window.location.href = paymentUrl;
```

## 체크리스트

### Elements 탭 확인
- [ ] `send_chat_or_donate` 버튼 찾기
- [ ] 버튼의 `href` 속성 확인 (있으면 링크 바로 확인 가능)
- [ ] Event Listeners에서 `click` 이벤트 확인
- [ ] JavaScript 코드에서 URL 또는 API 엔드포인트 확인

### Network 탭 확인
- [ ] Preserve log 체크
- [ ] 후원 버튼 클릭 전 Clear
- [ ] 버튼 클릭 후 새 요청 확인
- [ ] 요청 URL 확인
- [ ] 요청 본문 (Payload) 확인
- [ ] 응답 (Response) 확인

### 메시지 입력 플로우 확인
- [ ] 후원 팝업 열기
- [ ] 메시지 입력
- [ ] 전송 버튼 클릭
- [ ] Network에서 전송 요청 확인
- [ ] 결제 페이지로의 리다이렉트 확인

## 다음 단계

확인된 정보를 알려주시면:
1. Melt 코드에 적용하는 방법 안내
2. 후원 플로우 개선 방안 제시
3. 추가 확인이 필요한 부분 안내
