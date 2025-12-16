# Git 커밋 메시지 한글 깨짐 문제 해결 가이드

## ⚠️ 문제
PowerShell에서 `git commit -m "한글 메시지"`를 사용할 때 한글이 깨집니다.

## ✅ 해결 방법: 헬퍼 스크립트 사용

### 방법 1: 커밋만 하기

```powershell
.\scripts\git\commit.ps1 "커밋 메시지"
```

### 방법 2: 커밋 및 푸시

```powershell
.\scripts\git\commit-and-push.ps1 "커밋 메시지"
```

## 📝 사용 예시

### 예시 1: 간단한 커밋
```powershell
.\scripts\git\commit.ps1 "fix: 보안서약서 동의 저장 문제 해결"
```

### 예시 2: 여러 줄 커밋 메시지
```powershell
$message = @"
feat: 보안서약서 팝업 기능 추가

- 보안서약서 팝업 컴포넌트 생성
- 로그인 후 보안서약서 동의 상태 확인
- Supabase users 테이블에 보안서약서 관련 컬럼 추가
"@

.\scripts\git\commit.ps1 $message
```

### 예시 3: 커밋 및 푸시
```powershell
.\scripts\git\commit-and-push.ps1 "fix: RLS 정책 추가"
```

## 🔧 Git 설정 확인

다음 명령어로 Git 인코딩 설정을 확인하세요:

```powershell
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8
git config --global core.quotepath false
```

## 💡 왜 헬퍼 스크립트를 사용해야 하나요?

1. **PowerShell 인코딩 문제**: PowerShell의 기본 인코딩이 UTF-8이 아니어서 한글이 깨집니다.
2. **임시 파일 사용**: 헬퍼 스크립트는 커밋 메시지를 UTF-8 파일로 작성하여 `git commit -F`로 전달합니다.
3. **BOM 없이 저장**: UTF-8 BOM 없이 저장하여 Git이 올바르게 인식합니다.

## 🚫 하지 말아야 할 것

```powershell
# ❌ 이렇게 하면 한글이 깨집니다
git commit -m "한글 메시지"

# ✅ 이렇게 사용하세요
.\scripts\git\commit.ps1 "한글 메시지"
```

## 📚 참고

- 헬퍼 스크립트 위치: `scripts/git/commit.ps1`, `scripts/git/commit-and-push.ps1`
- 상세 가이드: `docs/git/COMMIT_WITH_KOREAN.md`

