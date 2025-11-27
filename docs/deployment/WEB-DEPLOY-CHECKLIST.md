# Vercel 웹 대시보드 배포 체크리스트

## ✅ 배포 전 확인 사항

### 1. 필수 파일 확인
- ✅ `package.json` - 빌드 스크립트 확인됨
- ✅ `vercel.json` - 배포 설정 확인됨
- ✅ `vite.config.js` - Vite 빌드 설정 확인됨
- ✅ `index.html` - 메인 페이지 확인됨
- ✅ `login.html` - 로그인 페이지 확인됨

### 2. Vercel 웹 대시보드 배포 단계

#### Step 1: Vercel 접속
- https://vercel.com 접속
- GitHub/GitLab/Bitbucket 계정으로 로그인

#### Step 2: 새 프로젝트 추가
1. "Add New Project" 클릭
2. 저장소 선택:
   - **옵션 A**: GitHub 저장소 연결 (권장)
     - 저장소가 없다면 GitHub에 새 저장소 생성 후 코드 푸시
   - **옵션 B**: ZIP 업로드 (임시 방법)
     - `evkmc-as-app` 폴더를 ZIP으로 압축 후 업로드

#### Step 3: 프로젝트 설정
다음 설정을 **반드시** 입력:

```
Framework Preset: Vite
Root Directory: evkmc-as-app (또는 .)
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

⚠️ **중요**: 
- Root Directory가 `.`인 경우, 프로젝트 루트가 `evkmc-as-app` 폴더가 되도록 설정
- 또는 Root Directory를 `evkmc-as-app`으로 설정

#### Step 4: 환경 변수 (선택사항)
현재 `js/config.js`에 하드코딩되어 있어서 필수는 아닙니다.
하지만 더 안전하게 관리하려면:

- `VITE_SUPABASE_URL`: `https://sesedcotooihnpjklqzs.supabase.co`
- `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlc2VkY290b29paG5wamtscXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjA5ODAsImV4cCI6MjA3NDgzNjk4MH0.AcbNoC19S_shBKXXs6-2LOo0KSnZ_Mk1ZejZtUX1EmI`

#### Step 5: 배포 실행
1. "Deploy" 버튼 클릭
2. 빌드 로그 모니터링
3. 빌드 완료 대기 (약 2-3분)

## ✅ 배포 후 확인 사항

### 1. 기본 기능 확인
- [ ] 홈페이지(`/`) 정상 로드
- [ ] 로그인 페이지(`/login.html`) 정상 로드
- [ ] 네비게이션 바 정상 표시
- [ ] 로고 및 이미지 정상 표시

### 2. Supabase 연결 확인
- [ ] 로그인 기능 정상 작동
- [ ] OTP 인증 정상 작동
- [ ] 사용자 정보 조회 정상 작동
- [ ] 세션 관리 정상 작동

### 3. 문서 기능 확인
- [ ] 정비지침서 트리 메뉴 정상 작동
- [ ] 전장회로도(ETM) 트리 메뉴 정상 작동
- [ ] TSB 목록 정상 표시
- [ ] PDF 뷰어 정상 작동
- [ ] 워터마크 기능 정상 작동

### 4. 고급 기능 확인
- [ ] 공지사항 목록 표시
- [ ] 공지사항 작성/수정/삭제 (본사/관리자 권한)
- [ ] 세션 타이머 정상 작동
- [ ] 세션 갱신 버튼 정상 작동
- [ ] 10분 경고 팝업 정상 작동

## 🐛 문제 해결

### 빌드 실패 시
1. Build Log에서 오류 확인
2. 로컬에서 `npm run build` 실행하여 오류 재현
3. `package.json`의 의존성 확인
4. Node.js 버전 확인 (18.x 권장)

### 라우팅 문제
- `vercel.json`의 `rewrites` 설정 확인
- 모든 경로가 `index.html`로 리다이렉트되도록 설정되어 있음

### 이미지/폰트 로드 실패
- `assets` 폴더가 제대로 배포되었는지 확인
- 경로가 상대 경로로 설정되어 있는지 확인

## 📝 참고사항

- Supabase Edge Function은 Supabase에서 별도로 배포되어야 합니다
- 이미 배포된 Edge Function은 그대로 사용 가능합니다
- 환경 변수는 Vercel 대시보드에서 언제든지 수정 가능합니다

