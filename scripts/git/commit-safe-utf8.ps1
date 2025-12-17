# Git 커밋 안전 스크립트 (UTF-8 인코딩 강제)
# 사용법: .\scripts\git\commit-safe-utf8.ps1 "커밋 메시지"
# 또는: .\scripts\git\commit-safe-utf8.ps1 "커밋 메시지" -Push

param(
    [Parameter(Mandatory=$true)]
    [string]$Message,
    
    [switch]$Push
)

# PowerShell 인코딩 강제 설정
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$env:PYTHONIOENCODING = "utf-8"
$env:LANG = "ko_KR.UTF-8"
$env:LC_ALL = "ko_KR.UTF-8"

# 코드 페이지를 UTF-8로 변경
chcp 65001 | Out-Null

# Git 인코딩 환경 변수 설정
$env:GIT_COMMITTER_NAME = git config user.name
$env:GIT_AUTHOR_NAME = git config user.name
$env:GIT_COMMITTER_EMAIL = git config user.email
$env:GIT_AUTHOR_EMAIL = git config user.email

# 임시 파일에 커밋 메시지 작성 (UTF-8 BOM 없이)
$tempFile = [System.IO.Path]::GetTempFileName()
try {
    # UTF-8 인코딩으로 파일 작성 (BOM 없이)
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($tempFile, $Message, $utf8NoBom)
    
    # 파일 인코딩 확인 (디버깅용)
    $fileContent = [System.IO.File]::ReadAllText($tempFile, $utf8NoBom)
    Write-Host "📝 커밋 메시지 확인: $fileContent" -ForegroundColor Cyan
    
    # Git 커밋 실행 (환경 변수와 함께)
    $env:GIT_EDITOR = "powershell -Command `"Get-Content '$tempFile' | Out-String`""
    
    Write-Host "🔄 커밋 실행 중..." -ForegroundColor Yellow
    git commit -F $tempFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 커밋 완료!" -ForegroundColor Green
        
        # 커밋 메시지 확인
        $lastCommit = git log -1 --pretty=format:"%s"
        Write-Host "📋 커밋된 메시지: $lastCommit" -ForegroundColor Cyan
        
        # 푸시 옵션이 있으면 실행
        if ($Push) {
            Write-Host "🔄 원격 저장소에 푸시 중..." -ForegroundColor Yellow
            git push origin master
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ 푸시 완료!" -ForegroundColor Green
            } else {
                Write-Host "❌ 푸시 실패" -ForegroundColor Red
                exit 1
            }
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

