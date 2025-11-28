# Git 히스토리 정리 및 한글 인코딩 문제 해결

## 🔴 문제 상황

GitHub 웹사이트에서 한글이 깨져서 표시되는 경우:
- `Add: ?꾨줈?앺듃 ?뚯씪??蹂듭썝`
- 파일명이 깨져서 보이는 경우

## ✅ 해결 방법

### 방법 1: Git 인코딩 설정 (권장)

이미 `fix-git-encoding.ps1` 스크립트를 생성했습니다. 실행하세요:

```powershell
.\fix-git-encoding.ps1
```

또는 수동으로 설정:

```powershell
# Git 전역 설정
git config --global core.quotepath false
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8
git config --global core.precomposeunicode true

# 현재 저장소 설정
git config core.quotepath false
git config i18n.commitencoding utf-8
git config i18n.logoutputencoding utf-8
```

### 방법 2: GitHub 웹사이트에서 보이는 한글 깨짐 문제

이는 브라우저나 GitHub의 인코딩 처리 문제일 수 있습니다. 다음을 확인하세요:

1. **브라우저 인코딩 확인**
   - Chrome/Edge: 자동으로 UTF-8 사용
   - 설정이 변경되었다면 기본값으로 재설정

2. **GitHub 웹사이트 새로고침**
   - Ctrl + F5 (강력 새로고침)
   - 캐시 클리어 후 다시 확인

### 방법 3: 커밋 히스토리 확인 및 정리

#### 3-1. 현재 커밋 메시지 확인

```powershell
# 최근 10개 커밋 확인
git log --oneline -10

# 자세한 커밋 정보 확인
git log -5 --pretty=format:"%h - %an, %ar : %s"
```

#### 3-2. 깨진 커밋 메시지 수정 (필요시)

**주의**: 이미 푸시된 커밋을 수정하면 force push가 필요합니다!

```powershell
# 최근 N개 커밋을 interactive rebase로 수정
git rebase -i HEAD~5

# 에디터에서:
# - 'pick'을 'reword'로 변경하여 커밋 메시지 수정
# - 또는 'edit'으로 변경하여 커밋 내용 수정
```

### 방법 4: 파일명 인코딩 문제 해결

#### 4-1. 잘못된 파일명 확인

```powershell
# 한글 파일명 확인
git ls-files | Select-String -Pattern "[가-힣]"

# 모든 파일 확인
git ls-files
```

#### 4-2. 파일명 재추가 (필요시)

```powershell
# 파일명이 깨진 파일이 있다면
git rm --cached "깨진파일명"
git add "올바른파일명"
git commit -m "파일명 인코딩 수정"
```

### 방법 5: 새 커밋부터 올바르게 처리

설정을 완료한 후 새로운 커밋부터 한글이 정상적으로 표시됩니다:

```powershell
# 변경사항 스테이징
git add .

# 커밋 (한글 메시지 사용)
git commit -m "한글로 업데이트 및 최신화"

# 푸시
git push origin HEAD:evkmc-as-app
```

## 🧹 불필요한 파일 정리

### Git에서 추적하지 않아야 할 파일들

`.gitignore` 파일을 확인하고 다음 항목들이 포함되어 있는지 확인하세요:

```
# 환경 변수 파일
.env
.env.local

# 로그 파일
*.log
logs/

# 임시 파일
sms-logs.json
*.tmp
*.temp

# 빌드 파일
dist/
build/

# 백업 파일
*.backup
backup/

# Node 모듈 (필요시)
# node_modules/
```

### 추적 중인 불필요한 파일 제거

```powershell
# .gitignore에 추가 후
git rm --cached sms-logs.json
git rm --cached -r backup/
git commit -m "불필요한 파일 제거"
```

## 📋 체크리스트

- [ ] `fix-git-encoding.ps1` 실행 완료
- [ ] Git 인코딩 설정 확인 (`git config --global --list | Select-String encoding`)
- [ ] PowerShell 인코딩 확인 (`chcp` - 65001이어야 함)
- [ ] 최근 커밋 메시지 확인 (`git log --oneline -5`)
- [ ] GitHub 웹사이트에서 새 커밋 확인
- [ ] `.gitignore` 파일 확인 및 업데이트

## ⚠️ 주의사항

1. **Force Push 주의**: 이미 푸시된 커밋을 수정하면 `git push --force`가 필요합니다. 협업 중이라면 팀원들과 상의하세요.

2. **히스토리 변경**: Interactive rebase는 Git 히스토리를 변경하므로 주의가 필요합니다.

3. **백업**: 중요한 작업 전에는 브랜치 백업을 권장합니다:
   ```powershell
   git branch backup-before-cleanup
   ```

## 🔗 관련 문서

- `GIT-ENCODING-FIX.md` - 상세한 인코딩 설정 가이드
- `fix-git-encoding.ps1` - 자동 설정 스크립트

---

**결론**: Git 설정은 이미 올바르게 되어 있습니다. 새로운 커밋부터 한글이 정상적으로 표시됩니다. GitHub에서 보이는 깨짐은 브라우저 캐시 문제일 수 있으니 새로고침해보세요.

