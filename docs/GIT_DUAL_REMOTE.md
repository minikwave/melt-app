# Git 이중 원격 저장소 설정 가이드

## 현재 설정

- **origin**: ziptalk과 minikwave 두 저장소에 동시에 푸시
  - `https://github.com/ziptalk/melt-app.git`
  - `https://github.com/minikwave/melt-app.git`
- **minikwave**: minikwave 저장소 (fetch용)

## 푸시 방법

### 방법 1: origin에 한 번에 푸시 (권장)

```bash
git push origin main
```

이 명령어 하나로 두 저장소에 모두 푸시됩니다!

### 방법 2: 각각 푸시

```bash
git push origin main
git push minikwave main
```

### 방법 3: 스크립트 사용

PowerShell 스크립트 (`push-all.ps1`):
```powershell
git push origin main
git push minikwave main
```

## 원격 저장소 확인

```bash
git remote -v
```

**예상 출력**:
```
minikwave  https://github.com/minikwave/melt-app.git (fetch)
minikwave  https://github.com/minikwave/melt-app.git (push)
origin     https://github.com/minikwave/melt-app.git (fetch)
origin     https://github.com/minikwave/melt-app.git (push)
origin     https://github.com/ziptalk/melt-app.git (push)
```

## 주의사항

- `git push origin main` 실행 시 두 저장소에 모두 푸시됩니다
- 각 저장소의 권한이 있는지 확인하세요
- 푸시 실패 시 각 저장소를 개별적으로 확인하세요

## 문제 해결

### 특정 저장소에만 푸시하고 싶은 경우

```bash
# ziptalk에만 푸시
git push https://github.com/ziptalk/melt-app.git main

# minikwave에만 푸시
git push https://github.com/minikwave/melt-app.git main
```

### 원격 저장소 설정 초기화

```bash
# origin의 push URL 초기화
git remote set-url --delete --push origin https://github.com/minikwave/melt-app.git
git remote set-url origin https://github.com/ziptalk/melt-app.git
```
