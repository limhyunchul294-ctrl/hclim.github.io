# Git 한글 인코딩 문제 해결 스크립트
# 실행 방법: PowerShell에서 .\fix-git-encoding.ps1 실행

Write-Host "=== Git 한글 인코딩 설정 시작 ===" -ForegroundColor Cyan

# 1. Git 전역 설정
Write-Host "`n[1/5] Git 전역 설정 중..." -ForegroundColor Yellow
git config --global core.quotepath false
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8
git config --global core.precomposeunicode true
git config --global core.autocrlf true

Write-Host "✓ Git 전역 설정 완료" -ForegroundColor Green

# 2. 현재 저장소 설정
Write-Host "`n[2/5] 현재 저장소 설정 중..." -ForegroundColor Yellow
git config core.quotepath false
git config i18n.commitencoding utf-8
git config i18n.logoutputencoding utf-8

Write-Host "✓ 저장소 설정 완료" -ForegroundColor Green

# 3. PowerShell 인코딩 설정 (현재 세션)
Write-Host "`n[3/5] PowerShell 인코딩 설정 중..." -ForegroundColor Yellow
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

Write-Host "✓ PowerShell 인코딩 설정 완료" -ForegroundColor Green

# 4. 설정 확인
Write-Host "`n[4/5] 설정 확인 중..." -ForegroundColor Yellow
Write-Host "`n--- Git 설정 확인 ---" -ForegroundColor Cyan
git config --global --get core.quotepath
git config --global --get i18n.commitencoding
git config --global --get i18n.logoutputencoding
git config --global --get core.precomposeunicode

Write-Host "`n--- PowerShell 인코딩 확인 ---" -ForegroundColor Cyan
chcp

Write-Host "`n✓ 설정 확인 완료" -ForegroundColor Green

# 5. 현재 커밋 메시지 확인
Write-Host "`n[5/5] 최근 커밋 확인 중..." -ForegroundColor Yellow
Write-Host "`n--- 최근 5개 커밋 ---" -ForegroundColor Cyan
git log --oneline -5

Write-Host "`n=== 설정 완료! ===" -ForegroundColor Green
Write-Host "`n다음 단계:" -ForegroundColor Yellow
Write-Host "1. 새로운 커밋부터 한글이 정상적으로 표시됩니다."
Write-Host "2. 기존 커밋 메시지를 수정하려면 interactive rebase를 사용하세요."
Write-Host "3. PowerShell을 재시작하면 인코딩 설정이 적용됩니다."

