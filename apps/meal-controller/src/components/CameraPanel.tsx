import type { RefObject } from 'react'

type Props = {
  videoRef: RefObject<HTMLVideoElement | null>
  canvasRef: RefObject<HTMLCanvasElement | null>
  faceLost: boolean
  statusLabel: string
}

export function CameraPanel({
  videoRef,
  canvasRef,
  faceLost,
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
        {faceLost && (
          <div className="face-lost-banner" role="status">
            얼굴이 보이지 않습니다
          </div>
        )}
      </div>
      <p className="camera-status">{statusLabel}</p>
    </div>
  )
}
