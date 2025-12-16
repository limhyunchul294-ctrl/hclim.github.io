# Git 커밋 메시지 한글 깨짐 문제 해결

## ⚠️ 중요: 항상 헬퍼 스크립트를 사용하세요!

PowerShell에서 `git commit -m "한글 메시지"`를 직접 사용하면 한글이 깨집니다.

## ✅ 올바른 사용법

### 커밋만 하기
```powershell
.\scripts\git\commit.ps1 "커밋 메시지"
```

### 커밋 및 푸시
```powershell
.\scripts\git\commit-and-push.ps1 "커밋 메시지"
```

## 📚 상세 가이드

- **[HOW_TO_COMMIT.md](HOW_TO_COMMIT.md)**: 기본 사용법
- **[COMMIT_WITH_KOREAN.md](COMMIT_WITH_KOREAN.md)**: 상세 해결 방법
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)**: 문제 진단 및 해결

## 🔍 커밋 메시지 확인 방법

PowerShell에서 깨져 보여도 실제로는 저장이 잘 되었을 수 있습니다.

### GitHub에서 확인 (가장 확실)
1. GitHub 저장소로 이동
2. 커밋 히스토리 확인
3. 커밋 메시지가 올바르게 표시되는지 확인

### Git Bash에서 확인
```bash
git log --oneline -5
```

## 🚫 하지 말아야 할 것

```powershell
# ❌ 이렇게 하면 한글이 깨집니다
git commit -m "한글 메시지"

# ✅ 이렇게 사용하세요
.\scripts\git\commit.ps1 "한글 메시지"
```

