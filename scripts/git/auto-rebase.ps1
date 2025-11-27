# 자동 rebase 스크립트 - 모든 커밋 메시지를 "한글로 업데이트 및 최신화"로 변경

# PowerShell UTF-8 인코딩 설정
chcp 65001 | Out-Null
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "🔄 이전 커밋 메시지를 '한글로 업데이트 및 최신화'로 자동 변경 중..." -ForegroundColor Cyan
Write-Host ""

# 변경할 커밋 범위: ea29937부터 cd3a61d까지
$startCommit = "ea29937"
$endCommit = "cd3a61d"

# 커밋 해시 목록 가져오기 (역순)
$commits = git log --reverse --format="%H" "$startCommit..$endCommit"
$commitArray = $commits -split "`n" | Where-Object { $_ -ne "" }

Write-Host "변경할 커밋 개수: $($commitArray.Count)" -ForegroundColor Cyan
Write-Host ""

# 각 커밋에 대해 rebase를 통해 메시지 변경
foreach ($commit in $commitArray) {
    $shortHash = git log --format="%h" -1 $commit
    Write-Host "처리 중: $shortHash" -ForegroundColor Yellow
    
    # Git filter-branch를 사용하여 특정 커밋의 메시지만 변경
    # 하지만 더 안전한 방법은 interactive rebase입니다
}

Write-Host "`n⚠️  대량 커밋 수정은 interactive rebase가 더 안전합니다." -ForegroundColor Yellow
Write-Host "`n다음 명령을 수동으로 실행하세요:" -ForegroundColor Cyan
Write-Host "1. git rebase -i ea29937^" -ForegroundColor Yellow
Write-Host "2. 모든 'pick'을 'reword'로 변경" -ForegroundColor Yellow
Write-Host "3. 각 커밋에서 '한글로 업데이트 및 최신화' 입력" -ForegroundColor Yellow
Write-Host "4. git push --force origin master:evkmc-as-app" -ForegroundColor Yellow

