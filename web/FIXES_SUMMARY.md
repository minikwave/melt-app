# 수정 사항 요약

## 1. MetaMask 오류 처리 ✅
- `web/app/layout.tsx`에 MetaMask 관련 오류를 무시하는 스크립트 추가
- 브라우저 확장 프로그램에서 발생하는 오류를 자동으로 처리

## 2. Auth 페이지 개선 ✅
- `web/app/auth/naver/page.tsx`에 개발 모드 지원 추가
- 개발 모드일 때 자동으로 `/dev/login`으로 리다이렉트
- 개발 모드 링크 추가

## 3. 회원가입 플로우 개선 ✅
- `web/app/dev/login/page.tsx`: 로그인 시 온보딩 페이지로 이동
- `web/app/onboarding/page.tsx`: 개발 모드에서 쿠키로 온보딩 상태 관리
- `web/app/onboarding/creator-setup/page.tsx`: 개발 모드에서 온보딩 완료 표시
- `web/lib/mockData.ts`: 개발 모드에서 온보딩 상태 확인 및 역할 설정 지원

## 4. 메신저 UI 개선 ✅
- `web/components/Messenger.tsx` 완전 재작성
- 내부 메신저 형태의 UI로 변경
- 메시지 버블 스타일 개선
- DM과 공개 메시지 구분 명확화

## 5. 메시지 타입별 다르게 노출 ✅
- **전체공개 시청자 메시지(치즈)**: 초록색 배지, "치즈 XXX원" 표시
- **전체공개 시청자 메시지(크리에이터 RT)**: 파란색 배지, "RT" 표시
- **본인에게만 보이는 시청자 메시지**: 크리에이터만 볼 수 있는 DM, 보라색 배지
- **크리에이터 메시지**: 노란색 배지, "크리에이터" 표시

## 주요 변경 파일

1. `web/app/layout.tsx` - MetaMask 오류 처리
2. `web/app/auth/naver/page.tsx` - 개발 모드 지원
3. `web/app/dev/login/page.tsx` - 온보딩 플로우 연결
4. `web/app/onboarding/page.tsx` - 개발 모드 쿠키 관리
5. `web/app/onboarding/creator-setup/page.tsx` - 개발 모드 완료 처리
6. `web/components/Messenger.tsx` - 메신저 UI 완전 재작성
7. `web/lib/mockData.ts` - 개발 모드 온보딩 지원
8. `web/lib/api.ts` - POST 요청 처리 및 mock 응답 개선

## 테스트 방법

1. 개발 서버 실행:
```powershell
cd web
npm run dev
```

2. 개발 모드 로그인:
- `http://localhost:3000/dev/login` 접속
- 유저 선택 후 로그인
- 온보딩 페이지에서 역할 선택
- 크리에이터인 경우 채널 설정
- 메인 앱으로 이동

3. 메시지 타입 확인:
- 채널 페이지에서 다양한 메시지 타입 확인
- 크리에이터는 DM과 공개 메시지 전환 가능
- 시청자는 치즈 후원 메시지와 일반 DM 구분

## 참고사항

- 모든 변경사항은 개발 모드에서 테스트 가능
- 빌드 후에도 정상 작동
- MetaMask 오류는 자동으로 무시됨
