# Git 커밋 메시지 안전하게 수정하는 스크립트
# 실행 방법: PowerShell에서 .\fix-commit-messages-safe.ps1 실행

Write-Host "=== Git 커밋 메시지 수정 (안전 모드) ===" -ForegroundColor Cyan
Write-Host ""

# 현재 브랜치 확인
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "현재 브랜치: $currentBranch" -ForegroundColor Yellow

# 1단계: 백업 브랜치 생성
Write-Host "`n[1/4] 백업 브랜치 생성 중..." -ForegroundColor Yellow
$backupBranchName = "backup-before-fix-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
git branch $backupBranchName
Write-Host "✓ 백업 브랜치 생성 완료: $backupBranchName" -ForegroundColor Green

# 2단계: 수정할 커밋 개수 확인
Write-Host "`n[2/4] 최근 커밋 확인 중..." -ForegroundColor Yellow
Write-Host "`n--- 최근 15개 커밋 ---" -ForegroundColor Cyan
git log --oneline -15

Write-Host "`n몇 개의 커밋을 수정하시겠습니까? (기본값: 10)" -ForegroundColor Yellow
$commitCount = Read-Host "커밋 개수 입력"
if ([string]::IsNullOrWhiteSpace($commitCount)) {
    $commitCount = 10
}

# 3단계: Interactive rebase 실행
Write-Host "`n[3/4] Interactive rebase 시작..." -ForegroundColor Yellow
Write-Host "⚠️  주의: 다음 단계에서 텍스트 에디터가 열립니다." -ForegroundColor Red
Write-Host ""
Write-Host "에디터에서 할 일:" -ForegroundColor Cyan
Write-Host "1. 모든 'pick'을 'reword'로 변경 (또는 'r'로 줄여서)" -ForegroundColor White
Write-Host "2. 파일 저장 및 에디터 종료" -ForegroundColor White
Write-Host "3. 각 커밋 메시지를 '한글로 업데이트 및 최신화'로 입력" -ForegroundColor White
Write-Host ""
Write-Host "에디터 종료 후 스크립트가 계속 진행됩니다..." -ForegroundColor Yellow
Write-Host ""

# 사용자 확인
$confirm = Read-Host "계속하시겠습니까? (Y/N)"
if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "취소되었습니다." -ForegroundColor Yellow
    exit
}

# Git 에디터 설정 (기본 에디터 사용)
$originalEditor = $env:GIT_EDITOR
if (-not $originalEditor) {
    $env:GIT_EDITOR = "code --wait"  # VS Code가 설치되어 있다면
}

# Interactive rebase 실행
Write-Host "`nRebase 에디터를 엽니다..." -ForegroundColor Cyan
git rebase -i "HEAD~$commitCount"

# 4단계: 결과 확인
Write-Host "`n[4/4] 수정 결과 확인..." -ForegroundColor Yellow
Write-Host "`n--- 수정된 커밋 히스토리 ---" -ForegroundColor Cyan
git log --oneline -15

Write-Host "`n=== 수정 완료! ===" -ForegroundColor Green
Write-Host ""
Write-Host "다음 단계:" -ForegroundColor Yellow
Write-Host "1. 위의 커밋 히스토리를 확인하세요." -ForegroundColor White
Write-Host "2. 문제가 없으면 다음 명령어로 푸시하세요:" -ForegroundColor White
Write-Host "   git push --force-with-lease origin $currentBranch" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Force push는 이미 푸시된 커밋을 덮어씁니다." -ForegroundColor Red
Write-Host "   협업 중이라면 팀원들과 상의하세요!" -ForegroundColor Red
Write-Host ""
Write-Host "문제가 있다면 다음 명령어로 되돌릴 수 있습니다:" -ForegroundColor Yellow
Write-Host "   git reset --hard $backupBranchName" -ForegroundColor Cyan

