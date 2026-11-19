import type { FaceMode, PlayerPhase } from './types'

/** Controller → viewer playback + nudge payload (broadcast). */
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

export function isRemoteControlState(x: unknown): x is RemoteControlState {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  if (o.v !== 1 || typeof o.shouldPlay !== 'boolean') return false
  // Older controllers may omit posture field
  if (typeof o.showPostureNudge !== 'boolean') {
    ;(o as { showPostureNudge: boolean }).showPostureNudge = false
  }
  return true
}
