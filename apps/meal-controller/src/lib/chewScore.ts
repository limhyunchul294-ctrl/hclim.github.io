import type { ChewSnapshot, ControllerSettings, FaceFrame } from './types'

type Sample = { t: number; jaw: number; mar: number; smile: number }

type ChewSettings = Pick<
  ControllerSettings,
  'sensitivity' | 'amplitudeThreshold' | 'freqMinHz' | 'freqMaxHz'
>

/**
 * Jaw-oscillation chew detector (not static mouth-open).
 * Peak intervals must fall inside the configured Hz band.
 */
export class ChewScorer {
  private samples: Sample[] = []
  private readonly windowMs = 2500
  private lastPeakT = -Infinity
  private lastCycleT = -Infinity
  private rising = false
  private cycleEvents: number[] = []
  private gapSamples: number[] = []

  reset(): void {
    this.samples = []
    this.lastPeakT = -Infinity
    this.lastCycleT = -Infinity
    this.rising = false
    this.cycleEvents = []
    this.gapSamples = []
  }

  push(
    frame: FaceFrame,
    settings: ChewSettings,
  ): ChewSnapshot & { newCycle: boolean } {
    if (!frame.hasFace) {
      return {
        score: 0,
        isChewing: false,
        cyclesInWindow: 0,
        amplitude: 0,
        habitualGapSec: this.habitualGapSec(),
        newCycle: false,
      }
    }

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

    // Sensitivity lowers the floor; amplitudeThreshold is the user absolute.
    const ampFloor =
      settings.amplitudeThreshold * (1.35 - settings.sensitivity * 0.7)
    const values = this.samples.map((s) => s.jaw)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const amplitude = max - min

    const recentSmile =
      this.samples.reduce((a, s) => a + s.smile, 0) /
      Math.max(1, this.samples.length)
    const smilePenalty =
      recentSmile > 0.35 && amplitude < ampFloor * 1.8 ? 0.45 : 1

    const periodMinMs = 1000 / settings.freqMaxHz
    const periodMaxMs = 1000 / settings.freqMinHz

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
        if (
          amplitude >= ampFloor &&
          dt >= periodMinMs &&
          dt <= periodMaxMs &&
          frame.timestampMs - this.lastCycleT > periodMinMs * 0.7
        ) {
          if (Number.isFinite(this.lastCycleT) && this.lastCycleT > 0) {
            const gap = (frame.timestampMs - this.lastCycleT) / 1000
            if (gap > 0.2 && gap < 5) {
              this.gapSamples.push(gap)
              if (this.gapSamples.length > 12) this.gapSamples.shift()
            }
          }
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
    const need = settings.sensitivity > 0.7 ? 1 : 2
    const periodic = cyclesInWindow >= need
    const score =
      Math.min(
        1,
        (amplitude / (ampFloor * 3)) * 0.5 + (cyclesInWindow / 4) * 0.5,
      ) * smilePenalty

    return {
      score,
      isChewing: periodic && score > 0.25 * smilePenalty,
      cyclesInWindow,
      amplitude,
      habitualGapSec: this.habitualGapSec(),
      newCycle,
    }
  }

  private habitualGapSec(): number {
    if (this.gapSamples.length < 3) return 0
    const sorted = [...this.gapSamples].sort((a, b) => a - b)
    return sorted[Math.floor(sorted.length / 2)]
  }
}
