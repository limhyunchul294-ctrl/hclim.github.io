# Git 커밋 메시지 한글 인코딩 문제 해결 가이드

## 문제 상황
PowerShell에서 `git commit -m "한글 메시지"`를 사용할 때 한글이 깨지는 문제가 발생합니다.

## 해결 방법

### 방법 1: 헬퍼 스크립트 사용 (권장)

#### 커밋만 하기
```powershell
.\scripts\git\commit-with-message.ps1 "커밋 메시지"
```

#### 커밋 및 푸시
```powershell
.\scripts\git\commit-and-push.ps1 "커밋 메시지"
```

### 방법 2: 임시 파일 사용

1. 커밋 메시지를 UTF-8로 작성한 파일 생성:
```powershell
$message = "커밋 메시지 내용"
$tempFile = [System.IO.Path]::GetTempFileName()
[System.IO.File]::WriteAllText($tempFile, $message, [System.Text.UTF8Encoding]::new($false))
git commit -F $tempFile
Remove-Item $tempFile -Force
```

### 방법 3: Git 설정 확인

다음 명령어로 Git 인코딩 설정을 확인하세요:
```powershell
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8
git config --global core.quotepath false
```

### 방법 4: PowerShell 프로필 설정

PowerShell 프로필에 UTF-8 인코딩 설정을 추가하세요:
```powershell
# 프로필 파일 열기
notepad $PROFILE

# 다음 내용 추가
chcp 65001 | Out-Null
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
```

또는 프로젝트의 `docs/setup/powershell-utf8-profile.ps1` 파일 내용을 프로필에 추가하세요.

## 예시

### 올바른 사용법
```powershell
# 헬퍼 스크립트 사용
.\scripts\git\commit-and-push.ps1 "feat: 보안서약서 팝업 기능 추가"
```

### 잘못된 사용법
```powershell
# 직접 커밋 메시지 입력 (한글 깨짐 가능)
git commit -m "feat: 보안서약서 팝업 기능 추가"
```

## 참고사항

- 헬퍼 스크립트는 UTF-8 BOM 없이 파일을 생성하여 인코딩 문제를 방지합니다.
- 커밋 메시지는 항상 명확하고 간결하게 작성하세요.
- 여러 줄 커밋 메시지는 헬퍼 스크립트에서 자동으로 처리됩니다.

