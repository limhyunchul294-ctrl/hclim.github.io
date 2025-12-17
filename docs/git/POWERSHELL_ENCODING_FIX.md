# PowerShell 인코딩 문제 해결 가이드

## 문제
Git 커밋 메시지에 한글이 포함되면 깨지는 현상이 발생합니다.

## 원인
PowerShell의 기본 인코딩이 UTF-8이 아니거나, Git에 인코딩이 제대로 전달되지 않아 발생합니다.

## 해결 방법

### 방법 1: PowerShell 프로필에 UTF-8 설정 추가 (권장)

1. **프로필 설정 스크립트 실행:**
   ```powershell
   .\scripts\git\setup-powershell-encoding.ps1
   ```

2. **PowerShell 재시작:**
   - PowerShell 창을 닫고 다시 열기
   - 또는 다음 명령 실행:
     ```powershell
     . $PROFILE
     ```

### 방법 2: 안전한 커밋 스크립트 사용 (즉시 적용)

**커밋만 하기:**
```powershell
.\scripts\git\commit-safe-utf8.ps1 "커밋 메시지"
```

**커밋 + 푸시:**
```powershell
.\scripts\git\commit-safe-utf8.ps1 "커밋 메시지" -Push
```

### 방법 3: 수동 설정

PowerShell에서 다음 명령을 실행:

```powershell
# 인코딩 설정
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

# Git 인코딩 환경 변수
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

## 확인 방법

커밋 후 다음 명령으로 메시지가 올바르게 저장되었는지 확인:

```powershell
git log -1 --pretty=format:"%s"
```

한글이 깨지지 않고 정상적으로 표시되면 성공입니다.

## 추가 팁

### Git 전역 설정 확인

```powershell
git config --global i18n.commitencoding
git config --global i18n.logoutputencoding
git config --global core.quotepath
```

다음과 같이 설정되어 있어야 합니다:
- `i18n.commitencoding = utf-8`
- `i18n.logoutputencoding = utf-8`
- `core.quotepath = false`

설정이 다르면 다음 명령으로 수정:

```powershell
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8
git config --global core.quotepath false
```

## 문제가 계속되면

1. **PowerShell 버전 확인:**
   ```powershell
   $PSVersionTable.PSVersion
   ```

2. **인코딩 상태 확인:**
   ```powershell
   [Console]::OutputEncoding
   $OutputEncoding
   chcp
   ```

3. **안전한 커밋 스크립트 사용:**
   - `.\scripts\git\commit-safe-utf8.ps1` 스크립트는 모든 인코딩 설정을 강제로 적용합니다.

## 참고 파일

- `scripts/git/commit-safe-utf8.ps1` - 안전한 커밋 스크립트
- `scripts/git/setup-powershell-encoding.ps1` - PowerShell 프로필 설정 스크립트
- `docs/setup/powershell-utf8-profile.ps1` - 수동 설정용 프로필 코드

