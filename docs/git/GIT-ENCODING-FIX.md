# Git 한글 인코딩 문제 해결 가이드

## 🔴 문제 상황

GitHub에서 커밋 메시지나 파일명이 다음과 같이 깨져서 표시되는 경우:
- `Add: ?꾨줈?앺듃 ?뚯씪??蹂듭썝`
- `js, assets, public, scripts` (한글 파일명이 깨진 형태)

## ✅ 해결 방법

### 1단계: Git 전역 설정 확인 및 수정

다음 명령어들을 순서대로 실행하세요:

```powershell
# 인코딩 관련 설정
git config --global core.quotepath false
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8
git config --global core.precomposeunicode true

# 설정 확인
git config --global --list | Select-String -Pattern "encoding|quotepath|precompose"
```

### 2단계: 현재 저장소 설정 확인

```powershell
cd evkmc-as-app
git config core.quotepath false
git config i18n.commitencoding utf-8
git config i18n.logoutputencoding utf-8
```

### 3단계: PowerShell 인코딩 설정

PowerShell 프로필 파일에 UTF-8 인코딩 설정 추가:

```powershell
# 프로필 파일 위치 확인
$PROFILE

# 프로필 파일이 없으면 생성
if (!(Test-Path -Path $PROFILE)) {
    New-Item -ItemType File -Path $PROFILE -Force
}

# UTF-8 인코딩 설정 추가
Add-Content -Path $PROFILE -Value '[Console]::OutputEncoding = [System.Text.Encoding]::UTF8'
Add-Content -Path $PROFILE -Value '$OutputEncoding = [System.Text.Encoding]::UTF8'
Add-Content -Path $PROFILE -Value 'chcp 65001 | Out-Null'
```

### 4단계: Windows 환경 변수 설정

**방법 1: PowerShell에서 설정 (현재 세션만)**
```powershell
$env:LANG = "ko_KR.UTF-8"
$env:LC_ALL = "ko_KR.UTF-8"
```

**방법 2: 시스템 환경 변수 영구 설정**
1. 제어판 > 시스템 > 고급 시스템 설정
2. 환경 변수 클릭
3. 시스템 변수에서 `새로 만들기`:
   - 변수 이름: `LANG`
   - 변수 값: `ko_KR.UTF-8`
4. 다시 `새로 만들기`:
   - 변수 이름: `LC_ALL`
   - 변수 값: `ko_KR.UTF-8`

### 5단계: 기존 커밋 메시지 수정 (선택사항)

이미 깨진 커밋 메시지가 있다면 interactive rebase로 수정:

```powershell
# 최근 10개 커밋 확인
git log --oneline -10

# Interactive rebase 시작
git rebase -i HEAD~10

# 에디터에서 'pick'을 'reword'로 변경하여 커밋 메시지 수정
```

## 🔍 현재 설정 확인

```powershell
# Git 전역 설정 확인
git config --global --list

# Git 로컬 설정 확인
git config --local --list

# 인코딩 관련 설정만 확인
git config --global --get i18n.commitencoding
git config --global --get i18n.logoutputencoding
git config --global --get core.quotepath
git config --global --get core.precomposeunicode

# PowerShell 인코딩 확인
[Console]::OutputEncoding
chcp
```

## 📝 추천 설정 (복사해서 실행)

```powershell
# Git 전역 설정
git config --global core.quotepath false
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8
git config --global core.precomposeunicode true
git config --global core.autocrlf true

# 현재 저장소 설정
cd evkmc-as-app
git config core.quotepath false
git config i18n.commitencoding utf-8
git config i18n.logoutputencoding utf-8

# PowerShell 세션 인코딩
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001
```

## ⚠️ 주의사항

1. **기존 커밋 히스토리 수정 시 주의**: Interactive rebase는 히스토리를 변경하므로 이미 푸시된 커밋을 수정하면 force push가 필요합니다.

2. **팀 작업 시**: 히스토리를 변경하면 다른 팀원들과 충돌할 수 있으므로 주의가 필요합니다.

3. **새로운 커밋부터 적용**: 설정 변경은 새로운 커밋부터 적용되며, 이미 깨진 커밋 메시지는 별도로 수정해야 합니다.

## 🧪 테스트

```powershell
# 한글 파일명으로 테스트 파일 생성
echo "테스트" | Out-File -FilePath "테스트-한글.txt" -Encoding UTF8

# Git에 추가
git add "테스트-한글.txt"
git commit -m "테스트: 한글 파일명 테스트"

# 커밋 로그 확인
git log --oneline -1

# 파일명이 제대로 표시되는지 확인
git ls-files | Select-String "테스트"
```

---

설정을 완료한 후 새로운 커밋부터 한글이 정상적으로 표시됩니다!
