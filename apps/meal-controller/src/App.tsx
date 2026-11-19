import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CameraFeed } from './components/CameraFeed'
import { CameraPanel } from './components/CameraPanel'
import { ControllerTransport } from './components/ControllerTransport'
import { PairingPanel } from './components/PairingPanel'
import {
  PlaybackStage,
  type PlaybackSource,
} from './components/PlaybackStage'
import { RemoteCameraPreview } from './components/RemoteCameraPreview'
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
import { PostureTracker, type PostureSnapshot } from './lib/postureScore'
import {
  capturePreviewJpeg,
  PREVIEW_INTERVAL_MS,
} from './lib/previewFrame'
import {
  parseRoleFromUrl,
  writeRoleToUrl,
  type AppRole,
} from './lib/roomCode'
import {
  EMPTY_DETECT,
  type CommandBroadcast,
  type DetectBroadcast,
  type PreviewBroadcast,
} from './lib/roomSyncTypes'
import { loadSettings, saveSettings } from './lib/settingsStorage'
import type { YtVideoMeta } from './lib/youtube'
import {
  type BlinkSnapshot,
  type ChewSnapshot,
  type ControllerSettings,
  type FaceFrame,
  type FaceMode,
  type PlayerPhase,
  type SessionMode,
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

const emptyPosture = (): PostureSnapshot => ({
  pitchProxy: 0,
  score: 0.35,
  badSec: 0,
  needsPostureNudge: false,
})

function settingsEqual(a: ControllerSettings, b: ControllerSettings): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

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
  /** Parent 「재생」 boost — plays until pause or chew FSM auto-pauses. */
  const [forcePlay, setForcePlay] = useState(false)
  const [missingBuddy, setMissingBuddy] = useState(false)
  /** Phone: request JPEG thumbnails of the viewer recognition camera. */
  const [wantViewerPreview, setWantViewerPreview] = useState(false)
  const [outboundPreview, setOutboundPreview] =
    useState<PreviewBroadcast | null>(null)

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
  const [posture, setPosture] = useState<PostureSnapshot>(emptyPosture)

  const multiChewRef = useRef(new MultiFaceChew())
  const blinkRefs = useRef([new BlinkTracker(), new BlinkTracker()])
  const postureRef = useRef(new PostureTracker())
  const fsmRef = useRef(new PlayerStateMachine())
  const settingsRef = useRef(settings)
  const lastAppliedCmdTs = useRef(0)

  const isController = role === 'controller'
  const isViewer = role === 'viewer'
  const isCombined = role === 'combined'
  /**
   * Camera + MediaPipe run on combined + viewer (TV/iPad).
   * Phone controller is remote-only — no local face pipeline.
   */
  const cameraEnabled = enabled && !isController

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
    postureRef.current.reset()
    fsmRef.current.reset()
  }

  const setSessionMode = (mode: SessionMode) => {
    setSettings((s) => ({ ...s, sessionMode: mode }))
    multiChewRef.current.reset()
    blinkRefs.current.forEach((b) => b.reset())
    postureRef.current.reset()
    fsmRef.current.reset()
    setForcePlay(false)
    setManualPaused(false)
  }

  const onFrame = useCallback((frame: FaceFrame) => {
    setLatest(frame)
    const s = settingsRef.current
    const isWatch = s.sessionMode === 'watch'
    const agg = multiChewRef.current.push(frame, s, s.faceMode)
    setChew(agg)
    setMissingBuddy(isWatch ? false : agg.missingBuddy)

    let blinkSnap = emptyBlink()
    if (frame.hasFace) {
      const n = isWatch ? 1 : s.faceMode
      const snaps = []
      for (let i = 0; i < n; i++) {
        const face = frame.faces[i] ?? frame.faces[0]
        if (!face) break
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
      if (snaps.length) {
        blinkSnap = {
          blinkRatePerMin: Math.min(...snaps.map((x) => x.blinkRatePerMin)),
          sessionBlinkCount: snaps.reduce((a, x) => a + x.sessionBlinkCount, 0),
          secSinceLastBlink: Math.max(...snaps.map((x) => x.secSinceLastBlink)),
          needsBlinkNudge: snaps.some((x) => x.needsBlinkNudge),
          blinkLeft: snaps[0]?.blinkLeft ?? 0,
          blinkRight: snaps[0]?.blinkRight ?? 0,
        }
      }
    }
    setBlink(blinkSnap)

    const postureSnap = postureRef.current.push(frame, s)
    setPosture(postureSnap)

    const out = fsmRef.current.step({
      nowMs: frame.timestampMs,
      hasFace: isWatch ? frame.hasFace : agg.facesReady,
      isChewing: isWatch ? true : agg.isChewing,
      newCycle: isWatch ? false : agg.newCycle,
      habitualGapSec: agg.habitualGapSec,
      settings: s,
    })
    setMachine({
      phase: out.phase,
      shouldPlay: out.shouldPlay,
      showNudge: isWatch ? false : out.showNudge,
      noChewSec: out.noChewSec,
      resumeProgress: out.resumeProgress,
      effectivePauseSec: out.effectivePauseSec,
    })
  }, [])

  const { videoRef, canvasRef, status, faceLost, faceCount, streamInfo } =
    useCameraLandmarker({
      showMesh:
        settings.showMesh ||
        settings.showRecognitionPreview ||
        (isViewer && cameraEnabled),
      cameraZoom: settings.cameraZoom,
      onFrame,
      enabled: cameraEnabled,
    })

  // Chew FSM auto-pause wins over parent 「재생」 boost
  const prevPhaseRef = useRef(machine.phase)
  useEffect(() => {
    const prev = prevPhaseRef.current
    prevPhaseRef.current = machine.phase
    if (forcePlay && prev !== 'PAUSED' && machine.phase === 'PAUSED') {
      setForcePlay(false)
    }
  }, [forcePlay, machine.phase])

  const isWatch = settings.sessionMode === 'watch'

  const dryEyeBlocksPlay =
    settings.pauseOnDryEye && blink.needsBlinkNudge && cameraEnabled

  const postureBlocksPlay =
    isWatch &&
    settings.pauseOnPosture &&
    posture.needsPostureNudge &&
    cameraEnabled

  const showFriendNudge = !isWatch && cameraEnabled && missingBuddy

  const showPostureNudge =
    isWatch && cameraEnabled && posture.needsPostureNudge

  const localWantPlay =
    cameraEnabled &&
    !dryEyeBlocksPlay &&
    !postureBlocksPlay &&
    !manualPaused &&
    (forcePlay ||
      (isWatch ? true : machine.shouldPlay && !missingBuddy))

  const outboundDetect: DetectBroadcast | null = useMemo(() => {
    if (!isViewer) return null
    return {
      v: 2,
      kind: 'detect',
      shouldPlay: localWantPlay,
      showChewNudge:
        !isWatch && machine.showNudge && cameraEnabled && !manualPaused,
      showBlinkNudge: blink.needsBlinkNudge && cameraEnabled,
      showFriendNudge,
      showPostureNudge,
      phase: machine.phase,
      isChewing: chew.isChewing,
      faceCount,
      faceMode: settings.faceMode,
      resumeNeed: settings.resumeCycles,
      resumeHave: machine.resumeProgress,
      secSinceLastBlink: blink.secSinceLastBlink,
      sessionOn: cameraEnabled,
      ts: Date.now(),
    }
  }, [
    isViewer,
    isWatch,
    localWantPlay,
    machine.showNudge,
    machine.phase,
    machine.resumeProgress,
    cameraEnabled,
    manualPaused,
    blink.needsBlinkNudge,
    blink.secSinceLastBlink,
    showFriendNudge,
    showPostureNudge,
    chew.isChewing,
    faceCount,
    settings.faceMode,
    settings.resumeCycles,
  ])

  const outboundCommand: CommandBroadcast | null = useMemo(() => {
    if (!isController) return null
    return {
      v: 2,
      kind: 'command',
      forcePlay,
      manualPaused,
      settings,
      wantPreview: wantViewerPreview,
      ts: Date.now(),
    }
  }, [isController, forcePlay, manualPaused, settings, wantViewerPreview])

  const {
    status: syncStatus,
    error: syncError,
    peerConnected,
    remoteDetect,
    remoteCommand,
    remotePreview,
  } = useRoomSync({
    room,
    role: isCombined ? null : role,
    outboundDetect,
    outboundCommand,
    outboundPreview: isViewer ? outboundPreview : null,
    enabled: !isCombined && Boolean(room),
  })

  // Phone: drop preview request when unpaired (stops MQTT frames)
  useEffect(() => {
    if (!peerConnected && wantViewerPreview) {
      setWantViewerPreview(false)
    }
  }, [peerConnected, wantViewerPreview])

  // Viewer: stream JPEG thumbnails only while phone wants preview + paired + camera on
  const wantPreviewFromPhone = Boolean(remoteCommand?.wantPreview)
  useEffect(() => {
    if (
      !isViewer ||
      !wantPreviewFromPhone ||
      !peerConnected ||
      !cameraEnabled ||
      status.kind !== 'ready'
    ) {
      setOutboundPreview(null)
      return
    }

    let cancelled = false
    let busy = false
    const tick = async () => {
      if (cancelled || busy) return
      const canvas = canvasRef.current
      if (!canvas || !canvas.width) return
      busy = true
      try {
        const shot = await capturePreviewJpeg(canvas)
        if (cancelled || !shot) return
        setOutboundPreview({
          v: 2,
          kind: 'preview',
          mime: 'image/jpeg',
          data: shot.data,
          w: shot.w,
          h: shot.h,
          ts: Date.now(),
        })
      } finally {
        busy = false
      }
    }

    void tick()
    const id = window.setInterval(() => {
      void tick()
    }, PREVIEW_INTERVAL_MS)

    return () => {
      cancelled = true
      window.clearInterval(id)
      setOutboundPreview(null)
    }
  }, [
    isViewer,
    wantPreviewFromPhone,
    peerConnected,
    cameraEnabled,
    status.kind,
  ])

  // Viewer: apply phone forcePlay / manualPaused / settings
  useEffect(() => {
    if (!isViewer || !remoteCommand) return
    if (remoteCommand.ts && remoteCommand.ts <= lastAppliedCmdTs.current) return
    lastAppliedCmdTs.current = remoteCommand.ts

    setManualPaused(remoteCommand.manualPaused)
    if (remoteCommand.manualPaused) {
      setForcePlay(false)
    } else if (remoteCommand.forcePlay) {
      setForcePlay(true)
    }

    if (
      remoteCommand.settings &&
      !settingsEqual(remoteCommand.settings, settingsRef.current)
    ) {
      setSettings(remoteCommand.settings)
      settingsRef.current = remoteCommand.settings
    }
  }, [isViewer, remoteCommand])

  // Phone: clear local forcePlay when viewer FSM auto-pauses
  const prevRemotePhaseRef = useRef<PlayerPhase | null>(null)
  useEffect(() => {
    if (!isController || !remoteDetect) return
    const prev = prevRemotePhaseRef.current
    prevRemotePhaseRef.current = remoteDetect.phase
    if (
      forcePlay &&
      prev != null &&
      prev !== 'PAUSED' &&
      remoteDetect.phase === 'PAUSED'
    ) {
      setForcePlay(false)
    }
  }, [isController, remoteDetect, forcePlay])

  const detectState = remoteDetect ?? EMPTY_DETECT

  const statusLabel = isController
    ? peerConnected
      ? detectState.sessionOn
        ? detectState.phase === 'NO_FACE' || detectState.faceCount === 0
          ? '영상 기기 카메라 · 얼굴 기다리는 중'
          : `영상 기기 인식 중 · 얼굴 ${detectState.faceCount}`
        : '영상 기기에서 「시작」을 눌러 카메라를 켜 주세요'
      : '영상 화면 연결을 기다려요'
    : status.kind === 'idle'
      ? isViewer
        ? '이 기기에서 「시작」을 눌러 카메라를 켜요'
        : '시작을 눌러 주세요'
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

  // Viewer & combined use local camera FSM; controller has no stage
  const stageShouldPlay = localWantPlay

  const stageChewNudge =
    !isWatch && machine.showNudge && cameraEnabled && !manualPaused

  const stageBlinkNudge = blink.needsBlinkNudge && cameraEnabled

  const stageFriendNudge = showFriendNudge

  const stagePostureNudge = showPostureNudge

  const badgePhase = isController ? detectState.phase : machine.phase
  const badgeChewing = isController ? detectState.isChewing : chew.isChewing
  const badgeFaceMode = isController ? detectState.faceMode : settings.faceMode
  const badgeFaceCount = isController
    ? detectState.faceCount
    : cameraEnabled
      ? faceCount
      : 0
  const badgeMissing = isController
    ? detectState.showFriendNudge
    : showFriendNudge

  const pipActive =
    (isCombined || isViewer) &&
    settings.showRecognitionPreview &&
    cameraEnabled &&
    status.kind === 'ready'

  const enterController = (code: string) => {
    setEnabled(false)
    setManualPaused(false)
    setForcePlay(false)
    setWantViewerPreview(false)
    setRole('controller')
    setRoom(code)
  }

  const enterViewer = (code: string) => {
    setEnabled(false)
    setManualPaused(false)
    setForcePlay(false)
    setWantViewerPreview(false)
    setOutboundPreview(null)
    lastAppliedCmdTs.current = 0
    setRole('viewer')
    setRoom(code)
  }

  const leaveSplit = () => {
    setEnabled(false)
    setForcePlay(false)
    setWantViewerPreview(false)
    setOutboundPreview(null)
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

  const startCameraSession = () => {
    multiChewRef.current.reset()
    blinkRefs.current.forEach((b) => b.reset())
    postureRef.current.reset()
    fsmRef.current.reset()
    setManualPaused(false)
    setForcePlay(false)
    setEnabled(true)
  }

  const stopCameraSession = () => {
    setEnabled(false)
    setForcePlay(false)
    setManualPaused(false)
  }

  const tagline = isController
    ? isWatch
      ? '시청 모드 · 이 휴대폰은 리모컨이에요'
      : '식사 모드 · 이 휴대폰은 리모컨이에요'
    : isViewer
      ? '이 화면에서 영상·얼굴 인식을 해요'
      : isWatch
        ? '시청 모드 · 깜빡임·목 자세를 살펴요'
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
              <p className="controller-hero-label">
                리모컨 (카메라는 영상 기기)
              </p>
              <div className="controller-status-card" aria-live="polite">
                <p className="controller-status-main">{statusLabel}</p>
                <p className="controller-status-sub">
                  {peerConnected
                    ? detectState.shouldPlay
                      ? '영상 기기에서 재생 중'
                      : detectState.showChewNudge
                        ? '씹기 유도 중'
                        : detectState.showBlinkNudge
                          ? '깜빡임 유도 중'
                          : detectState.showPostureNudge
                            ? '목 자세 유도 중'
                            : '대기 중'
                    : '아직 영상 화면이 안 들어왔어요'}
                </p>
              </div>
              <RemoteCameraPreview
                frame={
                  wantViewerPreview && peerConnected ? remotePreview : null
                }
                enabled={wantViewerPreview}
                peerConnected={peerConnected}
                sessionOn={detectState.sessionOn}
                onToggle={setWantViewerPreview}
              />
              <ControllerTransport
                sessionOn={peerConnected && detectState.sessionOn}
                broadcastingPlay={
                  peerConnected ? detectState.shouldPlay : false
                }
                manualPaused={manualPaused}
                peerConnected={peerConnected}
                watchMode={isWatch}
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
              showPostureNudge={stagePostureNudge}
              resumeNeed={settings.resumeCycles}
              resumeHave={machine.resumeProgress}
              secSinceLastBlink={blink.secSinceLastBlink}
              showHud={settings.showDebug && cameraEnabled}
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

          {(isCombined || isViewer) && (
            <CameraPanel
              videoRef={videoRef}
              canvasRef={canvasRef}
              faceLost={cameraEnabled && status.kind === 'ready' && faceLost}
              missingBuddy={showFriendNudge}
              statusLabel={statusLabel}
              showFeed={!pipActive}
              streamInfo={cameraEnabled ? streamInfo : null}
              note={
                isViewer
                  ? peerConnected
                    ? '카메라는 이 기기예요. 휴대폰은 재생·설정만 해요.'
                    : '카메라는 이 기기에서 켜요. 휴대폰 연결을 기다려요.'
                  : pipActive
                    ? '인식 화면은 영상 오른쪽 위에 작게 보여요.'
                    : undefined
              }
            />
          )}
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

          <h2>
            {isController
              ? '휴대폰 리모컨'
              : isViewer
                ? '영상·카메라'
                : isWatch
                  ? '같이 봐요'
                  : '같이 먹어요'}
          </h2>

          {!isViewer && (
            <>
              <div className="face-mode" role="group" aria-label="모드">
                <p className="face-mode-label">지금은 어떤 모드인가요?</p>
                <div className="face-mode-tabs">
                  <button
                    type="button"
                    className={`btn face-mode-btn ${!isWatch ? 'primary' : ''}`}
                    aria-pressed={!isWatch}
                    onClick={() => setSessionMode('meal')}
                  >
                    식사 모드
                  </button>
                  <button
                    type="button"
                    className={`btn face-mode-btn ${isWatch ? 'primary' : ''}`}
                    aria-pressed={isWatch}
                    onClick={() => setSessionMode('watch')}
                  >
                    시청 모드
                  </button>
                </div>
                <p className="face-mode-rule">
                  {isWatch
                    ? '씹지 않아도 영상이 나와요. 눈을 오래 안 깜빡이거나 고개를 숙이면 알려 줘요.'
                    : '씹어야 영상이 나와요. 식사할 때 쓰는 모드예요.'}
                </p>
              </div>

              {!isWatch && (
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
              )}
            </>
          )}

          {/* Camera start lives on the device that owns the camera */}
          {!isController && (
            <div className="btn-row start-row">
              <button
                type="button"
                className="btn primary btn-start"
                onClick={startCameraSession}
                disabled={cameraEnabled && status.kind !== 'error'}
              >
                시작
              </button>
              <button
                type="button"
                className="btn btn-stop"
                onClick={stopCameraSession}
                disabled={!cameraEnabled}
              >
                중지
              </button>
            </div>
          )}

          {isViewer ? (
            <p className="camera-device-note" role="note">
              얼굴 인식 카메라는 <strong>이 영상 기기</strong>에서 켜져요.
              휴대폰은 재생·일시정지와 설정만 보내요.
            </p>
          ) : null}

          {isController ? (
            <p className="camera-device-note" role="note">
              카메라는 <strong>TV·아이패드</strong>에서 켜요. 여기서는
              재생·일시정지와 설정을 바꿔요.
            </p>
          ) : null}

          {!isStandalone && !isController && (
            <p className="a2hs-tip" role="note">
              Safari에서는 주소창이 남을 수 있어요. 주소창을 없애려면{' '}
              <strong>공유 → 홈 화면에 추가</strong> 한 뒤, 홈 아이콘으로
              열어 주세요. 앱처럼 전체 화면으로 나와요.
            </p>
          )}

          {(isCombined || isViewer) && (
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

          {/* Settings on phone (synced) + combined; viewer receives via MQTT */}
          {!isViewer && (
            <SettingsPanel
              key={isController ? 'settings-controller' : 'settings-combined'}
              settings={settings}
              onChange={setSettings}
              habitualGapSec={
                isController ? 0 : chew.habitualGapSec
              }
              effectivePauseSec={
                isController ? undefined : machine.effectivePauseSec
              }
              defaultOpen={isController}
            />
          )}

          {settings.showDebug && !isController && (
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
              ? isWatch
                ? '재생·일시정지와 설정을 보내요. 깜빡임·목 인식은 TV·아이패드 카메라로 해요.'
                : '재생·일시정지와 설정을 보내요. 씹기 인식은 TV·아이패드 카메라로 해요.'
              : isViewer
                ? isWatch
                  ? '시작으로 카메라를 켠 뒤 유튜브를 고르세요. 휴대폰에서 재생을 눌러도 돼요.'
                  : '시작으로 카메라를 켠 뒤 유튜브를 고르세요. 씹으면 재생되고, 휴대폰으로도 조작할 수 있어요.'
                : isWatch
                  ? '시작 → 영상을 틀어요. 눈을 깜빡이지 않거나 고개를 숙이면 알려 줘요.'
                  : '시작 → 얼굴 비추고 씹어요. 화면 가장자리를 누르면 일시정지·전체화면이 잠깐 보여요.'}
          </p>

          <p className="privacy">
            얼굴은 인식하는 기기(한 기기 모드 또는 영상 기기)에서만 처리해요.
            기기 나누기 미리보기는 연결 중에만 MQTT(페어링과 같은 경로)로
            작은 사진을 보내고, 끊기면 바로 멈춰요. 따로 클라우드에 저장하지
            않아요. 유튜브 재생은 YouTube로 연결돼요.
          </p>
        </aside>
      </main>
    </div>
  )
}

export default App
