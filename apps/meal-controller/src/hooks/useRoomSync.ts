import { useCallback, useEffect, useRef, useState } from 'react'
import { connectRoomMqtt } from '../lib/mqttRoomClient'
import {
  isCommandBroadcast,
  isDetectBroadcast,
  isRemoteControlState,
  type CommandBroadcast,
  type DetectBroadcast,
} from '../lib/roomSyncTypes'

type Role = 'controller' | 'viewer'

type Options = {
  room: string | null
  role: Role | null
  /** Viewer publishes detection / play outcome. */
  outboundDetect?: DetectBroadcast | null
  /** Phone publishes play/pause + settings. */
  outboundCommand?: CommandBroadcast | null
  enabled?: boolean
}

export type SyncStatus =
  | 'idle'
  | 'connecting'
  | 'waiting'
  | 'linked'
  | 'error'

function detectFingerprint(d: DetectBroadcast): string {
  return JSON.stringify({
    shouldPlay: d.shouldPlay,
    showChewNudge: d.showChewNudge,
    showBlinkNudge: d.showBlinkNudge,
    showFriendNudge: d.showFriendNudge,
    showPostureNudge: d.showPostureNudge,
    phase: d.phase,
    isChewing: d.isChewing,
    faceCount: d.faceCount,
    faceMode: d.faceMode,
    resumeNeed: d.resumeNeed,
    resumeHave: d.resumeHave,
    secSinceLastBlink: d.secSinceLastBlink,
    sessionOn: d.sessionOn,
  })
}

function commandFingerprint(c: CommandBroadcast): string {
  return JSON.stringify({
    forcePlay: c.forcePlay,
    manualPaused: c.manualPaused,
    settings: c.settings,
  })
}

export function useRoomSync({
  room,
  role,
  outboundDetect = null,
  outboundCommand = null,
  enabled = true,
}: Options) {
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [peerConnected, setPeerConnected] = useState(false)
  const [remoteDetect, setRemoteDetect] = useState<DetectBroadcast | null>(null)
  const [remoteCommand, setRemoteCommand] = useState<CommandBroadcast | null>(
    null,
  )

  const publishDetectRef = useRef<((payload: unknown) => void) | null>(null)
  const publishCommandRef = useRef<((payload: unknown) => void) | null>(null)
  const lastDetectSentRef = useRef(0)
  const lastDetectPayloadRef = useRef('')
  const lastCommandSentRef = useRef(0)
  const lastCommandPayloadRef = useRef('')
  const roleRef = useRef(role)
  roleRef.current = role

  const cleanup = useCallback(() => {
    publishDetectRef.current = null
    publishCommandRef.current = null
  }, [])

  useEffect(() => {
    if (!enabled || !room || !role) {
      cleanup()
      setStatus('idle')
      setPeerConnected(false)
      setRemoteDetect(null)
      setRemoteCommand(null)
      setError(null)
      return
    }

    let disposed = false
    setStatus('connecting')
    setError(null)
    setPeerConnected(false)

    const clientKey = `${role}-${Math.random().toString(36).slice(2, 8)}`
    const session = connectRoomMqtt({
      room,
      role,
      clientKey,
      onStatus: (s, detail) => {
        if (disposed) return
        if (s === 'connecting') {
          setStatus('connecting')
          setError(null)
        } else if (s === 'connected') {
          setStatus('waiting')
          setError(null)
        } else if (s === 'error') {
          setStatus('error')
          setError(
            detail ??
              '연결이 안 됐어요. 같은 코드인지, 인터넷이 되는지를 확인해 주세요.',
          )
        }
      },
      onPresence: (roles) => {
        if (disposed) return
        const wantPeer =
          roleRef.current === 'controller' ? 'viewer' : 'controller'
        const linked = roles.has(wantPeer)
        setPeerConnected(linked)
        setStatus((prev) => {
          if (prev === 'error' || prev === 'idle') return prev
          return linked ? 'linked' : 'waiting'
        })
      },
      onDetect: (payload) => {
        if (disposed) return
        // Phone consumes viewer detection (ignore own echo by role)
        if (roleRef.current !== 'controller') return
        if (isDetectBroadcast(payload)) {
          setRemoteDetect(payload)
          return
        }
        // Legacy v1: older phone-as-detector peers — map into detect shape
        if (isRemoteControlState(payload)) {
          setRemoteDetect({
            v: 2,
            kind: 'detect',
            shouldPlay: payload.shouldPlay,
            showChewNudge: payload.showChewNudge,
            showBlinkNudge: payload.showBlinkNudge,
            showFriendNudge: payload.showFriendNudge,
            showPostureNudge: payload.showPostureNudge,
            phase: payload.phase,
            isChewing: payload.isChewing,
            faceCount: payload.faceCount,
            faceMode: payload.faceMode,
            resumeNeed: payload.resumeNeed,
            resumeHave: payload.resumeHave,
            secSinceLastBlink: payload.secSinceLastBlink,
            sessionOn: true,
            ts: payload.ts,
          })
        }
      },
      onCommand: (payload) => {
        if (disposed) return
        if (roleRef.current !== 'viewer') return
        if (isCommandBroadcast(payload)) {
          setRemoteCommand(payload)
        }
      },
    })

    publishDetectRef.current = session.publishDetect
    publishCommandRef.current = session.publishCommand

    return () => {
      disposed = true
      publishDetectRef.current = null
      publishCommandRef.current = null
      session.dispose()
      cleanup()
    }
  }, [cleanup, enabled, room, role])

  // Viewer → phone detect (throttle ~8Hz)
  useEffect(() => {
    if (
      !enabled ||
      role !== 'viewer' ||
      !outboundDetect ||
      !publishDetectRef.current
    ) {
      return
    }
    const now = performance.now()
    const json = detectFingerprint(outboundDetect)
    if (json === lastDetectPayloadRef.current && now - lastDetectSentRef.current < 500) {
      return
    }
    if (now - lastDetectSentRef.current < 80) return
    lastDetectSentRef.current = now
    lastDetectPayloadRef.current = json
    publishDetectRef.current(outboundDetect)
  }, [enabled, outboundDetect, role])

  // Phone → viewer command (throttle; settings changes send immediately-ish)
  useEffect(() => {
    if (
      !enabled ||
      role !== 'controller' ||
      !outboundCommand ||
      !publishCommandRef.current
    ) {
      return
    }
    const now = performance.now()
    const json = commandFingerprint(outboundCommand)
    if (
      json === lastCommandPayloadRef.current &&
      now - lastCommandSentRef.current < 500
    ) {
      return
    }
    if (now - lastCommandSentRef.current < 80) return
    lastCommandSentRef.current = now
    lastCommandPayloadRef.current = json
    publishCommandRef.current(outboundCommand)
  }, [enabled, outboundCommand, role])

  return {
    status,
    error,
    peerConnected,
    remoteDetect,
    remoteCommand,
  }
}
