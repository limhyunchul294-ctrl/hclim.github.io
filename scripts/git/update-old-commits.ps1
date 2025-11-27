# 이전 커밋 메시지를 "한글로 업데이트 및 최신화"로 통일하는 스크립트
# 주의: 이미 푸시된 커밋을 수정하므로 force push가 필요합니다.

Write-Host "⚠️  주의: 이 작업은 이미 푸시된 커밋 메시지를 수정합니다." -ForegroundColor Yellow
Write-Host "⚠️  force push가 필요하며, 다른 사람이 사용 중인 브랜치에서는 위험할 수 있습니다." -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "계속하시겠습니까? (Y/N)"
if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "작업을 취소했습니다." -ForegroundColor Yellow
    exit 0
}

# PowerShell UTF-8 인코딩 설정
chcp 65001 | Out-Null
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# 현재 브랜치 확인
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "현재 브랜치: $currentBranch" -ForegroundColor Cyan

# 변경할 커밋 범위 확인
Write-Host "`n변경할 커밋 목록:" -ForegroundColor Cyan
git log --oneline 1a107bb..HEAD

Write-Host "`n이 커밋들의 메시지를 모두 '한글로 업데이트 및 최신화'로 변경하시겠습니까?" -ForegroundColor Yellow
$confirm2 = Read-Host "(Y/N)"

if ($confirm2 -eq "Y" -or $confirm2 -eq "y") {
    Write-Host "`nInteractive rebase를 시작합니다..." -ForegroundColor Cyan
    Write-Host "에디터가 열리면 각 커밋의 'pick'을 'reword'로 변경하고 저장하세요." -ForegroundColor Yellow
    Write-Host "그런 다음 각 커밋에 대해 '한글로 업데이트 및 최신화' 메시지를 입력하세요." -ForegroundColor Yellow
    Write-Host ""
    
    # Git 에디터 설정 확인
    $editor = git config core.editor
    if (-not $editor) {
        Write-Host "⚠️  Git 에디터가 설정되지 않았습니다." -ForegroundColor Yellow
        Write-Host "Visual Studio Code를 사용하려면 다음 명령을 실행하세요:" -ForegroundColor Yellow
        Write-Host "git config --global core.editor 'code --wait'" -ForegroundColor Cyan
        Write-Host ""
    }
    
    Write-Host "계속하려면 Enter를 누르세요..."
    Read-Host
    
    # Interactive rebase 시작
    git rebase -i 1a107bb
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Rebase 완료" -ForegroundColor Green
        Write-Host "`n변경사항을 확인하려면:" -ForegroundColor Cyan
        Write-Host "git log --oneline -10" -ForegroundColor Yellow
        Write-Host ""
        
        $push = Read-Host "원격 저장소에 force push 하시겠습니까? (Y/N)"
        if ($push -eq "Y" -or $push -eq "y") {
            Write-Host "Force pushing..." -ForegroundColor Cyan
            git push --force origin $currentBranch:evkmc-as-app
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Force push 완료" -ForegroundColor Green
            } else {
                Write-Host "❌ Force push 실패" -ForegroundColor Red
            }
        } else {
            Write-Host "⏭️  Force push를 건너뜁니다." -ForegroundColor Yellow
            Write-Host "나중에 다음 명령으로 push하세요:" -ForegroundColor Cyan
            Write-Host "git push --force origin $currentBranch:evkmc-as-app" -ForegroundColor Yellow
        }
    } else {
        Write-Host "`n❌ Rebase 실패 또는 취소됨" -ForegroundColor Red
        Write-Host "Rebase를 취소하려면: git rebase --abort" -ForegroundColor Yellow
    }
} else {
    Write-Host "작업을 취소했습니다." -ForegroundColor Yellow
}

