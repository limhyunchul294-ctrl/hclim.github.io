# 028 게시판 타임라인 시드 — Supabase CLI 토큰 + Management API로 원격 실행
# 사용: .\scripts\apply-028-board-seed.ps1
# 사전: supabase login (Windows 자격 증명에 토큰 저장)

$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$sqlFile = Join-Path $root 'supabase\migrations\028_refresh_notices_and_community_seed.sql'
$applyScript = Join-Path $root 'supabase\.temp\apply-migration.ps1'

if (-not (Test-Path $sqlFile)) {
    Write-Error "SQL 파일 없음: $sqlFile"
}
if (-not (Test-Path $applyScript)) {
    Write-Error "apply-migration.ps1 없음: $applyScript (supabase login 필요)"
}

Write-Host "=== 028 게시판 시드 (원격 DB) ===" -ForegroundColor Cyan
Write-Host "파일: $sqlFile"
Write-Host "주의: 기존 공지·커뮤니티·댓글·좋아요가 삭제됩니다." -ForegroundColor Yellow
Write-Host ""

& powershell -NoProfile -ExecutionPolicy Bypass -File $applyScript -SqlFile $sqlFile

Write-Host ""
Write-Host "검증 중..." -ForegroundColor Cyan
$verifySql = Join-Path $root 'supabase\.temp\verify-028.sql'
& powershell -NoProfile -ExecutionPolicy Bypass -File $applyScript -SqlFile $verifySql
Write-Host "완료 — notices 12건, community_posts 6건 기대" -ForegroundColor Green
