import { useCallback, useEffect, useRef, useState } from 'react'
import { useYouTubeApiReady } from '../hooks/useYouTubeApi'
import type { YtPlayer } from '../lib/youtubeApi'

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
  resumeNeed: number
  resumeHave: number
  secSinceLastBlink: number
  showHud: boolean
  hud: LiveHud
  onManualPause: () => void
  onManualPlay: () => void
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
  resumeNeed,
  resumeHave,
  secSinceLastBlink,
  showHud,
  hud,
  onManualPause,
  onManualPlay,
}: Props) {
  const shellRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const ytHostRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<YtPlayer | null>(null)
  const shouldPlayRef = useRef(shouldPlay)
  const hideTimerRef = useRef<number>(0)
  const ytReady = useYouTubeApiReady()
  const [appFs, setAppFs] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(false)
  const videoId = source?.kind === 'youtube' ? source.videoId : null
  const localSrc = source?.kind === 'local' ? source.src : null

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
  }, [videoId, ytReady, applyDesired])

  useEffect(() => {
    applyDesired(shouldPlay)
  }, [shouldPlay, applyDesired, videoId, localSrc])

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
      setAppFs(Boolean(el && document.fullscreenElement === el))
    }
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  const toggleAppFullscreen = async () => {
    const el = shellRef.current
    if (!el) return
    try {
      if (document.fullscreenElement === el) {
        await document.exitFullscreen()
      } else {
        await el.requestFullscreen()
      }
    } catch {
      /* unsupported */
    }
  }

  return (
    <div
      className={`video-panel ${appFs ? 'video-panel-fs' : ''}`}
      ref={shellRef}
    >
      <div className="video-stage">
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

        {showBlinkNudge && (
          <div className="stage-overlay blink-overlay" role="alert">
            <p className="stage-overlay-title">눈을 깜빡여 주세요</p>
            <p className="stage-overlay-sub">
              {secSinceLastBlink.toFixed(0)}초 동안 깜빡이지 않았어요
            </p>
          </div>
        )}

        {showChewNudge && !showBlinkNudge && (
          <div className="stage-overlay chew-overlay" role="status">
            <p className="stage-overlay-title">한 입 더 씹어 주세요</p>
            <p className="stage-overlay-sub">
              다시 씹으면 재생돼요 · {resumeHave}/{resumeNeed}회
            </p>
          </div>
        )}

        {showChewNudge && showBlinkNudge && (
          <div
            className="stage-overlay chew-overlay chew-secondary"
            role="status"
          >
            <p className="stage-overlay-title stage-overlay-title-sm">
              한 입 더 씹어 주세요
            </p>
            <p className="stage-overlay-sub">
              재개 {resumeHave}/{resumeNeed}회
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
