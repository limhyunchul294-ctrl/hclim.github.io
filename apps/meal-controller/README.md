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

## 유튜브 (아이 시청용)

1. **주소/ID 붙여넣기** — API 키 없이 재생 (oEmbed로 제목·썸네일)
2. **검색** — `VITE_YOUTUBE_API_KEY` 가 빌드에 있을 때만 (YouTube Data API v3, `safeSearch=strict`)
3. 최근 본 영상은 `localStorage`에 저장
4. 저작 상태머신이 IFrame `playVideo` / `pauseVideo` 를 제어합니다

키 설정: `apps/meal-controller/.env.example` 참고. Vercel 환경 변수에
`VITE_YOUTUBE_API_KEY` 추가 후 재배포.

임베드 제한: 일부 연령 제한·임베드 금지 영상은 재생되지 않을 수 있습니다.
referrer/origin이 맞아야 IFrame API가 안정적입니다.

## 건성안 알림

깜빡임이 `T_noblink`(기본 12초) 동안 없으면 영상 화면 전체에
「눈을 깜빡여 주세요」 오버레이. 깜빡이면 자동으로 사라집니다.
저작 pause와 분리(기본). 세밀 설정의 옵션으로 영상 정지도 가능.

## 프라이버시

온디바이스 MediaPipe Face Landmarker. 카메라 프레임은 서버로 업로드되지 않습니다.
설정은 `localStorage`에만 저장됩니다. HTTPS + 카메라 권한 필요.
