# 간단한 커밋 메시지 수정 방법

## 현재 상황

최근 8개 커밋은 "한글로 업데이트 및 최신화"로 잘 표시되지만,
그 이전 7개 커밋 (973d8eb ~ cd3a61d)은 한글이 깨져 있습니다.

## 수정할 커밋 (7개)

다음 커밋들의 메시지를 "한글로 업데이트 및 최신화"로 변경해야 합니다:

1. 973d8eb - Fix: Vercel 빌드를 위한 루트 디렉토리 설정 추가
2. 38b8320 - Add: 프로젝트 파일 복원
3. c1b7b34 - Fix: 스플래시 화면 멈춤 문제 해결
4. c7c420b - Fix: require 오류 해결 및 로그인 흐름 개선
5. 0f6399e - Docs: Git 한글 인코딩 설정 문서 추가
6. 3bf46f6 - Docs: 커밋 히스토리 및 메시지 템플릿 추가
7. cd3a61d - Docs: Git 한글 인코딩 완전 해결 가이드 추가

## 실행 방법

### 1단계: Interactive Rebase 시작

PowerShell에서 다음 명령을 실행하세요:

```powershell
git rebase -i ea29937
```

**주의:** `ea29937^`가 아니라 `ea29937`입니다!

### 2단계: Visual Studio Code에서 파일 수정

Visual Studio Code가 열리면 다음 파일이 표시됩니다:

```
pick 973d8eb Fix: Vercel...
pick 38b8320 Add: 프로젝트...
pick c1b7b34 Fix: 스플래시...
pick c7c420b Fix: require...
pick 0f6399e Docs: Git...
pick 3bf46f6 Docs: 커밋...
pick cd3a61d Docs: Git...
```

**모든 `pick`을 `reword`로 변경:**

```
reword 973d8eb Fix: Vercel...
reword 38b8320 Add: 프로젝트...
reword c1b7b34 Fix: 스플래시...
reword c7c420b Fix: require...
reword 0f6399e Docs: Git...
reword 3bf46f6 Docs: 커밋...
reword cd3a61d Docs: Git...
```

**저장 후 닫기** (Ctrl+S, Ctrl+W)

### 3단계: 각 커밋 메시지 수정 (7번 반복)

Visual Studio Code가 다시 열리면:

1. 모든 텍스트를 선택하여 삭제 (Ctrl+A, Delete)
2. "한글로 업데이트 및 최신화" 입력
3. 저장 후 닫기 (Ctrl+S, Ctrl+W)

**이 작업을 7번 반복**합니다.

### 4단계: Force Push

모든 수정이 완료되면:

```powershell
git push --force origin master:evkmc-as-app
```

## 확인

```powershell
git log --oneline -15
```

모든 커밋이 "한글로 업데이트 및 최신화"로 표시되어야 합니다.

## 문제 발생 시

### Rebase 취소
```powershell
git rebase --abort
```

### 백업 브랜치로 되돌리기
```powershell
git reset --hard backup-before-fix-20251118-170221
```

