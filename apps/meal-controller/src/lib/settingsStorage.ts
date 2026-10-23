import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  type ControllerSettings,
} from './types'

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

/** Merge persisted JSON with defaults; migrate legacy keys. */
export function loadSettings(): ControllerSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    const parsed = JSON.parse(raw) as Partial<ControllerSettings> & {
      eyesClosedWarnSec?: number
    }
    const migrated: Partial<ControllerSettings> = { ...parsed }
    if (
      migrated.noBlinkWarnSec == null &&
      typeof parsed.eyesClosedWarnSec === 'number'
    ) {
      // Old “eyes closed” → map into a sensible no-blink default range
      migrated.noBlinkWarnSec = clamp(parsed.eyesClosedWarnSec * 4, 8, 20)
    }
    return sanitizeSettings({ ...DEFAULT_SETTINGS, ...migrated })
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings: ControllerSettings): void {
  try {
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(sanitizeSettings(settings)),
    )
  } catch {
    /* quota / private mode */
  }
}

export function sanitizeSettings(s: ControllerSettings): ControllerSettings {
  let freqMin = clamp(s.freqMinHz, 0.3, 2.0)
  let freqMax = clamp(s.freqMaxHz, 0.8, 4.0)
  if (freqMin >= freqMax - 0.1) {
    freqMax = Math.min(4, freqMin + 0.3)
  }
  return {
    pauseDelaySec: clamp(s.pauseDelaySec, 1, 8),
    resumeCycles: Math.round(clamp(s.resumeCycles, 1, 6)),
    sensitivity: clamp(s.sensitivity, 0.2, 0.95),
    amplitudeThreshold: clamp(s.amplitudeThreshold, 0.015, 0.25),
    freqMinHz: freqMin,
    freqMaxHz: freqMax,
    faceLostDelaySec: clamp(s.faceLostDelaySec, 0.3, 3),
    debounceSec: clamp(s.debounceSec, 0.15, 2),
    habitualPauseMultiplier: clamp(s.habitualPauseMultiplier, 0.5, 2.5),
    noBlinkWarnSec: clamp(s.noBlinkWarnSec, 5, 30),
    pauseOnDryEye: Boolean(s.pauseOnDryEye),
    showMesh: Boolean(s.showMesh),
    showDebug: Boolean(s.showDebug),
  }
}
