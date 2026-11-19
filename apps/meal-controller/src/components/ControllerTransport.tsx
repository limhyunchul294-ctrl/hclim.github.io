type Props = {
  sessionOn: boolean
  broadcastingPlay: boolean
  manualPaused: boolean
  peerConnected: boolean
  watchMode?: boolean
  onPause: () => void
  onPlay: () => void
}

/** Big parent play/pause for phone remote → viewer. */
export function ControllerTransport({
  sessionOn,
  broadcastingPlay,
  manualPaused,
  peerConnected,
  watchMode = false,
  onPause,
  onPlay,
}: Props) {
  const statusText = !sessionOn
    ? peerConnected
      ? '영상 기기에서 「시작」을 기다려요'
      : '먼저 영상 화면을 연결해 주세요'
    : manualPaused
      ? '부모님 일시정지 · 영상 멈춤'
      : broadcastingPlay
        ? '영상 기기에서 재생 중'
        : watchMode
          ? '대기 중 · 재생을 눌러 보세요'
          : '씹으면 영상이 나와요'

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
          disabled={!peerConnected}
          aria-pressed={manualPaused}
          onClick={onPause}
        >
          일시정지
        </button>
        <button
          type="button"
          className="btn primary controller-transport-btn"
          disabled={!peerConnected}
          aria-pressed={!manualPaused && broadcastingPlay}
          onClick={onPlay}
        >
          재생
        </button>
      </div>
      <p className="controller-transport-hint">
        {watchMode
          ? '인식(깜빡임·목)은 영상 기기 카메라로 해요. 재생·일시정지만 여기서 보내요.'
          : '씹기 자동 멈춤은 영상 기기에서 그대로예요. 재생·일시정지는 여기서 보내요.'}
      </p>
    </section>
  )
}
