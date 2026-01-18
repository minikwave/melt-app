# Git 원격 저장소 설정 가이드

## 현재 상태

- **origin**: `https://github.com/ziptalk/melt-app.git`
- **minikwave**: 새 레포지토리 생성 필요

## minikwave에 새 레포지토리 생성

### 방법 1: GitHub 웹사이트에서 생성

1. **GitHub 접속**: https://github.com/
2. **minikwave 계정으로 로그인**
3. **"New repository"** 클릭
4. **레포지토리 정보 입력**:
   - Repository name: `cheese3` (또는 원하는 이름)
   - Description: `Melt - 치지직 기반 후원·메시지 웹앱`
   - Public 또는 Private 선택
   - **"Initialize this repository with a README" 체크 해제** (이미 코드가 있으므로)
5. **"Create repository"** 클릭

### 방법 2: GitHub CLI 사용 (선택적)

```bash
# GitHub CLI 설치 필요
gh repo create minikwave/cheese3 --public --description "Melt - 치지직 기반 후원·메시지 웹앱"
```

## 원격 저장소 추가 및 푸시

### 1. minikwave 원격 저장소 추가

```bash
# minikwave 원격 저장소 추가
git remote add minikwave https://github.com/minikwave/cheese3.git

# 또는 SSH 사용 시
git remote add minikwave git@github.com:minikwave/cheese3.git
```

### 2. 원격 저장소 확인

```bash
git remote -v
```

**예상 출력**:
```
minikwave  https://github.com/minikwave/cheese3.git (fetch)
minikwave  https://github.com/minikwave/cheese3.git (push)
origin     https://github.com/ziptalk/melt-app.git (fetch)
origin     https://github.com/ziptalk/melt-app.git (push)
```

### 3. minikwave에 푸시

```bash
# main 브랜치 푸시
git push minikwave main

# 또는 모든 브랜치 푸시
git push minikwave --all
```

### 4. 향후 동시 푸시

두 저장소에 동시에 푸시하려면:

```bash
# origin과 minikwave에 동시 푸시
git push origin main && git push minikwave main

# 또는 여러 원격 저장소에 한 번에 푸시
git remote set-url --add --push origin https://github.com/ziptalk/melt-app.git
git remote set-url --add --push origin https://github.com/minikwave/cheese3.git
git push origin main
```

## 원격 저장소 관리

### 원격 저장소 목록 확인
```bash
git remote -v
```

### 원격 저장소 제거
```bash
git remote remove minikwave
```

### 원격 저장소 URL 변경
```bash
git remote set-url minikwave https://github.com/minikwave/cheese3.git
```

## 체크리스트

- [ ] minikwave GitHub 계정으로 로그인
- [ ] 새 레포지토리 생성 (`cheese3`)
- [ ] 로컬에서 minikwave 원격 저장소 추가
- [ ] minikwave에 푸시
- [ ] 두 저장소 모두 확인
