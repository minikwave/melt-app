# Docker 설치 및 사용 가이드

## Docker Desktop 설치

### 1. 다운로드
- https://www.docker.com/products/docker-desktop/
- Windows용 Docker Desktop 다운로드

### 2. 설치
- 다운로드한 설치 파일 실행
- 설치 완료 후 재시작 필요할 수 있음

### 3. 실행
- Docker Desktop 실행
- 시스템 트레이에 Docker 아이콘 표시 확인

### 4. 확인
```powershell
docker --version
docker info
```

## PostgreSQL 컨테이너 실행

### 자동 설정 (권장)
```powershell
.\SETUP_COMPLETE.ps1
```

### 수동 설정

1. **컨테이너 생성 및 실행**
```powershell
docker run --name melt-postgres `
    -e POSTGRES_PASSWORD=postgres `
    -e POSTGRES_DB=melt `
    -p 5432:5432 `
    -d postgres:14
```

2. **스키마 적용**
```powershell
Get-Content backend\db\schema.sql | docker exec -i melt-postgres psql -U postgres -d melt
Get-Content backend\db\migrations\001_add_channel_urls.sql | docker exec -i melt-postgres psql -U postgres -d melt
Get-Content backend\db\migrations\002_add_follows_and_reads.sql | docker exec -i melt-postgres psql -U postgres -d melt
```

3. **컨테이너 관리**
```powershell
# 컨테이너 시작
docker start melt-postgres

# 컨테이너 중지
docker stop melt-postgres

# 컨테이너 삭제 (데이터도 삭제됨)
docker rm -f melt-postgres

# 컨테이너 상태 확인
docker ps -a | findstr melt-postgres
```

## 문제 해결

### Docker가 시작되지 않는 경우
- Docker Desktop이 실행 중인지 확인
- Windows 기능에서 WSL 2 활성화 필요할 수 있음
- 재시작 후 다시 시도

### 포트 충돌
- 5432 포트가 이미 사용 중인 경우:
```powershell
# 다른 포트 사용
docker run --name melt-postgres `
    -e POSTGRES_PASSWORD=postgres `
    -e POSTGRES_DB=melt `
    -p 5433:5432 `
    -d postgres:14
```
- `.env` 파일의 `DATABASE_URL`도 포트 변경 필요
