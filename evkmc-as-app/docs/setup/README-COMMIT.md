# Git 커밋 가이드 - "한글로 업데이트 및 최신화"

## ✅ 모든 커밋 메시지는 "한글로 업데이트 및 최신화"로 통일합니다.

## 🚀 빠른 사용법

### 방법 1: PowerShell 스크립트 (가장 간단) ⭐ 권장

#### 커밋만 하기
```powershell
.\git-commit-ko.ps1
```

#### 커밋 + 푸시 한 번에
```powershell
.\git-push-ko.ps1
```

### 방법 2: commit-msg.txt 파일 직접 사용

```powershell
git add -A
git commit -F commit-msg.txt
git push
```

### 방법 3: 한 줄 명령어

```powershell
git add -A; git commit -F commit-msg.txt; git push
```

## 📝 상세 설명

### commit-msg.txt 파일
- 프로젝트 루트에 있는 `commit-msg.txt` 파일에는 "한글로 업데이트 및 최신화" 메시지가 저장되어 있습니다.
- `git commit -F commit-msg.txt` 명령어로 이 파일의 내용을 커밋 메시지로 사용합니다.

### git-commit-ko.ps1 스크립트
- 모든 변경사항을 자동으로 추가하고 커밋합니다.
- 푸시 여부를 물어봅니다.

### git-push-ko.ps1 스크립트
- 모든 변경사항을 자동으로 추가하고 커밋합니다.
- 자동으로 푸시까지 실행합니다.

## 💡 팁

- 변경사항만 추가하려면 `git add -A` 대신 `git add .` 또는 특정 파일명을 지정할 수 있습니다.
- 커밋 전에 변경사항을 확인하려면 `git status` 또는 `git diff`를 사용하세요.

## ✅ 확인

커밋 후 다음 명령어로 확인할 수 있습니다:
```powershell
git log --oneline -5
```

모든 커밋 메시지가 "한글로 업데이트 및 최신화"로 표시됩니다.

