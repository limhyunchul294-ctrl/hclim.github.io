# 깨진 커밋 메시지를 안전하게 수정하는 스크립트
# 실행 방법: PowerShell에서 .\rebase-fix-commits.ps1 실행

# PowerShell UTF-8 인코딩 설정
chcp 65001 | Out-Null
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "깨진 커밋 메시지 수정 스크립트" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 현재 브랜치 확인
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "현재 브랜치: $currentBranch" -ForegroundColor Yellow

# 1단계: 백업 브랜치 생성
Write-Host "`n[1/5] 백업 브랜치 생성 중..." -ForegroundColor Yellow
$backupBranchName = "backup-before-rebase-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
git branch $backupBranchName
Write-Host "✓ 백업 브랜치 생성 완료: $backupBranchName" -ForegroundColor Green

# 2단계: 최근 커밋 확인
Write-Host "`n[2/5] 최근 커밋 확인 중..." -ForegroundColor Yellow
Write-Host "`n--- 최근 15개 커밋 ---" -ForegroundColor Cyan
git log --oneline -15

Write-Host "`n수정할 커밋 개수를 입력하세요 (기본값: 10):" -ForegroundColor Yellow
$commitCount = Read-Host "커밋 개수"
if ([string]::IsNullOrWhiteSpace($commitCount)) {
    $commitCount = 10
}

# 3단계: 커밋 메시지 템플릿 확인
Write-Host "`n[3/5] 커밋 메시지 템플릿 확인 중..." -ForegroundColor Yellow
$commitMsgFile = "commit-msg.txt"
if (Test-Path $commitMsgFile) {
    $commitMsg = (Get-Content $commitMsgFile -Raw).Trim()
    Write-Host "✓ 커밋 메시지: '$commitMsg'" -ForegroundColor Green
} else {
    $commitMsg = "한글로 업데이트 및 최신화"
    Write-Host "⚠️  commit-msg.txt 파일이 없습니다. 기본 메시지 사용: '$commitMsg'" -ForegroundColor Yellow
}

# 4단계: 안내 메시지
Write-Host "`n[4/5] Interactive Rebase 안내" -ForegroundColor Yellow
Write-Host "`n⚠️  중요 안내:" -ForegroundColor Red
Write-Host "  - 에디터가 열리면 모든 'pick'을 'reword' (또는 'r')로 변경하세요" -ForegroundColor White
Write-Host "  - 파일을 저장하고 에디터를 종료하세요" -ForegroundColor White
Write-Host "  - 각 커밋마다 에디터가 열리면 '$commitMsg' 입력 후 저장하세요" -ForegroundColor White
Write-Host "  - 모든 커밋을 수정하면 자동으로 완료됩니다" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  주의사항:" -ForegroundColor Yellow
Write-Host "  - 이미 푸시된 커밋을 수정합니다" -ForegroundColor Yellow
Write-Host "  - Force push가 필요합니다 (git push --force-with-lease)" -ForegroundColor Yellow
Write-Host "  - 백업 브랜치: $backupBranchName" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "계속하시겠습니까? (Y/N)"
if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "`n작업을 취소했습니다." -ForegroundColor Yellow
    Write-Host "백업 브랜치는 유지됩니다: $backupBranchName" -ForegroundColor Gray
    exit 0
}

# 5단계: Interactive Rebase 실행
Write-Host "`n[5/5] Interactive Rebase 시작..." -ForegroundColor Yellow
Write-Host "에디터를 엽니다. 위 안내에 따라 수정하세요." -ForegroundColor Cyan
Write-Host ""

# Git 에디터 확인
$gitEditor = git config --get core.editor
if (-not $gitEditor) {
    $env:GIT_EDITOR = "notepad"  # Windows 기본 메모장 사용
    Write-Host "Git 에디터가 설정되지 않았습니다. 메모장을 사용합니다." -ForegroundColor Yellow
    Write-Host "다른 에디터를 사용하려면: git config --global core.editor 'code --wait'" -ForegroundColor Gray
}

# Interactive rebase 실행
try {
    git rebase -i "HEAD~$commitCount"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✓ Interactive Rebase 완료!" -ForegroundColor Green
        
        # 결과 확인
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
        Write-Host "   git rebase --abort  (rebase 중이라면)" -ForegroundColor Cyan
        Write-Host "   git reset --hard $backupBranchName  (완료 후 되돌리기)" -ForegroundColor Cyan
        
    } else {
        Write-Host "`n❌ Interactive Rebase 중 오류가 발생했습니다." -ForegroundColor Red
        Write-Host "다음 명령어로 rebase를 취소할 수 있습니다:" -ForegroundColor Yellow
        Write-Host "   git rebase --abort" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host "`n❌ 오류 발생: $_" -ForegroundColor Red
    Write-Host "rebase를 취소하려면: git rebase --abort" -ForegroundColor Yellow
}

