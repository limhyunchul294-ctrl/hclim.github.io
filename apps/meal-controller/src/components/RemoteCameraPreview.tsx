import { useEffect, useState } from 'react'
import { previewDataUrl } from '../lib/previewFrame'
import type { PreviewBroadcast } from '../lib/roomSyncTypes'

type Props = {
  frame: PreviewBroadcast | null
  enabled: boolean
  peerConnected: boolean
  /** Viewer pressed 시작 (session claimed). */
  sessionOn: boolean
  onToggle: (on: boolean) => void
}

/**
 * Phone-only live thumbnail of the VIEWER recognition camera.
 * Frames arrive over MQTT only while paired + 「미리보기」 is on.
 */
export function RemoteCameraPreview({
  frame,
  enabled,
  peerConnected,
  sessionOn,
  onToggle,
}: Props) {
  const src =
    enabled && frame ? previewDataUrl(frame.mime, frame.data) : null
  const [waitingTooLong, setWaitingTooLong] = useState(false)

  useEffect(() => {
    if (!enabled || !peerConnected || src) {
      setWaitingTooLong(false)
      return
    }
    const id = window.setTimeout(() => setWaitingTooLong(true), 3500)
    return () => window.clearTimeout(id)
  }, [enabled, peerConnected, src, sessionOn, frame?.ts])

  let placeholder: string
  if (!peerConnected) {
    placeholder = '연결되면 미리보기가 나와요'
  } else if (!sessionOn) {
    placeholder = '영상 기기에서 「시작」을 눌러 주세요'
  } else if (waitingTooLong) {
    placeholder =
      '미리보기가 아직 안 와요. 영상 기기 카메라가 켜졌는지 확인하거나, 미리보기를 껐다 다시 켜 보세요.'
  } else {
    placeholder = '미리보기를 불러오는 중…'
  }

  return (
    <section className="remote-preview" aria-label="영상기기 카메라 미리보기">
      <div className="remote-preview-head">
        <p className="remote-preview-label">영상기기 카메라</p>
        <label className="check-row preview-toggle remote-preview-toggle">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
            disabled={!peerConnected}
          />
          미리보기
        </label>
      </div>

      {enabled ? (
        <div className="remote-preview-stage">
          {src ? (
            <img
              className="remote-preview-img"
              src={src}
              alt="영상기기 인식 카메라 화면"
              width={frame?.w}
              height={frame?.h}
            />
          ) : (
            <p className="remote-preview-placeholder" role="status">
              {placeholder}
            </p>
          )}
          <span className="remote-preview-badge">TV·아이패드 카메라</span>
        </div>
      ) : (
        <p className="remote-preview-hint">
          켜면 영상 기기가 보는 얼굴을 휴대폰에서 살짝 보여 줘요. (데이터 조금
          써요 · 연결 중에만)
        </p>
      )}
    </section>
  )
}
