import type { ChewSnapshot, ControllerSettings, FaceFrame } from './types'

type Sample = { t: number; jaw: number; smile: number }

type ChewSettings = Pick<
  ControllerSettings,
  'sensitivity' | 'amplitudeThreshold' | 'freqMinHz' | 'freqMaxHz'
>

/**
 * Jaw-oscillation chew detector (not static mouth-open).
 * Uses peak counting in a freq band + short-window oscillation energy
 * so typical webcam distances still register.
 */
export class ChewScorer {
  private samples: Sample[] = []
  private readonly windowMs = 2800
  private lastPeakT = -1
  private lastCycleT = -1
  private rising = false
  private cycleEvents: number[] = []
  private gapSamples: number[] = []
  private ema = 0
  private emaInited = false

  reset(): void {
    this.samples = []
    this.lastPeakT = -1
    this.lastCycleT = -1
    this.rising = false
    this.cycleEvents = []
    this.gapSamples = []
    this.ema = 0
    this.emaInited = false
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

    // Blend jawOpen with MAR; MAR is often stronger at distance.
    const raw = frame.jawOpen * 0.55 + Math.min(1, frame.mar * 2.8) * 0.45
    if (!this.emaInited) {
      this.ema = raw
      this.emaInited = true
    } else {
      this.ema = this.ema * 0.65 + raw * 0.35
    }
    const jaw = this.ema

    this.samples.push({
      t: frame.timestampMs,
      jaw,
      smile: frame.mouthSmile,
    })

    const cutoff = frame.timestampMs - this.windowMs
    while (this.samples.length && this.samples[0].t < cutoff) {
      this.samples.shift()
    }
    this.cycleEvents = this.cycleEvents.filter((t) => t >= cutoff)

    // Lower floor for real webcam; sensitivity reduces floor further.
    const ampFloor = Math.max(
      0.018,
      settings.amplitudeThreshold * (1.15 - settings.sensitivity * 0.85),
    )
    const values = this.samples.map((s) => s.jaw)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const amplitude = max - min
    const mean = values.reduce((a, b) => a + b, 0) / Math.max(1, values.length)
    const variance =
      values.reduce((a, b) => a + (b - mean) ** 2, 0) /
      Math.max(1, values.length)
    const std = Math.sqrt(variance)

    const recentSmile =
      this.samples.reduce((a, s) => a + s.smile, 0) /
      Math.max(1, this.samples.length)
    // Only veto strong smile with tiny jaw motion (talking/laugh).
    const smilePenalty =
      recentSmile > 0.45 && amplitude < ampFloor * 1.2 ? 0.55 : 1

    const periodMinMs = 1000 / settings.freqMaxHz
    const periodMaxMs = 1000 / Math.max(0.25, settings.freqMinHz)

    let newCycle = false
    if (this.samples.length >= 4) {
      const prev = this.samples[this.samples.length - 2].jaw
      const curr = this.samples[this.samples.length - 1].jaw
      const mid = (min + max) / 2
      const peakMargin = Math.max(ampFloor * 0.2, std * 0.35)

      if (!this.rising && curr > prev && curr > mid) {
        this.rising = true
      } else if (
        this.rising &&
        curr < prev &&
        prev > mid + peakMargin
      ) {
        this.rising = false
        const seeded = this.lastPeakT < 0
        const dt = seeded
          ? (periodMinMs + periodMaxMs) / 2
          : frame.timestampMs - this.lastPeakT
        const inBand = seeded || (dt >= periodMinMs * 0.85 && dt <= periodMaxMs * 1.15)
        const strongEnough = amplitude >= ampFloor || std >= ampFloor * 0.55
        if (
          strongEnough &&
          inBand &&
          (seeded || frame.timestampMs - this.lastCycleT > periodMinMs * 0.55)
        ) {
          if (!seeded && this.lastCycleT > 0) {
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
        } else if (strongEnough) {
          this.lastPeakT = frame.timestampMs
        }
      }
    }

    const cyclesInWindow = this.cycleEvents.length
    // Oscillation energy: chewing even if peaks are messy.
    const energyChew = std >= ampFloor * 0.45 && amplitude >= ampFloor * 0.7
    const need = settings.sensitivity >= 0.65 ? 1 : 2
    const periodic = cyclesInWindow >= need
    const score =
      Math.min(
        1,
        (amplitude / Math.max(ampFloor * 2.2, 1e-6)) * 0.4 +
          (std / Math.max(ampFloor, 1e-6)) * 0.25 +
          (cyclesInWindow / 3) * 0.35,
      ) * smilePenalty

    const isChewing =
      ((periodic || (energyChew && cyclesInWindow >= 1) || newCycle) &&
        score > 0.18 * smilePenalty) ||
      (energyChew && score > 0.35 && smilePenalty > 0.7)

    return {
      score,
      isChewing,
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
