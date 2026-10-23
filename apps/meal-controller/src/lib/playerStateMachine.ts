import type { ControllerSettings, PlayerPhase } from './types'

export type MachineInput = {
  nowMs: number
  hasFace: boolean
  isChewing: boolean
  newCycle: boolean
  /** Median inter-chew gap from scorer (0 if unknown). */
  habitualGapSec: number
  settings: ControllerSettings
}

export type MachineOutput = {
  phase: PlayerPhase
  shouldPlay: boolean
  showNudge: boolean
  noChewSec: number
  resumeProgress: number
  faceLostSec: number
  effectivePauseSec: number
}

/**
 * NO_FACE → ARMED → PLAYING ↔ PAUSED
 * Pause after no-chew ≥ effective T_pause; resume after N_resume chew cycles.
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
    const { nowMs, hasFace, isChewing, newCycle, habitualGapSec, settings } =
      input
    const effectivePauseSec = computeEffectivePauseSec(
      settings,
      habitualGapSec,
    )
    const pauseMs = effectivePauseSec * 1000
    const lostMs = settings.faceLostDelaySec * 1000
    const debounceMs = settings.debounceSec * 1000

    if (!hasFace) {
      if (this.faceLostSince == null) this.faceLostSince = nowMs
      const faceLostSec = (nowMs - this.faceLostSince) / 1000
      if (nowMs - this.faceLostSince >= lostMs) {
        this.transition('NO_FACE', nowMs)
        this.resumeCycles = 0
      }
      return this.output(nowMs, faceLostSec, effectivePauseSec)
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
        if (
          noChew >= pauseMs &&
          nowMs - this.lastTransitionMs >= debounceMs
        ) {
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
          nowMs - this.lastTransitionMs >= debounceMs
        ) {
          this.transition('PLAYING', nowMs)
          this.resumeCycles = 0
          this.lastChewMs = nowMs
        }
        break
    }

    return this.output(nowMs, 0, effectivePauseSec)
  }

  private transition(next: PlayerPhase, nowMs: number): void {
    if (this.phase === next) return
    this.phase = next
    this.lastTransitionMs = nowMs
  }

  private output(
    nowMs: number,
    faceLostSec: number,
    effectivePauseSec: number,
  ): MachineOutput {
    const noChewSec = Math.max(0, (nowMs - this.lastChewMs) / 1000)
    return {
      phase: this.phase,
      shouldPlay: this.phase === 'PLAYING',
      showNudge: this.phase === 'PAUSED',
      noChewSec:
        this.phase === 'PLAYING' || this.phase === 'PAUSED' ? noChewSec : 0,
      resumeProgress: this.phase === 'PAUSED' ? this.resumeCycles : 0,
      faceLostSec,
      effectivePauseSec,
    }
  }

  getResumeCycles(): number {
    return this.resumeCycles
  }
}

export function computeEffectivePauseSec(
  settings: ControllerSettings,
  habitualGapSec: number,
): number {
  const base = settings.pauseDelaySec
  const mult = settings.habitualPauseMultiplier
  if (habitualGapSec > 0.3 && Math.abs(mult - 1) > 0.01) {
    const fromHabit = habitualGapSec * mult
    return Math.min(8, Math.max(1, Math.max(base * 0.75, fromHabit)))
  }
  return Math.min(8, Math.max(1, base * mult))
}
