# Git 한글 인코딩 문제 완전 해결 가이드

## 문제
PowerShell에서 Git 커밋 메시지를 작성할 때 한글이 깨져서 저장되는 문제

## 해결 방법

### 1. Git 전역 설정 (이미 완료)
```powershell
git config --global core.quotepath false
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8
git config --global core.precomposeunicode true
git config --global core.autocrlf false
```

### 2. PowerShell 프로필 설정

#### 방법 1: 자동 설정 스크립트 실행
```powershell
# 현재 디렉토리에서 실행
. .\powershell-utf8-profile.ps1
```

#### 방법 2: PowerShell 프로필에 영구 추가
```powershell
# 프로필 파일이 없으면 생성
if (!(Test-Path $PROFILE)) {
    New-Item -Path $PROFILE -ItemType File -Force
}

# UTF-8 설정 추가
$utf8Config = @'
chcp 65001 | Out-Null
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
'@

Add-Content -Path $PROFILE -Value $utf8Config
```

### 3. 매번 PowerShell 시작 시 실행할 명령어

PowerShell을 시작할 때마다 다음 명령어를 실행하세요:

```powershell
chcp 65001
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
```

### 4. 커밋할 때 UTF-8 강제 사용

```powershell
# 커밋 전에 항상 실행
chcp 65001
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# 그 다음 커밋
git commit -m "한글 메시지"
```

### 5. Git Bash 사용 (권장)

PowerShell 대신 Git Bash를 사용하면 인코딩 문제가 발생하지 않습니다:

1. Git Bash 실행
2. 일반적으로 커밋 메시지 작성
3. 한글이 정상적으로 저장됨

## 참고

- 이미 커밋된 메시지는 수정하기 어렵습니다.
- 앞으로의 커밋은 위 설정을 적용하면 정상적으로 저장됩니다.
- GitHub에서는 실제로 UTF-8로 저장되어 있지만, PowerShell 출력에서만 깨져 보일 수 있습니다.

