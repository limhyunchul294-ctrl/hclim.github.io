/**
 * Cutout AI nudge frames (transparent PNG): eyes-only / lips-only.
 * CSS opacity swap — no Lottie.
 */

const blinkOpen = './nudge/blink-open.png'
const blinkClosed = './nudge/blink-closed.png'
const chewOpen = './nudge/chew-open.png'
const chewClosed = './nudge/chew-closed.png'

export function BlinkEyesArt({ className = '' }: { className?: string }) {
  return (
    <div
      className={`nudge-art nudge-art-frames blink-eyes-art ${className}`}
      aria-hidden="true"
    >
      <img
        className="nudge-frame nudge-frame-a"
        src={blinkOpen}
        alt=""
        width={720}
        height={280}
        decoding="async"
        draggable={false}
      />
      <img
        className="nudge-frame nudge-frame-b"
        src={blinkClosed}
        alt=""
        width={720}
        height={280}
        decoding="async"
        draggable={false}
      />
    </div>
  )
}

export function ChewMouthArt({ className = '' }: { className?: string }) {
  return (
    <div
      className={`nudge-art nudge-art-frames chew-mouth-art ${className}`}
      aria-hidden="true"
    >
      <img
        className="nudge-frame nudge-frame-a"
        src={chewOpen}
        alt=""
        width={480}
        height={480}
        decoding="async"
        draggable={false}
      />
      <img
        className="nudge-frame nudge-frame-b"
        src={chewClosed}
        alt=""
        width={480}
        height={480}
        decoding="async"
        draggable={false}
      />
    </div>
  )
}

/** Simple SVG — upright vs tucked head (turtle neck). */
export function PostureNeckArt({ className = '' }: { className?: string }) {
  return (
    <div className={`nudge-art posture-neck-art ${className}`} aria-hidden="true">
      <svg viewBox="0 0 160 140" width="160" height="140">
        <ellipse cx="80" cy="118" rx="42" ry="14" fill="rgba(255,255,255,0.12)" />
        {/* slumped ghost */}
        <g opacity="0.35">
          <circle cx="58" cy="48" r="22" fill="#c97a7e" />
          <path
            d="M58 70 C52 88 48 100 44 118"
            stroke="#c97a7e"
            strokeWidth="14"
            strokeLinecap="round"
            fill="none"
          />
        </g>
        {/* upright */}
        <circle cx="96" cy="40" r="24" fill="#6bc49a" />
        <path
          d="M96 64 C96 84 96 100 96 118"
          stroke="#6bc49a"
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M72 52 C84 44 108 44 118 54"
          stroke="#f0f4f2"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
      </svg>
    </div>
  )
}
