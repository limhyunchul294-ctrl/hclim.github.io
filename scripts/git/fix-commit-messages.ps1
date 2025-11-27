# 이전 커밋 메시지를 "한글로 업데이트 및 최신화"로 자동 변경하는 스크립트

# PowerShell UTF-8 인코딩 설정
chcp 65001 | Out-Null
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "이전 커밋 메시지 수정 스크립트" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 현재 브랜치 확인
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "현재 브랜치: $currentBranch" -ForegroundColor Yellow

# 백업 브랜치 생성
$backupBranch = "backup-before-fix-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Write-Host "백업 브랜치 생성: $backupBranch" -ForegroundColor Yellow
git branch $backupBranch
Write-Host ""

# 변경할 커밋 목록 확인
Write-Host "변경할 커밋 목록:" -ForegroundColor Cyan
$commits = git log --reverse --format="%H|%h|%s" ea29937..cd3a61d
$commits | ForEach-Object {
    $parts = $_ -split '\|'
    Write-Host "  - $($parts[1]) $($parts[2])" -ForegroundColor Gray
}
Write-Host ""

Write-Host "총 $($commits.Count)개의 커밋 메시지를 변경합니다." -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  주의사항:" -ForegroundColor Yellow
Write-Host "  - 이미 푸시된 커밋을 수정합니다" -ForegroundColor Yellow
Write-Host "  - Force push가 필요합니다" -ForegroundColor Yellow
Write-Host "  - 백업 브랜치: $backupBranch" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "계속하시겠습니까? (Y/N)"
if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "작업을 취소했습니다." -ForegroundColor Yellow
    exit 0
}

# commit-msg.txt 파일 확인
if (-not (Test-Path "commit-msg.txt")) {
    Write-Host "❌ commit-msg.txt 파일을 찾을 수 없습니다." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔄 Interactive rebase를 시작합니다..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Visual Studio Code가 열리면:" -ForegroundColor Yellow
Write-Host "  1. 모든 'pick'을 'reword'로 변경하세요" -ForegroundColor White
Write-Host "  2. 파일을 저장하고 닫으세요 (Ctrl+S, Ctrl+W)" -ForegroundColor White
Write-Host "  3. 각 커밋마다 '한글로 업데이트 및 최신화'를 입력하세요 (8번 반복)" -ForegroundColor White
Write-Host ""
Read-Host "준비되었으면 Enter를 누르세요"

# Interactive rebase 시작
git rebase -i ea29937^

# Rebase 결과 확인
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Rebase 완료!" -ForegroundColor Green
    Write-Host ""
    Write-Host "변경된 커밋 확인:" -ForegroundColor Cyan
    git log --oneline -15
    
    Write-Host ""
    Write-Host "원격 저장소에 force push 하시겠습니까? (Y/N)" -ForegroundColor Yellow
    $push = Read-Host
    
    if ($push -eq "Y" -or $push -eq "y") {
        Write-Host ""
        Write-Host "🚀 Force pushing..." -ForegroundColor Cyan
        git push --force origin $currentBranch:evkmc-as-app
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Force push 완료!" -ForegroundColor Green
            Write-Host "GitHub에서 커밋 메시지가 정상적으로 표시되는지 확인하세요." -ForegroundColor Cyan
        } else {
            Write-Host ""
            Write-Host "❌ Force push 실패" -ForegroundColor Red
        }
    } else {
        Write-Host ""
        Write-Host "⏭️  Force push를 건너뜁니다." -ForegroundColor Yellow
        Write-Host "나중에 다음 명령으로 push하세요:" -ForegroundColor Cyan
        Write-Host "  git push --force origin $currentBranch :evkmc-as-app" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "⚠️  Rebase가 완료되지 않았거나 취소되었습니다." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Rebase를 계속하려면:" -ForegroundColor Cyan
    Write-Host "  git rebase --continue" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Rebase를 취소하려면:" -ForegroundColor Cyan
    Write-Host "  git rebase --abort" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "백업 브랜치: $backupBranch" -ForegroundColor Gray

