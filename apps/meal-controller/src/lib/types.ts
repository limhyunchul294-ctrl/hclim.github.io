export type PlayerPhase = 'NO_FACE' | 'ARMED' | 'PLAYING' | 'PAUSED'

/** How many diners must be visible and chewing. */
export type FaceMode = 1 | 2

/** Meal = chew-gated play; watch = free play + blink/posture monitor. */
export type SessionMode = 'meal' | 'watch'

export type FaceSignals = {
  jawOpen: number
  mouthSmile: number
  eyeBlinkLeft: number
  eyeBlinkRight: number
  mar: number
  landmarks: Array<{ x: number; y: number; z: number }>
}

export type FaceFrame = {
  timestampMs: number
  hasFace: boolean
  faceCount: number
  faces: FaceSignals[]
  /** Primary face (index 0) — convenience for blink / HUD. */
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
  /** meal = chew-gated; watch = free play + blink/posture. */
  sessionMode: SessionMode
  /** 1 = one child; 2 = both visible faces must chew (meal mode). */
  faceMode: FaceMode
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
  /** Seconds of poor posture before turtle-neck nudge. */
  postureWarnSec: number
  /** Pitch-proxy threshold (higher = less sensitive). */
  postureThreshold: number
  /** Optional soft pause while posture nudge shows (default off). */
  pauseOnPosture: boolean
  /** PiP camera/recognition preview over the video (default off). */
  showRecognitionPreview: boolean
  /**
   * Digital camera zoom / center crop (1.0–2.5).
   * Raise for desk setups ~1m from a laptop webcam.
   */
  cameraZoom: number
  showMesh: boolean
  showDebug: boolean
}

/** Toddler-tuned defaults (forgiving pause, slightly easier chew). */
export const DEFAULT_SETTINGS: ControllerSettings = {
  sessionMode: 'meal',
  faceMode: 1,
  pauseDelaySec: 4.5,
  resumeCycles: 2,
  sensitivity: 0.78,
  amplitudeThreshold: 0.032,
  freqMinHz: 0.5,
  freqMaxHz: 2.8,
  faceLostDelaySec: 1.2,
  debounceSec: 0.45,
  habitualPauseMultiplier: 1.0,
  noBlinkWarnSec: 14,
  pauseOnDryEye: false,
  postureWarnSec: 8,
  postureThreshold: 0.52,
  pauseOnPosture: false,
  showRecognitionPreview: false,
  cameraZoom: 1.35,
  showMesh: false,
  showDebug: false,
}

/** Bump when defaults change so old prefs don't stick. */
export const SETTINGS_STORAGE_KEY = 'meal-controller-settings-v6'
