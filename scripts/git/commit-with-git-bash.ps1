# Git Bash를 사용한 커밋 스크립트 (가장 안전한 방법)
# Git Bash는 기본적으로 UTF-8을 지원하므로 한글이 깨지지 않습니다
# 사용법: .\scripts\git\commit-with-git-bash.ps1 "커밋 메시지"
# 또는: .\scripts\git\commit-with-git-bash.ps1 "커밋 메시지" -Push

param(
    [Parameter(Mandatory=$true)]
    [string]$Message,
    
    [switch]$Push
)

# Git Bash 경로 찾기
$gitBashPath = $null

# 일반적인 Git Bash 설치 경로들
$possiblePaths = @(
    "${env:ProgramFiles}\Git\bin\bash.exe",
    "${env:ProgramFiles(x86)}\Git\bin\bash.exe",
    "${env:LocalAppData}\Programs\Git\bin\bash.exe",
    "C:\Program Files\Git\bin\bash.exe",
    "C:\Program Files (x86)\Git\bin\bash.exe"
)

foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $gitBashPath = $path
        break
    }
}

if (-not $gitBashPath) {
    Write-Host "❌ Git Bash를 찾을 수 없습니다." -ForegroundColor Red
    Write-Host "   Git을 설치하거나 다른 방법을 사용하세요." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Git Bash 발견: $gitBashPath" -ForegroundColor Green

# 현재 디렉토리 저장
$currentDir = Get-Location

# 임시 파일에 메시지 작성 (UTF-8)
$tempFile = [System.IO.Path]::GetTempFileName()
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($tempFile, $Message, $utf8NoBom)

try {
    # Git Bash를 사용하여 커밋
    Write-Host "🔄 Git Bash로 커밋 실행 중..." -ForegroundColor Yellow
    
    # Git Bash 명령 구성
    $bashCommand = "cd '$($currentDir.Path -replace '\\', '/')' && git commit -F '$($tempFile -replace '\\', '/')'"
    
    # Git Bash 실행
    $process = Start-Process -FilePath $gitBashPath -ArgumentList "-c", $bashCommand -NoNewWindow -Wait -PassThru
    
    if ($process.ExitCode -eq 0) {
        Write-Host "✅ 커밋 완료!" -ForegroundColor Green
        
        # 커밋된 메시지 확인
        $lastCommit = git log -1 --pretty=format:"%s"
        Write-Host "📋 커밋된 메시지: $lastCommit" -ForegroundColor Cyan
        
        # 푸시 옵션이 있으면 실행
        if ($Push) {
            Write-Host "🔄 원격 저장소에 푸시 중..." -ForegroundColor Yellow
            & $gitBashPath -c "cd '$($currentDir.Path -replace '\\', '/')' && git push origin master"
            
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

