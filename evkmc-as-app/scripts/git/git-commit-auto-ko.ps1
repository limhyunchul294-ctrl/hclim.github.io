# Git 커밋 메시지 자동 생성 스크립트 (한글)
# 변경 내용을 분석하여 적절한 한글 커밋 메시지를 생성합니다

chcp 65001 | Out-Null
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# 변경된 파일 목록 가져오기
$stagedFiles = git diff --cached --name-only
$modifiedFiles = git diff --name-only
$allChangedFiles = ($stagedFiles + $modifiedFiles) | Sort-Object -Unique

if ($allChangedFiles.Count -eq 0) {
    Write-Host "변경된 파일이 없습니다. 먼저 git add를 실행하세요." -ForegroundColor Yellow
    exit 1
}

# 변경 내용 분석
$changes = @{
    Added = @()
    Modified = @()
    Deleted = @()
    Features = @()
    Fixes = @()
    Docs = @()
    Refactor = @()
    Config = @()
    Styles = @()
}

# 파일별 변경 유형 분석
foreach ($file in $allChangedFiles) {
    $status = git status --porcelain $file
    
    if ($status -match '^\?\?') {
        $changes.Added += $file
    } elseif ($status -match '^ M' -or $status -match '^MM') {
        $changes.Modified += $file
    } elseif ($status -match '^ D' -or $status -match '^DD') {
        $changes.Deleted += $file
    }
    
    # 파일 유형별 분류
    $fileName = Split-Path -Leaf $file
    $fileDir = Split-Path -Parent $file
    
    if ($file -match '\.(md|txt|README)') {
        $changes.Docs += $file
    } elseif ($file -match '\.(json|yaml|yml|config|env)') {
        $changes.Config += $file
    } elseif ($file -match '\.(css|scss|less|styl)') {
        $changes.Styles += $file
    } elseif ($file -match '(test|spec)') {
        # 테스트 파일
    } elseif ($file -match '(fix|bug|error|issue)') {
        $changes.Fixes += $file
    } elseif ($file -match '(feature|add|new)') {
        $changes.Features += $file
    }
}

# diff 내용 분석 (간단한 키워드 기반)
$diffContent = git diff --cached
$diffContent += git diff

# 버그 수정 키워드
if ($diffContent -match 'fix|bug|error|issue|오류|버그|문제|해결') {
    $changes.Fixes += "일반"
}

# 기능 추가 키워드
if ($diffContent -match 'add|new|feature|추가|신규|기능') {
    $changes.Features += "일반"
}

# 리팩토링 키워드
if ($diffContent -match 'refactor|리팩토링|개선|최적화|정리') {
    $changes.Refactor += "일반"
}

# 커밋 메시지 생성
$commitMessages = @()

# 우선순위에 따라 메시지 생성
if ($changes.Fixes.Count -gt 0) {
    $fixFiles = ($changes.Fixes | Where-Object { $_ -ne "일반" }).Count
    if ($fixFiles -gt 0) {
        $mainFile = ($changes.Fixes | Where-Object { $_ -ne "일반" } | Select-Object -First 1)
        $fileName = Split-Path -Leaf $mainFile
        $commitMessages += "Fix: $fileName 관련 오류 수정"
    } else {
        $commitMessages += "Fix: 버그 및 오류 수정"
    }
}

if ($changes.Features.Count -gt 0) {
    $featureFiles = ($changes.Features | Where-Object { $_ -ne "일반" }).Count
    if ($featureFiles -gt 0) {
        $mainFile = ($changes.Features | Where-Object { $_ -ne "일반" } | Select-Object -First 1)
        $fileDir = Split-Path -Parent $mainFile
        if ($fileDir -match 'js') {
            $commitMessages += "Feat: JavaScript 기능 추가"
        } elseif ($fileDir -match 'css') {
            $commitMessages += "Feat: 스타일 기능 추가"
        } else {
            $commitMessages += "Feat: 새 기능 추가"
        }
    } else {
        $commitMessages += "Feat: 기능 추가"
    }
}

if ($changes.Docs.Count -gt 0) {
    $commitMessages += "Docs: 문서 업데이트"
}

if ($changes.Config.Count -gt 0) {
    $commitMessages += "Config: 설정 파일 변경"
}

if ($changes.Refactor.Count -gt 0) {
    $commitMessages += "Refactor: 코드 리팩토링 및 개선"
}

if ($changes.Styles.Count -gt 0) {
    $commitMessages += "Style: 스타일 변경"
}

if ($changes.Deleted.Count -gt 0) {
    $commitMessages += "Remove: 파일 삭제"
}

# 파일 경로 기반 메시지 생성 (더 구체적)
if ($commitMessages.Count -eq 0) {
    $mainFile = $allChangedFiles[0]
    $fileDir = Split-Path -Parent $mainFile
    $fileName = Split-Path -Leaf $mainFile
    
    if ($fileDir -match 'js') {
        $commitMessages += "Update: JavaScript 파일 수정 ($fileName)"
    } elseif ($fileDir -match 'css' -or $fileDir -match 'styles') {
        $commitMessages += "Update: 스타일 파일 수정 ($fileName)"
    } elseif ($fileDir -match 'html') {
        $commitMessages += "Update: HTML 파일 수정 ($fileName)"
    } elseif ($fileDir -match 'sql') {
        $commitMessages += "Update: 데이터베이스 스키마 수정"
    } else {
        $commitMessages += "Update: $fileName 수정"
    }
}

# 주요 파일명 추출하여 메시지 구체화
$mainFiles = $allChangedFiles | Select-Object -First 3 | ForEach-Object {
    Split-Path -Leaf $_
}

# 최종 메시지 생성
$mainMessage = $commitMessages[0]

# 여러 파일이 변경된 경우
if ($allChangedFiles.Count -gt 3) {
    $mainMessage += " 및 기타 파일 수정"
} elseif ($allChangedFiles.Count -gt 1) {
    $fileList = ($mainFiles -join ', ')
    $mainMessage += " ($fileList)"
}

# 메시지 출력
Write-Host "`n생성된 커밋 메시지:" -ForegroundColor Cyan
Write-Host "$mainMessage" -ForegroundColor Green
Write-Host ""

# commit-msg.txt에 저장
Set-Content -Path "commit-msg.txt" -Value $mainMessage -Encoding UTF8

# 커밋 실행 여부 확인
$confirm = Read-Host "이 메시지로 커밋하시겠습니까? (Y/N, 기본값: N)"
if ($confirm -eq "Y" -or $confirm -eq "y") {
    git commit -F commit-msg.txt
    Write-Host "`n커밋 완료!" -ForegroundColor Green
} else {
    Write-Host "`n메시지가 commit-msg.txt에 저장되었습니다." -ForegroundColor Yellow
    Write-Host "직접 수정 후 'git commit -F commit-msg.txt'로 커밋하세요." -ForegroundColor Yellow
}

