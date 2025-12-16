# Git 커밋 및 푸시 헬퍼 스크립트 (한글 인코딩 문제 해결)
# 사용법: .\scripts\git\commit-and-push.ps1 "커밋 메시지"

param(
    [Parameter(Mandatory=$true)]
    [string]$Message
)

# UTF-8 인코딩 설정 (강제)
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$env:PYTHONIOENCODING = "utf-8"
$env:LANG = "ko_KR.UTF-8"
chcp 65001 | Out-Null

# 임시 파일에 커밋 메시지 작성 (UTF-8 BOM 없이)
$tempFile = [System.IO.Path]::GetTempFileName()
[System.IO.File]::WriteAllText($tempFile, $Message, [System.Text.UTF8Encoding]::new($false))

try {
    # 파일을 사용하여 커밋 (인코딩 문제 방지)
    git commit -F $tempFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 커밋 완료: $Message" -ForegroundColor Green
        
        # 푸시 실행
        Write-Host "🔄 원격 저장소에 푸시 중..." -ForegroundColor Yellow
        git push origin master
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ 푸시 완료" -ForegroundColor Green
        } else {
            Write-Host "❌ 푸시 실패" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ 커밋 실패" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ 오류 발생: $_" -ForegroundColor Red
    exit 1
} finally {
    # 임시 파일 삭제
    if (Test-Path $tempFile) {
        Remove-Item $tempFile -Force
    }
}

