# 이전 커밋 메시지를 "한글로 업데이트 및 최신화"로 통일하는 자동화 스크립트

# PowerShell UTF-8 인코딩 설정
chcp 65001 | Out-Null
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "🔄 이전 커밋 메시지를 '한글로 업데이트 및 최신화'로 변경 중..." -ForegroundColor Cyan
Write-Host ""

# 현재 브랜치 확인
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "현재 브랜치: $currentBranch" -ForegroundColor Cyan

# 변경할 커밋 목록 확인
Write-Host "`n변경할 커밋 목록 (ea29937부터 cd3a61d까지):" -ForegroundColor Cyan
git log --oneline ea29937..cd3a61d

Write-Host "`n⚠️  주의: 이미 푸시된 커밋을 수정하므로 force push가 필요합니다." -ForegroundColor Yellow

# commit-msg.txt 파일 확인
$commitMsgFile = "commit-msg.txt"
if (-not (Test-Path $commitMsgFile)) {
    Write-Host "❌ commit-msg.txt 파일을 찾을 수 없습니다." -ForegroundColor Red
    exit 1
}

# Git 에디터를 자동화 스크립트로 설정
$autoEditScript = @'
#!/bin/sh
# 자동으로 모든 커밋의 pick을 reword로 변경
sed -i 's/^pick/reword/g' "$1"
'@

# PowerShell에서 실행 가능한 형태로 변환
$autoEditScript = "#!/bin/sh`nsed -i 's/^pick/reword/g' `$1"

# 임시 스크립트 파일 생성
$tempScript = [System.IO.Path]::GetTempFileName() + ".sh"
[System.IO.File]::WriteAllText($tempScript, $autoEditScript, [System.Text.Encoding]::UTF8)

# Git 설정 변경 (임시)
$originalEditor = git config core.editor

Write-Host "`nGit rebase를 시작합니다..." -ForegroundColor Cyan
Write-Host "각 커밋에 대해 '한글로 업데이트 및 최신화' 메시지를 입력하세요." -ForegroundColor Yellow
Write-Host ""

# Interactive rebase 시작 (ea29937 이전 커밋부터)
git rebase -i ea29937^

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Rebase 완료" -ForegroundColor Green
    Write-Host "`n변경된 커밋 확인:" -ForegroundColor Cyan
    git log --oneline -10
    
    Write-Host "`n원격 저장소에 force push 하시겠습니까? (Y/N)" -ForegroundColor Yellow
    $push = Read-Host
    
    if ($push -eq "Y" -or $push -eq "y") {
        Write-Host "`n🚀 Force pushing..." -ForegroundColor Cyan
        git push --force origin $currentBranch:evkmc-as-app
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✅ Force push 완료" -ForegroundColor Green
            Write-Host "GitHub에서 커밋 메시지가 정상적으로 표시되는지 확인하세요." -ForegroundColor Cyan
        } else {
            Write-Host "`n❌ Force push 실패" -ForegroundColor Red
        }
    } else {
        Write-Host "`n⏭️  Force push를 건너뜁니다." -ForegroundColor Yellow
        Write-Host "나중에 다음 명령으로 push하세요:" -ForegroundColor Cyan
        Write-Host "git push --force origin $currentBranch :evkmc-as-app" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n❌ Rebase 실패 또는 취소됨" -ForegroundColor Red
    Write-Host "Rebase를 취소하려면: git rebase --abort" -ForegroundColor Yellow
}

# 임시 파일 정리
if (Test-Path $tempScript) {
    Remove-Item $tempScript -Force
}

# Git 에디터 설정 복원
if ($originalEditor) {
    git config core.editor $originalEditor
}

