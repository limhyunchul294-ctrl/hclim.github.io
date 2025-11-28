# Vercel 배포 가이드

## 배포 방법

### 방법 1: Vercel CLI 사용 (권장)

1. **Vercel CLI 설치**
   ```bash
   npm install -g vercel
   ```

2. **프로젝트 디렉토리로 이동**
   ```bash
   cd evkmc-as-app
   ```

3. **Vercel 로그인**
   ```bash
   vercel login
   ```

4. **배포 실행**
   ```bash
   vercel
   ```
   
   첫 배포 시 다음과 같은 질문이 나옵니다:
   - Set up and deploy? **Yes**
   - Which scope? (개인 계정 또는 팀 선택)
   - Link to existing project? **No** (첫 배포)
   - What's your project's name? **evkmc-as-portal** (또는 원하는 이름)
   - In which directory is your code located? **./**

5. **프로덕션 배포**
   ```bash
   vercel --prod
   ```

### 방법 2: Vercel 웹 대시보드 사용

1. [Vercel](https://vercel.com)에 로그인
2. "Add New Project" 클릭
3. GitHub/GitLab/Bitbucket 저장소 연결 (또는 Git 저장소가 없으면 ZIP 업로드)
4. 프로젝트 설정:
   - **Framework Preset**: Vite
   - **Root Directory**: `evkmc-as-app`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. "Deploy" 클릭

## 환경 변수 설정 (선택사항)

현재 `js/config.js`에 Supabase 키가 하드코딩되어 있습니다. 
더 안전하게 관리하려면 Vercel 환경 변수를 사용할 수 있습니다:

1. Vercel 대시보드 → 프로젝트 → Settings → Environment Variables
2. 다음 변수 추가:
   - `VITE_SUPABASE_URL`: `https://sesedcotooihnpjklqzs.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. `js/config.js`를 수정하여 환경 변수 사용:
   ```javascript
   SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://sesedcotooihnpjklqzs.supabase.co',
   SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
   ```

## 배포 후 확인 사항

1. ✅ 빌드가 성공적으로 완료되었는지 확인
2. ✅ 홈페이지(`/`)가 정상적으로 로드되는지 확인
3. ✅ 로그인 페이지(`/login.html`)가 정상적으로 로드되는지 확인
4. ✅ Supabase 연결이 정상적으로 작동하는지 확인
5. ✅ PDF 뷰어가 정상적으로 작동하는지 확인
6. ✅ 워터마크 기능이 정상적으로 작동하는지 확인

## 문제 해결

### 빌드 오류가 발생하는 경우
- `npm install`을 로컬에서 실행하여 의존성이 제대로 설치되는지 확인
- `npm run build`를 로컬에서 실행하여 빌드 오류 확인

### 환경 변수 관련 오류
- Vercel 대시보드에서 환경 변수가 올바르게 설정되었는지 확인
- 환경 변수 이름이 `VITE_`로 시작하는지 확인 (Vite 프리픽스 필수)

### 라우팅 문제
- `vercel.json`의 `rewrites` 설정이 올바른지 확인
- 모든 경로가 `index.html`로 리다이렉트되도록 설정되어 있음

## 참고사항

- Supabase Edge Function은 Supabase에서 별도로 배포되어야 합니다 (`supabase functions deploy`)
- 정적 파일(이미지, 폰트 등)은 `assets` 폴더에 있어야 합니다
- 빌드된 파일은 `dist` 폴더에 생성됩니다

