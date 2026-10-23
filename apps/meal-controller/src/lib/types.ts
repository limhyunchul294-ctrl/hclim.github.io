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
  /** Estimated mean inter-chew gap (s), 0 if not enough samples. */
  habitualGapSec: number
}

export type BlinkSnapshot = {
  blinkRatePerMin: number
  sessionBlinkCount: number
  /** Seconds since last blink (face present). */
  secSinceLastBlink: number
  /** True when no blink for ≥ T_noblink (dry-eye / staring). */
  needsBlinkNudge: boolean
  blinkLeft: number
  blinkRight: number
}

export type ControllerSettings = {
  /** Seconds without chewing before pause. */
  pauseDelaySec: number
  /** Chew cycles needed to resume. */
  resumeCycles: number
  /** 0–1: higher = easier to count as chewing (scales amplitude floor). */
  sensitivity: number
  /** Absolute jaw amplitude floor for a chew cycle. */
  amplitudeThreshold: number
  /** Chew frequency band lower bound (Hz). */
  freqMinHz: number
  /** Chew frequency band upper bound (Hz). */
  freqMaxHz: number
  /** Face lost this long → NO_FACE. */
  faceLostDelaySec: number
  /** Min seconds between pause ↔ play transitions. */
  debounceSec: number
  /**
   * Scales pause delay. If habitual gap is known and multiplier ≠ 1,
   * uses max(pauseDelay, habitualGap × multiplier).
   */
  habitualPauseMultiplier: number
  /** No blink for this many seconds → dry-eye nudge. */
  noBlinkWarnSec: number
  /** Optional: also pause video on dry-eye nudge (default off). */
  pauseOnDryEye: boolean
  showMesh: boolean
  showDebug: boolean
}

export const DEFAULT_SETTINGS: ControllerSettings = {
  pauseDelaySec: 3.5,
  resumeCycles: 2,
  sensitivity: 0.55,
  amplitudeThreshold: 0.08,
  freqMinHz: 0.6,
  freqMaxHz: 2.5,
  faceLostDelaySec: 1.0,
  debounceSec: 0.5,
  habitualPauseMultiplier: 1.0,
  noBlinkWarnSec: 12,
  pauseOnDryEye: false,
  showMesh: true,
  showDebug: true,
}

export const SETTINGS_STORAGE_KEY = 'meal-controller-settings-v1'
