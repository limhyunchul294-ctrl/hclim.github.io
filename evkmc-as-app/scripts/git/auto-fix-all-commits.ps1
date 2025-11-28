# 모든 커밋 메시지를 자동으로 수정하는 완전 자동화 스크립트
# 실행 방법: PowerShell에서 .\auto-fix-all-commits.ps1 실행

chcp 65001 | Out-Null
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "커밋 메시지 자동 수정 스크립트" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$currentBranch = git rev-parse --abbrev-ref HEAD
$totalCommits = (git rev-list --count HEAD)
$commitMsg = "한글로 업데이트 및 최신화"

Write-Host "현재 브랜치: $currentBranch" -ForegroundColor Yellow
Write-Host "총 커밋 개수: $totalCommits" -ForegroundColor Yellow
Write-Host "변경할 메시지: $commitMsg" -ForegroundColor Green

# 백업 확인
$backupBranch = git branch | Select-String "backup-before-rebase-all" | Select-Object -First 1
if ($backupBranch) {
    $backupName = ($backupBranch.ToString() -split '\s+')[1]
    Write-Host "백업 브랜치: $backupName" -ForegroundColor Green
} else {
    $backupName = "backup-before-auto-fix-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    git branch $backupName
    Write-Host "백업 브랜치 생성: $backupName" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "자동화된 방법으로 커밋 메시지를 수정합니다..." -ForegroundColor Cyan
Write-Host ""

# 방법: git filter-branch를 사용하여 모든 커밋 메시지 변경
# 또는 환경 변수를 사용한 자동 rebase

# 임시 스크립트 파일 생성 (rebase-todo 자동 수정용)
$tempScript = "$env:TEMP\git-rebase-auto.ps1"
$rebaseTodoScript = @"
`$content = Get-Content `$args[0]
`$newContent = `$content | ForEach-Object {
    if (`$_ -match '^pick\s+') {
        `$_ -replace '^pick\s+', 'reword '
    } else {
        `$_
    }
}
Set-Content -Path `$args[0] -Value `$newContent
"@
Set-Content -Path $tempScript -Value $rebaseTodoScript

# 커밋 메시지 자동 입력용 스크립트
$tempMsgScript = "$env:TEMP\git-commit-msg-auto.ps1"
$commitMsgAuto = @"
Set-Content -Path `$args[0] -Value '$commitMsg'
"@
Set-Content -Path $tempMsgScript -Value $commitMsgAuto

try {
    # Git 환경 변수 설정
    $env:GIT_SEQUENCE_EDITOR = "powershell -File `"$tempScript`""
    $env:GIT_EDITOR = "powershell -File `"$tempMsgScript`""
    
    Write-Host "[1/3] Interactive Rebase 시작 (자동화됨)..." -ForegroundColor Yellow
    Write-Host "   모든 'pick'을 'reword'로 자동 변경합니다..." -ForegroundColor Gray
    
    # Rebase 실행
    git rebase -i --root
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n[2/3] 커밋 메시지 수정 완료!" -ForegroundColor Green
        
        Write-Host "`n[3/3] 결과 확인 중..." -ForegroundColor Yellow
        Write-Host "`n--- 수정된 커밋 히스토리 (최근 10개) ---" -ForegroundColor Cyan
        git log --oneline -10
        
        Write-Host "`n=== 자동 수정 완료! ===" -ForegroundColor Green
        Write-Host ""
        Write-Host "다음 단계:" -ForegroundColor Yellow
        Write-Host "1. 위의 커밋 히스토리를 확인하세요" -ForegroundColor White
        Write-Host "2. 전체 확인: git log --oneline" -ForegroundColor White
        Write-Host "3. 문제없으면 푸시: git push --force-with-lease origin $currentBranch" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "문제가 있다면:" -ForegroundColor Yellow
        Write-Host "  git reset --hard $backupName" -ForegroundColor Cyan
        
    } else {
        Write-Host "`n오류가 발생했습니다. rebase를 취소합니다." -ForegroundColor Red
        git rebase --abort
        exit 1
    }
    
} catch {
    Write-Host "`n오류 발생: $_" -ForegroundColor Red
    git rebase --abort
    exit 1
} finally {
    # 임시 파일 정리
    Remove-Item $tempScript -ErrorAction SilentlyContinue
    Remove-Item $tempMsgScript -ErrorAction SilentlyContinue
    # 환경 변수 정리
    Remove-Item Env:\GIT_SEQUENCE_EDITOR -ErrorAction SilentlyContinue
    Remove-Item Env:\GIT_EDITOR -ErrorAction SilentlyContinue
}

