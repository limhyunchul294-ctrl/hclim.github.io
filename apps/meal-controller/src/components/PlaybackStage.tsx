import { useEffect, useRef } from 'react'
import { useYouTubeApiReady } from '../hooks/useYouTubeApi'
import type { YtPlayer } from '../lib/youtubeApi'

export type PlaybackSource =
  | { kind: 'local'; src: string }
  | { kind: 'youtube'; videoId: string }

type Props = {
  source: PlaybackSource | null
  shouldPlay: boolean
  showChewNudge: boolean
  showBlinkNudge: boolean
  resumeNeed: number
  resumeHave: number
  secSinceLastBlink: number
}

/**
 * Local <video> or YouTube IFrame — same shouldPlay control + on-screen nudges.
 */
export function PlaybackStage({
  source,
  shouldPlay,
  showChewNudge,
  showBlinkNudge,
  resumeNeed,
  resumeHave,
  secSinceLastBlink,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const ytHostRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<YtPlayer | null>(null)
  const shouldPlayRef = useRef(shouldPlay)
  const ytReady = useYouTubeApiReady()
  const videoId = source?.kind === 'youtube' ? source.videoId : null
  const localSrc = source?.kind === 'local' ? source.src : null

  useEffect(() => {
    shouldPlayRef.current = shouldPlay
  }, [shouldPlay])

  // Create / recreate YT player when video id changes
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
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: () => {
          if (cancelled) return
          playerRef.current = player
          try {
            if (shouldPlayRef.current) player.playVideo()
            else player.pauseVideo()
          } catch {
            /* user gesture may be required once */
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
  }, [videoId, ytReady])

  // Sync play/pause for local video
  useEffect(() => {
    const el = videoRef.current
    if (!el || !localSrc) return
    if (shouldPlay) {
      void el.play().catch(() => {})
    } else {
      el.pause()
    }
  }, [shouldPlay, localSrc])

  // Sync play/pause for YouTube
  useEffect(() => {
    const p = playerRef.current
    if (!p || !videoId) return
    try {
      if (shouldPlay) p.playVideo()
      else p.pauseVideo()
    } catch {
      /* player not ready */
    }
  }, [shouldPlay, videoId])

  return (
    <div className="video-panel">
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
          />
        ) : (
          <div className="video-empty">
            유튜브 주소를 넣거나 영상을 검색해 주세요
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
          <div className="stage-overlay chew-overlay chew-secondary" role="status">
            <p className="stage-overlay-title stage-overlay-title-sm">
              한 입 더 씹어 주세요
            </p>
            <p className="stage-overlay-sub">
              재개 {resumeHave}/{resumeNeed}회
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
