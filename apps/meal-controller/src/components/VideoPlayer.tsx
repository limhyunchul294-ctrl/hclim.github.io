import { useEffect, useRef } from 'react'

type Props = {
  src: string | null
  shouldPlay: boolean
  showNudge: boolean
  resumeNeed: number
  resumeHave: number
}

export function VideoPlayer({
  src,
  shouldPlay,
  showNudge,
  resumeNeed,
  resumeHave,
}: Props) {
  const ref = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !src) return
    if (shouldPlay) {
      void el.play().catch(() => {
        /* autoplay may require prior user gesture — file pick covers this */
      })
    } else {
      el.pause()
    }
  }, [shouldPlay, src])

  return (
    <div className="video-panel">
      <div className="video-stage">
        {src ? (
          <video
            ref={ref}
            className="content-video"
            src={src}
            playsInline
            loop
            controls={false}
          />
        ) : (
          <div className="video-empty">
            샘플 영상을 불러오거나 파일을 선택하세요
          </div>
        )}
        {showNudge && (
          <div className="nudge" role="status">
            <p className="nudge-title">한 입 더 씹어 주세요</p>
            <p className="nudge-sub">
              저작이 멈추면 영상이 일시정지됩니다 · 재개까지 {resumeHave}/
              {resumeNeed}회
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
