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

## 공개 URL

https://evkmc-as-portal.vercel.app/meal-controller/

## 건성안 알림

깜빡임이 `T_noblink`(기본 12초) 동안 없으면 「눈을 깜빡여 주세요」 소프트 알림.
저작 pause와는 분리되어 있으며, 영상 정지는 세밀 설정의 옵션(기본 꺼짐).

## 프라이버시

온디바이스 MediaPipe Face Landmarker. 카메라 프레임은 서버로 업로드되지 않습니다.
설정은 `localStorage`에만 저장됩니다. HTTPS + 카메라 권한 필요.
