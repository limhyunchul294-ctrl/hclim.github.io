# Git 커밋 + 푸시 스크립트 - 한글로 업데이트 및 최신화
# 사용법: .\git-push-ko.ps1

# PowerShell UTF-8 인코딩 설정
chcp 65001 | Out-Null
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# commit-msg.txt 파일 경로 확인
$commitMsgFile = "commit-msg.txt"
if (-not (Test-Path $commitMsgFile)) {
    Write-Host "❌ commit-msg.txt 파일을 찾을 수 없습니다." -ForegroundColor Red
    exit 1
}

# 변경사항이 있는지 확인
$status = git status --short
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "❌ 커밋할 변경사항이 없습니다." -ForegroundColor Yellow
    exit 0
}

# 모든 변경사항 추가
Write-Host "📦 변경사항 추가 중..." -ForegroundColor Cyan
git add -A

# commit-msg.txt 파일을 사용하여 커밋
Write-Host "📝 커밋 메시지: 한글로 업데이트 및 최신화" -ForegroundColor Cyan
git commit -F $commitMsgFile

# 커밋 결과 확인
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 커밋 완료: 한글로 업데이트 및 최신화" -ForegroundColor Green
} else {
    Write-Host "❌ 커밋 실패" -ForegroundColor Red
    exit 1
}

# 자동 푸시
Write-Host "🚀 푸시 중..." -ForegroundColor Cyan
git push origin master:evkmc-as-app

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 푸시 완료" -ForegroundColor Green
} else {
    Write-Host "❌ 푸시 실패" -ForegroundColor Red
    exit 1
}

