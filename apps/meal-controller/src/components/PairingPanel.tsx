import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import {
  controllerPairUrl,
  generateRoomCode,
  isValidRoomCode,
  normalizeRoomCode,
  viewerPairUrl,
  type AppRole,
} from '../lib/roomCode'

type Props = {
  role: AppRole
  room: string | null
  peerConnected: boolean
  syncStatus: string
  syncError: string | null
  onEnterController: (room: string) => void
  onEnterViewer: (room: string) => void
  onLeaveSplit: () => void
}

export function PairingPanel({
  role,
  room,
  peerConnected,
  syncStatus,
  syncError,
  onEnterController,
  onEnterViewer,
  onLeaveSplit,
}: Props) {
  const [joinCode, setJoinCode] = useState(room ?? '')
  const [open, setOpen] = useState(role !== 'combined')
  const qrRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (role !== 'controller' || !room || !qrRef.current) return
    const url = viewerPairUrl(room)
    void QRCode.toCanvas(qrRef.current, url, {
      width: 168,
      margin: 1,
      color: { dark: '#15201e', light: '#f0f4f2' },
    })
  }, [role, room])

  if (role === 'combined' && !open) {
    return (
      <section className="pairing-panel" aria-label="기기 나누기">
        <button
          type="button"
          className="btn pairing-open-btn"
          onClick={() => setOpen(true)}
        >
          기기 나누기 (휴대폰 + TV)
        </button>
      </section>
    )
  }

  if (role === 'combined') {
    return (
      <section className="pairing-panel pairing-pick" aria-label="기기 나누기">
        <h3 className="pairing-title">기기를 나눠 쓸까요?</h3>
        <p className="pairing-hint">
          카메라는 TV·아이패드(영상 기기)에서 켜고, 휴대폰은 재생·설정
          리모컨만 해요. 같은 Wi‑Fi가 아니어도 됩니다.
        </p>
        <div className="btn-row pairing-actions">
          <button
            type="button"
            className="btn primary"
            onClick={() => onEnterController(generateRoomCode())}
          >
            이 휴대폰으로 조작
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              const code = normalizeRoomCode(joinCode)
              if (isValidRoomCode(code)) onEnterViewer(code)
            }}
          >
            이 화면에서 영상·인식
          </button>
        </div>
        <label className="pairing-join-label">
          영상·인식 화면이면 코드를 입력해요
          <input
            className="pairing-code-input"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="6자리 코드"
            value={joinCode}
            onChange={(e) => setJoinCode(normalizeRoomCode(e.target.value))}
            maxLength={6}
          />
        </label>
        <button type="button" className="btn btn-tiny" onClick={() => setOpen(false)}>
          한 기기로 계속
        </button>
      </section>
    )
  }

  const linkLabel =
    syncStatus === 'linked' || peerConnected
      ? '연결됐어요'
      : syncStatus === 'connecting'
        ? '연결하는 중…'
        : syncStatus === 'error'
          ? '연결이 안 됐어요'
          : syncStatus === 'waiting'
            ? '상대 기기 기다리는 중…'
            : '준비 중…'

  const waitingHint =
    syncStatus === 'waiting' && !peerConnected
      ? role === 'controller'
        ? '아직 TV·아이패드가 안 들어왔어요. 같은 6자리 코드를 넣어 주세요.'
        : '아직 휴대폰이 안 들어왔어요. 휴대폰에 나온 같은 코드를 확인해 주세요.'
      : null

  return (
    <section
      className={`pairing-panel pairing-active role-${role}`}
      aria-label="페어링"
    >
      <div className="pairing-role-chip">
        {role === 'controller' ? '조작 휴대폰' : '영상·인식 화면'}
        <span
          className={`pairing-link ${peerConnected ? 'on' : ''} ${syncStatus === 'error' ? 'err' : ''}`}
        >
          {linkLabel}
        </span>
      </div>

      {role === 'controller' && room ? (
        <>
          <p className="pairing-code-big" aria-live="polite">
            {room}
          </p>
          <p className="pairing-hint">
            TV·아이패드에서 코드를 입력하거나 QR을 찍어요. 카메라는 그쪽에서
            켜져요.
          </p>
          <canvas ref={qrRef} className="pairing-qr" aria-hidden />
          <p className="pairing-url-hint">{viewerPairUrl(room)}</p>
        </>
      ) : null}

      {role === 'viewer' ? (
        <>
          <label className="pairing-join-label">
            연결 코드
            <input
              className="pairing-code-input"
              inputMode="numeric"
              value={joinCode}
              onChange={(e) => setJoinCode(normalizeRoomCode(e.target.value))}
              maxLength={6}
            />
          </label>
          <button
            type="button"
            className="btn primary"
            disabled={!isValidRoomCode(normalizeRoomCode(joinCode))}
            onClick={() => onEnterViewer(normalizeRoomCode(joinCode))}
          >
            코드로 연결
          </button>
          {room ? (
            <p className="pairing-hint">
              지금 방: {room} · 카메라는 이 기기에서 켜요
            </p>
          ) : (
            <p className="pairing-hint">
              휴대폰에 나온 6자리 코드를 넣어요.
            </p>
          )}
        </>
      ) : null}

      {waitingHint ? <p className="pairing-hint">{waitingHint}</p> : null}
      {syncError ? (
        <p className="pairing-error" role="alert">
          {syncError}
        </p>
      ) : null}
      {syncStatus === 'error' ? (
        <p className="pairing-hint">
          코드를 다시 치거나, Wi‑Fi·데이터를 켠 뒤 한 번 더 눌러 보세요.
        </p>
      ) : null}

      <button type="button" className="btn btn-tiny" onClick={onLeaveSplit}>
        기기 나누기 끄기
      </button>
      {role === 'controller' && room ? (
        <p className="pairing-url-hint muted">
          리모컨 URL: {controllerPairUrl(room)}
        </p>
      ) : null}
    </section>
  )
}
