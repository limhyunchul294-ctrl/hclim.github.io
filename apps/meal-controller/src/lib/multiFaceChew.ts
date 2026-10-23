import { ChewScorer } from './chewScore'
import type {
  ChewSnapshot,
  ControllerSettings,
  FaceFrame,
  FaceMode,
  FaceSignals,
} from './types'

export type AggregatedChew = ChewSnapshot & {
  newCycle: boolean
  /** Per-face chewing flags (length = faceMode when enough faces). */
  perFaceChewing: boolean[]
  facesReady: boolean
  missingBuddy: boolean
}

type ChewSettings = Pick<
  ControllerSettings,
  'sensitivity' | 'amplitudeThreshold' | 'freqMinHz' | 'freqMaxHz'
>

function asFrame(base: FaceFrame, face: FaceSignals): FaceFrame {
  return {
    timestampMs: base.timestampMs,
    hasFace: true,
    faceCount: 1,
    faces: [face],
    jawOpen: face.jawOpen,
    mouthSmile: face.mouthSmile,
    eyeBlinkLeft: face.eyeBlinkLeft,
    eyeBlinkRight: face.eyeBlinkRight,
    mar: face.mar,
    landmarks: face.landmarks,
  }
}

/**
 * Runs one ChewScorer per expected diner.
 * Rule: pause unless all active faces are chewing (and face count ≥ mode).
 */
export class MultiFaceChew {
  private scorers = [new ChewScorer(), new ChewScorer()]

  reset(): void {
    this.scorers.forEach((s) => s.reset())
  }

  push(
    frame: FaceFrame,
    settings: ChewSettings,
    faceMode: FaceMode,
  ): AggregatedChew {
    const need = faceMode
    const facesReady = frame.faceCount >= need
    const missingBuddy = faceMode === 2 && frame.faceCount === 1

    if (!facesReady) {
      if (frame.faces[0]) {
        this.scorers[0].push(asFrame(frame, frame.faces[0]), settings)
      }
      return {
        score: 0,
        isChewing: false,
        cyclesInWindow: 0,
        amplitude: 0,
        habitualGapSec: 0,
        newCycle: false,
        perFaceChewing: [],
        facesReady: false,
        missingBuddy,
      }
    }

    const snaps = []
    for (let i = 0; i < need; i++) {
      snaps.push(this.scorers[i].push(asFrame(frame, frame.faces[i]), settings))
    }

    const perFaceChewing = snaps.map((s) => s.isChewing)
    const allChewing = perFaceChewing.every(Boolean)
    // Resume cycle: every required face chewing, and at least one new peak
    const newCycle = allChewing && snaps.some((s) => s.newCycle)
    const score = Math.min(...snaps.map((s) => s.score))
    const cyclesInWindow = Math.min(...snaps.map((s) => s.cyclesInWindow))
    const amplitude = Math.min(...snaps.map((s) => s.amplitude))
    const gaps = snaps.map((s) => s.habitualGapSec).filter((g) => g > 0)
    const habitualGapSec =
      gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0

    return {
      score,
      isChewing: allChewing,
      cyclesInWindow,
      amplitude,
      habitualGapSec,
      newCycle,
      perFaceChewing,
      facesReady: true,
      missingBuddy: false,
    }
  }
}
