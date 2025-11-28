# 깨진 커밋 메시지 수정 가이드

## 🔴 문제 상황

GitHub 웹사이트에서 커밋 메시지가 깨져서 표시되는 경우:
- `Add: ?꾨줈?앺듃 ?뚯씪??蹂듭썝`
- 한글이 깨져서 보이는 경우

## ✅ 해결 방법

### 방법 1: 자동 스크립트 사용 (권장)

```powershell
.\fix-commit-messages-safe.ps1
```

이 스크립트는:
1. 자동으로 백업 브랜치 생성
2. Interactive rebase 실행
3. 안전하게 커밋 메시지 수정

### 방법 2: 수동으로 Interactive Rebase 실행

#### 2-1. 백업 생성

```powershell
# 백업 브랜치 생성
git branch backup-before-fix-$(Get-Date -Format 'yyyyMMdd-HHmmss')

# 현재 브랜치 확인
git branch
```

#### 2-2. 최근 커밋 확인

```powershell
# 최근 15개 커밋 확인
git log --oneline -15
```

#### 2-3. Interactive Rebase 시작

```powershell
# 최근 10개 커밋 메시지 수정
git rebase -i HEAD~10
```

#### 2-4. 에디터에서 수정

에디터가 열리면 다음과 같은 내용이 표시됩니다:

```
pick abc1234 한글로 업데이트 및 최신화
pick def5678 한글로 업데이트 및 최신화
pick ghi9012 한글로 업데이트 및 최신화
...
```

**모든 `pick`을 `reword` (또는 `r`)로 변경:**

```
reword abc1234 한글로 업데이트 및 최신화
reword def5678 한글로 업데이트 및 최신화
reword ghi9012 한글로 업데이트 및 최신화
...
```

**파일 저장 후 에디터 종료**

#### 2-5. 각 커밋 메시지 입력

에디터가 다시 열리면 각 커밋의 메시지를 수정합니다:

```
한글로 업데이트 및 최신화
```

파일 저장 후 에디터 종료. 다음 커밋으로 자동 진행됩니다.

#### 2-6. 결과 확인

```powershell
# 수정된 커밋 히스토리 확인
git log --oneline -15

# 커밋 메시지 상세 확인
git log --pretty=format:"%h - %s" -15
```

### 방법 3: 한 번에 모든 커밋 메시지 수정 (고급)

#### 3-1. 스크립트로 자동 수정

```powershell
# 최근 20개 커밋을 모두 수정
git rebase -i HEAD~20
```

에디터에서 모든 `pick`을 `reword`로 변경하고, 각 커밋마다 "한글로 업데이트 및 최신화"를 입력합니다.

#### 3-2. 자동화 스크립트 (PowerShell)

```powershell
# 최근 N개 커밋의 메시지를 자동으로 수정
$commitCount = 10
git rebase -i HEAD~$commitCount
```

## ⚠️ 중요 주의사항

### 1. Force Push 필수

이미 푸시된 커밋을 수정하면 히스토리가 변경되므로 **force push**가 필요합니다:

```powershell
# 안전한 force push (권장)
git push --force-with-lease origin HEAD:evkmc-as-app

# 또는 일반 force push (주의!)
git push --force origin HEAD:evkmc-as-app
```

### 2. 협업 중인 경우

- **팀원들과 반드시 상의**하세요
- Force push는 다른 사람의 작업에 영향을 줄 수 있습니다
- 가능하면 브랜치를 새로 만들어서 작업하세요

### 3. 백업 필수

반드시 백업 브랜치를 만들고 시작하세요:

```powershell
git branch backup-before-fix-$(Get-Date -Format 'yyyyMMdd-HHmmss')
```

문제가 생기면 되돌릴 수 있습니다:

```powershell
git reset --hard backup-before-fix-YYYYMMDD-HHMMSS
```

## 🔄 되돌리기 (Rollback)

문제가 생겼다면:

```powershell
# 1. rebase 중단
git rebase --abort

# 2. 백업 브랜치로 되돌리기
git reset --hard backup-before-fix-YYYYMMDD-HHMMSS

# 3. 또는 원격 저장소에서 가져오기
git fetch origin
git reset --hard origin/evkmc-as-app
```

## 📋 체크리스트

수정 전:
- [ ] 백업 브랜치 생성
- [ ] 현재 브랜치 확인
- [ ] 수정할 커밋 개수 결정

수정 중:
- [ ] Interactive rebase 시작
- [ ] 모든 `pick`을 `reword`로 변경
- [ ] 각 커밋 메시지 입력
- [ ] 에디터 저장 및 종료

수정 후:
- [ ] 커밋 히스토리 확인
- [ ] 문제없으면 force push
- [ ] GitHub에서 확인

## 🧪 테스트

수정 후 확인:

```powershell
# 커밋 메시지 확인
git log --oneline -10

# 상세 커밋 정보 확인
git log --pretty=format:"%h - %an, %ar : %s" -10

# 원격과 비교
git log origin/evkmc-as-app..HEAD --oneline
```

## 🔗 관련 문서

- `fix-commit-messages-safe.ps1` - 자동 수정 스크립트
- `GIT-ENCODING-FIX.md` - Git 인코딩 설정 가이드
- `CLEANUP-GIT-HISTORY.md` - Git 히스토리 정리 가이드

---

**추천 방법**: `fix-commit-messages-safe.ps1` 스크립트를 사용하세요. 자동으로 백업을 생성하고 안전하게 수정합니다!

