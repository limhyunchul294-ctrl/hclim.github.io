# 빠른 커밋 가이드 - "한글로 업데이트 및 최신화"

## 앞으로 모든 커밋 메시지는 "한글로 업데이트 및 최신화"로 통일합니다.

## 사용 방법

### 방법 1: commit-msg.txt 파일 사용 (가장 간단)
```powershell
git add -A
git commit -F commit-msg.txt
git push
```

### 방법 2: PowerShell 스크립트 사용
```powershell
.\git-commit-ko.ps1
```

### 방법 3: Git Alias 사용
```powershell
# 커밋만
git commit-ko

# 커밋 + 푸시
git push-ko
```

### 방법 4: 직접 명령어 (한 줄)
```powershell
git add -A; git commit -F commit-msg.txt; git push
```

## commit-msg.txt 파일
프로젝트 루트에 `commit-msg.txt` 파일이 있습니다.
이 파일을 사용하여 항상 동일한 커밋 메시지로 커밋할 수 있습니다.

## 참고
- `commit-msg.txt` 파일은 Git에 포함되어 있습니다.
- 모든 커밋 메시지는 "한글로 업데이트 및 최신화"로 통일합니다.
- 변경사항만 추가하려면 `git add -A` 대신 특정 파일을 지정할 수 있습니다.

