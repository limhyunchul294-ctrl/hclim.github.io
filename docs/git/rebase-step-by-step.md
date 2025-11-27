# 이전 커밋 메시지 수정 - 단계별 가이드

## 목표
ea29937부터 cd3a61d까지의 모든 커밋 메시지를 "한글로 업데이트 및 최신화"로 통일합니다.

## 변경할 커밋 (총 8개)
1. ea29937 - Fix: 스크립트 검증을 인라인으로 변경하여 Vercel 경로 문제 해결
2. 973d8eb - Fix: Vercel 빌드를 위한 루트 디렉토리 설정 추가
3. 38b8320 - Add: 프로젝트 파일 복원 (js, assets, public, scripts, package-lock.json 등)
4. c1b7b34 - Fix: 스플래시 화면 멈춤 문제 해결
5. c7c420b - Fix: require 오류 해결 및 로그인 흐름 개선
6. 0f6399e - Docs: Git 한글 인코딩 설정 문서 추가
7. 3bf46f6 - Docs: 커밋 히스토리 및 메시지 템플릿 추가
8. cd3a61d - Docs: Git 한글 인코딩 완전 해결 가이드 추가

## 자동화 스크립트 사용

```powershell
.\rebase-all-commits.ps1
```

이 스크립트는 interactive rebase를 시작하고 안내합니다.

## 수동 방법

### 1단계: Interactive Rebase 시작

```powershell
git rebase -i ea29937^
```

### 2단계: Visual Studio Code에서 수정

Visual Studio Code가 열리면 각 커밋의 `pick`을 `reword` (또는 `r`)로 변경:

```
pick ea29937 Fix: 스크립트 검증...
pick 973d8eb Fix: Vercel 빌드...
pick 38b8320 Add: 프로젝트 파일...
pick c1b7b34 Fix: 스플래시 화면...
pick c7c420b Fix: require 오류...
pick 0f6399e Docs: Git 한글...
pick 3bf46f6 Docs: 커밋 히스토리...
pick cd3a61d Docs: Git 한글...
```

를 다음과 같이 변경:

```
reword ea29937 Fix: 스크립트 검증...
reword 973d8eb Fix: Vercel 빌드...
reword 38b8320 Add: 프로젝트 파일...
reword c1b7b34 Fix: 스플래시 화면...
reword c7c420b Fix: require 오류...
reword 0f6399e Docs: Git 한글...
reword 3bf46f6 Docs: 커밋 히스토리...
reword cd3a61d Docs: Git 한글...
```

**파일 저장 후 닫기** (Ctrl+S, Ctrl+W)

### 3단계: 각 커밋에 대해 메시지 변경

Visual Studio Code가 각 커밋마다 다시 열립니다. **8번 반복**합니다.

각 열린 파일에서:
1. 모든 텍스트 삭제
2. 다음만 입력: `한글로 업데이트 및 최신화`
3. 파일 저장 후 닫기 (Ctrl+S, Ctrl+W)

### 4단계: Rebase 완료 후 확인

```powershell
git log --oneline -15
```

모든 커밋이 "한글로 업데이트 및 최신화"로 표시되어야 합니다.

### 5단계: Force Push

```powershell
git push --force origin master:evkmc-as-app
```

## 문제 발생 시

### Rebase 취소
```powershell
git rebase --abort
```

### 백업 브랜치로 되돌리기
```powershell
git reset --hard backup-before-rebase-manual
```

## 주의사항

- ⚠️ Force push는 이미 푸시된 커밋을 변경하므로 주의가 필요합니다
- ✅ 백업 브랜치가 생성되어 있으므로 안전하게 복구할 수 있습니다
- ✅ 다른 사람이 이 브랜치를 사용 중이면 먼저 협의하세요

