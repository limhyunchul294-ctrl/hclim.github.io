# Vercel 배포 오류 해결 방법

## 오류: "임현철 @ vercel ... is not a legal HTTP header value"

이 오류는 Vercel CLI가 로그인할 때 한글 이름이 HTTP 헤더에 포함되어 발생합니다.

## 해결 방법

### 방법 1: Vercel 웹 대시보드 사용 (권장)

CLI 대신 웹 대시보드를 사용하면 이 문제를 피할 수 있습니다:

1. [vercel.com](https://vercel.com) 접속
2. "Add New Project" 클릭
3. GitHub/GitLab/Bitbucket 저장소 연결 (또는 Git 없이 ZIP 업로드)
4. 프로젝트 설정:
   - **Framework Preset**: Vite
   - **Root Directory**: `evkmc-as-app` (또는 `.`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. "Deploy" 클릭

### 방법 2: Vercel 계정 이름 변경

1. [vercel.com/account](https://vercel.com/account) 접속
2. "Account Settings" → "Profile"
3. 이름을 영문으로 변경 (예: "Hyunchul Lim")
4. 저장 후 다시 CLI 로그인 시도

### 방법 3: 환경 변수 설정

Windows PowerShell에서 다음 명령어 실행:

```powershell
# 영문 이름으로 임시 설정
$env:USER="hyunchul"
vercel login
```

### 방법 4: .vercel 디렉토리 삭제 후 재로그인

```bash
# .vercel 디렉토리 삭제
rm -rf .vercel
# 또는 Windows PowerShell
Remove-Item -Recurse -Force .vercel

# 다시 로그인
vercel login
```

## 빠른 배포 (GitHub 사용)

가장 안정적인 방법은 GitHub 저장소를 연결하는 것입니다:

1. GitHub에 저장소 생성
2. 코드 푸시
3. Vercel에서 GitHub 저장소 연결
4. 자동 배포 설정

## 배포 후 확인

배포가 완료되면:
- ✅ 빌드 로그 확인
- ✅ 배포된 URL 확인
- ✅ `/` 및 `/login.html` 페이지 접속 테스트
- ✅ Supabase 연결 확인

