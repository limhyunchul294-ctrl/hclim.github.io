import type { PlayerPhase } from '../lib/types'

const LABELS: Record<PlayerPhase, string> = {
  NO_FACE: '얼굴 없음',
  ARMED: '대기',
  PLAYING: '재생 중',
  PAUSED: '일시정지',
}

export function StatusBadges({
  phase,
  isChewing,
}: {
  phase: PlayerPhase
  isChewing: boolean
}) {
  return (
    <div className="badges">
      <span className={`badge phase-${phase}`}>{LABELS[phase]}</span>
      <span className={`badge ${isChewing ? 'chew-on' : 'chew-off'}`}>
        {isChewing ? 'CHEW' : 'IDLE'}
      </span>
    </div>
  )
}
