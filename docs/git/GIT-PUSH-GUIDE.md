# Git 푸시 가이드

## 변경된 파일 목록

다음 파일들이 수정되었습니다:

### 1. 빌드 설정 수정
- ✅ `package.json` - terser 추가
- ✅ `index.html` - script 태그에 `type="module"` 추가
- ✅ `login.html` - script 태그에 `type="module"` 추가

### 2. 정리 작업
- ✅ `hclim.github.io` 서브폴더 삭제 (백업은 `hclim.github.io.backup`에 보관)

## Git 푸시 방법

### 방법 1: GitHub Desktop 사용 (권장)

1. **GitHub Desktop 열기**
2. **변경사항 확인**
   - 왼쪽 패널에서 변경된 파일 확인
   - `package.json`, `index.html`, `login.html` 등이 표시됨
3. **커밋 메시지 입력**
   ```
   Fix Vite build: Add type=module and terser, Remove duplicate folder
   ```
4. **커밋 및 푸시**
   - "Commit to evkmc-as-app" 클릭
   - "Push origin" 클릭

### 방법 2: Git Bash 또는 명령 프롬프트 사용

Git이 설치되어 있다면 다음 명령어 실행:

```bash
# 변경사항 확인
git status

# 모든 변경사항 추가
git add .

# 커밋
git commit -m "Fix Vite build: Add type=module and terser, Remove duplicate folder"

# 푸시
git push origin evkmc-as-app
```

### 방법 3: VSCode 통합 Git 사용

1. **VSCode에서 변경사항 확인**
   - 왼쪽 사이드바에서 Source Control 아이콘 클릭
   - 변경된 파일 목록 확인
2. **커밋 메시지 입력**
3. **커밋 및 푸시**
   - "Commit" 클릭
   - "Sync Changes" 또는 "Push" 클릭

## Vercel 자동 배포

GitHub에 푸시하면 Vercel이 자동으로:
1. 변경사항 감지
2. 빌드 실행
3. 배포 완료

배포 후 Vercel 대시보드에서 빌드 상태를 확인하세요.

## 확인 사항

푸시 후 다음을 확인하세요:
- ✅ GitHub 저장소에 변경사항이 반영되었는지
- ✅ Vercel 대시보드에서 빌드가 시작되었는지
- ✅ 빌드가 성공적으로 완료되었는지

