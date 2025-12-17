# PowerShell Git 커밋 한글 깨짐 문제 완전 해결 가이드

## 문제 분석

PowerShell에서 Git 커밋 시 한글이 깨지는 문제는 여러 원인이 복합적으로 작용합니다:

1. **PowerShell 콘솔 인코딩**: 기본적으로 Windows 코드 페이지를 사용
2. **Git 입력 인코딩**: Git이 파일을 읽을 때 시스템 인코딩 사용
3. **Git 출력 인코딩**: Git이 로그를 출력할 때 인코딩 불일치
4. **환경 변수**: LANG, LC_ALL 등이 설정되지 않음

## 해결 방법 (우선순위 순)

### 방법 1: Git Bash 사용 (가장 안전, 권장) ⭐

Git Bash는 기본적으로 UTF-8을 완벽하게 지원합니다.

```powershell
.\scripts\git\commit-with-git-bash.ps1 "커밋 메시지"
```

또는 직접 Git Bash에서:
```bash
git commit -m "커밋 메시지"
```

**장점:**
- 한글이 절대 깨지지 않음
- 추가 설정 불필요
- 가장 안정적

### 방법 2: 개선된 PowerShell 스크립트 사용

```powershell
.\scripts\git\commit-utf8-fixed.ps1 "커밋 메시지"
```

이 스크립트는:
- 모든 인코딩 환경 변수 설정
- Git 프로세스에 명시적 인코딩 전달
- 커밋 후 메시지 검증

### 방법 3: 수동 설정 (임시)

PowerShell 세션마다 다음 명령 실행:

```powershell
# 인코딩 설정
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

# 환경 변수 설정
$env:LANG = "ko_KR.UTF-8"
$env:LC_ALL = "ko_KR.UTF-8"

# Git 환경 변수
$env:GIT_COMMITTER_NAME = git config user.name
$env:GIT_AUTHOR_NAME = git config user.name
$env:GIT_COMMITTER_EMAIL = git config user.email
$env:GIT_AUTHOR_EMAIL = git config user.email

# 임시 파일로 커밋
$tempFile = [System.IO.Path]::GetTempFileName()
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($tempFile, "커밋 메시지", $utf8NoBom)
git commit -F $tempFile
Remove-Item $tempFile -Force
```

## Git 전역 설정 확인 및 수정

```powershell
# 현재 설정 확인
git config --global i18n.commitencoding
git config --global i18n.logoutputencoding
git config --global core.quotepath

# 올바른 설정 적용
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8
git config --global core.quotepath false
```

## PowerShell 프로필 영구 설정

PowerShell을 열 때마다 자동으로 인코딩이 설정되도록:

```powershell
.\scripts\git\setup-powershell-encoding.ps1
```

이후 PowerShell을 재시작하면 자동으로 UTF-8이 설정됩니다.

## 커밋 메시지 확인

커밋 후 메시지가 올바르게 저장되었는지 확인:

```powershell
git log -1 --pretty=format:"%s"
```

한글이 정상적으로 표시되면 성공입니다.

## 문제 해결 체크리스트

- [ ] Git 전역 설정 확인 (`i18n.commitencoding = utf-8`)
- [ ] PowerShell 인코딩 설정 (`chcp 65001`)
- [ ] 환경 변수 설정 (`LANG`, `LC_ALL`)
- [ ] 임시 파일 사용 (`git commit -F`)
- [ ] Git Bash 사용 (가장 안전)

## 근본 원인

Windows PowerShell과 Git의 인코딩 처리 방식 차이:

1. **PowerShell**: Windows 코드 페이지 (기본: CP949)
2. **Git**: 시스템 로케일 또는 환경 변수 기반
3. **충돌**: 두 시스템의 인코딩이 일치하지 않으면 깨짐

## 최종 권장사항

**가장 안정적인 방법: Git Bash 사용**

1. Git Bash 열기
2. 프로젝트 디렉토리로 이동
3. 일반적인 Git 명령 사용

```bash
git add .
git commit -m "커밋 메시지"
git push origin master
```

이 방법은 추가 설정 없이 100% 작동합니다.

## 참고 파일

- `scripts/git/commit-with-git-bash.ps1` - Git Bash 사용 스크립트 (권장)
- `scripts/git/commit-utf8-fixed.ps1` - 개선된 PowerShell 스크립트
- `scripts/git/setup-powershell-encoding.ps1` - PowerShell 프로필 설정

