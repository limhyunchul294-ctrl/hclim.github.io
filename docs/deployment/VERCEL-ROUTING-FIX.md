# Vercel 라우팅 문제 해결

## 문제

현재 `vercel.json`의 `rewrites`가 모든 경로를 `index.html`로 리다이렉트하여:
- `/js/config.js` 같은 정적 파일들이 `index.html`로 반환됨 (MIME type 오류)
- `login.html`이 제대로 접근되지 않음
- 애플리케이션이 로딩 화면에서 멈춤

## 해결 방법

`rewrites` 대신 `routes`를 사용하여 더 정확한 라우팅 규칙 설정:

1. **정적 파일 우선 처리**
   - `/js/*` - JavaScript 파일
   - `/assets/*` - 이미지, 폰트 등
   - 기타 정적 파일 확장자

2. **HTML 파일 명시적 처리**
   - `/login.html` - 로그인 페이지
   - `/login` - 로그인 페이지 별칭

3. **SPA 라우팅**
   - 그 외 모든 경로는 `index.html`로 리다이렉트

## 변경사항

`vercel.json`의 `rewrites`를 `routes`로 변경하여:
- 정적 파일이 먼저 처리되도록 순서 보장
- `login.html` 명시적 라우팅
- SPA 라우팅은 마지막에 처리

## 배포 후 확인

1. ✅ `/js/config.js` - JavaScript 파일로 정상 로드
2. ✅ `/login.html` - 로그인 페이지 정상 표시
3. ✅ `/login` - 로그인 페이지 별칭 작동
4. ✅ `/` - 메인 페이지 정상 작동
5. ✅ SPA 라우팅 (`/#/shop` 등) 정상 작동

