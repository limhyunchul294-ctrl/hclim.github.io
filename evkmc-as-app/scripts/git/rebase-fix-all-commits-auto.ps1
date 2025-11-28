# 모든 커밋 메시지를 자동으로 수정하는 스크립트
# 실행 방법: PowerShell에서 .\rebase-fix-all-commits-auto.ps1 실행

# PowerShell UTF-8 인코딩 설정
chcp 65001 | Out-Null
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "모든 커밋 메시지 자동 수정 스크립트" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 현재 브랜치 확인
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "현재 브랜치: $currentBranch" -ForegroundColor Yellow

# 전체 커밋 개수 확인
$totalCommits = (git rev-list --count HEAD)
Write-Host "전체 커밋 개수: $totalCommits" -ForegroundColor Yellow

# 커밋 메시지 템플릿 확인
$commitMsgFile = "commit-msg.txt"
if (Test-Path $commitMsgFile) {
    $commitMsg = (Get-Content $commitMsgFile -Raw).Trim()
} else {
    $commitMsg = "한글로 업데이트 및 최신화"
}
Write-Host "변경할 커밋 메시지: '$commitMsg'" -ForegroundColor Green

# 1단계: 백업 브랜치 생성
Write-Host "`n[1/4] 백업 브랜치 생성 중..." -ForegroundColor Yellow
$backupBranchName = "backup-before-rebase-all-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
git branch $backupBranchName
Write-Host "✓ 백업 브랜치 생성 완료: $backupBranchName" -ForegroundColor Green

# 2단계: 최근 커밋 확인 (깨진 커밋 샘플)
Write-Host "`n[2/4] 최근 커밋 확인 중..." -ForegroundColor Yellow
Write-Host "`n--- 최근 10개 커밋 (수정 전) ---" -ForegroundColor Cyan
git log --oneline -10

# 3단계: 안내 및 확인
Write-Host "`n[3/4] 최종 확인" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  중요 안내:" -ForegroundColor Red
Write-Host "  - $totalCommits개의 커밋 메시지를 모두 수정합니다" -ForegroundColor White
Write-Host "  - 모든 커밋 메시지를 '$commitMsg'로 변경합니다" -ForegroundColor White
Write-Host "  - 이미 푸시된 커밋을 수정합니다" -ForegroundColor White
Write-Host "  - Force push가 필요합니다" -ForegroundColor White
Write-Host "  - 백업 브랜치: $backupBranchName" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Interactive Rebase를 사용합니다." -ForegroundColor Yellow
Write-Host "   에디터가 열리면 모든 'pick'을 'reword'로 변경하세요." -ForegroundColor Yellow
Write-Host "   각 커밋마다 '$commitMsg'를 입력하세요." -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "계속하시겠습니까? (Y/N)"
if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "`n작업을 취소했습니다." -ForegroundColor Yellow
    Write-Host "백업 브랜치는 유지됩니다: $backupBranchName" -ForegroundColor Gray
    exit 0
}

# 4단계: Interactive Rebase 실행
Write-Host "`n[4/4] Interactive Rebase 시작..." -ForegroundColor Yellow
Write-Host ""

# Git 에디터 확인 및 설정
$gitEditor = git config --get core.editor
if (-not $gitEditor) {
    # VS Code가 설치되어 있으면 사용, 없으면 메모장
    if (Get-Command code -ErrorAction SilentlyContinue) {
        $env:GIT_EDITOR = "code --wait"
        Write-Host "VS Code를 에디터로 사용합니다." -ForegroundColor Green
    } else {
        $env:GIT_EDITOR = "notepad"
        Write-Host "메모장을 에디터로 사용합니다." -ForegroundColor Yellow
    }
} else {
    Write-Host "설정된 에디터 사용: $gitEditor" -ForegroundColor Green
}

Write-Host ""
Write-Host "에디터가 열립니다. 다음 단계를 따르세요:" -ForegroundColor Cyan
Write-Host "  1. 모든 'pick'을 'reword' (또는 'r')로 변경" -ForegroundColor White
Write-Host "  2. 파일 저장 및 에디터 종료" -ForegroundColor White
Write-Host "  3. 각 커밋마다 '$commitMsg' 입력 후 저장" -ForegroundColor White
Write-Host ""
Write-Host "에디터를 열고 있습니다..." -ForegroundColor Yellow
Write-Host ""

# 전체 커밋을 수정하기 위해 root까지 rebase
# 하지만 이건 위험할 수 있으므로, 실제로는 최근 N개만 수정
# 전체를 수정하려면 첫 커밋까지 가야 함
$firstCommit = git rev-list --max-parents=0 HEAD
$firstCommitShort = git rev-parse --short $firstCommit

Write-Host "⚠️  전체 커밋($totalCommits개)을 수정합니다." -ForegroundColor Yellow
Write-Host "   첫 커밋부터 rebase를 시작합니다." -ForegroundColor Yellow
Write-Host ""

try {
    # 첫 커밋의 이전으로 rebase (첫 커밋부터 모두 포함)
    # --root 옵션을 사용하여 모든 커밋 포함
    git rebase -i --root
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✓ Interactive Rebase 완료!" -ForegroundColor Green
        
        # 결과 확인
        Write-Host "`n--- 수정된 커밋 히스토리 샘플 ---" -ForegroundColor Cyan
        git log --oneline -10
        
        Write-Host "`n=== 수정 완료! ===" -ForegroundColor Green
        Write-Host ""
        Write-Host "다음 단계:" -ForegroundColor Yellow
        Write-Host "1. 위의 커밋 히스토리를 확인하세요." -ForegroundColor White
        Write-Host "2. 전체 확인: git log --oneline" -ForegroundColor White
        Write-Host "3. 문제가 없으면 다음 명령어로 푸시하세요:" -ForegroundColor White
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
        exit 1
    }
    
} catch {
    Write-Host "`n❌ 오류 발생: $_" -ForegroundColor Red
    Write-Host "rebase를 취소하려면: git rebase --abort" -ForegroundColor Yellow
    exit 1
}

