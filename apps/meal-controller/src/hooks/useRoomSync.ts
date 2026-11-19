import { useCallback, useEffect, useRef, useState } from 'react'
import { connectRoomMqtt } from '../lib/mqttRoomClient'
import {
  isRemoteControlState,
  type RemoteControlState,
} from '../lib/roomSyncTypes'

type Role = 'controller' | 'viewer'

type Options = {
  room: string | null
  role: Role | null
  /** Controller publishes this whenever it changes (throttled inside). */
  outbound?: RemoteControlState | null
  enabled?: boolean
}

export type SyncStatus =
  | 'idle'
  | 'connecting'
  | 'waiting'
  | 'linked'
  | 'error'

export function useRoomSync({
  room,
  role,
  outbound = null,
  enabled = true,
}: Options) {
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [peerConnected, setPeerConnected] = useState(false)
  const [remote, setRemote] = useState<RemoteControlState | null>(null)

  const publishRef = useRef<((payload: unknown) => void) | null>(null)
  const lastSentRef = useRef(0)
  const lastPayloadRef = useRef('')
  const roleRef = useRef(role)
  roleRef.current = role

  const cleanup = useCallback(() => {
    publishRef.current = null
  }, [])

  useEffect(() => {
    if (!enabled || !room || !role) {
      cleanup()
      setStatus('idle')
      setPeerConnected(false)
      setRemote(null)
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
        const wantPeer = roleRef.current === 'controller' ? 'viewer' : 'controller'
        const linked = roles.has(wantPeer)
        setPeerConnected(linked)
        setStatus((prev) => {
          if (prev === 'error' || prev === 'idle') return prev
          return linked ? 'linked' : 'waiting'
        })
      },
      onControl: (payload) => {
        if (disposed) return
        if (roleRef.current !== 'viewer') return
        if (isRemoteControlState(payload)) {
          setRemote(payload)
        }
      },
    })

    publishRef.current = session.publishControl

    return () => {
      disposed = true
      publishRef.current = null
      session.dispose()
      cleanup()
    }
  }, [cleanup, enabled, room, role])

  // Controller → broadcast (throttle ~8Hz, skip identical payloads)
  useEffect(() => {
    if (!enabled || role !== 'controller' || !outbound || !publishRef.current) {
      return
    }
    const now = performance.now()
    const json = JSON.stringify({
      shouldPlay: outbound.shouldPlay,
      showChewNudge: outbound.showChewNudge,
      showBlinkNudge: outbound.showBlinkNudge,
      showFriendNudge: outbound.showFriendNudge,
      showPostureNudge: outbound.showPostureNudge,
      phase: outbound.phase,
      isChewing: outbound.isChewing,
      faceCount: outbound.faceCount,
      faceMode: outbound.faceMode,
      resumeNeed: outbound.resumeNeed,
      resumeHave: outbound.resumeHave,
      secSinceLastBlink: outbound.secSinceLastBlink,
    })
    if (json === lastPayloadRef.current && now - lastSentRef.current < 500) {
      return
    }
    if (now - lastSentRef.current < 80) return
    lastSentRef.current = now
    lastPayloadRef.current = json
    publishRef.current(outbound)
  }, [enabled, outbound, role])

  return {
    status,
    error,
    peerConnected,
    remote,
  }
}
