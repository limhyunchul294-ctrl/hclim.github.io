# 최근 200개 커밋 메시지를 안전하게 수정하는 스크립트
# 실행 방법: PowerShell에서 .\rebase-fix-200-commits.ps1 실행

# PowerShell UTF-8 인코딩 설정
chcp 65001 | Out-Null
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "최근 200개 커밋 메시지 수정 스크립트" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 현재 브랜치 확인
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "현재 브랜치: $currentBranch" -ForegroundColor Yellow

# 전체 커밋 개수 확인
$totalCommits = (git rev-list --count HEAD)
Write-Host "전체 커밋 개수: $totalCommits" -ForegroundColor Yellow

# 수정할 커밋 개수 결정
$commitCount = 200
if ($totalCommits -lt $commitCount) {
    $commitCount = $totalCommits
    Write-Host "전체 커밋 개수가 $totalCommits개입니다. 모두 수정합니다." -ForegroundColor Yellow
} else {
    Write-Host "최근 $commitCount개 커밋을 수정합니다." -ForegroundColor Yellow
}

# 1단계: 백업 브랜치 생성
Write-Host "`n[1/6] 백업 브랜치 생성 중..." -ForegroundColor Yellow
$backupBranchName = "backup-before-rebase-200-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
git branch $backupBranchName
Write-Host "✓ 백업 브랜치 생성 완료: $backupBranchName" -ForegroundColor Green

# 2단계: 최근 커밋 샘플 확인
Write-Host "`n[2/6] 최근 커밋 샘플 확인 중..." -ForegroundColor Yellow
Write-Host "`n--- 최근 10개 커밋 샘플 ---" -ForegroundColor Cyan
git log --oneline -10

# 3단계: 커밋 메시지 템플릿 확인
Write-Host "`n[3/6] 커밋 메시지 템플릿 확인 중..." -ForegroundColor Yellow
$commitMsgFile = "commit-msg.txt"
if (Test-Path $commitMsgFile) {
    $commitMsg = (Get-Content $commitMsgFile -Raw).Trim()
    Write-Host "✓ 커밋 메시지: '$commitMsg'" -ForegroundColor Green
} else {
    $commitMsg = "한글로 업데이트 및 최신화"
    Write-Host "⚠️  commit-msg.txt 파일이 없습니다. 기본 메시지 사용: '$commitMsg'" -ForegroundColor Yellow
}

# 4단계: 자동화 방식 선택
Write-Host "`n[4/6] 수정 방식 선택" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  200개 커밋을 수정하는 방법:" -ForegroundColor Cyan
Write-Host "  1. Interactive Rebase (수동, 안전하지만 시간 소요)" -ForegroundColor White
Write-Host "  2. 자동 스크립트 (빠르지만 모든 커밋을 동일 메시지로 변경)" -ForegroundColor White
Write-Host ""
Write-Host "방법 1을 선택하면 에디터가 열리며 각 커밋마다 확인하며 수정합니다." -ForegroundColor Gray
Write-Host "방법 2를 선택하면 모든 커밋 메시지를 자동으로 '$commitMsg'로 변경합니다." -ForegroundColor Gray
Write-Host ""
$methodChoice = Read-Host "방법을 선택하세요 (1 또는 2, 기본값: 2)"

if ([string]::IsNullOrWhiteSpace($methodChoice)) {
    $methodChoice = "2"
}

# 5단계: 안내 및 확인
Write-Host "`n[5/6] 최종 확인" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  중요 안내:" -ForegroundColor Red
Write-Host "  - $commitCount개의 커밋 메시지를 수정합니다" -ForegroundColor White
Write-Host "  - 이미 푸시된 커밋을 수정합니다" -ForegroundColor White
Write-Host "  - Force push가 필요합니다 (git push --force-with-lease)" -ForegroundColor White
Write-Host "  - 백업 브랜치: $backupBranchName" -ForegroundColor White
Write-Host ""
if ($methodChoice -eq "1") {
    Write-Host "  - Interactive Rebase를 사용합니다" -ForegroundColor White
    Write-Host "  - 에디터가 열리면 모든 'pick'을 'reword'로 변경하세요" -ForegroundColor White
    Write-Host "  - 각 커밋마다 '$commitMsg' 입력하세요" -ForegroundColor White
} else {
    Write-Host "  - 자동 스크립트를 사용합니다" -ForegroundColor White
    Write-Host "  - 모든 커밋 메시지를 '$commitMsg'로 자동 변경합니다" -ForegroundColor White
}
Write-Host ""

$confirm = Read-Host "계속하시겠습니까? (Y/N)"
if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "`n작업을 취소했습니다." -ForegroundColor Yellow
    Write-Host "백업 브랜치는 유지됩니다: $backupBranchName" -ForegroundColor Gray
    exit 0
}

# 6단계: 실행
Write-Host "`n[6/6] 커밋 메시지 수정 실행..." -ForegroundColor Yellow

if ($methodChoice -eq "1") {
    # 방법 1: Interactive Rebase
    Write-Host "Interactive Rebase를 시작합니다..." -ForegroundColor Cyan
    Write-Host "에디터가 열리면 모든 'pick'을 'reword'로 변경하세요." -ForegroundColor Yellow
    
    # Git 에디터 확인
    $gitEditor = git config --get core.editor
    if (-not $gitEditor) {
        $env:GIT_EDITOR = "notepad"
        Write-Host "Git 에디터가 설정되지 않았습니다. 메모장을 사용합니다." -ForegroundColor Yellow
    }
    
    try {
        git rebase -i "HEAD~$commitCount"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✓ Interactive Rebase 완료!" -ForegroundColor Green
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
    
} else {
    # 방법 2: 자동 스크립트 (filter-branch 또는 rebase 사용)
    Write-Host "자동 스크립트를 사용하여 모든 커밋 메시지를 변경합니다..." -ForegroundColor Cyan
    Write-Host ""
    
    # Git filter-repo가 설치되어 있으면 사용, 없으면 filter-branch 사용
    $useFilterRepo = $false
    try {
        git filter-repo --version 2>&1 | Out-Null
        $useFilterRepo = $true
        Write-Host "✓ git-filter-repo가 설치되어 있습니다." -ForegroundColor Green
    } catch {
        Write-Host "⚠️  git-filter-repo가 없습니다. git filter-branch를 사용합니다." -ForegroundColor Yellow
    }
    
    if ($useFilterRepo) {
        # git filter-repo 사용 (더 안전하고 빠름)
        Write-Host "git filter-repo를 사용합니다..." -ForegroundColor Cyan
        # Note: git filter-repo는 복잡하므로 여기서는 filter-branch 사용
        Write-Host "⚠️  git filter-repo는 이 스크립트에서 지원하지 않습니다." -ForegroundColor Yellow
        Write-Host "git filter-branch를 사용합니다..." -ForegroundColor Cyan
    }
    
    # git filter-branch를 사용한 자동 변경
    # 최근 N개 커밋만 변경하기 위해 rebase를 사용
    Write-Host "최근 $commitCount개 커밋을 자동으로 변경합니다..." -ForegroundColor Cyan
    Write-Host "이 작업은 시간이 걸릴 수 있습니다..." -ForegroundColor Yellow
    Write-Host ""
    
    # 자동으로 모든 커밋 메시지를 변경하는 스크립트 생성
    $scriptPath = "temp-rebase-script.ps1"
    $rebaseScript = @"
# 자동 rebase 스크립트
`$commitMsg = '$commitMsg'
`$count = $commitCount

# rebase todo 파일 생성
`$todoFile = ".git/rebase-merge/git-rebase-todo"
if (-not (Test-Path ".git/rebase-merge")) {
    New-Item -ItemType Directory -Path ".git/rebase-merge" -Force | Out-Null
}

# 모든 커밋을 reword로 설정
`$commits = git log --reverse --format="%H" HEAD~`$count..HEAD
`$todoContent = ""
foreach (`$commit in `$commits) {
    `$shortHash = git rev-parse --short `$commit
    `$todoContent += "reword `$shortHash `$commitMsg`n"
}

# Interactive rebase를 위한 환경 변수 설정
`$env:GIT_SEQUENCE_EDITOR = "powershell -Command `"Set-Content -Path '.git/rebase-merge/git-rebase-todo' -Value @'`n`$todoContent`n'@'`""
"@
    
    # 대신 더 간단한 방법: 각 커밋을 개별적으로 수정
    Write-Host "⚠️  많은 커밋을 한 번에 자동 변경하는 것은 복잡합니다." -ForegroundColor Yellow
    Write-Host "대신 Interactive Rebase를 사용하거나," -ForegroundColor Yellow
    Write-Host "Git filter-branch를 사용하는 것을 권장합니다." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "계속하려면 방법 1 (Interactive Rebase)을 사용하세요." -ForegroundColor Cyan
    Write-Host "또는 최근 커밋만 선택하여 수정하는 것을 권장합니다." -ForegroundColor Yellow
    exit 1
}

# 결과 확인
Write-Host "`n--- 수정된 커밋 히스토리 샘플 ---" -ForegroundColor Cyan
git log --oneline -10

Write-Host "`n=== 수정 완료! ===" -ForegroundColor Green
Write-Host ""
Write-Host "다음 단계:" -ForegroundColor Yellow
Write-Host "1. 위의 커밋 히스토리를 확인하세요." -ForegroundColor White
Write-Host "2. 전체 히스토리 확인: git log --oneline -20" -ForegroundColor White
Write-Host "3. 문제가 없으면 다음 명령어로 푸시하세요:" -ForegroundColor White
Write-Host "   git push --force-with-lease origin $currentBranch" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Force push는 이미 푸시된 커밋을 덮어씁니다." -ForegroundColor Red
Write-Host "   협업 중이라면 팀원들과 상의하세요!" -ForegroundColor Red
Write-Host ""
Write-Host "문제가 있다면 다음 명령어로 되돌릴 수 있습니다:" -ForegroundColor Yellow
Write-Host "   git rebase --abort  (rebase 중이라면)" -ForegroundColor Cyan
Write-Host "   git reset --hard $backupBranchName  (완료 후 되돌리기)" -ForegroundColor Cyan

