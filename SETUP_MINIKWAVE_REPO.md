# minikwave 레포지토리 설정 가이드

## 1단계: minikwave GitHub에서 레포지토리 생성

### GitHub 웹사이트에서 생성

1. **GitHub 접속**: https://github.com/
2. **minikwave 계정으로 로그인**
3. 우측 상단 **"+"** 아이콘 클릭 → **"New repository"** 선택
4. **레포지토리 정보 입력**:
   - **Repository name**: `cheese3`
   - **Description**: `Melt - 치지직 기반 후원·메시지 웹앱`
   - **Public** 또는 **Private** 선택
   - **⚠️ 중요**: "Initialize this repository with a README" 체크 해제
   - "Add .gitignore" 선택 안 함
   - "Choose a license" 선택 안 함
5. **"Create repository"** 클릭

## 2단계: 로컬에서 원격 저장소 추가 및 푸시

레포지토리 생성 후 아래 명령어를 실행하세요:

```bash
# minikwave 원격 저장소 추가
git remote add minikwave https://github.com/minikwave/cheese3.git

# 원격 저장소 확인
git remote -v

# minikwave에 푸시
git push minikwave main
```

## 3단계: 확인

1. **GitHub에서 확인**: https://github.com/minikwave/cheese3
2. 파일들이 올바르게 푸시되었는지 확인

## 향후 동시 푸시 방법

### 방법 1: 각각 푸시
```bash
git push origin main
git push minikwave main
```

### 방법 2: 한 번에 푸시 (스크립트)
```bash
git push origin main && git push minikwave main
```

### 방법 3: 여러 원격 저장소에 한 번에 푸시
```bash
# origin에 여러 URL 추가
git remote set-url --add --push origin https://github.com/ziptalk/melt-app.git
git remote set-url --add --push origin https://github.com/minikwave/cheese3.git

# 한 번에 푸시
git push origin main
```

## 현재 원격 저장소 상태

- **origin**: `https://github.com/ziptalk/melt-app.git` (ziptalk)
- **minikwave**: `https://github.com/minikwave/cheese3.git` (추가 필요)
