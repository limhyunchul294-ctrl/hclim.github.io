# QQ_SM PDF → Supabase Storage (manual/MASADA-QQ/)
# 사용: $env:SUPABASE_SERVICE_ROLE_KEY = 'eyJ...'; .\scripts\upload-qq-sm-pdfs.ps1
# 챕터만: .\scripts\upload-qq-sm-pdfs.ps1 -Chapter 08

param([string]$Chapter = '')

$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)

if (-not $env:SUPABASE_SERVICE_ROLE_KEY) {
    Write-Host 'SUPABASE_SERVICE_ROLE_KEY 환경 변수를 설정해주세요.' -ForegroundColor Yellow
    Write-Host 'Dashboard → Project Settings → API → service_role (secret)' -ForegroundColor Gray
    exit 1
}

$nodeArgs = @('scripts/upload-qq-sm-pdfs.mjs')
if ($Chapter) {
    $nodeArgs += '--chapter', $Chapter
}

node @nodeArgs
exit $LASTEXITCODE
