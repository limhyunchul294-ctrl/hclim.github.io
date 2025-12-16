# PowerShell UTF-8 인코딩 설정
# 이 파일을 PowerShell 프로필에 추가하세요: Add-Content $PROFILE -Value (Get-Content powershell-utf8-profile.ps1)

# 코드 페이지를 UTF-8로 변경
chcp 65001 | Out-Null

# 콘솔 출력 인코딩을 UTF-8로 설정
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# PowerShell 기본 인코딩을 UTF-8로 설정
$PSDefaultParameterValues['*:Encoding'] = 'utf8'

# Git 커밋 메시지 인코딩 설정
$env:GIT_COMMITTER_NAME = $env:GIT_AUTHOR_NAME
$env:LANG = "ko_KR.UTF-8"

Write-Host "✅ PowerShell UTF-8 인코딩 설정 완료" -ForegroundColor Green

