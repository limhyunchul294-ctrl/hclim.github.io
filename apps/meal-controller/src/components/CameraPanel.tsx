import type { RefObject } from 'react'

type Props = {
  videoRef: RefObject<HTMLVideoElement | null>
  canvasRef: RefObject<HTMLCanvasElement | null>
  faceLost: boolean
  missingBuddy: boolean
  statusLabel: string
}

export function CameraPanel({
  videoRef,
  canvasRef,
  faceLost,
  missingBuddy,
  statusLabel,
}: Props) {
  return (
    <div className="camera-panel">
      <div className="camera-stage">
        <video
          ref={videoRef}
          className="camera-video"
          playsInline
          muted
          autoPlay
        />
        <canvas ref={canvasRef} className="camera-overlay" />
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
      </div>
      <p className="camera-status">{statusLabel}</p>
    </div>
  )
}
