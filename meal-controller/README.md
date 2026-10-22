# 식사 중 영상시청 컨트롤러

전면 카메라로 **저작(씹기)의 주기적 턱 움직임**을 감지하고, 저작이 멈추면 영상을 일시정지하는 클라이언트 전용 웹 MVP입니다.

기존 GitHub Pages 사이트 루트(`index.html` 등)는 건드리지 않습니다. 앱은 **`meal-controller/`** 하위에만 있습니다.

## 기능 (M0–M4)

| 단계 | 내용 |
|------|------|
| M0 | Vite + React + TypeScript 스캐폴드 |
| M1 | `getUserMedia` + MediaPipe Face Landmarker (VIDEO) · 메시 오버레이 · 얼굴 소실 |
| M2 | `jawOpen`/MAR 주기 휴리스틱 · PLAYING/PAUSED/NO_FACE · 로컬/샘플 영상 pause + 넛지 |
| M3 | `eyeBlinkLeft/Right` 깜빡임 횟수·분당 지표 · 눈 감김 장시간 소프트 경고 (재생 비차단) |
| M4 | 임계값 슬라이더 · 프라이버시 문구 · 모바일 레이아웃 |

## 로컬 실행

```bash
cd meal-controller
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` (또는 터미널에 표시된 URL)을 엽니다.

- **HTTPS 또는 localhost** 필요 (카메라 권한)
- 전면 카메라 권한을 허용한 뒤 **시작**을 누릅니다
- 샘플 영상으로 데모하거나, **파일 선택**으로 로컬 영상을 넣을 수 있습니다

### 빌드 / 미리보기

```bash
cd meal-controller
npm run build
npm run preview
```

산출물: `meal-controller/dist/`  
Vite `base`는 `./` 이라서 GitHub Pages 하위 경로에서도 정적 자산이 동작합니다.

## GitHub Pages

이 저장소에 이미 루트 사이트가 있으므로, 가장 안전한 배치는 **`/meal-controller/`** 서브디렉터리입니다.

배포 예:

1. `npm run build`
2. `dist/` 내용을 Pages가 서빙하는 `meal-controller/` 정적 경로에 맞춤 (Actions 또는 수동 복사)
3. HTTPS로 접속 후 카메라 허용

로컬 `npm run dev`가 가장 확실한 데모 경로입니다.

## 사용 방법 (데모)

1. **시작** → 카메라·모델 로드
2. 얼굴을 비추고 **주기적으로 씹는 동작** → 영상 재생
3. 저작을 ~3.5초 멈추면 → 일시정지 + 「한 입 더 씹어 주세요」
4. 다시 2회(기본) 저작 주기 → 재개
5. 옆 패널에서 일시정지 지연·민감도·재개 횟수 조절

## 프라이버시

- MediaPipe Face Landmarker (`@mediapipe/tasks-vision`, **Apache-2.0**)가 **브라우저 온디바이스**에서 실행됩니다
- 카메라 프레임을 서버로 업로드하지 않습니다
- 모델 파일은 Google MediaPipe CDN에서 로드될 수 있습니다 (추론은 로컬)

## 알려진 한계

- **말하기·웃음**이 저작으로 오인될 수 있음 (smile veto·주기성으로 완화, 완전하지 않음)
- 입만 벌리고 고정하면 재생되지 않아야 하나, 조명·각도에 따라 오탐/미탐 가능
- 얼굴 가림·측면·어두운 조명에서 불안정
- 깜빡임은 **부가 지표**이며 재생을 막지 않음
- iOS Safari WASM/카메라 제약은 실기기에서 추가 확인 권장

## 스택

- Vite 8 · React 19 · TypeScript
- `@mediapipe/tasks-vision` Face Landmarker + blendshapes
