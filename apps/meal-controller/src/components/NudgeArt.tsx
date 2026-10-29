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
