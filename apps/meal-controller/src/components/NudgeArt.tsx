/** Lightweight CSS-animated SVG nudges for toddlers (no Lottie). */

function Eye({
  cx,
  className,
}: {
  cx: number
  className: string
}) {
  return (
    <g className={`eye ${className}`} transform={`translate(${cx} 50)`}>
      {/* Socket */}
      <ellipse cx="0" cy="0" rx="34" ry="30" fill="#243040" />
      <g className="eye-ball">
        <ellipse cx="0" cy="0" rx="30" ry="26" fill="#fffef8" />
        <circle className="eye-iris" cx="3" cy="2" r="13" fill="#3d6fb8" />
        <circle cx="5" cy="3" r="6.5" fill="#1a2433" />
        <circle cx="9" cy="-2" r="3.2" fill="#fff" opacity="0.95" />
      </g>
    </g>
  )
}

export function BlinkEyesArt({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`nudge-art blink-eyes-art ${className}`}
      viewBox="0 0 200 100"
      width="200"
      height="100"
      aria-hidden="true"
      focusable="false"
    >
      <Eye cx={48} className="eye-left" />
      <Eye cx={152} className="eye-right" />
    </svg>
  )
}

export function ChewMouthArt({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`nudge-art chew-mouth-art ${className}`}
      viewBox="0 0 160 140"
      width="160"
      height="140"
      aria-hidden="true"
      focusable="false"
    >
      <ellipse cx="28" cy="78" rx="18" ry="14" fill="#f5b8a8" opacity="0.85" />
      <ellipse cx="132" cy="78" rx="18" ry="14" fill="#f5b8a8" opacity="0.85" />
      <ellipse cx="80" cy="72" rx="58" ry="48" fill="#ffe8d6" />
      <ellipse cx="80" cy="58" rx="8" ry="6" fill="#f0c4b0" />
      <path
        d="M40 78 Q80 62 120 78"
        fill="none"
        stroke="#e07a6a"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <g className="jaw">
        <path
          d="M42 82 Q80 118 118 82"
          fill="#c45c55"
          stroke="#a84842"
          strokeWidth="3"
        />
        <circle className="crumb" cx="80" cy="96" r="7" fill="#e8a54b" />
      </g>
      <g className="nyam-marks" fill="#fff" opacity="0.9">
        <text
          x="12"
          y="36"
          fontSize="18"
          fontWeight="800"
          fontFamily="system-ui, sans-serif"
        >
          냠
        </text>
        <text
          x="118"
          y="40"
          fontSize="16"
          fontWeight="800"
          fontFamily="system-ui, sans-serif"
        >
          냠
        </text>
      </g>
    </svg>
  )
}
