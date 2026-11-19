import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CameraFeed } from './components/CameraFeed'
import { CameraPanel } from './components/CameraPanel'
import { ControllerTransport } from './components/ControllerTransport'
import { PairingPanel } from './components/PairingPanel'
import {
  PlaybackStage,
  type PlaybackSource,
} from './components/PlaybackStage'
import { SettingsPanel } from './components/SettingsPanel'
import { StatusBadges } from './components/StatusBadges'
import { YoutubePicker } from './components/YoutubePicker'
import { useCameraLandmarker } from './hooks/useCameraLandmarker'
import { useRoomSync } from './hooks/useRoomSync'
import { useStandaloneDisplay } from './hooks/useStandaloneDisplay'
import { useWakeLock } from './hooks/useWakeLock'
import { BlinkTracker } from './lib/blinkScore'
import { MultiFaceChew } from './lib/multiFaceChew'
import { PlayerStateMachine } from './lib/playerStateMachine'
import {
  parseRoleFromUrl,
  writeRoleToUrl,
  type AppRole,
} from './lib/roomCode'
import { EMPTY_REMOTE_STATE, type RemoteControlState } from './lib/roomSyncTypes'
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
  const initial = parseRoleFromUrl()
  const [role, setRole] = useState<AppRole>(initial.role)
  const [room, setRoom] = useState<string | null>(initial.room)

  const [enabled, setEnabled] = useState(false)
  const [settings, setSettings] = useState<ControllerSettings>(() =>
    loadSettings(),
  )
  const [mediaMode, setMediaMode] = useState<MediaMode>('youtube')
  const [ytMeta, setYtMeta] = useState<YtVideoMeta | null>(null)
  const [localSrc, setLocalSrc] = useState<string | null>(null)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [manualPaused, setManualPaused] = useState(false)
  /** Parent 「재생」 boost — TV plays until pause or chew FSM auto-pauses. */
  const [forcePlay, setForcePlay] = useState(false)
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

  const isController = role === 'controller'
  const isViewer = role === 'viewer'
  const isCombined = role === 'combined'
  /** Camera runs on combined + controller only. */
  const cameraEnabled = enabled && !isViewer

  useWakeLock(cameraEnabled)
  const isStandalone = useStandaloneDisplay()

  useEffect(() => {
    settingsRef.current = settings
    saveSettings(settings)
  }, [settings])

  useEffect(() => {
    writeRoleToUrl(role, room)
  }, [role, room])

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

  const { videoRef, canvasRef, status, faceLost, faceCount, streamInfo } =
    useCameraLandmarker({
      // Controller: always show mesh while session runs so parents can tune
      showMesh:
        settings.showMesh ||
        settings.showRecognitionPreview ||
        (isController && cameraEnabled),
      cameraZoom: settings.cameraZoom,
      onFrame,
      enabled: cameraEnabled,
    })

  // Chew FSM auto-pause wins over parent 「재생」 boost (only on transition → PAUSED)
  const prevPhaseRef = useRef(machine.phase)
  useEffect(() => {
    const prev = prevPhaseRef.current
    prevPhaseRef.current = machine.phase
    if (forcePlay && prev !== 'PAUSED' && machine.phase === 'PAUSED') {
      setForcePlay(false)
    }
  }, [forcePlay, machine.phase])

  const dryEyeBlocksPlay =
    settings.pauseOnDryEye && blink.needsBlinkNudge && cameraEnabled

  const showFriendNudge = cameraEnabled && missingBuddy

  const localWantPlay =
    cameraEnabled &&
    !dryEyeBlocksPlay &&
    !manualPaused &&
    !missingBuddy &&
    (forcePlay || machine.shouldPlay)

  const outbound: RemoteControlState | null = useMemo(() => {
    if (!isController) return null
    return {
      v: 1,
      shouldPlay: localWantPlay,
      showChewNudge: machine.showNudge && cameraEnabled && !manualPaused,
      showBlinkNudge: blink.needsBlinkNudge && cameraEnabled,
      showFriendNudge,
      phase: machine.phase,
      isChewing: chew.isChewing,
      faceCount,
      faceMode: settings.faceMode,
      resumeNeed: settings.resumeCycles,
      resumeHave: machine.resumeProgress,
      secSinceLastBlink: blink.secSinceLastBlink,
      ts: Date.now(),
    }
  }, [
    isController,
    localWantPlay,
    machine.showNudge,
    machine.phase,
    machine.resumeProgress,
    cameraEnabled,
    manualPaused,
    blink.needsBlinkNudge,
    blink.secSinceLastBlink,
    showFriendNudge,
    chew.isChewing,
    faceCount,
    settings.faceMode,
    settings.resumeCycles,
  ])

  const {
    status: syncStatus,
    error: syncError,
    peerConnected,
    remote,
  } = useRoomSync({
    room,
    role: isCombined ? null : role,
    outbound,
    enabled: !isCombined && Boolean(room),
  })

  const remoteState = remote ?? EMPTY_REMOTE_STATE

  const statusLabel = isViewer
    ? peerConnected
      ? '휴대폰 인식 연결됨'
      : '휴대폰 연결을 기다려요'
    : status.kind === 'idle'
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

  const playbackSource: PlaybackSource | null =
    mediaMode === 'youtube' && ytMeta
      ? { kind: 'youtube', videoId: ytMeta.id }
      : mediaMode === 'local' && localSrc
        ? { kind: 'local', src: localSrc }
        : null

  const stageShouldPlay = isViewer
    ? remoteState.shouldPlay && !manualPaused
    : localWantPlay

  const stageChewNudge = isViewer
    ? remoteState.showChewNudge && !manualPaused
    : machine.showNudge && cameraEnabled && !manualPaused

  const stageBlinkNudge = isViewer
    ? remoteState.showBlinkNudge
    : blink.needsBlinkNudge && cameraEnabled

  const stageFriendNudge = isViewer
    ? remoteState.showFriendNudge
    : showFriendNudge

  const badgePhase = isViewer ? remoteState.phase : machine.phase
  const badgeChewing = isViewer ? remoteState.isChewing : chew.isChewing
  const badgeFaceMode = isViewer ? remoteState.faceMode : settings.faceMode
  const badgeFaceCount = isViewer
    ? remoteState.faceCount
    : cameraEnabled
      ? faceCount
      : 0
  const badgeMissing = isViewer ? remoteState.showFriendNudge : showFriendNudge

  const pipActive =
    isCombined &&
    settings.showRecognitionPreview &&
    cameraEnabled &&
    status.kind === 'ready'

  const enterController = (code: string) => {
    setEnabled(false)
    setManualPaused(false)
    setForcePlay(false)
    setRole('controller')
    setRoom(code)
  }

  const enterViewer = (code: string) => {
    setEnabled(false)
    setManualPaused(false)
    setForcePlay(false)
    setRole('viewer')
    setRoom(code)
  }

  const leaveSplit = () => {
    setEnabled(false)
    setForcePlay(false)
    setRole('combined')
    setRoom(null)
  }

  const onParentPause = () => {
    setManualPaused(true)
    setForcePlay(false)
  }

  const onParentPlay = () => {
    setManualPaused(false)
    setForcePlay(true)
  }

  const tagline = isController
    ? '이 휴대폰으로 얼굴을 봐요'
    : isViewer
      ? '이 화면에서 영상을 봐요'
      : '씹으면 나와요 · 깜빡깜빡도 해요'

  return (
    <div className={`app role-${role}`}>
      <header className="app-header">
        <p className="brand">냠냠 시청</p>
        <p className="tagline">{tagline}</p>
      </header>

      <main className="app-main layout-m2">
        <div className="col-media">
          {isController ? (
            <div className="controller-hero">
              <p className="controller-hero-label">인식 카메라 (이 휴대폰)</p>
              <CameraPanel
                videoRef={videoRef}
                canvasRef={canvasRef}
                faceLost={cameraEnabled && status.kind === 'ready' && faceLost}
                missingBuddy={showFriendNudge}
                statusLabel={statusLabel}
                showFeed
                streamInfo={cameraEnabled ? streamInfo : null}
                note={
                  peerConnected
                    ? '영상 화면에 연결됐어요. 아래 재생·일시정지가 TV로 가요.'
                    : '영상 화면이 코드를 입력하기를 기다려요.'
                }
              />
              <ControllerTransport
                sessionOn={cameraEnabled}
                broadcastingPlay={localWantPlay}
                manualPaused={manualPaused}
                peerConnected={peerConnected}
                onPause={onParentPause}
                onPlay={onParentPlay}
              />
              {room ? (
                <p className="controller-stage-code subtle">코드 {room}</p>
              ) : null}
            </div>
          ) : (
            <PlaybackStage
              source={playbackSource}
              shouldPlay={stageShouldPlay}
              showChewNudge={stageChewNudge}
              showBlinkNudge={stageBlinkNudge}
              showFriendNudge={stageFriendNudge}
              resumeNeed={
                isViewer ? remoteState.resumeNeed : settings.resumeCycles
              }
              resumeHave={
                isViewer ? remoteState.resumeHave : machine.resumeProgress
              }
              secSinceLastBlink={
                isViewer
                  ? remoteState.secSinceLastBlink
                  : blink.secSinceLastBlink
              }
              showHud={settings.showDebug && (isViewer || cameraEnabled)}
              hud={{
                jawOpen: latest?.jawOpen ?? 0,
                chewScore: chew.score,
                isChewing: badgeChewing,
                phase: badgePhase,
                noChewSec: machine.noChewSec,
                effectivePauseSec: machine.effectivePauseSec,
              }}
              recognitionSlot={
                pipActive ? (
                  <CameraFeed
                    videoRef={videoRef}
                    canvasRef={canvasRef}
                    faceLost={faceLost}
                    missingBuddy={showFriendNudge}
                    variant="pip"
                  />
                ) : null
              }
              onManualPause={onParentPause}
              onManualPlay={onParentPlay}
            />
          )}

          {isCombined ? (
            <CameraPanel
              videoRef={videoRef}
              canvasRef={canvasRef}
              faceLost={cameraEnabled && status.kind === 'ready' && faceLost}
              missingBuddy={showFriendNudge}
              statusLabel={statusLabel}
              showFeed={!pipActive}
              streamInfo={cameraEnabled ? streamInfo : null}
              note={
                pipActive
                  ? '인식 화면은 영상 오른쪽 위에 작게 보여요.'
                  : undefined
              }
            />
          ) : null}

          {isViewer ? (
            <p className="viewer-camera-note">{statusLabel}</p>
          ) : null}
        </div>

        <aside className="side-panel">
          <StatusBadges
            phase={badgePhase}
            isChewing={badgeChewing}
            faceMode={badgeFaceMode}
            faceCount={badgeFaceCount}
            missingBuddy={badgeMissing}
          />

          <PairingPanel
            role={role}
            room={room}
            peerConnected={peerConnected}
            syncStatus={syncStatus}
            syncError={syncError}
            onEnterController={enterController}
            onEnterViewer={enterViewer}
            onLeaveSplit={leaveSplit}
          />

          <h2>{isViewer ? '영상 고르기' : '같이 먹어요'}</h2>

          {!isViewer && (
            <>
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
                    setForcePlay(false)
                    setEnabled(true)
                  }}
                  disabled={cameraEnabled && status.kind !== 'error'}
                >
                  시작
                </button>
                <button
                  type="button"
                  className="btn btn-stop"
                  onClick={() => {
                    setEnabled(false)
                    setForcePlay(false)
                    setManualPaused(false)
                  }}
                  disabled={!cameraEnabled}
                >
                  중지
                </button>
              </div>
            </>
          )}

          {!isStandalone && !isViewer && (
            <p className="a2hs-tip" role="note">
              Safari에서는 주소창이 남을 수 있어요. 주소창을 없애려면{' '}
              <strong>공유 → 홈 화면에 추가</strong> 한 뒤, 홈 아이콘으로
              열어 주세요. 앱처럼 전체 화면으로 나와요.
            </p>
          )}

          {isCombined && (
            <label className="check-row preview-toggle">
              <input
                type="checkbox"
                checked={settings.showRecognitionPreview}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    showRecognitionPreview: e.target.checked,
                  }))
                }
              />
              인식 화면 보기
              <span className="preview-toggle-hint">
                (켜면 영상 위에 작게 보여요 · 기본 꺼짐)
              </span>
            </label>
          )}

          {!isController && (
            <>
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
                      onChange={(e) =>
                        onPickFile(e.target.files?.[0] ?? null)
                      }
                    />
                  </label>
                </div>
              )}

              {ytMeta && mediaMode === 'youtube' && (
                <p className="now-playing">지금: {ytMeta.title}</p>
              )}
            </>
          )}

          {!isViewer && (
            <SettingsPanel
              key={isController ? 'settings-controller' : 'settings-combined'}
              settings={settings}
              onChange={setSettings}
              habitualGapSec={chew.habitualGapSec}
              effectivePauseSec={machine.effectivePauseSec}
              defaultOpen={isController}
            />
          )}

          {settings.showDebug && !isViewer && (
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
            {isController
              ? '시작 → 인식 화면을 보고 설정을 맞춰요. 재생·일시정지는 TV로 보내요. 씹기 자동 멈춤은 그대로예요.'
              : isViewer
                ? '유튜브를 고른 뒤, 휴대폰에서 시작을 누르면 씹을 때 재생돼요.'
                : '시작 → 얼굴 비추고 씹어요. 화면 가장자리를 누르면 일시정지·전체화면이 잠깐 보여요.'}
          </p>

          <p className="privacy">
            얼굴은 인식하는 기기에서만 봐요. 유튜브 재생은 YouTube로 연결돼요.
          </p>
        </aside>
      </main>
    </div>
  )
}

export default App
