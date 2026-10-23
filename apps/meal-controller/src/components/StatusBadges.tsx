import type { FaceMode, PlayerPhase } from '../lib/types'

const LABELS: Record<PlayerPhase, string> = {
  NO_FACE: '얼굴 찾아요',
  ARMED: '준비',
  PLAYING: '보는 중',
  PAUSED: '잠깐 멈춤',
}

export function StatusBadges({
  phase,
  isChewing,
  faceMode,
  faceCount,
  missingBuddy,
}: {
  phase: PlayerPhase
  isChewing: boolean
  faceMode: FaceMode
  faceCount: number
  missingBuddy: boolean
}) {
  return (
    <div className="badges" aria-live="polite">
      <span className={`badge phase-${phase}`}>{LABELS[phase]}</span>
      <span className={`badge ${isChewing ? 'chew-on' : 'chew-off'}`}>
        {isChewing ? '씹는 중' : '쉬는 중'}
      </span>
      <span className="badge face-mode-badge">
        {faceMode === 2 ? '2명' : '1명'}
        {faceCount > 0 ? ` · ${faceCount}명 보임` : ''}
      </span>
      {missingBuddy && (
        <span className="badge friend-badge">친구 필요</span>
      )}
    </div>
  )
}
