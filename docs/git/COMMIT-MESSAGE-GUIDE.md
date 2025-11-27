# 한글 커밋 메시지 작성 가이드

## 🎯 목표

변경 내용에 맞게 적절한 한글 커밋 메시지를 작성합니다.
고정 메시지 "한글로 업데이트 및 최신화" 대신 실제 변경 사항을 반영합니다.

## 📝 사용 방법

### 방법 1: 자동 메시지 생성 (권장)

변경 내용을 분석하여 자동으로 한글 커밋 메시지를 생성합니다:

```powershell
# 1. 변경사항 스테이징
git add .

# 2. 자동 커밋 메시지 생성
.\git-commit-auto-ko.ps1

# 3. 생성된 메시지 확인 후 커밋
# (스크립트가 자동으로 커밋하거나 commit-msg.txt에 저장)
```

**예시:**
- JavaScript 파일 수정 → `Fix: main.js 관련 오류 수정`
- 새 기능 추가 → `Feat: 사용자 인증 기능 추가`
- 문서 업데이트 → `Docs: API 문서 업데이트`

### 방법 2: 수동 작성

템플릿을 사용하여 수동으로 작성:

```powershell
git commit
```

VS Code나 에디터가 열리면 `.gitmessage.txt` 템플릿이 표시됩니다.

### 방법 3: 커밋 메시지 파일 사용

```powershell
# commit-msg.txt 파일에 메시지 작성
echo "Feat: 게시판 댓글 기능 추가" > commit-msg.txt

# 커밋 실행
git commit -F commit-msg.txt
```

## 📋 커밋 메시지 형식

### 접두사 (Prefix)

변경 유형에 따라 적절한 접두사를 사용합니다:

| 접두사 | 용도 | 예시 |
|--------|------|------|
| **Feat** | 새로운 기능 추가 | `Feat: 게시판 좋아요 기능 추가` |
| **Fix** | 버그 수정 | `Fix: 로그인 세션 만료 오류 수정` |
| **Docs** | 문서 수정 | `Docs: 설치 가이드 업데이트` |
| **Style** | 코드 스타일 변경 | `Style: 코드 포맷팅 수정` |
| **Refactor** | 코드 리팩토링 | `Refactor: API 호출 로직 개선` |
| **Config** | 설정 변경 | `Config: 환경 변수 설정 추가` |
| **Test** | 테스트 코드 | `Test: 사용자 인증 테스트 추가` |
| **Chore** | 기타 작업 | `Chore: 의존성 패키지 업데이트` |

### 메시지 작성 원칙

1. **명확성**: 무엇을 변경했는지 명확하게 작성
2. **간결성**: 한 줄로 핵심 내용 표현 (50자 이내 권장)
3. **구체성**: 추상적인 표현보다 구체적인 내용
4. **한글 사용**: 한글로 작성하되 기술 용어는 영문 유지 가능

### 좋은 예시

✅ **좋은 예시:**
- `Feat: 커뮤니티 게시판 댓글 작성 기능 추가`
- `Fix: 모바일에서 PDF 뷰어 1페이지만 표시되는 문제 해결`
- `Docs: 게시판 설정 가이드 문서 추가`
- `Refactor: 세션 관리 로직을 별도 모듈로 분리`
- `Config: Supabase 환경 변수 설정 추가`

❌ **나쁜 예시:**
- `한글로 업데이트 및 최신화` (너무 추상적)
- `수정` (무엇을 수정했는지 불명확)
- `버그 고침` (비전문적)
- `update` (영문 혼용, 부정확)

## 🔧 자동화 스크립트 사용법

`git-commit-auto-ko.ps1` 스크립트는 다음과 같이 분석합니다:

### 분석 기준

1. **파일 경로 분석**
   - `js/` → JavaScript 파일
   - `css/` → 스타일 파일
   - `*.md` → 문서 파일
   - `*.json` → 설정 파일

2. **변경 내용 분석**
   - `fix`, `bug`, `error` 키워드 → Fix
   - `add`, `new`, `feature` 키워드 → Feat
   - `refactor`, `개선` 키워드 → Refactor

3. **파일 상태 분석**
   - 새로 추가된 파일 → Feat
   - 수정된 파일 → Update/Fix
   - 삭제된 파일 → Remove

### 사용 예시

```powershell
# 변경사항 확인
git status

# 스테이징
git add js/main.js js/dataService.js

# 자동 메시지 생성
.\git-commit-auto-ko.ps1

# 출력 예시:
# 생성된 커밋 메시지:
# Fix: main.js 관련 오류 수정 (main.js, dataService.js)
#
# 이 메시지로 커밋하시겠습니까? (Y/N, 기본값: N)
```

## 📚 Git 설정

커밋 메시지 템플릿이 자동으로 로드되도록 설정되어 있습니다:

```powershell
# 템플릿 설정 확인
git config --get commit.template

# 템플릿 경로: .gitmessage.txt
```

## 💡 팁

1. **자주 사용하는 명령어를 별칭으로 등록:**
   ```powershell
   git config --global alias.commit-ko "!powershell -File git-commit-auto-ko.ps1"
   ```
   이후 `git commit-ko`로 사용 가능

2. **메시지 미리보기:**
   ```powershell
   .\git-commit-auto-ko.ps1
   # 메시지만 생성하고 커밋하지 않으려면 N 입력
   ```

3. **여러 파일이 변경된 경우:**
   - 주요 파일만 메시지에 포함
   - 너무 많으면 "및 기타 파일 수정" 추가

## 🔄 기존 방식과의 비교

### 이전 방식
```powershell
git commit -F commit-msg.txt  # 항상 "한글로 업데이트 및 최신화"
```

### 새로운 방식
```powershell
.\git-commit-auto-ko.ps1  # 변경 내용에 맞는 메시지 자동 생성
```

## ✅ 체크리스트

커밋 메시지 작성 전:
- [ ] 변경 내용을 명확히 파악했는가?
- [ ] 적절한 접두사를 선택했는가?
- [ ] 한 줄로 핵심 내용을 표현했는가?
- [ ] 불필요한 정보는 제외했는가?

---

**이제 변경 내용에 맞는 명확한 한글 커밋 메시지를 작성할 수 있습니다!**

