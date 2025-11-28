# 중복 데이터 정리 가이드

## 현재 상황

- **원본 작업 폴더**: `C:\Users\sec\Desktop\GSW\evkmc-as-app` ✅ (최신 파일)
- **중복 폴더**: `C:\Users\sec\Desktop\GSW\evkmc-as-app\hclim.github.io` ❌ (이전 버전, 불필요)

## 해결 방법

### 방법 1: 중복 폴더 삭제 (권장)

`hclim.github.io` 서브폴더는 Git 클론 시 실수로 생성된 것으로 보입니다.
원본 폴더에서 직접 Git 작업을 진행하는 것이 좋습니다.

#### 단계:

1. **중복 폴더 삭제**
   ```powershell
   Remove-Item -Recurse -Force "hclim.github.io"
   ```

2. **원본 폴더를 Git 저장소로 초기화** (아직 안 되어 있다면)
   ```powershell
   git init
   git remote add origin https://github.com/limhyunchul294-ctrl/hclim.github.io.git
   ```

3. **변경사항 커밋 및 푸시**
   ```powershell
   git add .
   git commit -m "Fix Vite build configuration"
   git push origin evkmc-as-app
   ```

### 방법 2: 중복 폴더 내용 확인 후 삭제

혹시 `hclim.github.io`에 중요한 변경사항이 있을 수 있으니 확인:

1. **파일 비교**
   - `hclim.github.io/package.json` vs `package.json`
   - 최신 수정사항이 원본에 있는지 확인

2. **확인 후 삭제**
   - 원본에 모든 최신 내용이 있다면 삭제
   - 필요하면 파일을 원본으로 복사 후 삭제

## 권장 작업 순서

1. ✅ 원본 폴더에 최신 수정사항이 모두 있는지 확인
2. ✅ `hclim.github.io` 서브폴더 삭제
3. ✅ 원본 폴더에서 Git 작업 진행

## 주의사항

- `hclim.github.io` 폴더는 `.git`이 있어서 Git 저장소입니다
- 하지만 원본 폴더에서 작업하는 것이 더 깔끔합니다
- 삭제 전에 `hclim.github.io`에 중요한 변경사항이 있는지 확인하세요

