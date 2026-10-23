import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CameraPanel } from './components/CameraPanel'
import {
  PlaybackStage,
  type PlaybackSource,
} from './components/PlaybackStage'
import { SettingsPanel } from './components/SettingsPanel'
import { StatusBadges } from './components/StatusBadges'
import { YoutubePicker } from './components/YoutubePicker'
import { useCameraLandmarker } from './hooks/useCameraLandmarker'
import { BlinkTracker } from './lib/blinkScore'
import { ChewScorer } from './lib/chewScore'
import { PlayerStateMachine } from './lib/playerStateMachine'
import { loadSettings, saveSettings } from './lib/settingsStorage'
import type { YtVideoMeta } from './lib/youtube'
import {
  type BlinkSnapshot,
  type ChewSnapshot,
  type ControllerSettings,
  type FaceFrame,
  type PlayerPhase,
} from './lib/types'
import './App.css'

/** CC0 flower clip — secondary local option. */
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

type MediaMode = 'youtube' | 'local'

function App() {
  const [enabled, setEnabled] = useState(false)
  const [settings, setSettings] = useState<ControllerSettings>(() =>
    loadSettings(),
  )
  const [mediaMode, setMediaMode] = useState<MediaMode>('youtube')
  const [ytMeta, setYtMeta] = useState<YtVideoMeta | null>(null)
  const [localSrc, setLocalSrc] = useState<string | null>(null)
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
    setLocalSrc(url)
    setMediaMode('local')
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

  const playbackSource: PlaybackSource | null =
    mediaMode === 'youtube' && ytMeta
      ? { kind: 'youtube', videoId: ytMeta.id }
      : mediaMode === 'local' && localSrc
        ? { kind: 'local', src: localSrc }
        : null

  const wantPlay = machine.shouldPlay && enabled && !dryEyeBlocksPlay

  return (
    <div className="app">
      <header className="app-header">
        <p className="brand">식사 중 영상시청 컨트롤러</p>
        <p className="tagline">
          유튜브를 보며 씹어요 · 깜빡임도 챙기세요 · 온디바이스
        </p>
      </header>

      <main className="app-main layout-m2">
        <div className="col-media">
          <PlaybackStage
            source={playbackSource}
            shouldPlay={wantPlay}
            showChewNudge={machine.showNudge && enabled}
            showBlinkNudge={blink.needsBlinkNudge && enabled}
            resumeNeed={settings.resumeCycles}
            resumeHave={machine.resumeProgress}
            secSinceLastBlink={blink.secSinceLastBlink}
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

          <div className="mode-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mediaMode === 'youtube'}
              className={`btn ${mediaMode === 'youtube' ? 'primary' : ''}`}
              onClick={() => setMediaMode('youtube')}
            >
              유튜브
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mediaMode === 'local'}
              className={`btn ${mediaMode === 'local' ? 'primary' : ''}`}
              onClick={() => setMediaMode('local')}
            >
              내 파일
            </button>
          </div>

          {mediaMode === 'youtube' ? (
            <YoutubePicker
              activeId={ytMeta?.id ?? null}
              onSelect={(meta) => {
                setYtMeta(meta)
                setMediaMode('youtube')
              }}
            />
          ) : (
            <div className="file-row">
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setLocalSrc(SAMPLE_VIDEO)
                  setMediaMode('local')
                }}
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
          )}

          {ytMeta && mediaMode === 'youtube' && (
            <p className="now-playing">지금: {ytMeta.title}</p>
          )}

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
                <dt>무저작</dt>
                <dd>{machine.noChewSec.toFixed(1)}s</dd>
              </div>
              {pauseHint != null && (
                <div>
                  <dt>pause까지</dt>
                  <dd>{pauseHint}s</dd>
                </div>
              )}
              <div>
                <dt>깜빡임/분</dt>
                <dd>{blink.blinkRatePerMin.toFixed(1)}</dd>
              </div>
              <div>
                <dt>마지막 깜빡임</dt>
                <dd>{blink.secSinceLastBlink.toFixed(1)}s 전</dd>
              </div>
            </dl>
          )}

          <p className="hint">
            씹으면 유튜브가 재생되고, 멈추면 화면이 커다랗게 「한 입 더」를
            보여 줍니다. 오래 깜빡이지 않으면 「눈을 깜빡여 주세요」가 영상 위에
            뜹니다.
          </p>

          <p className="privacy">
            프라이버시: 얼굴 감지는 <strong>온디바이스</strong>입니다. 유튜브
            재생은 YouTube에 연결됩니다. 설정·최근 영상은 이 기기
            localStorage에만 저장됩니다.
          </p>
        </aside>
      </main>
    </div>
  )
}

export default App
