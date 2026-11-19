type Props = {
  sessionOn: boolean
  broadcastingPlay: boolean
  manualPaused: boolean
  peerConnected: boolean
  onPause: () => void
  onPlay: () => void
}

/** Big parent play/pause for phone-controller → viewer broadcast. */
export function ControllerTransport({
  sessionOn,
  broadcastingPlay,
  manualPaused,
  peerConnected,
  onPause,
  onPlay,
}: Props) {
  const statusText = !sessionOn
    ? '먼저 「시작」을 눌러 주세요'
    : manualPaused
      ? '부모님 일시정지 · TV 멈춤'
      : broadcastingPlay
        ? 'TV로 재생 보내는 중'
        : '씹으면 TV가 나와요'

  return (
    <section className="controller-transport" aria-label="영상 원격 조작">
      <p className={`controller-broadcast-status ${broadcastingPlay ? 'on' : ''}`}>
        {statusText}
        {sessionOn && peerConnected ? (
          <span className="controller-peer-dot" title="영상 화면 연결됨">
            연결
          </span>
        ) : null}
      </p>
      <div className="btn-row controller-transport-row">
        <button
          type="button"
          className="btn controller-transport-btn"
          disabled={!sessionOn}
          aria-pressed={manualPaused}
          onClick={onPause}
        >
          일시정지
        </button>
        <button
          type="button"
          className="btn primary controller-transport-btn"
          disabled={!sessionOn}
          aria-pressed={!manualPaused && broadcastingPlay}
          onClick={onPlay}
        >
          재생
        </button>
      </div>
      <p className="controller-transport-hint">
        씹기 자동 멈춤은 그대로예요. 재생은 TV에 바로 보내고, 씹기를 오래 안
        하면 다시 멈춰요.
      </p>
    </section>
  )
}
