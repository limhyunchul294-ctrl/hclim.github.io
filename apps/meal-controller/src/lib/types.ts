export type PlayerPhase = 'NO_FACE' | 'ARMED' | 'PLAYING' | 'PAUSED'

export type FaceFrame = {
  timestampMs: number
  hasFace: boolean
  jawOpen: number
  mouthSmile: number
  eyeBlinkLeft: number
  eyeBlinkRight: number
  mar: number
  landmarks: Array<{ x: number; y: number; z: number }>
}

export type ChewSnapshot = {
  score: number
  isChewing: boolean
  cyclesInWindow: number
  amplitude: number
}

export type BlinkSnapshot = {
  blinkRatePerMin: number
  sessionBlinkCount: number
  eyesClosedLong: boolean
  blinkLeft: number
  blinkRight: number
}

export type ControllerSettings = {
  /** Seconds without chewing before pause (3–4s default). */
  pauseDelaySec: number
  /** Chew cycles needed to resume (2–3). */
  resumeCycles: number
  /** Sensitivity 0–1: higher = easier to count as chewing. */
  sensitivity: number
  /** Soft warning if eyes stay closed this many seconds. */
  eyesClosedWarnSec: number
  showMesh: boolean
  showDebug: boolean
}

export const DEFAULT_SETTINGS: ControllerSettings = {
  pauseDelaySec: 3.5,
  resumeCycles: 2,
  sensitivity: 0.55,
  eyesClosedWarnSec: 2.5,
  showMesh: true,
  showDebug: true,
}
