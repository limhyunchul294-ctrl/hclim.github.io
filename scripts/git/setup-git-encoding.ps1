# Git 한글 인코딩 설정 스크립트
# 이 스크립트를 실행하면 Git 커밋 메시지 한글 깨짐 문제가 해결됩니다.

Write-Host "🔧 Git 한글 인코딩 설정 중..." -ForegroundColor Yellow

# Git 전역 설정
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8
git config --global core.quotepath false

# PowerShell 인코딩 설정
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$env:PYTHONIOENCODING = "utf-8"

# 코드 페이지를 UTF-8로 변경
chcp 65001 | Out-Null

Write-Host "✅ Git 인코딩 설정 완료!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 설정된 값:" -ForegroundColor Cyan
git config --global --list | Select-String -Pattern "encoding|commit|i18n"
Write-Host ""
Write-Host "💡 이제 헬퍼 스크립트를 사용하여 커밋하세요:" -ForegroundColor Yellow
Write-Host "   .\scripts\git\commit.ps1 `"커밋 메시지`"" -ForegroundColor White
Write-Host "   또는" -ForegroundColor Gray
Write-Host "   .\scripts\git\commit-and-push.ps1 `"커밋 메시지`"" -ForegroundColor White

