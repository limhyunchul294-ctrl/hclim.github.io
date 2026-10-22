import { useCallback, useState } from 'react'
import { CameraPanel } from './components/CameraPanel'
import { useCameraLandmarker } from './hooks/useCameraLandmarker'
import type { FaceFrame } from './lib/types'
import './App.css'

function App() {
  const [latest, setLatest] = useState<FaceFrame | null>(null)
  const [enabled, setEnabled] = useState(false)
  const [showMesh, setShowMesh] = useState(true)

  const onFrame = useCallback((frame: FaceFrame) => {
    setLatest(frame)
  }, [])

  const { videoRef, canvasRef, status, faceLost } = useCameraLandmarker({
    showMesh,
    onFrame,
    enabled,
  })

  const statusLabel =
    status.kind === 'idle'
      ? '카메라를 시작해 주세요'
      : status.kind === 'loading'
        ? status.message
        : status.kind === 'error'
          ? status.message
          : faceLost
            ? '얼굴 없음'
            : '얼굴 감지 중'

  return (
    <div className="app">
      <header className="app-header">
        <p className="brand">식사 중 영상시청 컨트롤러</p>
        <p className="tagline">저작할 때만 영상이 재생됩니다 · 온디바이스</p>
      </header>

      <main className="app-main layout-m1">
        <CameraPanel
          videoRef={videoRef}
          canvasRef={canvasRef}
          faceLost={enabled && status.kind === 'ready' && faceLost}
          statusLabel={statusLabel}
        />

        <aside className="side-panel">
          <h2>M1 · 카메라 + Face Landmarker</h2>
          <div className="btn-row">
            <button
              type="button"
              className="btn primary"
              onClick={() => setEnabled(true)}
              disabled={enabled && status.kind !== 'error'}
            >
              카메라 시작
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => setEnabled(false)}
              disabled={!enabled}
            >
              중지
            </button>
          </div>

          <label className="check-row">
            <input
              type="checkbox"
              checked={showMesh}
              onChange={(e) => setShowMesh(e.target.checked)}
            />
            얼굴 메시 오버레이
          </label>

          <dl className="metrics">
            <div>
              <dt>jawOpen</dt>
              <dd>{(latest?.jawOpen ?? 0).toFixed(3)}</dd>
            </div>
            <div>
              <dt>MAR</dt>
              <dd>{(latest?.mar ?? 0).toFixed(3)}</dd>
            </div>
            <div>
              <dt>얼굴</dt>
              <dd>{latest?.hasFace ? '있음' : '없음'}</dd>
            </div>
          </dl>

          <p className="privacy">
            카메라 프레임은 기기 안에서만 처리됩니다. 서버로 업로드되지 않습니다.
          </p>
        </aside>
      </main>
    </div>
  )
}

export default App
