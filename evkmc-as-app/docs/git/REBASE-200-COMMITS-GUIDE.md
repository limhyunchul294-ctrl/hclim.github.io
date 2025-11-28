# 최근 200개 커밋 메시지 수정 가이드

## 🎯 목표

최근 200개 커밋 메시지를 "한글로 업데이트 및 최신화"로 통일합니다.

## ⚠️ 중요 안내

1. **백업 필수**: 이미 백업 브랜치가 생성되었습니다
2. **Force Push 필요**: 수정 후 force push가 필요합니다
3. **시간 소요**: 200개 커밋 수정에는 시간이 걸릴 수 있습니다

## 📋 실행 단계

### 1단계: 백업 확인

```powershell
git branch | Select-String "backup"
```

백업 브랜치가 생성되었는지 확인합니다.

### 2단계: Interactive Rebase 시작

```powershell
# 모든 커밋을 수정하려면 (첫 커밋부터)
git rebase -i --root

# 또는 최근 200개만 수정하려면
git rebase -i HEAD~200
```

### 3단계: 에디터에서 수정

에디터가 열리면:

1. **모든 `pick`을 `reword` (또는 `r`)로 변경**
   ```
   pick abc1234 첫번째 커밋
   pick def5678 두번째 커밋
   ```
   ↓
   ```
   reword abc1234 첫번째 커밋
   reword def5678 두번째 커밋
   ```

2. **파일 저장 및 에디터 종료**

3. **각 커밋마다 메시지 입력**
   - 에디터가 다시 열리면
   - "한글로 업데이트 및 최신화" 입력
   - 저장 후 종료
   - 다음 커밋으로 자동 진행

### 4단계: 결과 확인

```powershell
# 최근 10개 커밋 확인
git log --oneline -10

# 전체 커밋 확인
git log --oneline
```

### 5단계: Force Push (문제없다면)

```powershell
git push --force-with-lease origin HEAD:evkmc-as-app
```

## 🔄 되돌리기

문제가 발생하면:

```powershell
# Rebase 중 취소
git rebase --abort

# 완료 후 되돌리기
git reset --hard backup-before-rebase-200-commits-YYYYMMDD-HHMMSS
```

## 💡 팁

- **빠른 진행**: 각 커밋마다 "한글로 업데이트 및 최신화"만 입력하면 됩니다
- **VS Code 사용**: `git config --global core.editor "code --wait"` 설정 후 사용
- **메모장 사용**: 기본 에디터가 메모장이면 그대로 사용 가능

---

**지금 바로 실행하려면 다음 명령어를 실행하세요:**

```powershell
git rebase -i --root
```

