import type { ControllerSettings, FaceMode, PlayerPhase } from './types'

/** Viewer → phone: detection + nudge + effective play state. */
export type DetectBroadcast = {
  v: 2
  kind: 'detect'
  shouldPlay: boolean
  showChewNudge: boolean
  showBlinkNudge: boolean
  showFriendNudge: boolean
  showPostureNudge: boolean
  phase: PlayerPhase
  isChewing: boolean
  faceCount: number
  faceMode: FaceMode
  resumeNeed: number
  resumeHave: number
  secSinceLastBlink: number
  /** Viewer camera session running. */
  sessionOn: boolean
  ts: number
}

/** Phone → viewer: remote transport + settings (camera runs on viewer). */
export type CommandBroadcast = {
  v: 2
  kind: 'command'
  forcePlay: boolean
  manualPaused: boolean
  settings: ControllerSettings
  ts: number
}

/** @deprecated v1 controller→viewer blob; kept for type-guard migration. */
export type RemoteControlState = {
  v: 1
  shouldPlay: boolean
  showChewNudge: boolean
  showBlinkNudge: boolean
  showFriendNudge: boolean
  showPostureNudge: boolean
  phase: PlayerPhase
  isChewing: boolean
  faceCount: number
  faceMode: FaceMode
  resumeNeed: number
  resumeHave: number
  secSinceLastBlink: number
  ts: number
}

export const EMPTY_DETECT: DetectBroadcast = {
  v: 2,
  kind: 'detect',
  shouldPlay: false,
  showChewNudge: false,
  showBlinkNudge: false,
  showFriendNudge: false,
  showPostureNudge: false,
  phase: 'NO_FACE',
  isChewing: false,
  faceCount: 0,
  faceMode: 1,
  resumeNeed: 2,
  resumeHave: 0,
  secSinceLastBlink: 0,
  sessionOn: false,
  ts: 0,
}

/** @deprecated use EMPTY_DETECT */
export const EMPTY_REMOTE_STATE: RemoteControlState = {
  v: 1,
  shouldPlay: false,
  showChewNudge: false,
  showBlinkNudge: false,
  showFriendNudge: false,
  showPostureNudge: false,
  phase: 'NO_FACE',
  isChewing: false,
  faceCount: 0,
  faceMode: 1,
  resumeNeed: 2,
  resumeHave: 0,
  secSinceLastBlink: 0,
  ts: 0,
}

export function isDetectBroadcast(x: unknown): x is DetectBroadcast {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  return o.v === 2 && o.kind === 'detect' && typeof o.shouldPlay === 'boolean'
}

export function isCommandBroadcast(x: unknown): x is CommandBroadcast {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  return (
    o.v === 2 &&
    o.kind === 'command' &&
    typeof o.forcePlay === 'boolean' &&
    typeof o.manualPaused === 'boolean' &&
    o.settings != null &&
    typeof o.settings === 'object'
  )
}

export function isRemoteControlState(x: unknown): x is RemoteControlState {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  if (o.v !== 1 || typeof o.shouldPlay !== 'boolean') return false
  if (typeof o.showPostureNudge !== 'boolean') {
    ;(o as { showPostureNudge: boolean }).showPostureNudge = false
  }
  return true
}
