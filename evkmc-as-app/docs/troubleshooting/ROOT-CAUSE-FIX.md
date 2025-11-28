# 근본 원인 해결 방법

## 문제의 근본 원인

Vite는 빌드 시 JavaScript 파일들을 번들링하고 해시를 추가한 파일명으로 변환합니다. 하지만:
1. 현재 `js` 폴더의 파일들은 번들링되지 않고 정적 파일로 유지되어야 함
2. Vite의 기본 동작으로는 `js` 폴더가 `dist`에 복사되지 않음
3. HTML에서 `./js/config.js`를 참조하지만 빌드 후에는 파일이 없어서 404 발생
4. Vercel의 SPA 라우팅이 404를 `index.html`로 리다이렉트
5. 결과적으로 JavaScript 파일 요청이 HTML로 반환되어 MIME type 오류 발생

## 해결 방법: public 폴더 사용

Vite는 `public` 폴더의 내용을 빌드 시 `dist` 루트로 그대로 복사합니다.

### 변경사항

1. **`public` 폴더 생성**
   - `js` 폴더를 `public/js`로 복사
   - `assets` 폴더를 `public/assets`로 복사

2. **`vite.config.js` 수정**
   - `publicDir: 'public'` 설정 추가
   - 복잡한 플러그인 제거

3. **`vercel.json` 개선**
   - `/js/*.js` 파일에 명시적인 Content-Type 헤더 추가
   - 라우팅 순서 최적화

## 파일 구조

```
evkmc-as-app/
├── public/          (새로 생성)
│   ├── js/         (js 폴더 복사)
│   └── assets/     (assets 폴더 복사)
├── js/             (원본, 개발용)
├── assets/         (원본, 개발용)
├── index.html
├── login.html
└── vite.config.js
```

빌드 후:
```
dist/
├── js/             (public/js에서 복사됨)
├── assets/         (public/assets에서 복사됨)
├── index.html
└── login.html
```

## 장점

1. ✅ Vite의 표준 방식 사용
2. ✅ 빌드 시 자동으로 정적 파일 복사
3. ✅ 추가 플러그인 불필요
4. ✅ 안정적이고 예측 가능한 동작

## 다음 단계

1. 변경사항 커밋 및 푸시
2. Vercel 재배포
3. `/js/config.js` 직접 접속하여 JavaScript 파일로 정상 로드 확인
4. 애플리케이션 정상 작동 확인







