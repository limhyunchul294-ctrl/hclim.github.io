# AGENTS.md

## Cursor Cloud specific instructions

### 프로젝트 개요
EVKMC A/S 정비 기술 문서 포털 — 전기차 정비 기술자를 위한 웹 애플리케이션.
Vanilla JS SPA (Vite) + Supabase (PostgreSQL, Auth, Storage, Edge Functions) + Vercel 배포.

### 프로덕션 URL
- **Vercel**: `evkmc-as-app.vercel.app`
- **Supabase**: `sesedcotooihnpjklqzs.supabase.co` (URL/키가 `js/config.js`에 하드코딩됨)

### 개발 환경
- **Node.js 22.x** 필수 (`engines` 필드 참고)
- `npm install` → `npm run dev` (Vite dev server, 포트 3000)
- `npm run build` (Vite 프로덕션 빌드)
- `evkmc-as-app/` 디렉토리에도 별도 `npm install` 필요 (보안 강화 변형 앱)

### 주의사항
- **ESLint 미설정**: `package.json`에 `lint` 스크립트가 있으나, eslint 의존성/설정 파일/`src` 디렉토리가 없어서 동작하지 않음.
- **테스트 없음**: 테스트 프레임워크나 테스트 파일이 프로젝트에 없음.
- **로컬 dev 서버에서는 Vercel URL rewrite가 적용되지 않음**: SPA 라우팅은 hash 기반(`#/shop`, `#/etm` 등)이므로 로컬에서도 작동하지만, `vercel.json`의 rewrite 규칙은 Vercel에서만 적용됨.
- **Supabase 인증 (Magic Link)**: 이메일 magic link 방식 사용. 로그인 시 Supabase Auth가 이메일을 발송하고, 해당 링크를 클릭해야 인증이 완료됨.
- **Vercel Deployment Protection**: Vercel SSO가 활성화되어 있어, curl 등으로 직접 접근 시 401 반환. 브라우저에서 Vercel 계정 인증 후 접근 가능.
