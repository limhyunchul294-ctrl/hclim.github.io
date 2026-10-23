import type { BlinkSnapshot, ControllerSettings, FaceFrame } from './types'

/**
 * Secondary blink / dry-eye tracker.
 * Nudges when eyes stay OPEN without blinking for T_noblink
 * (screen staring → dry eyes). Does NOT hard-pause video by default.
 */
export class BlinkTracker {
  private sessionStart = performance.now()
  private blinkCount = 0
  private recentBlinkTs: number[] = []
  private lastBlinkMs: number | null = null
  private wasClosed = false
  /** Grace: don't nudge until we've seen at least one blink or face for a bit. */
  private faceSinceMs: number | null = null

  reset(nowMs = performance.now()): void {
    this.sessionStart = nowMs
    this.blinkCount = 0
    this.recentBlinkTs = []
    this.lastBlinkMs = null
    this.wasClosed = false
    this.faceSinceMs = null
  }

  push(
    frame: FaceFrame,
    settings: Pick<ControllerSettings, 'noBlinkWarnSec'>,
  ): BlinkSnapshot {
    if (!frame.hasFace) {
      this.wasClosed = false
      this.faceSinceMs = null
      // Keep lastBlink so rate stats persist; don't nudge without a face.
      return this.snapshot(frame.timestampMs, 0, 0, settings, false)
    }

    if (this.faceSinceMs == null) this.faceSinceMs = frame.timestampMs

    const blinkL = frame.eyeBlinkLeft
    const blinkR = frame.eyeBlinkRight
    const closedScore = Math.min(blinkL, blinkR)
    const closed = closedScore > 0.5

    if (closed) {
      if (!this.wasClosed) {
        // Rising edge = blink
        this.blinkCount += 1
        this.recentBlinkTs.push(frame.timestampMs)
        this.lastBlinkMs = frame.timestampMs
      }
      this.wasClosed = true
    } else {
      this.wasClosed = false
    }

    const windowMs = 60_000
    const cutoff = frame.timestampMs - windowMs
    this.recentBlinkTs = this.recentBlinkTs.filter((t) => t >= cutoff)

    // Baseline: if never blinked, clock from face appear (staring from start).
    const ref =
      this.lastBlinkMs ?? this.faceSinceMs ?? frame.timestampMs
    const secSinceLastBlink = Math.max(0, (frame.timestampMs - ref) / 1000)
    const armed =
      frame.timestampMs - (this.faceSinceMs ?? frame.timestampMs) > 1500
    const needsBlinkNudge =
      armed && secSinceLastBlink >= settings.noBlinkWarnSec

    return this.snapshot(
      frame.timestampMs,
      blinkL,
      blinkR,
      settings,
      needsBlinkNudge,
      secSinceLastBlink,
    )
  }

  private snapshot(
    _nowMs: number,
    blinkLeft: number,
    blinkRight: number,
    _settings: Pick<ControllerSettings, 'noBlinkWarnSec'>,
    needsBlinkNudge: boolean,
    secSinceLastBlink = 0,
  ): BlinkSnapshot {
    const elapsedMin = Math.max(
      1 / 60,
      (performance.now() - this.sessionStart) / 60_000,
    )
    const blinkRatePerMin =
      elapsedMin >= 0.5
        ? this.recentBlinkTs.length
        : this.blinkCount / elapsedMin

    return {
      blinkRatePerMin,
      sessionBlinkCount: this.blinkCount,
      secSinceLastBlink,
      needsBlinkNudge,
      blinkLeft,
      blinkRight,
    }
  }
}
