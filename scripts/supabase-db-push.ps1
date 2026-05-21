#Requires -Version 5.1
<#
.SYNOPSIS
  Supabase CLI로 연결된 원격 DB에 supabase/migrations 의 대기 마이그레이션을 적용합니다.

.DESCRIPTION
  DB 접속 정보는 Dashboard → Database → 연결 문자열(Connection string)에서 확인합니다.

  기본값은 CLI가 사용하는 Pooler 연결입니다. `28P01` 인증 오류 시 **Direct connection** 전체 URI를
  넘기세요(사용자명은 보통 `postgres`, 호스트는 `db.<프로젝트ref>.supabase.co`, 포트 5432).

  비밀번호에 @ # % 등 특수문자가 있으면 연결 문자열의 비밀번호 부분만 URL 인코딩해야 합니다.

.EXAMPLE
  $env:SUPABASE_DB_PASSWORD = 'your-db-password'
  .\scripts\supabase-db-push.ps1

.EXAMPLE
  $env:SUPABASE_DB_PUSH_URL = 'postgresql://postgres:비밀번호@db.sesedcotooihnpjklqzs.supabase.co:5432/postgres'
  .\scripts\supabase-db-push.ps1

.EXAMPLE
  .\scripts\supabase-db-push.ps1 -DbPassword 'your-db-password' -DryRun

.NOTES
  프로젝트가 아직 연결되지 않았다면 최초 1회:
    supabase link --project-ref sesedcotooihnpjklqzs
#>
param(
    [string] $DbPassword,
    [string] $DbUrl,
    [switch] $DryRun
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path $PSScriptRoot -Parent
if (-not (Test-Path (Join-Path $repoRoot 'supabase\migrations'))) {
    Write-Error "supabase\migrations 폴더가 없습니다. 경로: $repoRoot"
    exit 1
}

Set-Location $repoRoot

if (-not $DbUrl -and $env:SUPABASE_DB_PUSH_URL) {
    $DbUrl = $env:SUPABASE_DB_PUSH_URL.Trim()
}

if (-not $DbPassword) {
    $DbPassword = $env:SUPABASE_DB_PASSWORD
}

$supabaseArgs = @('db', 'push')

if ($DbUrl -and $DbUrl.Length -gt 0) {
    $supabaseArgs += @('--db-url', $DbUrl)
    Write-Host '📂 Repository: ' -NoNewline -ForegroundColor Cyan
    Write-Host $repoRoot -ForegroundColor Cyan
    Write-Host '▶ supabase db push --db-url <redacted> --yes' -ForegroundColor Cyan
} elseif ($DbPassword -and $DbPassword.Length -gt 0) {
    $supabaseArgs += @('-p', $DbPassword)
    Write-Host '📂 Repository: ' -NoNewline -ForegroundColor Cyan
    Write-Host $repoRoot -ForegroundColor Cyan
    Write-Host '▶ supabase db push -p *** --yes' -ForegroundColor Cyan
} else {
    Write-Error @"
DB 접속 정보가 없습니다. 다음 중 하나를 사용하세요:

  A) Direct URI (Pooler 오류 시 권장) — Dashboard → Database → Connection string → 직접(Direct):
     `$env:SUPABASE_DB_PUSH_URL = 'postgresql://postgres:...@db.sesedcotooihnpjklqzs.supabase.co:5432/postgres'
     .\scripts\supabase-db-push.ps1

  B) 비밀번호만 (Pooler 경로):
     `$env:SUPABASE_DB_PASSWORD = '<Database password>'
     .\scripts\supabase-db-push.ps1

  C) 명시적 인자:
     .\scripts\supabase-db-push.ps1 -DbUrl 'postgresql://postgres:...@db....:5432/postgres'
"@
    exit 1
}

if ($DryRun) {
    $supabaseArgs += '--dry-run'
}
$supabaseArgs += '--yes'

& supabase @supabaseArgs
exit $LASTEXITCODE
