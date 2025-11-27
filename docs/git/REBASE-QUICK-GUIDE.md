# 깨진 커밋 메시지 빠른 수정 가이드

## 🚀 빠른 시작 (3단계)

### 1단계: 스크립트 실행

```powershell
.\rebase-fix-commits.ps1
```

### 2단계: 에디터에서 수정

에디터가 열리면:
- 모든 `pick`을 `reword` (또는 `r`)로 변경
- 파일 저장 및 에디터 종료
- 각 커밋마다 "한글로 업데이트 및 최신화" 입력

### 3단계: Force Push

```powershell
git push --force-with-lease origin HEAD:evkmc-as-app
```

## 📝 상세 가이드

### Interactive Rebase 에디터 화면

```
pick abc1234 한글로 업데이트 및 최신화
pick def5678 한글로 업데이트 및 최신화
pick ghi9012 한글로 업데이트 및 최신화
```

**변경 후:**

```
reword abc1234 한글로 업데이트 및 최신화
reword def5678 한글로 업데이트 및 최신화
reword ghi9012 한글로 업데이트 및 최신화
```

### 각 커밋 메시지 입력

에디터가 다시 열리면:
```
한글로 업데이트 및 최신화
```

저장 후 종료 → 다음 커밋으로 자동 진행

## ⚠️ 중요 사항

1. **백업 자동 생성**: 스크립트가 자동으로 백업 브랜치를 만듭니다
2. **Force Push 필수**: 이미 푸시된 커밋을 수정했으므로 force push 필요
3. **협업 중 주의**: 팀원들과 상의 후 진행하세요

## 🔄 되돌리기

```powershell
# Rebase 중 취소
git rebase --abort

# 완료 후 되돌리기
git reset --hard backup-before-rebase-YYYYMMDD-HHMMSS
```

---

**더 자세한 내용은 `FIX-COMMIT-MESSAGES-GUIDE.md`를 참고하세요.**

