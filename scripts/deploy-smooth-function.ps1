# Supabase Edge Function 배포 스크립트
# 사용법: .\scripts\deploy-smooth-function.ps1

Write-Host "🚀 Smooth Function 배포 시작..." -ForegroundColor Cyan

# 현재 디렉토리 확인
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = Split-Path -Parent $scriptPath
Set-Location $rootPath

# 프로젝트 ref 확인
$projectRef = Read-Host "Supabase 프로젝트 Reference ID를 입력하세요"

if ([string]::IsNullOrWhiteSpace($projectRef)) {
    Write-Host "❌ 프로젝트 Reference ID가 필요합니다." -ForegroundColor Red
    exit 1
}

Write-Host "📦 Edge Function 배포 중..." -ForegroundColor Yellow
Write-Host "프로젝트: $projectRef" -ForegroundColor Gray

try {
    # Supabase CLI로 배포
    supabase functions deploy smooth-function --project-ref $projectRef
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 배포 완료!" -ForegroundColor Green
    } else {
        Write-Host "❌ 배포 실패" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ 배포 중 오류 발생: $_" -ForegroundColor Red
    exit 1
}
