import type { ChewSnapshot, ControllerSettings, FaceFrame } from './types'

type Sample = { t: number; jaw: number; mar: number; smile: number }

/**
 * Jaw-oscillation chew detector (not static mouth-open).
 * Counts peaks in a sliding window whose inter-peak interval is in ~0.6–2.5 Hz.
 */
export class ChewScorer {
  private samples: Sample[] = []
  private readonly windowMs = 2500
  private lastPeakT = -Infinity
  private lastCycleT = -Infinity
  private rising = false
  private cycleEvents: number[] = []

  reset(): void {
    this.samples = []
    this.lastPeakT = -Infinity
    this.lastCycleT = -Infinity
    this.rising = false
    this.cycleEvents = []
  }

  /** Consume a face frame; returns chew snapshot + newly completed cycle flag. */
  push(
    frame: FaceFrame,
    settings: Pick<ControllerSettings, 'sensitivity'>,
  ): ChewSnapshot & { newCycle: boolean } {
    if (!frame.hasFace) {
      return {
        score: 0,
        isChewing: false,
        cyclesInWindow: 0,
        amplitude: 0,
        newCycle: false,
      }
    }

    // Blend jawOpen with MAR so either signal can drive oscillation.
    const jaw = frame.jawOpen * 0.7 + Math.min(1, frame.mar * 2.2) * 0.3
    this.samples.push({
      t: frame.timestampMs,
      jaw,
      mar: frame.mar,
      smile: frame.mouthSmile,
    })

    const cutoff = frame.timestampMs - this.windowMs
    while (this.samples.length && this.samples[0].t < cutoff) {
      this.samples.shift()
    }
    this.cycleEvents = this.cycleEvents.filter((t) => t >= cutoff)

    const ampFloor = 0.045 + (1 - settings.sensitivity) * 0.07
    const values = this.samples.map((s) => s.jaw)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const amplitude = max - min

    // Smile veto: high smile + small jaw amp → talking/laugh, not chew.
    const recentSmile =
      this.samples.reduce((a, s) => a + s.smile, 0) /
      Math.max(1, this.samples.length)
    const smilePenalty =
      recentSmile > 0.35 && amplitude < ampFloor * 1.8 ? 0.45 : 1

    let newCycle = false
    if (this.samples.length >= 3) {
      const prev = this.samples[this.samples.length - 2].jaw
      const curr = this.samples[this.samples.length - 1].jaw
      const mid = (min + max) / 2

      if (!this.rising && curr > prev && curr > mid) {
        this.rising = true
      } else if (this.rising && curr < prev && prev > mid + ampFloor * 0.35) {
        this.rising = false
        const dt = frame.timestampMs - this.lastPeakT
        // 0.6–2.5 Hz → period 400–1667 ms
        if (
          amplitude >= ampFloor &&
          dt >= 380 &&
          dt <= 1700 &&
          frame.timestampMs - this.lastCycleT > 280
        ) {
          this.lastPeakT = frame.timestampMs
          this.lastCycleT = frame.timestampMs
          this.cycleEvents.push(frame.timestampMs)
          newCycle = true
        } else if (amplitude >= ampFloor) {
          this.lastPeakT = frame.timestampMs
        }
      }
    }

    const cyclesInWindow = this.cycleEvents.length
    // ~0.6 Hz over 2.5s ≈ 1.5 cycles; require ≥2 for "chewing" at mid sensitivity
    const need = settings.sensitivity > 0.7 ? 1 : 2
    const periodic = cyclesInWindow >= need
    const score = Math.min(
      1,
      (amplitude / (ampFloor * 3)) * 0.5 +
        (cyclesInWindow / 4) * 0.5,
    ) * smilePenalty

    return {
      score,
      isChewing: periodic && score > 0.25 * smilePenalty,
      cyclesInWindow,
      amplitude,
      newCycle,
    }
  }
}
