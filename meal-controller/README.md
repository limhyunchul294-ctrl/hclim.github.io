# 식사 중 영상시청 컨트롤러

전면 카메라로 **저작(씹기)** 을 감지하고, 저작이 멈추면 영상을 일시정지하는 클라이언트 전용 웹 MVP입니다.

- **위치:** 이 저장소의 `meal-controller/` (기존 GitHub Pages 루트 사이트와 분리)
- **프라이버시:** MediaPipe Face Landmarker가 **기기 안에서만** 동작합니다. 프레임을 서버로 보내지 않습니다.
- **라이선스 참고:** `@mediapipe/tasks-vision` (Apache-2.0)

## 요구 사항

- Node.js 22.x 권장
- HTTPS 또는 `localhost` (카메라 권한)
- 전면 카메라가 있는 기기

## 개발

```bash
cd meal-controller
npm install
npm run dev
```

브라우저에서 표시되는 주소(기본 `http://localhost:5173`)로 엽니다.

## 빌드 / 미리보기

```bash
cd meal-controller
npm run build
npm run preview
```

빌드 결과는 `meal-controller/dist/` 입니다. Vite `base`는 `./` 이라서 GitHub Pages 하위 경로(`/meal-controller/`)에서도 정적 자산이 동작합니다.

## GitHub Pages에서 열기

1. `npm run build` 후 `dist/` 내용을 Pages에 배포하거나, 저장소에서 정적 서빙 규칙을 맞춥니다.
2. 카메라·WASM은 **HTTPS** 가 필요합니다.

로컬 확인이 가장 확실합니다: `npm run dev`.

## 마일스톤

| 단계 | 내용 |
|------|------|
| M0 | Vite + React + TS 스캐폴드 |
| M1 | 카메라 + Face Landmarker + 메시 오버레이 · 얼굴 소실 UI |
| M2 | 저작 스코어 + PLAYING/PAUSED 상태머신 + 넛지 (현재) |
| M3 | 눈 깜빡임 지표 (부가) |
| M4 | 임계값 슬라이더 · 모바일 레이아웃 · 폴리시 |

## 관련 문서

프로젝트 조사 문서(에이전트 스토어): `mvp-direction.md`, `model-recommendations.md`, `research-similar-services.md`
