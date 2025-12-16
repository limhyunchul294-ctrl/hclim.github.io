# Git 커밋 메시지 한글 깨짐 문제 해결 가이드

## 🔍 문제 진단

### 1. 실제로 커밋 메시지가 깨졌는지 확인

PowerShell에서 보이는 것이 깨져도, 실제로는 저장이 잘 되었을 수 있습니다.

**GitHub에서 확인:**
1. GitHub 저장소로 이동
2. 커밋 히스토리 확인
3. 커밋 메시지가 올바르게 표시되는지 확인

**다른 방법으로 확인:**
```powershell
# Git Bash에서 확인 (한글이 올바르게 표시됨)
git log --oneline -5

# 또는 웹 브라우저에서 GitHub 확인
```

### 2. PowerShell 출력만 깨진 경우

PowerShell의 출력 인코딩 문제일 수 있습니다. 다음을 시도하세요:

```powershell
# UTF-8 코드 페이지로 변경
chcp 65001

# PowerShell 인코딩 설정
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# 다시 확인
git log --oneline -1
```

## ✅ 해결 방법

### 방법 1: 헬퍼 스크립트 사용 (강력 권장)

**항상 헬퍼 스크립트를 사용하세요:**

```powershell
# 커밋만
.\scripts\git\commit.ps1 "커밋 메시지"

# 커밋 및 푸시
.\scripts\git\commit-and-push.ps1 "커밋 메시지"
```

### 방법 2: Git Bash 사용

PowerShell 대신 Git Bash를 사용하면 한글 문제가 거의 발생하지 않습니다:

```bash
git commit -m "한글 메시지"
```

### 방법 3: VS Code 내장 터미널 사용

VS Code의 내장 터미널은 UTF-8을 기본으로 사용합니다:

1. VS Code에서 터미널 열기 (`Ctrl + ``)
2. Git 명령어 실행

### 방법 4: GitHub 웹 인터페이스 사용

작은 수정사항은 GitHub 웹 인터페이스에서 직접 편집할 수 있습니다.

## 🔧 추가 설정

### Git 전역 설정 확인

```powershell
.\scripts\git\setup-git-encoding.ps1
```

이 스크립트는 다음을 설정합니다:
- `i18n.commitencoding=utf-8`
- `i18n.logoutputencoding=utf-8`
- `core.quotepath=false`
- `core.precomposeUnicode=true`

### PowerShell 프로필 설정

PowerShell을 열 때마다 자동으로 UTF-8이 설정되도록:

```powershell
# 프로필 파일 열기
notepad $PROFILE

# 다음 내용 추가
chcp 65001 | Out-Null
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
```

## 📝 확인 방법

### 커밋 메시지가 올바르게 저장되었는지 확인

```powershell
# 방법 1: GitHub에서 확인 (가장 확실)
# 브라우저에서 https://github.com/사용자명/저장소명/commits/master

# 방법 2: Git Bash에서 확인
# Git Bash 실행 후
git log --oneline -5

# 방법 3: 다른 터미널에서 확인
# Windows Terminal 또는 CMD에서
chcp 65001
git log --oneline -5
```

## ⚠️ 주의사항

1. **직접 `git commit -m` 사용 금지**: PowerShell에서 직접 사용하면 한글이 깨질 수 있습니다.
2. **헬퍼 스크립트 사용 필수**: 모든 커밋은 헬퍼 스크립트를 통해 수행하세요.
3. **GitHub에서 최종 확인**: PowerShell 출력이 깨져도 GitHub에서 올바르게 표시되면 문제없습니다.

## 🆘 여전히 문제가 있다면

1. **GitHub에서 확인**: 실제 저장소에서 커밋 메시지가 올바른지 확인
2. **Git Bash 사용**: PowerShell 대신 Git Bash 사용
3. **VS Code 사용**: VS Code의 내장 터미널 사용
4. **이슈 리포트**: 문제가 계속되면 상세 정보와 함께 리포트

