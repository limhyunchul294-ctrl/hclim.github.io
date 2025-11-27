# 이전 커밋 메시지 수정 가이드

## 목표
ea29937부터 cd3a61d까지의 모든 커밋 메시지를 "한글로 업데이트 및 최신화"로 통일합니다.

## 변경할 커밋 목록 (순서대로)

1. **ea29937** - Fix: 스크립트 검증을 인라인으로 변경하여 Vercel 경로 문제 해결
2. **973d8eb** - Fix: Vercel 빌드를 위한 루트 디렉토리 설정 추가
3. **38b8320** - Add: 프로젝트 파일 복원 (js, assets, public, scripts, package-lock.json 등)
4. **c1b7b34** - Fix: 스플래시 화면 멈춤 문제 해결 - 인증 체크 타임아웃 추가 및 로그인 페이지 리다이렉트 개선
5. **c7c420b** - Fix: require 오류 해결 및 로그인 흐름 개선 - Vite CommonJS 변환 활성화, Git 한글 인코딩 설정
6. **0f6399e** - Docs: Git 한글 인코딩 설정 문서 추가
7. **3bf46f6** - Docs: 커밋 히스토리 및 메시지 템플릿 추가
8. **cd3a61d** - Docs: Git 한글 인코딩 완전 해결 가이드 추가

## 자동화 스크립트 사용 (권장)

```powershell
.\fix-old-commits.ps1
```

이 스크립트는:
1. Interactive rebase를 시작합니다
2. 각 커밋에 대해 메시지 변경을 안내합니다
3. 완료 후 force push 여부를 물어봅니다

## 수동 방법

### 1단계: Interactive Rebase 시작

```powershell
git rebase -i ea29937^
```

### 2단계: 에디터에서 모든 'pick'을 'reword'로 변경

Visual Studio Code가 열리면 각 커밋의 `pick`을 `reword` (또는 `r`)로 변경합니다:

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

파일을 저장하고 닫습니다.

### 3단계: 각 커밋에 대해 메시지 변경

각 커밋에 대해 Visual Studio Code가 다시 열립니다. 모든 텍스트를 지우고 다음만 입력:

```
한글로 업데이트 및 최신화
```

파일을 저장하고 닫습니다. 이 과정을 8번 반복합니다.

### 4단계: Rebase 완료 후 Force Push

```powershell
git push --force origin master:evkmc-as-app
```

## 확인

```powershell
git log --oneline -15
```

모든 커밋 메시지가 "한글로 업데이트 및 최신화"로 표시되어야 합니다.

## 주의사항

- ⚠️ Force push는 이미 푸시된 커밋을 변경하므로 주의가 필요합니다.
- ⚠️ 다른 사람이 이 브랜치를 사용하고 있다면 먼저 협의하세요.
- ✅ 백업을 권장합니다: `git branch backup-before-rebase`

## 문제 발생 시

Rebase를 취소하려면:
```powershell
git rebase --abort
```

백업 브랜치로 되돌리려면:
```powershell
git reset --hard backup-before-rebase
```

