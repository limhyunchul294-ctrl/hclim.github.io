# PowerShell 인코딩 영구 설정 스크립트
# 이 스크립트를 실행하면 PowerShell 프로필에 UTF-8 인코딩 설정이 추가됩니다

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "PowerShell UTF-8 인코딩 영구 설정" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# PowerShell 프로필 경로 확인
$profilePath = $PROFILE.CurrentUserAllHosts
$profileDir = Split-Path -Parent $profilePath

Write-Host "📁 프로필 경로: $profilePath" -ForegroundColor Yellow

# 프로필 디렉토리가 없으면 생성
if (-not (Test-Path $profileDir)) {
    New-Item -ItemType Directory -Path $profileDir -Force | Out-Null
    Write-Host "✅ 프로필 디렉토리 생성 완료" -ForegroundColor Green
}

# UTF-8 인코딩 설정 코드
$encodingConfig = @"

# ============================================
# UTF-8 인코딩 설정 (Git 커밋 메시지 한글 깨짐 방지)
# ============================================
`$PSDefaultParameterValues['*:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
`$OutputEncoding = [System.Text.Encoding]::UTF8
`$env:PYTHONIOENCODING = "utf-8"
`$env:LANG = "ko_KR.UTF-8"
`$env:LC_ALL = "ko_KR.UTF-8"
chcp 65001 | Out-Null

# Git 인코딩 환경 변수
`$env:GIT_COMMITTER_NAME = git config user.name
`$env:GIT_AUTHOR_NAME = git config user.name
`$env:GIT_COMMITTER_EMAIL = git config user.email
`$env:GIT_AUTHOR_EMAIL = git config user.email

"@

# 프로필 파일이 없으면 생성
if (-not (Test-Path $profilePath)) {
    Set-Content -Path $profilePath -Value $encodingConfig -Encoding UTF8
    Write-Host "✅ 프로필 파일 생성 완료" -ForegroundColor Green
} else {
    # 프로필 파일에 이미 설정이 있는지 확인
    $profileContent = Get-Content $profilePath -Raw -ErrorAction SilentlyContinue
    
    if ($profileContent -match "UTF-8 인코딩 설정") {
        Write-Host "⚠️  프로필에 이미 UTF-8 설정이 있습니다." -ForegroundColor Yellow
        Write-Host "   기존 설정을 유지합니다." -ForegroundColor Gray
    } else {
        # 기존 내용에 추가
        Add-Content -Path $profilePath -Value "`n$encodingConfig" -Encoding UTF8
        Write-Host "✅ 프로필에 UTF-8 설정 추가 완료" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "설정 완료!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 다음 단계:" -ForegroundColor Yellow
Write-Host "   1. PowerShell을 재시작하세요" -ForegroundColor White
Write-Host "   2. 또는 다음 명령으로 프로필을 다시 로드하세요:" -ForegroundColor White
Write-Host "      . `$PROFILE" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Git 커밋 시 안전한 스크립트 사용:" -ForegroundColor Yellow
Write-Host "   .\scripts\git\commit-safe-utf8.ps1 `"커밋 메시지`"" -ForegroundColor White
Write-Host "   또는" -ForegroundColor Gray
Write-Host "   .\scripts\git\commit-safe-utf8.ps1 `"커밋 메시지`" -Push" -ForegroundColor White
Write-Host ""

