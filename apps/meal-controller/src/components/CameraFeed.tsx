import type { RefObject } from 'react'

type Props = {
  videoRef: RefObject<HTMLVideoElement | null>
  canvasRef: RefObject<HTMLCanvasElement | null>
  faceLost: boolean
  missingBuddy: boolean
  /** `panel` = camera card; `pip` = floating corner over YouTube */
  variant: 'panel' | 'pip'
}

/**
 * Shared camera surface. Raw <video> stays off-screen for the MediaStream;
 * the canvas shows the zoomed crop MediaPipe actually sees (+ optional mesh).
 */
export function CameraFeed({
  videoRef,
  canvasRef,
  faceLost,
  missingBuddy,
  variant,
}: Props) {
  return (
    <div
      className={
        variant === 'pip' ? 'recognition-pip' : 'camera-stage'
      }
      aria-label={variant === 'pip' ? '인식 화면' : undefined}
    >
      <video
        ref={videoRef}
        className="camera-video camera-video-source"
        playsInline
        muted
        autoPlay
      />
      <canvas ref={canvasRef} className="camera-overlay camera-feed-canvas" />
      {missingBuddy && (
        <div className="face-lost-banner friend-banner" role="status">
          친구도 화면에 나와요
        </div>
      )}
      {faceLost && !missingBuddy && (
        <div className="face-lost-banner" role="status">
          얼굴을 보여 주세요
        </div>
      )}
      {variant === 'pip' && (
        <span className="recognition-pip-label">인식</span>
      )}
    </div>
  )
}
