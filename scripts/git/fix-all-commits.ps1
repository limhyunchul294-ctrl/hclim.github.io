# Fix all commit messages automatically
# UTF-8 encoding required

chcp 65001 | Out-Null
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "All Commit Messages Fix Script" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "Current branch: $currentBranch" -ForegroundColor Yellow

$totalCommits = (git rev-list --count HEAD)
Write-Host "Total commits: $totalCommits" -ForegroundColor Yellow

$commitMsgFile = "commit-msg.txt"
if (Test-Path $commitMsgFile) {
    $commitMsg = (Get-Content $commitMsgFile -Raw).Trim()
} else {
    $commitMsg = "한글로 업데이트 및 최신화"
}
Write-Host "New commit message: '$commitMsg'" -ForegroundColor Green

Write-Host "`n[1/4] Creating backup branch..." -ForegroundColor Yellow
$backupBranchName = "backup-before-rebase-all-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
git branch $backupBranchName
Write-Host "Backup branch created: $backupBranchName" -ForegroundColor Green

Write-Host "`n[2/4] Recent commits (before fix):" -ForegroundColor Yellow
git log --oneline -10

Write-Host "`n[3/4] Final confirmation" -ForegroundColor Yellow
Write-Host ""
Write-Host "WARNING:" -ForegroundColor Red
Write-Host "  - Will modify $totalCommits commit messages" -ForegroundColor White
Write-Host "  - All messages will be changed to: '$commitMsg'" -ForegroundColor White
Write-Host "  - This will modify already pushed commits" -ForegroundColor White
Write-Host "  - Force push will be required" -ForegroundColor White
Write-Host "  - Backup branch: $backupBranchName" -ForegroundColor White
Write-Host ""
Write-Host "Interactive Rebase will be used." -ForegroundColor Yellow
Write-Host "When editor opens, change all 'pick' to 'reword' (or 'r')" -ForegroundColor Yellow
Write-Host "For each commit, enter: '$commitMsg'" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Continue? (Y/N)"
if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "`nCancelled." -ForegroundColor Yellow
    Write-Host "Backup branch maintained: $backupBranchName" -ForegroundColor Gray
    exit 0
}

Write-Host "`n[4/4] Starting Interactive Rebase..." -ForegroundColor Yellow
Write-Host ""

$gitEditor = git config --get core.editor
if (-not $gitEditor) {
    if (Get-Command code -ErrorAction SilentlyContinue) {
        $env:GIT_EDITOR = "code --wait"
        Write-Host "Using VS Code as editor." -ForegroundColor Green
    } else {
        $env:GIT_EDITOR = "notepad"
        Write-Host "Using Notepad as editor." -ForegroundColor Yellow
    }
} else {
    Write-Host "Using configured editor: $gitEditor" -ForegroundColor Green
}

Write-Host ""
Write-Host "Editor will open. Follow these steps:" -ForegroundColor Cyan
Write-Host "  1. Change all 'pick' to 'reword' (or 'r')" -ForegroundColor White
Write-Host "  2. Save file and close editor" -ForegroundColor White
Write-Host "  3. For each commit, enter '$commitMsg' and save" -ForegroundColor White
Write-Host ""
Write-Host "Opening editor..." -ForegroundColor Yellow
Write-Host ""

Write-Host "WARNING: Will rebase all $totalCommits commits." -ForegroundColor Yellow
Write-Host "Starting from root commit..." -ForegroundColor Yellow
Write-Host ""

try {
    git rebase -i --root
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nInteractive Rebase completed!" -ForegroundColor Green
        
        Write-Host "`n--- Fixed commit history sample ---" -ForegroundColor Cyan
        git log --oneline -10
        
        Write-Host "`n=== Fix completed! ===" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Review the commit history above." -ForegroundColor White
        Write-Host "2. Review all: git log --oneline" -ForegroundColor White
        Write-Host "3. If OK, push with:" -ForegroundColor White
        Write-Host "   git push --force-with-lease origin $currentBranch" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "WARNING: Force push will overwrite commits." -ForegroundColor Red
        Write-Host "Consult team members if collaborating!" -ForegroundColor Red
        Write-Host ""
        Write-Host "To rollback if needed:" -ForegroundColor Yellow
        Write-Host "   git rebase --abort  (if during rebase)" -ForegroundColor Cyan
        Write-Host "   git reset --hard $backupBranchName  (after completion)" -ForegroundColor Cyan
        
    } else {
        Write-Host "`nError during Interactive Rebase." -ForegroundColor Red
        Write-Host "Cancel rebase with: git rebase --abort" -ForegroundColor Yellow
        exit 1
    }
    
} catch {
    Write-Host "`nError: $_" -ForegroundColor Red
    Write-Host "Cancel rebase: git rebase --abort" -ForegroundColor Yellow
    exit 1
}

