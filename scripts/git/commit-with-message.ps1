# Git 커밋 헬퍼 스크립트 (한글 인코딩 문제 해결)
# 사용법: .\scripts\git\commit-with-message.ps1 "커밋 메시지"

param(
    [Parameter(Mandatory=$true)]
    [string]$Message
)

# UTF-8 인코딩 설정
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$env:PYTHONIOENCODING = "utf-8"

# 임시 파일에 커밋 메시지 작성 (UTF-8 BOM 없이)
$tempFile = [System.IO.Path]::GetTempFileName()
[System.IO.File]::WriteAllText($tempFile, $Message, [System.Text.UTF8Encoding]::new($false))

try {
    # 파일을 사용하여 커밋 (인코딩 문제 방지)
    git commit -F $tempFile
    
    Write-Host "✅ 커밋 완료: $Message" -ForegroundColor Green
} catch {
    Write-Host "❌ 커밋 실패: $_" -ForegroundColor Red
    exit 1
} finally {
    # 임시 파일 삭제
    if (Test-Path $tempFile) {
        Remove-Item $tempFile -Force
    }
}

