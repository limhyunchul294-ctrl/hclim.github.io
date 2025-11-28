# Vercel 웹 대시보드 배포 단계별 가이드

## 1단계: Vercel 웹사이트 접속
1. https://vercel.com 접속
2. 로그인 (GitHub 계정으로 로그인 가능)

## 2단계: 새 프로젝트 추가
1. 대시보드에서 "Add New Project" 클릭
2. GitHub/GitLab/Bitbucket 저장소 선택
   - 저장소가 없다면:
     a. GitHub에 새 저장소 생성
     b. 또는 "Import Git Repository" 없이 직접 업로드

## 3단계: 프로젝트 설정
다음 설정을 입력:

- **Framework Preset**: `Vite`
- **Root Directory**: `evkmc-as-app` (또는 `.`로 설정하고 나중에 Root Directory를 변경)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install` (기본값)

## 4단계: 환경 변수 (선택사항)
필요한 경우 Environment Variables 추가:
- `VITE_SUPABASE_URL`: `https://sesedcotooihnpjklqzs.supabase.co`
- `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

⚠️ 현재 `js/config.js`에 하드코딩되어 있어서 필수는 아닙니다.

## 5단계: 배포
1. "Deploy" 버튼 클릭
2. 빌드 로그 확인
3. 배포 완료 후 URL 확인

## 6단계: 배포 후 확인
1. ✅ 빌드가 성공적으로 완료되었는지 확인
2. ✅ 배포된 URL로 접속하여 홈페이지 확인
3. ✅ `/login.html` 경로도 정상 작동하는지 확인
4. ✅ Supabase 연결 확인
5. ✅ PDF 뷰어 및 워터마크 기능 테스트

## 문제 해결

### 빌드 실패 시
- Build Log에서 오류 확인
- 로컬에서 `npm run build` 실행하여 오류 재현
- `package.json`의 의존성 확인

### 라우팅 문제
- `vercel.json`의 `rewrites` 설정 확인
- 모든 경로가 `index.html`로 리다이렉트되도록 설정되어 있음

