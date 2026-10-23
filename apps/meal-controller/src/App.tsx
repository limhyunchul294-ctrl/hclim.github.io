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
import { useWakeLock } from './hooks/useWakeLock'
import { BlinkTracker } from './lib/blinkScore'
import { MultiFaceChew } from './lib/multiFaceChew'
import { PlayerStateMachine } from './lib/playerStateMachine'
import { loadSettings, saveSettings } from './lib/settingsStorage'
import type { YtVideoMeta } from './lib/youtube'
import {
  type BlinkSnapshot,
  type ChewSnapshot,
  type ControllerSettings,
  type FaceFrame,
  type FaceMode,
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

const emptyBlink = (): BlinkSnapshot => ({
  blinkRatePerMin: 0,
  sessionBlinkCount: 0,
  secSinceLastBlink: 0,
  needsBlinkNudge: false,
  blinkLeft: 0,
  blinkRight: 0,
})

function App() {
  const [enabled, setEnabled] = useState(false)
  const [settings, setSettings] = useState<ControllerSettings>(() =>
    loadSettings(),
  )
  const [mediaMode, setMediaMode] = useState<MediaMode>('youtube')
  const [ytMeta, setYtMeta] = useState<YtVideoMeta | null>(null)
  const [localSrc, setLocalSrc] = useState<string | null>(null)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [manualPaused, setManualPaused] = useState(false)
  const [missingBuddy, setMissingBuddy] = useState(false)

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
  const [blink, setBlink] = useState<BlinkSnapshot>(emptyBlink)

  const multiChewRef = useRef(new MultiFaceChew())
  const blinkRefs = useRef([new BlinkTracker(), new BlinkTracker()])
  const fsmRef = useRef(new PlayerStateMachine())
  const settingsRef = useRef(settings)

  useWakeLock(enabled)

  useEffect(() => {
    settingsRef.current = settings
    saveSettings(settings)
  }, [settings])

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [objectUrl])

  const setFaceMode = (mode: FaceMode) => {
    setSettings((s) => ({ ...s, faceMode: mode }))
    multiChewRef.current.reset()
    blinkRefs.current.forEach((b) => b.reset())
    fsmRef.current.reset()
  }

  const onFrame = useCallback((frame: FaceFrame) => {
    setLatest(frame)
    const s = settingsRef.current
    const agg = multiChewRef.current.push(frame, s, s.faceMode)
    setChew(agg)
    setMissingBuddy(agg.missingBuddy)

    // Blink: any required face staring → nudge
    let blinkSnap = emptyBlink()
    if (agg.facesReady) {
      const snaps = []
      for (let i = 0; i < s.faceMode; i++) {
        const face = frame.faces[i]
        snaps.push(
          blinkRefs.current[i].push(
            {
              ...frame,
              hasFace: true,
              jawOpen: face.jawOpen,
              mouthSmile: face.mouthSmile,
              eyeBlinkLeft: face.eyeBlinkLeft,
              eyeBlinkRight: face.eyeBlinkRight,
              mar: face.mar,
              landmarks: face.landmarks,
              faceCount: 1,
              faces: [face],
            },
            s,
          ),
        )
      }
      blinkSnap = {
        blinkRatePerMin: Math.min(...snaps.map((x) => x.blinkRatePerMin)),
        sessionBlinkCount: snaps.reduce((a, x) => a + x.sessionBlinkCount, 0),
        secSinceLastBlink: Math.max(...snaps.map((x) => x.secSinceLastBlink)),
        needsBlinkNudge: snaps.some((x) => x.needsBlinkNudge),
        blinkLeft: snaps[0]?.blinkLeft ?? 0,
        blinkRight: snaps[0]?.blinkRight ?? 0,
      }
    }
    setBlink(blinkSnap)

    const out = fsmRef.current.step({
      nowMs: frame.timestampMs,
      hasFace: agg.facesReady,
      isChewing: agg.isChewing,
      newCycle: agg.newCycle,
      habitualGapSec: agg.habitualGapSec,
      settings: s,
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

  const { videoRef, canvasRef, status, faceLost, faceCount } =
    useCameraLandmarker({
      showMesh: settings.showMesh,
      onFrame,
      enabled,
    })

  const statusLabel =
    status.kind === 'idle'
      ? '시작을 눌러 주세요'
      : status.kind === 'loading'
        ? status.message
        : status.kind === 'error'
          ? status.message
          : missingBuddy
            ? '친구도 화면에 나와요'
            : faceLost
              ? '얼굴을 보여 주세요'
              : settings.faceMode === 2
                ? `얼굴 ${faceCount}/2`
                : '얼굴 보는 중'

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

  const wantPlay =
    machine.shouldPlay &&
    enabled &&
    !dryEyeBlocksPlay &&
    !manualPaused &&
    !missingBuddy

  const showFriendNudge = enabled && missingBuddy

  return (
    <div className="app">
      <header className="app-header">
        <p className="brand">식사 중 영상시청</p>
        <p className="tagline">씹으면 나와요 · 깜빡깜빡도 해요</p>
      </header>

      <main className="app-main layout-m2">
        <div className="col-media">
          <PlaybackStage
            source={playbackSource}
            shouldPlay={wantPlay}
            showChewNudge={machine.showNudge && enabled && !manualPaused}
            showBlinkNudge={blink.needsBlinkNudge && enabled}
            showFriendNudge={showFriendNudge}
            resumeNeed={settings.resumeCycles}
            resumeHave={machine.resumeProgress}
            secSinceLastBlink={blink.secSinceLastBlink}
            showHud={settings.showDebug && enabled}
            hud={{
              jawOpen: latest?.jawOpen ?? 0,
              chewScore: chew.score,
              isChewing: chew.isChewing,
              phase: machine.phase,
              noChewSec: machine.noChewSec,
              effectivePauseSec: machine.effectivePauseSec,
            }}
            onManualPause={() => setManualPaused(true)}
            onManualPlay={() => setManualPaused(false)}
          />
          <CameraPanel
            videoRef={videoRef}
            canvasRef={canvasRef}
            faceLost={enabled && status.kind === 'ready' && faceLost}
            missingBuddy={showFriendNudge}
            statusLabel={statusLabel}
          />
        </div>

        <aside className="side-panel">
          <StatusBadges
            phase={machine.phase}
            isChewing={chew.isChewing}
            faceMode={settings.faceMode}
            faceCount={enabled ? faceCount : 0}
            missingBuddy={showFriendNudge}
          />

          <h2>같이 먹어요</h2>

          <div className="face-mode" role="group" aria-label="몇 명인가요">
            <p className="face-mode-label">몇 명이 먹나요?</p>
            <div className="face-mode-tabs">
              <button
                type="button"
                className={`btn face-mode-btn ${settings.faceMode === 1 ? 'primary' : ''}`}
                aria-pressed={settings.faceMode === 1}
                onClick={() => setFaceMode(1)}
              >
                1명
              </button>
              <button
                type="button"
                className={`btn face-mode-btn ${settings.faceMode === 2 ? 'primary' : ''}`}
                aria-pressed={settings.faceMode === 2}
                onClick={() => setFaceMode(2)}
              >
                2명
              </button>
            </div>
            <p className="face-mode-rule">
              {settings.faceMode === 1
                ? '한 명이 씹어야 영상이 나와요.'
                : '두 명이 다 화면에 나오고, 둘 다 씹어야 영상이 나와요. 한 명만 보이면 「친구도 화면에 나와요」.'}
            </p>
          </div>

          <div className="btn-row start-row">
            <button
              type="button"
              className="btn primary btn-start"
              onClick={() => {
                multiChewRef.current.reset()
                blinkRefs.current.forEach((b) => b.reset())
                fsmRef.current.reset()
                setManualPaused(false)
                setEnabled(true)
              }}
              disabled={enabled && status.kind !== 'error'}
            >
              시작
            </button>
            <button
              type="button"
              className="btn btn-stop"
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

          {settings.showDebug && (
            <dl className="metrics">
              <div>
                <dt>faces</dt>
                <dd>
                  {latest?.faceCount ?? 0}/{settings.faceMode}
                </dd>
              </div>
              <div>
                <dt>jawOpen</dt>
                <dd>{(latest?.jawOpen ?? 0).toFixed(3)}</dd>
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
                <dt>깜빡임</dt>
                <dd>{blink.secSinceLastBlink.toFixed(1)}s 전</dd>
              </div>
            </dl>
          )}

          <p className="hint">
            <strong>시작</strong> → 얼굴 비추고 씹어요. 화면 가장자리를
            누르면 일시정지·전체화면이 잠깐 보여요.
          </p>

          <p className="privacy">
            얼굴은 이 기기에서만 봐요. 유튜브 재생은 YouTube로 연결돼요.
          </p>
        </aside>
      </main>
    </div>
  )
}

export default App
