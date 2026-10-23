import type { ReactNode, RefObject } from 'react'
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
}

export function CameraPanel({
  videoRef,
  canvasRef,
  faceLost,
  missingBuddy,
  statusLabel,
  showFeed,
  note,
}: Props) {
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
      {note ? <p className="camera-note">{note}</p> : null}
    </div>
  )
}
