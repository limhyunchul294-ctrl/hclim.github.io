# 빌드 오류 최종 해결

## 변경사항

1. **`package.json`**: `terser` 의존성 제거
2. **`vite.config.js`**: `minify: 'esbuild'` 명시적 설정

## 해결 방법

`minify: true`는 기본값으로 esbuild를 사용하지만, 명시적으로 `'esbuild'`로 설정하여 확실하게 했습니다.

## 다음 단계

1. 변경사항 커밋 및 푸시:
   ```bash
   git add package.json vite.config.js
   git commit -m "Remove terser, use esbuild minifier"
   git push
   ```

2. Vercel 자동 재배포 대기

3. 빌드 성공 확인

## 참고

- `esbuild`는 Vite에 기본 포함되어 있어 별도 설치 불필요
- `terser`보다 더 빠르고 안정적
- 동일한 minification 효과

