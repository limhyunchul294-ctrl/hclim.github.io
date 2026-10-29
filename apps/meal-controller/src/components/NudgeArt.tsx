/**
 * AI-illustrated nudge frames (open/closed) with CSS opacity swap.
 * Files in public/nudge/ — no Lottie; works on mobile Safari.
 */

const blinkOpen = './nudge/blink-open.jpg'
const blinkClosed = './nudge/blink-closed.jpg'
const chewOpen = './nudge/chew-open.jpg'
const chewClosed = './nudge/chew-closed.jpg'

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
        width={640}
        height={360}
        decoding="async"
        draggable={false}
      />
      <img
        className="nudge-frame nudge-frame-b"
        src={blinkClosed}
        alt=""
        width={640}
        height={360}
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
        width={512}
        height={512}
        decoding="async"
        draggable={false}
      />
      <img
        className="nudge-frame nudge-frame-b"
        src={chewClosed}
        alt=""
        width={512}
        height={512}
        decoding="async"
        draggable={false}
      />
    </div>
  )
}
