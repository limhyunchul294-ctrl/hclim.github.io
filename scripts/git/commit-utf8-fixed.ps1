# Git 커밋 UTF-8 인코딩 완전 해결 스크립트
# 사용법: .\scripts\git\commit-utf8-fixed.ps1 "커밋 메시지"
# 또는: .\scripts\git\commit-utf8-fixed.ps1 "커밋 메시지" -Push

param(
    [Parameter(Mandatory=$true)]
    [string]$Message,
    
    [switch]$Push
)

# ============================================
# 1. PowerShell 인코딩 강제 설정
# ============================================
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

# ============================================
# 2. 시스템 로케일 및 환경 변수 설정
# ============================================
$env:LANG = "ko_KR.UTF-8"
$env:LC_ALL = "ko_KR.UTF-8"
$env:PYTHONIOENCODING = "utf-8"

# ============================================
# 3. Git 인코딩 환경 변수 명시적 설정
# ============================================
$env:GIT_EDITOR = "powershell -NoProfile -Command `"`$input = `$input | Out-String; `$input`""
$env:GIT_PAGER = "cat"
$env:GIT_CONFIG_PARAMETERS = "i18n.commitencoding=utf-8 i18n.logoutputencoding=utf-8"

# Git 사용자 정보 환경 변수 설정
$gitUserName = git config --global user.name
$gitUserEmail = git config --global user.email
if ($gitUserName) { $env:GIT_COMMITTER_NAME = $gitUserName }
if ($gitUserEmail) { $env:GIT_COMMITTER_EMAIL = $gitUserEmail }
if ($gitUserName) { $env:GIT_AUTHOR_NAME = $gitUserName }
if ($gitUserEmail) { $env:GIT_AUTHOR_EMAIL = $gitUserEmail }

# ============================================
# 4. 임시 파일에 UTF-8 (BOM 없음)로 메시지 작성
# ============================================
$tempFile = [System.IO.Path]::GetTempFileName()

try {
    # UTF-8 인코딩 (BOM 없음)으로 파일 작성
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($tempFile, $Message, $utf8NoBom)
    
    # 파일이 올바르게 작성되었는지 확인
    $fileBytes = [System.IO.File]::ReadAllBytes($tempFile)
    $fileContent = $utf8NoBom.GetString($fileBytes)
    
    Write-Host "📝 커밋 메시지 확인: $fileContent" -ForegroundColor Cyan
    
    # ============================================
    # 5. Git 커밋 실행 (환경 변수와 함께)
    # ============================================
    Write-Host "🔄 커밋 실행 중..." -ForegroundColor Yellow
    
    # Git 명령을 UTF-8 환경에서 실행
    $gitProcess = Start-Process -FilePath "git" -ArgumentList "commit", "-F", $tempFile -NoNewWindow -Wait -PassThru -RedirectStandardOutput "git-output.txt" -RedirectStandardError "git-error.txt" -Environment @{
        "LANG" = "ko_KR.UTF-8"
        "LC_ALL" = "ko_KR.UTF-8"
        "GIT_COMMITTER_NAME" = $env:GIT_COMMITTER_NAME
        "GIT_COMMITTER_EMAIL" = $env:GIT_COMMITTER_EMAIL
        "GIT_AUTHOR_NAME" = $env:GIT_AUTHOR_NAME
        "GIT_AUTHOR_EMAIL" = $env:GIT_AUTHOR_EMAIL
    }
    
    if ($gitProcess.ExitCode -eq 0) {
        Write-Host "✅ 커밋 완료!" -ForegroundColor Green
        
        # 커밋된 메시지 확인 (UTF-8로 읽기)
        $lastCommit = git log -1 --pretty=format:"%s" --encoding=utf-8
        Write-Host "📋 커밋된 메시지: $lastCommit" -ForegroundColor Cyan
        
        # 메시지가 깨졌는지 확인
        if ($lastCommit -match "[\?]") {
            Write-Host "⚠️  경고: 커밋 메시지에 깨진 문자가 감지되었습니다." -ForegroundColor Yellow
            Write-Host "   Git Bash를 사용하거나 다른 방법을 시도해보세요." -ForegroundColor Yellow
        }
        
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
        if (Test-Path "git-error.txt") {
            $errorContent = Get-Content "git-error.txt" -Raw
            Write-Host "오류 내용: $errorContent" -ForegroundColor Red
        }
        exit 1
    }
} catch {
    Write-Host "❌ 오류 발생: $_" -ForegroundColor Red
    Write-Host "   스택 추적: $($_.ScriptStackTrace)" -ForegroundColor Red
    exit 1
} finally {
    # 임시 파일 정리
    if (Test-Path $tempFile) {
        Remove-Item $tempFile -Force
    }
    if (Test-Path "git-output.txt") {
        Remove-Item "git-output.txt" -Force
    }
    if (Test-Path "git-error.txt") {
        Remove-Item "git-error.txt" -Force
    }
}

