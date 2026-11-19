import type { ReactNode, RefObject } from 'react'
import type { StreamInfo } from '../hooks/useCameraLandmarker'
import { CameraFeed } from './CameraFeed'

type Props = {
  videoRef: RefObject<HTMLVideoElement | null>
  canvasRef: RefObject<HTMLCanvasElement | null>
  faceLost: boolean
  missingBuddy: boolean
  statusLabel: string
  /** When false, feed is shown as PiP on the video stage instead. */
  showFeed: boolean
  /** Optional note under status (e.g. PiP active). */
  note?: ReactNode
  /** Actual webcam resolution + zoom (parents can verify). */
  streamInfo?: StreamInfo | null
}

export function CameraPanel({
  videoRef,
  canvasRef,
  faceLost,
  missingBuddy,
  statusLabel,
  showFeed,
  note,
  streamInfo,
}: Props) {
  const streamLabel =
    streamInfo && streamInfo.width > 0
      ? `카메라 ${streamInfo.width}×${streamInfo.height} · 확대 ${streamInfo.zoom.toFixed(2)}×`
      : null

  return (
    <div className={`camera-panel ${showFeed ? '' : 'camera-panel-compact'}`}>
      {showFeed ? (
        <CameraFeed
          videoRef={videoRef}
          canvasRef={canvasRef}
          faceLost={faceLost}
          missingBuddy={missingBuddy}
          variant="panel"
        />
      ) : null}
      <p className="camera-status">{statusLabel}</p>
      {streamLabel ? (
        <p className="camera-stream-meta" title={streamInfo?.deviceLabel || undefined}>
          {streamLabel}
        </p>
      ) : null}
      {note ? <p className="camera-note">{note}</p> : null}
    </div>
  )
}
