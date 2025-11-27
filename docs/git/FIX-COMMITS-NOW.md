# 이전 커밋 메시지 수정 - 지금 바로 하기

## 목표
ea29937부터 cd3a61d까지의 모든 커밋 메시지를 "한글로 업데이트 및 최신화"로 통일합니다.

## 변경할 커밋 (7개)

1. 973d8eb - Fix: Vercel 빌드를 위한 루트 디렉토리 설정 추가
2. 38b8320 - Add: 프로젝트 파일 복원
3. c1b7b34 - Fix: 스플래시 화면 멈춤 문제 해결
4. c7c420b - Fix: require 오류 해결 및 로그인 흐름 개선
5. 0f6399e - Docs: Git 한글 인코딩 설정 문서 추가
6. 3bf46f6 - Docs: 커밋 히스토리 및 메시지 템플릿 추가
7. cd3a61d - Docs: Git 한글 인코딩 완전 해결 가이드 추가

## 실행 방법

### 방법 1: 스크립트 사용

```powershell
.\fix-commit-messages.ps1
```

스크립트가 실행되면:
1. Y를 입력하여 계속
2. Visual Studio Code가 열림
3. 모든 `pick`을 `reword`로 변경
4. 저장 후 닫기
5. 각 커밋마다 "한글로 업데이트 및 최신화" 입력 (7번 반복)
6. Y를 입력하여 force push

### 방법 2: 직접 명령어

```powershell
# 1. 백업 (이미 생성됨)
git branch backup-before-fix-manual

# 2. Interactive rebase 시작
git rebase -i ea29937^

# 3. Visual Studio Code에서 모든 pick을 reword로 변경 후 저장

# 4. 각 커밋에서 "한글로 업데이트 및 최신화" 입력 (7번 반복)

# 5. Force push
git push --force origin master:evkmc-as-app
```

## 중요한 단계

### Visual Studio Code에서 할 일:

**첫 번째 파일 (rebase 목록):**
```
pick 973d8eb Fix: Vercel...
pick 38b8320 Add: 프로젝트...
pick c1b7b34 Fix: 스플래시...
pick c7c420b Fix: require...
pick 0f6399e Docs: Git...
pick 3bf46f6 Docs: 커밋...
pick cd3a61d Docs: Git...
```

를 다음과 같이 변경:
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

**두 번째부터 여덟 번째 파일 (각 커밋 메시지):**
- 모든 텍스트 삭제
- "한글로 업데이트 및 최신화" 입력
- 저장 후 닫기 (Ctrl+S, Ctrl+W)

이 작업을 **7번 반복**합니다.

## 완료 후 확인

```powershell
git log --oneline -15
```

모든 커밋이 "한글로 업데이트 및 최신화"로 표시되어야 합니다.

## 문제 발생 시

### Rebase 취소
```powershell
git rebase --abort
```

### 백업으로 되돌리기
```powershell
git reset --hard backup-before-fix-20251118-170221
```

