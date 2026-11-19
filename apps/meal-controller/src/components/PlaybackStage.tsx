import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useYouTubeApiReady } from '../hooks/useYouTubeApi'
import {
  exitAppFullscreen,
  getFullscreenElement,
  hasFullscreenApi,
  isIOSLike,
  onFullscreenChange,
  requestAppFullscreen,
} from '../lib/fullscreen'
import type { YtMediaState } from '../lib/ytMedia'
import type { YtPlayer } from '../lib/youtubeApi'
import { BlinkEyesArt, ChewMouthArt, PostureNeckArt } from './NudgeArt'

export type PlaybackSource =
  | { kind: 'local'; src: string }
  | { kind: 'youtube'; videoId: string }

export type LiveHud = {
  jawOpen: number
  chewScore: number
  isChewing: boolean
  phase: string
  noChewSec: number
  effectivePauseSec: number
}

type Props = {
  source: PlaybackSource | null
  shouldPlay: boolean
  showChewNudge: boolean
  showBlinkNudge: boolean
  /** 2명 모드인데 얼굴이 1명만 보일 때 */
  showFriendNudge: boolean
  /** Watch mode: turtle-neck / forward-head soft nudge */
  showPostureNudge?: boolean
  resumeNeed: number
  resumeHave: number
  secSinceLastBlink: number
  showHud: boolean
  hud: LiveHud
  /** Optional PiP recognition feed (same camera stream). */
  recognitionSlot?: ReactNode
  onManualPause: () => void
  onManualPlay: () => void
  /** Volume / mute / rate / seek — YouTube quality is intentionally unsupported. */
  ytMedia?: YtMediaState | null
}

const YT_PLAYING = 1
const YT_BUFFERING = 3

/**
 * Local <video> or YouTube IFrame — forced play/pause sync + app fullscreen
 * wrapper so overlays stay visible (YT native fullscreen disabled).
 */
export function PlaybackStage({
  source,
  shouldPlay,
  showChewNudge,
  showBlinkNudge,
  showFriendNudge,
  showPostureNudge = false,
  resumeNeed,
  resumeHave,
  secSinceLastBlink,
  showHud,
  hud,
  recognitionSlot = null,
  onManualPause,
  onManualPlay,
  ytMedia = null,
}: Props) {
  const shellRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const ytHostRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<YtPlayer | null>(null)
  const shouldPlayRef = useRef(shouldPlay)
  const ytMediaRef = useRef(ytMedia)
  const lastSeekSeqRef = useRef(0)
  const hideTimerRef = useRef<number>(0)
  const ytReady = useYouTubeApiReady()
  /** Native Fullscreen API (desktop). */
  const [nativeFs, setNativeFs] = useState(false)
  /** CSS immersive fallback (iOS Safari / API failure). */
  const [cssFs, setCssFs] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(false)
  const videoId = source?.kind === 'youtube' ? source.videoId : null
  const localSrc = source?.kind === 'local' ? source.src : null
  const appFs = nativeFs || cssFs

  const revealControls = useCallback(() => {
    setControlsVisible(true)
    window.clearTimeout(hideTimerRef.current)
    hideTimerRef.current = window.setTimeout(() => {
      setControlsVisible(false)
    }, 2500)
  }, [])

  useEffect(() => {
    return () => window.clearTimeout(hideTimerRef.current)
  }, [])

  useEffect(() => {
    shouldPlayRef.current = shouldPlay
  }, [shouldPlay])

  useEffect(() => {
    ytMediaRef.current = ytMedia
  }, [ytMedia])

  // Lock page scroll while CSS immersive covers the viewport
  useEffect(() => {
    if (!cssFs) return
    const html = document.documentElement
    const body = document.body
    const prevHtml = html.style.overflow
    const prevBody = body.style.overflow
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    html.classList.add('meal-css-fs')
    return () => {
      html.style.overflow = prevHtml
      body.style.overflow = prevBody
      html.classList.remove('meal-css-fs')
    }
  }, [cssFs])

  const applyYtMedia = useCallback((media: YtMediaState | null | undefined) => {
    if (!media) return
    const p = playerRef.current
    if (p) {
      try {
        p.setVolume(media.volume)
        if (media.muted) p.mute()
        else p.unMute()
        p.setPlaybackRate(media.playbackRate)
        if (media.seekSeq > lastSeekSeqRef.current) {
          lastSeekSeqRef.current = media.seekSeq
          const now = p.getCurrentTime()
          const dur = p.getDuration()
          const target = now + media.seekDeltaSec
          const capped =
            Number.isFinite(dur) && dur > 0
              ? Math.min(Math.max(0, dur - 0.25), Math.max(0, target))
              : Math.max(0, target)
          p.seekTo(capped, true)
        }
      } catch {
        /* player not ready */
      }
    }
    const el = videoRef.current
    if (el && localSrc) {
      el.volume = Math.max(0, Math.min(1, media.volume / 100))
      el.muted = media.muted
      try {
        el.playbackRate = media.playbackRate
      } catch {
        /* ignore unsupported rate */
      }
      if (media.seekSeq > lastSeekSeqRef.current) {
        lastSeekSeqRef.current = media.seekSeq
        const dur = Number.isFinite(el.duration) ? el.duration : el.currentTime
        el.currentTime = Math.max(
          0,
          Math.min(dur, el.currentTime + media.seekDeltaSec),
        )
      }
    }
  }, [localSrc])

  const applyDesired = useCallback(
    (want: boolean) => {
      const p = playerRef.current
      if (p) {
        try {
          if (want) p.playVideo()
          else p.pauseVideo()
        } catch {
          /* not ready */
        }
      }
      const el = videoRef.current
      if (el && localSrc) {
        if (want) void el.play().catch(() => {})
        else el.pause()
      }
    },
    [localSrc],
  )

  useEffect(() => {
    if (!videoId || !ytReady || !ytHostRef.current) return
    let cancelled = false

    try {
      playerRef.current?.destroy()
    } catch {
      /* ignore */
    }
    playerRef.current = null
    // Do not replay an old seek when a new video loads
    lastSeekSeqRef.current = ytMediaRef.current?.seekSeq ?? 0
    ytHostRef.current.innerHTML = ''
    const mount = document.createElement('div')
    ytHostRef.current.appendChild(mount)

    const player = new window.YT!.Player(mount, {
      videoId,
      width: '100%',
      height: '100%',
      playerVars: {
        autoplay: 0,
        controls: 1,
        fs: 0,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: () => {
          if (cancelled) return
          playerRef.current = player
          applyYtMedia(ytMediaRef.current)
          applyDesired(shouldPlayRef.current)
        },
        onStateChange: (e) => {
          if (cancelled) return
          const playing = e.data === YT_PLAYING || e.data === YT_BUFFERING
          if (playing && !shouldPlayRef.current) {
            try {
              player.pauseVideo()
            } catch {
              /* ignore */
            }
          }
          // Re-apply rate/volume after cue/load resets rate to 1
          if (e.data === YT_PLAYING || e.data === YT_BUFFERING) {
            applyYtMedia(ytMediaRef.current)
          }
        },
      },
    })

    return () => {
      cancelled = true
      try {
        player.destroy()
      } catch {
        /* ignore */
      }
      playerRef.current = null
    }
  }, [videoId, ytReady, applyDesired, applyYtMedia])

  useEffect(() => {
    applyDesired(shouldPlay)
  }, [shouldPlay, applyDesired, videoId, localSrc])

  useEffect(() => {
    // New local file: ignore prior seek tokens (same idea as YT remount)
    lastSeekSeqRef.current = ytMediaRef.current?.seekSeq ?? 0
  }, [localSrc])

  useEffect(() => {
    applyYtMedia(ytMedia)
  }, [ytMedia, applyYtMedia, videoId, localSrc])

  useEffect(() => {
    const id = window.setInterval(() => {
      const p = playerRef.current
      if (!p) return
      try {
        const state = p.getPlayerState()
        const playing = state === YT_PLAYING || state === YT_BUFFERING
        if (shouldPlayRef.current && !playing) p.playVideo()
        if (!shouldPlayRef.current && playing) p.pauseVideo()
      } catch {
        /* ignore */
      }
    }, 250)
    return () => window.clearInterval(id)
  }, [videoId])

  useEffect(() => {
    const onFs = () => {
      const el = shellRef.current
      const active = Boolean(el && getFullscreenElement() === el)
      setNativeFs(active)
      // If native FS dropped unexpectedly, keep CSS mode if user wanted immersive
      if (!active && cssFs) {
        /* stay in cssFs */
      }
    }
    return onFullscreenChange(onFs)
  }, [cssFs])

  const toggleAppFullscreen = async () => {
    const el = shellRef.current
    if (!el) return

    // Exit whichever mode is active
    if (nativeFs || getFullscreenElement() === el) {
      await exitAppFullscreen()
      setNativeFs(false)
      setCssFs(false)
      return
    }
    if (cssFs) {
      setCssFs(false)
      return
    }

    // Enter: try system Fullscreen API first (skip on known-broken iOS)
    let enteredNative = false
    if (!isIOSLike() && hasFullscreenApi(el)) {
      enteredNative = await requestAppFullscreen(el)
      setNativeFs(enteredNative)
    }

    // Always fall back so the button never no-ops on iPhone
    if (!enteredNative) {
      setCssFs(true)
    }
  }

  return (
    <div
      className={`video-panel ${appFs ? 'video-panel-fs' : ''} ${cssFs ? 'video-panel-css-fs' : ''}`}
      ref={shellRef}
    >
      <div
        className={`video-stage ${recognitionSlot ? 'video-stage-has-pip' : ''}`}
      >
        {source?.kind === 'youtube' ? (
          <div ref={ytHostRef} className="yt-host" />
        ) : source?.kind === 'local' ? (
          <video
            ref={videoRef}
            className="content-video"
            src={source.src}
            playsInline
            loop
            controls={false}
            onClick={revealControls}
          />
        ) : (
          <div className="video-empty" onClick={revealControls}>
            유튜브 주소를 붙여넣어 주세요
          </div>
        )}

        {/* Edge hit zones — iframe steals center taps */}
        <button
          type="button"
          className="stage-hit-edge stage-hit-top"
          aria-label="조작 버튼 보이기"
          onClick={revealControls}
        />
        <button
          type="button"
          className="stage-hit-edge stage-hit-bottom"
          aria-label="조작 버튼 보이기"
          onClick={revealControls}
        />

        {recognitionSlot}

        {showHud && (
          <div className="live-hud" aria-live="polite">
            <span>jaw {hud.jawOpen.toFixed(3)}</span>
            <span>score {hud.chewScore.toFixed(2)}</span>
            <span className={hud.isChewing ? 'hud-on' : 'hud-off'}>
              {hud.isChewing ? 'CHEW' : 'idle'}
            </span>
            <span>{hud.phase}</span>
            <span>
              noChew {hud.noChewSec.toFixed(1)}/
              {hud.effectivePauseSec.toFixed(1)}s
            </span>
          </div>
        )}

        {showFriendNudge && (
          <div className="stage-overlay friend-overlay" role="status">
            <p className="stage-overlay-title">친구도 화면에 나와요</p>
            <p className="stage-overlay-sub">
              두 명이 다 보여야 영상이 나와요
            </p>
          </div>
        )}

        {showBlinkNudge && !showFriendNudge && (
          <div className="stage-overlay blink-overlay" role="alert">
            <BlinkEyesArt />
            <p className="stage-overlay-title">눈을 깜빡여 주세요</p>
            <p className="stage-overlay-sub">
              깜빡깜빡! · {secSinceLastBlink.toFixed(0)}초째예요
            </p>
          </div>
        )}

        {showPostureNudge &&
          !showBlinkNudge &&
          !showFriendNudge && (
            <div className="stage-overlay posture-overlay" role="status">
              <PostureNeckArt />
              <p className="stage-overlay-title">고개를 세워 보세요</p>
              <p className="stage-overlay-sub">목을 길게 · 화면을 똑바로 봐요</p>
            </div>
          )}

        {showChewNudge &&
          !showBlinkNudge &&
          !showPostureNudge &&
          !showFriendNudge && (
          <div className="stage-overlay chew-overlay" role="status">
            <ChewMouthArt />
            <p className="stage-overlay-title">한 입 더 씹어 봐요</p>
            <p className="stage-overlay-sub">
              냠냠 하면 나와요 · {resumeHave}/{resumeNeed}
            </p>
          </div>
        )}

        {showChewNudge && showBlinkNudge && !showFriendNudge && (
          <div
            className="stage-overlay chew-overlay chew-secondary"
            role="status"
          >
            <ChewMouthArt className="nudge-art-sm" />
            <p className="stage-overlay-title stage-overlay-title-sm">
              한 입 더 씹어 봐요
            </p>
            <p className="stage-overlay-sub">
              {resumeHave}/{resumeNeed}
            </p>
          </div>
        )}

        <div
          className={`stage-controls ${controlsVisible ? 'is-visible' : ''}`}
          role="toolbar"
          aria-label="재생 조작"
          aria-hidden={!controlsVisible}
          onPointerDown={revealControls}
        >
          {shouldPlay ? (
            <button
              type="button"
              className="btn stage-ctrl-btn"
              onClick={() => {
                onManualPause()
                revealControls()
              }}
            >
              일시정지
            </button>
          ) : (
            <button
              type="button"
              className="btn stage-ctrl-btn primary"
              onClick={() => {
                onManualPlay()
                revealControls()
              }}
            >
              재생
            </button>
          )}
          <button
            type="button"
            className="btn stage-ctrl-btn stage-ctrl-fs"
            onClick={() => {
              void toggleAppFullscreen()
              revealControls()
            }}
          >
            {appFs ? '전체화면 종료' : '앱 전체화면'}
          </button>
        </div>
      </div>
    </div>
  )
}
