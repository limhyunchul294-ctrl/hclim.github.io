# Git 커밋 사용 가이드 - "한글로 업데이트 및 최신화"

## 앞으로 모든 커밋 메시지는 "한글로 업데이트 및 최신화"로 통일합니다.

## 사용 방법

### 방법 1: PowerShell 스크립트 사용 (권장)
```powershell
.\git-commit-ko.ps1
```

### 방법 2: Git Alias 사용
```powershell
# 커밋만
git commit-ko

# 커밋 + 푸시
git push-ko
```

### 방법 3: 직접 명령어 사용
```powershell
git add -A
git commit -m "한글로 업데이트 및 최신화"
git push
```

### 방법 4: 한 줄 명령어
```powershell
git add -A && git commit -m "한글로 업데이트 및 최신화" && git push
```

## 참고
- 모든 커밋 메시지는 "한글로 업데이트 및 최신화"로 통일합니다.
- 변경사항만 추가하려면 `git add -A` 대신 `git add .` 또는 파일명을 지정할 수 있습니다.

