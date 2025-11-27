# Vercel 라우팅 최종 해결

## 문제 분석

1. **JavaScript 파일 MIME type 오류**: `/js/*` 파일들이 `text/html`로 반환됨
2. **login.html 접근 불가**: SPA 라우팅 규칙과 충돌
3. **빌드 후 파일 경로 문제**: Vite가 `js` 폴더를 빌드 출력에 포함하지 않음

## 해결 방법

### 1. Vite 빌드 설정 수정

`vite.config.js`에 플러그인 추가:
- 빌드 완료 후 `js` 폴더와 `assets` 폴더를 `dist`로 복사
- 정적 파일이 빌드 출력에 포함되도록 보장

### 2. Vercel 라우팅 규칙 개선

`vercel.json`의 `routes` 설정:
- 정적 파일 우선 처리 (순서 중요)
- `/js/*` 파일에 `Content-Type: application/javascript` 헤더 명시
- `/login.html` 명시적 라우팅

## 변경사항

### vite.config.js
- `copy-static-files` 플러그인 추가
- 빌드 후 `js`와 `assets` 폴더 자동 복사

### vercel.json
- `cleanUrls: false` 추가
- `trailingSlash: false` 추가
- `/js/*` 라우트에 Content-Type 헤더 추가
- 라우팅 순서 최적화

## 배포 후 확인

1. ✅ `/js/config.js` - JavaScript 파일로 정상 로드 (MIME type 확인)
2. ✅ `/login.html` - 로그인 페이지 정상 표시
3. ✅ `/login` - 로그인 페이지 별칭 작동
4. ✅ `/` - 메인 페이지 정상 작동
5. ✅ SPA 라우팅 (`/#/shop` 등) 정상 작동

## 문제가 계속되면

1. Vercel 대시보드에서 빌드 로그 확인
2. `dist` 폴더 구조 확인 (로컬에서 `npm run build` 실행)
3. 브라우저 개발자 도구 Network 탭에서 파일 요청 확인

