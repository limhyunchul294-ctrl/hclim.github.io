import type { BlinkSnapshot, ControllerSettings, FaceFrame } from './types'

/**
 * Secondary blink metrics from eyeBlinkLeft/Right blendshapes.
 * Does NOT gate video play/pause — soft status only.
 */
export class BlinkTracker {
  private sessionStart = performance.now()
  private blinkCount = 0
  private recentBlinkTs: number[] = []
  private eyesClosedSince: number | null = null
  private wasClosed = false

  reset(nowMs = performance.now()): void {
    this.sessionStart = nowMs
    this.blinkCount = 0
    this.recentBlinkTs = []
    this.eyesClosedSince = null
    this.wasClosed = false
  }

  push(
    frame: FaceFrame,
    settings: Pick<ControllerSettings, 'eyesClosedWarnSec'>,
  ): BlinkSnapshot {
    if (!frame.hasFace) {
      this.eyesClosedSince = null
      this.wasClosed = false
      return this.snapshot(0, 0, false)
    }

    const blinkL = frame.eyeBlinkLeft
    const blinkR = frame.eyeBlinkRight
    const closedScore = Math.min(blinkL, blinkR)
    const closed = closedScore > 0.5

    if (closed) {
      if (this.eyesClosedSince == null) this.eyesClosedSince = frame.timestampMs
      if (!this.wasClosed) {
        // Rising edge ≈ blink (or start of long close)
        this.blinkCount += 1
        this.recentBlinkTs.push(frame.timestampMs)
      }
      this.wasClosed = true
    } else {
      this.eyesClosedSince = null
      this.wasClosed = false
    }

    const windowMs = 60_000
    const cutoff = frame.timestampMs - windowMs
    this.recentBlinkTs = this.recentBlinkTs.filter((t) => t >= cutoff)

    const closedMs =
      this.eyesClosedSince == null
        ? 0
        : frame.timestampMs - this.eyesClosedSince
    const eyesClosedLong =
      closedMs >= settings.eyesClosedWarnSec * 1000

    return this.snapshot(blinkL, blinkR, eyesClosedLong)
  }

  private snapshot(
    blinkLeft: number,
    blinkRight: number,
    eyesClosedLong: boolean,
  ): BlinkSnapshot {
    const elapsedMin = Math.max(
      1 / 60,
      (performance.now() - this.sessionStart) / 60_000,
    )
    // Prefer last-60s rate when we have enough time; else session average.
    const rateFromWindow = this.recentBlinkTs.length
    const blinkRatePerMin =
      elapsedMin >= 0.5
        ? rateFromWindow
        : this.blinkCount / elapsedMin

    return {
      blinkRatePerMin,
      sessionBlinkCount: this.blinkCount,
      eyesClosedLong,
      blinkLeft,
      blinkRight,
    }
  }
}
