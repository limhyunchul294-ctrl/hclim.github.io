import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CameraPanel } from './components/CameraPanel'
import { SettingsPanel } from './components/SettingsPanel'
import { StatusBadges } from './components/StatusBadges'
import { VideoPlayer } from './components/VideoPlayer'
import { useCameraLandmarker } from './hooks/useCameraLandmarker'
import { BlinkTracker } from './lib/blinkScore'
import { ChewScorer } from './lib/chewScore'
import { PlayerStateMachine } from './lib/playerStateMachine'
import { loadSettings, saveSettings } from './lib/settingsStorage'
import {
  type BlinkSnapshot,
  type ChewSnapshot,
  type ControllerSettings,
  type FaceFrame,
  type PlayerPhase,
} from './lib/types'
import './App.css'

/** CC0 flower clip — reliable for demo; user may replace with local file. */
const SAMPLE_VIDEO =
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'

type MachineView = {
  phase: PlayerPhase
  shouldPlay: boolean
  showNudge: boolean
  noChewSec: number
  resumeProgress: number
  effectivePauseSec: number
}

function App() {
  const [enabled, setEnabled] = useState(false)
  const [settings, setSettings] = useState<ControllerSettings>(() =>
    loadSettings(),
  )
  const [videoSrc, setVideoSrc] = useState<string | null>(SAMPLE_VIDEO)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)

  const [chew, setChew] = useState<ChewSnapshot>({
    score: 0,
    isChewing: false,
    cyclesInWindow: 0,
    amplitude: 0,
    habitualGapSec: 0,
  })
  const [machine, setMachine] = useState<MachineView>({
    phase: 'NO_FACE',
    shouldPlay: false,
    showNudge: false,
    noChewSec: 0,
    resumeProgress: 0,
    effectivePauseSec: settings.pauseDelaySec,
  })
  const [latest, setLatest] = useState<FaceFrame | null>(null)
  const [blink, setBlink] = useState<BlinkSnapshot>({
    blinkRatePerMin: 0,
    sessionBlinkCount: 0,
    secSinceLastBlink: 0,
    needsBlinkNudge: false,
    blinkLeft: 0,
    blinkRight: 0,
  })

  const scorerRef = useRef(new ChewScorer())
  const blinkRef = useRef(new BlinkTracker())
  const fsmRef = useRef(new PlayerStateMachine())
  const settingsRef = useRef(settings)

  useEffect(() => {
    settingsRef.current = settings
    saveSettings(settings)
  }, [settings])

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [objectUrl])

  const onFrame = useCallback((frame: FaceFrame) => {
    setLatest(frame)
    const snap = scorerRef.current.push(frame, settingsRef.current)
    setChew(snap)
    setBlink(blinkRef.current.push(frame, settingsRef.current))
    const out = fsmRef.current.step({
      nowMs: frame.timestampMs,
      hasFace: frame.hasFace,
      isChewing: snap.isChewing,
      newCycle: snap.newCycle,
      habitualGapSec: snap.habitualGapSec,
      settings: settingsRef.current,
    })
    setMachine({
      phase: out.phase,
      shouldPlay: out.shouldPlay,
      showNudge: out.showNudge,
      noChewSec: out.noChewSec,
      resumeProgress: out.resumeProgress,
      effectivePauseSec: out.effectivePauseSec,
    })
  }, [])

  const { videoRef, canvasRef, status, faceLost } = useCameraLandmarker({
    showMesh: settings.showMesh,
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

  const onPickFile = (file: File | null) => {
    if (!file) return
    if (objectUrl) URL.revokeObjectURL(objectUrl)
    const url = URL.createObjectURL(file)
    setObjectUrl(url)
    setVideoSrc(url)
  }

  const pauseHint = useMemo(() => {
    if (machine.phase !== 'PLAYING') return null
    const remain = Math.max(
      0,
      machine.effectivePauseSec - machine.noChewSec,
    )
    return remain.toFixed(1)
  }, [machine.phase, machine.noChewSec, machine.effectivePauseSec])

  const dryEyeBlocksPlay =
    settings.pauseOnDryEye && blink.needsBlinkNudge && enabled

  return (
    <div className="app">
      <header className="app-header">
        <p className="brand">식사 중 영상시청 컨트롤러</p>
        <p className="tagline">저작할 때만 영상이 재생됩니다 · 온디바이스</p>
      </header>

      <main className="app-main layout-m2">
        <div className="col-media">
          <VideoPlayer
            src={videoSrc}
            shouldPlay={machine.shouldPlay && enabled && !dryEyeBlocksPlay}
            showNudge={machine.showNudge}
            resumeNeed={settings.resumeCycles}
            resumeHave={machine.resumeProgress}
          />
          <CameraPanel
            videoRef={videoRef}
            canvasRef={canvasRef}
            faceLost={enabled && status.kind === 'ready' && faceLost}
            statusLabel={statusLabel}
          />
        </div>

        <aside className="side-panel">
          <StatusBadges phase={machine.phase} isChewing={chew.isChewing} />
          <h2>식사 중 시청 제어</h2>

          {blink.needsBlinkNudge && (
            <div className="dryeye-nudge" role="status">
              <p className="dryeye-title">눈을 깜빡여 주세요</p>
              <p className="dryeye-sub">
                {blink.secSinceLastBlink.toFixed(1)}초 동안 깜빡임이 없어요.
                화면만 보면 눈이 건조해질 수 있습니다
                {settings.pauseOnDryEye ? ' · 선택 옵션으로 재생도 멈춤' : ''}
              </p>
            </div>
          )}

          <div className="btn-row">
            <button
              type="button"
              className="btn primary"
              onClick={() => {
                scorerRef.current.reset()
                blinkRef.current.reset()
                fsmRef.current.reset()
                setEnabled(true)
              }}
              disabled={enabled && status.kind !== 'error'}
            >
              시작
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

          <div className="file-row">
            <button
              type="button"
              className="btn"
              onClick={() => setVideoSrc(SAMPLE_VIDEO)}
            >
              샘플 영상
            </button>
            <label className="btn file-btn">
              파일 선택
              <input
                type="file"
                accept="video/*"
                hidden
                onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <SettingsPanel
            settings={settings}
            onChange={setSettings}
            habitualGapSec={chew.habitualGapSec}
            effectivePauseSec={machine.effectivePauseSec}
          />

          <div className="check-grid">
            <label className="check-row">
              <input
                type="checkbox"
                checked={settings.showMesh}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, showMesh: e.target.checked }))
                }
              />
              얼굴 메시
            </label>
            <label className="check-row">
              <input
                type="checkbox"
                checked={settings.showDebug}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, showDebug: e.target.checked }))
                }
              />
              디버그 수치
            </label>
          </div>

          {settings.showDebug && (
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
                <dt>chewScore</dt>
                <dd>{chew.score.toFixed(2)}</dd>
              </div>
              <div>
                <dt>진폭</dt>
                <dd>{chew.amplitude.toFixed(3)}</dd>
              </div>
              <div>
                <dt>cycles / 창</dt>
                <dd>{chew.cyclesInWindow}</dd>
              </div>
              <div>
                <dt>무저작</dt>
                <dd>{machine.noChewSec.toFixed(1)}s</dd>
              </div>
              <div>
                <dt>실효 pause</dt>
                <dd>{machine.effectivePauseSec.toFixed(1)}s</dd>
              </div>
              {pauseHint != null && (
                <div>
                  <dt>pause까지</dt>
                  <dd>{pauseHint}s</dd>
                </div>
              )}
              <div>
                <dt>깜빡임 (세션)</dt>
                <dd>{blink.sessionBlinkCount}</dd>
              </div>
              <div>
                <dt>깜빡임/분</dt>
                <dd>{blink.blinkRatePerMin.toFixed(1)}</dd>
              </div>
              <div>
                <dt>마지막 깜빡임</dt>
                <dd>{blink.secSinceLastBlink.toFixed(1)}s 전</dd>
              </div>
              <div>
                <dt>eyeBlink L/R</dt>
                <dd>
                  {blink.blinkLeft.toFixed(2)} / {blink.blinkRight.toFixed(2)}
                </dd>
              </div>
            </dl>
          )}

          <p className="hint">
            주기적으로 씹으면 재생되고, 약{' '}
            {machine.effectivePauseSec.toFixed(1)}초 멈추면 일시정지됩니다.
            깜빡이지 않고 {settings.noBlinkWarnSec.toFixed(0)}초가 지나면 건성안
            알림이 뜹니다(기본은 재생과 무관).
          </p>

          <p className="privacy">
            프라이버시: MediaPipe Face Landmarker가 <strong>온디바이스</strong>
            에서만 동작합니다. 카메라 프레임·랜드마크는 서버로 업로드되지
            않습니다. 설정은 이 기기의 localStorage에만 저장됩니다.
          </p>
        </aside>
      </main>
    </div>
  )
}

export default App
