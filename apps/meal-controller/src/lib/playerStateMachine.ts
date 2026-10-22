import type { ControllerSettings, PlayerPhase } from './types'

export type MachineInput = {
  nowMs: number
  hasFace: boolean
  isChewing: boolean
  newCycle: boolean
  settings: ControllerSettings
}

export type MachineOutput = {
  phase: PlayerPhase
  shouldPlay: boolean
  showNudge: boolean
  noChewSec: number
  resumeProgress: number
  faceLostSec: number
}

const T_LOST_MS = 1000
const DEBOUNCE_MS = 500

/**
 * NO_FACE → ARMED → PLAYING ↔ PAUSED
 * Pause after no-chew ≥ T_pause; resume after N_resume chew cycles.
 */
export class PlayerStateMachine {
  phase: PlayerPhase = 'NO_FACE'
  private lastChewMs = 0
  private faceLostSince: number | null = null
  private resumeCycles = 0
  private lastTransitionMs = 0

  reset(nowMs = performance.now()): void {
    this.phase = 'NO_FACE'
    this.lastChewMs = nowMs
    this.faceLostSince = null
    this.resumeCycles = 0
    this.lastTransitionMs = nowMs
  }

  step(input: MachineInput): MachineOutput {
    const { nowMs, hasFace, isChewing, newCycle, settings } = input
    const pauseMs = settings.pauseDelaySec * 1000

    if (!hasFace) {
      if (this.faceLostSince == null) this.faceLostSince = nowMs
      const faceLostSec = (nowMs - this.faceLostSince) / 1000
      if (nowMs - this.faceLostSince >= T_LOST_MS) {
        this.transition('NO_FACE', nowMs)
        this.resumeCycles = 0
      }
      return this.output(nowMs, faceLostSec)
    }

    this.faceLostSince = null

    if (isChewing || newCycle) {
      this.lastChewMs = nowMs
    }

    switch (this.phase) {
      case 'NO_FACE':
        this.transition('ARMED', nowMs)
        this.resumeCycles = 0
        break

      case 'ARMED':
        if (isChewing || newCycle) {
          this.transition('PLAYING', nowMs)
          this.resumeCycles = 0
        }
        break

      case 'PLAYING': {
        const noChew = nowMs - this.lastChewMs
        if (noChew >= pauseMs && nowMs - this.lastTransitionMs >= DEBOUNCE_MS) {
          this.transition('PAUSED', nowMs)
          this.resumeCycles = 0
        }
        break
      }

      case 'PAUSED':
        if (newCycle) {
          this.resumeCycles += 1
        }
        if (
          this.resumeCycles >= settings.resumeCycles &&
          nowMs - this.lastTransitionMs >= DEBOUNCE_MS
        ) {
          this.transition('PLAYING', nowMs)
          this.resumeCycles = 0
          this.lastChewMs = nowMs
        }
        break
    }

    return this.output(nowMs, 0)
  }

  private transition(next: PlayerPhase, nowMs: number): void {
    if (this.phase === next) return
    this.phase = next
    this.lastTransitionMs = nowMs
  }

  private output(nowMs: number, faceLostSec: number): MachineOutput {
    const noChewSec = Math.max(0, (nowMs - this.lastChewMs) / 1000)
    const showNudge = this.phase === 'PAUSED'
    const shouldPlay = this.phase === 'PLAYING'
    return {
      phase: this.phase,
      shouldPlay,
      showNudge,
      noChewSec:
        this.phase === 'PLAYING' || this.phase === 'PAUSED' ? noChewSec : 0,
      resumeProgress: this.phase === 'PAUSED' ? this.resumeCycles : 0,
      faceLostSec,
    }
  }

  /** For UI: how many cycles collected toward resume. */
  getResumeCycles(): number {
    return this.resumeCycles
  }
}
