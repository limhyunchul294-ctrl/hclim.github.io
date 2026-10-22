# 식사 중 영상시청 컨트롤러 (소스)

소스 위치: `apps/meal-controller/`  
GitHub Pages에 올라가는 정적 빌드: 저장소 루트 `meal-controller/`

## 공개 URL

https://limhyunchul294-ctrl.github.io/hclim.github.io/meal-controller/

(저장소 이름이 `hclim.github.io` 이라서 프로젝트 Pages 경로에 레포명이 포함됩니다.)

## 로컬 개발

```bash
cd apps/meal-controller
npm install
npm run dev
```

## 프로덕션 빌드 (Pages용 정적 파일 생성)

```bash
cd apps/meal-controller
npm install
npm run build
```

빌드 결과가 `../../meal-controller/`(저장소의 `meal-controller/`)에 출력됩니다. 이 폴더를 커밋하면 Pages에서 바로 서빙됩니다.

## 프라이버시

온디바이스 MediaPipe Face Landmarker. 카메라 프레임은 서버로 업로드되지 않습니다. HTTPS(Pages) + 카메라 권한 필요.
