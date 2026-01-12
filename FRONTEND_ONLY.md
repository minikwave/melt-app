# 🎨 프론트엔드만 실행하기

백엔드 서버 없이 프론트엔드만 실행하여 UI를 테스트할 수 있습니다.

## 🚀 실행 방법

```powershell
cd web
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 🔧 더미 데이터 모드

프론트엔드는 자동으로 백엔드 서버 연결을 확인하고, 서버가 없거나 연결할 수 없으면 **더미 데이터 모드**로 전환됩니다.

### 자동 감지

- 백엔드 서버(`http://localhost:3001`)에 연결 시도
- 2초 내 응답이 없으면 더미 데이터 모드 활성화
- 콘솔에 `🔧 Using mock data mode (backend not available)` 메시지 표시

### 더미 데이터 포함 내용

#### 사용자 정보
- 시청자: `viewer_1` (테스트 시청자)
- 크리에이터: `creator_1` (테스트 크리에이터)

#### 채널
- `channel_creator_1` - 크리에이터 1의 채널
- `channel_creator_2` - 크리에이터 2의 채널
- `channel_creator_3` - 크리에이터 3의 채널

#### 대화방 목록
- 팔로우한 크리에이터 목록
- 최신 메시지 미리보기
- 안읽은 메시지 개수

#### 메시지 피드
- 크리에이터 공개 메시지
- 치즈 후원 메시지 (10000원, 5000원)
- 시간 정보 포함

#### 크리에이터 인박스
- 비공개 DM 메시지
- 대기 중인 후원

## 📱 테스트 가능한 페이지

### 1. 홈 페이지
```
http://localhost:3000/
```

### 2. 개발 로그인 (더미 유저 선택)
```
http://localhost:3000/dev/login
```

더미 유저로 로그인하면 자동으로 `/app`으로 이동합니다.

### 3. 메인 대시보드
```
http://localhost:3000/app
```

### 4. 대화방 목록 (시청자)
```
http://localhost:3000/app/conversations
```

### 5. 크리에이터 검색
```
http://localhost:3000/app/search
```

검색어 예시:
- `creator_1`
- `크리에이터`

### 6. 채널 메신저
```
http://localhost:3000/app/channels/channel_creator_1
```

### 7. 크리에이터 메시지 관리
```
http://localhost:3000/app/creator/messages
```

채널 ID 입력: `channel_creator_1`

## ⚠️ 제한사항

### 작동하는 기능 (GET 요청)
- ✅ 사용자 정보 조회
- ✅ 채널 검색
- ✅ 대화방 목록
- ✅ 메시지 피드
- ✅ 크리에이터 인박스
- ✅ 팔로우 상태 확인

### 작동하지 않는 기능 (POST/DELETE 요청)
- ❌ 메시지 전송 (에러 표시)
- ❌ 팔로우/언팔로우 (에러 표시)
- ❌ 후원 (에러 표시)
- ❌ 답장/RT (에러 표시)

**참고**: POST 요청은 백엔드 서버가 필요하지만, UI는 정상적으로 표시됩니다.

## 🎯 테스트 시나리오

### 시청자 플로우
1. `http://localhost:3000/dev/login` 접속
2. `viewer_1` 선택하여 로그인
3. "대화방" 클릭 → 팔로우한 크리에이터 확인
4. 채널 클릭 → 메시지 피드 확인
5. "크리에이터 찾기" → 검색 테스트

### 크리에이터 플로우
1. `http://localhost:3000/dev/login` 접속
2. `creator_1` 선택하여 로그인
3. "메시지 관리" 클릭
4. 채널 ID: `channel_creator_1` 입력
5. DM 및 후원 메시지 확인

## 🔍 더미 데이터 수정

더미 데이터는 `web/lib/mockData.ts`에서 수정할 수 있습니다.

```typescript
// 더 많은 채널 추가
export const mockChannels = [
  // ... 기존 채널
  {
    id: 'channel-4',
    chzzk_channel_id: 'my_channel',
    name: '내 채널',
    // ...
  },
]

// 더 많은 메시지 추가
export const mockMessages = [
  // ... 기존 메시지
  {
    id: 'msg-4',
    // ...
  },
]
```

## 💡 팁

- 브라우저 개발자 도구 콘솔에서 더미 데이터 모드 활성화 여부 확인
- 네트워크 탭에서 API 호출 실패 시 더미 데이터로 폴백되는지 확인
- React Query DevTools를 사용하면 쿼리 상태를 더 잘 확인할 수 있습니다
