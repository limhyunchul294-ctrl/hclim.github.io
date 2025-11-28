# 이전 커밋 메시지를 모두 "한글로 업데이트 및 최신화"로 변경하는 자동화 스크립트

# PowerShell UTF-8 인코딩 설정
chcp 65001 | Out-Null
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "🔄 이전 커밋 메시지를 모두 '한글로 업데이트 및 최신화'로 변경합니다..." -ForegroundColor Cyan
Write-Host ""

# 현재 브랜치 확인
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "현재 브랜치: $currentBranch" -ForegroundColor Cyan

# 백업 브랜치 생성
Write-Host "`n백업 브랜치 생성 중..." -ForegroundColor Yellow
git branch backup-before-rebase-$([DateTime]::Now.ToString('yyyyMMddHHmmss'))
Write-Host "✅ 백업 완료" -ForegroundColor Green

# 변경할 커밋 목록 확인
Write-Host "`n변경할 커밋 목록:" -ForegroundColor Cyan
git log --oneline ea29937..cd3a61d

Write-Host "`n⚠️  주의: 이 작업은 force push가 필요합니다." -ForegroundColor Yellow
Write-Host "⚠️  다른 사람이 이 브랜치를 사용하고 있다면 먼저 협의하세요." -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "계속하시겠습니까? (Y/N)"
if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "작업을 취소했습니다." -ForegroundColor Yellow
    exit 0
}

# commit-msg.txt 파일 확인
$commitMsgFile = "commit-msg.txt"
if (-not (Test-Path $commitMsgFile)) {
    Write-Host "❌ commit-msg.txt 파일을 찾을 수 없습니다." -ForegroundColor Red
    exit 1
}

# 임시 파일로 커밋 메시지 준비
$tempMsgFile = [System.IO.Path]::GetTempFileName()
[System.IO.File]::WriteAllText($tempMsgFile, "한글로 업데이트 및 최신화`n", [System.Text.Encoding]::UTF8)

Write-Host "`n🔧 Git 에디터 설정 중..." -ForegroundColor Cyan

# 자동으로 커밋 메시지를 변경하는 에디터 스크립트 생성
$editorScript = @"
#!/bin/sh
# 자동으로 commit-msg.txt의 내용으로 커밋 메시지 변경
cp "$commitMsgFile" "$1"
"@

$editorScriptPath = [System.IO.Path]::GetTempFileName() + ".sh"
[System.IO.File]::WriteAllText($editorScriptPath, $editorScript, [System.Text.Encoding]::UTF8)

# PowerShell에서 Git 명령 실행을 위한 환경 설정
$originalEditor = git config core.editor

Write-Host "`n📝 Interactive rebase를 시작합니다..." -ForegroundColor Cyan
Write-Host "Visual Studio Code가 열리면:" -ForegroundColor Yellow
Write-Host "1. 모든 'pick'을 'reword'로 변경" -ForegroundColor Yellow
Write-Host "2. 파일 저장 후 닫기" -ForegroundColor Yellow
Write-Host "3. 각 커밋에서 '한글로 업데이트 및 최신화' 입력" -ForegroundColor Yellow
Write-Host ""

Read-Host "준비되었으면 Enter를 누르세요"

# Interactive rebase 시작 (ea29937 이전 커밋부터)
git rebase -i ea29937^

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Rebase 완료" -ForegroundColor Green
    Write-Host "`n변경된 커밋 확인:" -ForegroundColor Cyan
    git log --oneline -15
    
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
            Write-Host "브랜치 이름을 확인하세요: $currentBranch" -ForegroundColor Yellow
        }
    } else {
        Write-Host "`n⏭️  Force push를 건너뜁니다." -ForegroundColor Yellow
        Write-Host "나중에 다음 명령으로 push하세요:" -ForegroundColor Cyan
        Write-Host "git push --force origin $currentBranch :evkmc-as-app" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n⚠️  Rebase가 완료되지 않았거나 취소되었습니다." -ForegroundColor Yellow
    Write-Host "Rebase를 계속하려면: git rebase --continue" -ForegroundColor Yellow
    Write-Host "Rebase를 취소하려면: git rebase --abort" -ForegroundColor Yellow
}

# 임시 파일 정리
if (Test-Path $tempMsgFile) { Remove-Item $tempMsgFile -Force }
if (Test-Path $editorScriptPath) { Remove-Item $editorScriptPath -Force }

# Git 에디터 설정 복원
if ($originalEditor) {
    git config core.editor $originalEditor
}

