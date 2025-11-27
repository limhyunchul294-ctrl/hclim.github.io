# Vercel 빌드 오류 빠른 해결

## 문제
```
Error: terser not found. Since Vite v3, terser has become an optional dependency.
```

## 해결 방법

`vite.config.js`에서 `minify: 'terser'`를 `minify: true`로 변경했습니다.

이제 Vite가 기본 minifier인 `esbuild`를 사용합니다:
- ✅ 더 빠른 빌드 속도
- ✅ 추가 의존성 불필요
- ✅ 동일한 minification 효과

## 변경사항

`vite.config.js`:
```javascript
minify: true, // esbuild 사용 (terser 대신)
```

## 다음 단계

1. 변경사항을 GitHub에 푸시
2. Vercel 자동 재배포
3. 빌드 성공 확인

## 참고

- `terser`는 `package.json`에서 제거해도 됩니다 (선택사항)
- `esbuild`는 Vite에 기본 포함되어 있어 별도 설치 불필요

