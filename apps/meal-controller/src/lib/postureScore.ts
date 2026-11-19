import type { ControllerSettings, FaceFrame } from './types'

export type PostureSnapshot = {
  /** Higher ≈ looking down / forward-head proxy (0–1+). */
  pitchProxy: number
  /** Smoothed score used for thresholding. */
  score: number
  /** Seconds the score has stayed above threshold. */
  badSec: number
  needsPostureNudge: boolean
}

/**
 * Turtle-neck / forward-head proxy from Face Landmarker only (no Pose).
 * Uses nose vs eye-line drop + chin-forward lean in normalized face space.
 * Good enough for soft toddler nudges; not clinical.
 */
export function estimatePitchProxy(
  landmarks: Array<{ x: number; y: number; z?: number }>,
): number {
  if (landmarks.length < 455) return 0
  const nose = landmarks[1]
  const forehead = landmarks[10]
  const chin = landmarks[152]
  const leftEye = landmarks[33]
  const rightEye = landmarks[263]
  const leftEar = landmarks[234]
  const rightEar = landmarks[454]

  const midEye = {
    x: (leftEye.x + rightEye.x) / 2,
    y: (leftEye.y + rightEye.y) / 2,
  }
  const midEarY = (leftEar.y + rightEar.y) / 2
  const faceH = Math.hypot(chin.x - forehead.x, chin.y - forehead.y) || 1e-3

  // Looking down → nose sits lower vs eye line
  const noseDrop = (nose.y - midEye.y) / faceH
  // Chin forward vs ear plane (normalized x/z when z present)
  const earNoseY = (nose.y - midEarY) / faceH
  const earZ =
    typeof leftEar.z === 'number' && typeof rightEar.z === 'number'
      ? (leftEar.z + rightEar.z) / 2
      : null
  const zLean =
    typeof nose.z === 'number' && earZ != null
      ? Math.max(0, earZ - nose.z) * 2.2
      : 0

  // Calibrated so neutral ≈ 0.25–0.4, clear turtle/down ≈ 0.55+
  const raw = noseDrop * 0.7 + earNoseY * 0.25 + zLean * 0.35
  return Math.max(0, raw)
}

/**
 * Tracks sustained poor head posture for soft nudges.
 */
export class PostureTracker {
  private scoreEma = 0.35
  private badSinceMs: number | null = null
  private faceSinceMs: number | null = null

  reset(): void {
    this.scoreEma = 0.35
    this.badSinceMs = null
    this.faceSinceMs = null
  }

  push(
    frame: FaceFrame,
    settings: Pick<
      ControllerSettings,
      'postureWarnSec' | 'postureThreshold'
    >,
  ): PostureSnapshot {
    if (!frame.hasFace || !frame.landmarks.length) {
      this.faceSinceMs = null
      this.badSinceMs = null
      return {
        pitchProxy: 0,
        score: this.scoreEma,
        badSec: 0,
        needsPostureNudge: false,
      }
    }

    if (this.faceSinceMs == null) this.faceSinceMs = frame.timestampMs

    const pitchProxy = estimatePitchProxy(frame.landmarks)
    this.scoreEma = this.scoreEma * 0.82 + pitchProxy * 0.18

    const over = this.scoreEma >= settings.postureThreshold
    if (over) {
      if (this.badSinceMs == null) this.badSinceMs = frame.timestampMs
    } else {
      this.badSinceMs = null
    }

    const badSec =
      this.badSinceMs == null
        ? 0
        : Math.max(0, (frame.timestampMs - this.badSinceMs) / 1000)

    const armed =
      frame.timestampMs - (this.faceSinceMs ?? frame.timestampMs) > 2000

    return {
      pitchProxy,
      score: this.scoreEma,
      badSec,
      needsPostureNudge:
        armed && badSec >= settings.postureWarnSec,
    }
  }
}
