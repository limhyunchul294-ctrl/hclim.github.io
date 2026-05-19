# Supabase SQL Editor에서 028 마이그레이션 실행 안내
# 사용: .\scripts\apply-028-board-seed.ps1
# DB URL이 있으면 psql로 직접 실행 시도 (선택)

$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$sqlFile = Join-Path $root 'supabase\migrations\028_refresh_notices_and_community_seed.sql'

if (-not (Test-Path $sqlFile)) {
    Write-Error "SQL 파일 없음: $sqlFile"
}

Write-Host "=== EVKMC 게시판 시드 SQL ===" -ForegroundColor Cyan
Write-Host "파일: $sqlFile"
Write-Host ""
Write-Host "1) Supabase Dashboard > SQL Editor 열기"
Write-Host "   https://supabase.com/dashboard/project/sesedcotooihnpjklqzs/sql/new"
Write-Host "2) 위 SQL 파일 전체를 붙여넣고 Run"
Write-Host "3) 마지막 SELECT 결과: notices 12건, community_posts 6건 확인"
Write-Host "   (타임라인: 2025-06-03 ~ 2026-05-19, QQ 공지 2026-02-14)"
Write-Host ""

$dbUrl = $env:SUPABASE_DB_URL
if ($dbUrl -and (Get-Command psql -ErrorAction SilentlyContinue)) {
    $confirm = Read-Host "SUPABASE_DB_URL + psql 감지됨. 지금 실행할까요? (y/N)"
    if ($confirm -eq 'y') {
        psql $dbUrl -f $sqlFile
        Write-Host "완료" -ForegroundColor Green
        exit 0
    }
}

Write-Host "클립보드에 SQL 복사하려면:" -ForegroundColor Yellow
Write-Host "  Get-Content '$sqlFile' | Set-Clipboard"
