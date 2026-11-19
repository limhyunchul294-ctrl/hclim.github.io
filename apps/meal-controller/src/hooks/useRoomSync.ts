import { useCallback, useEffect, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { channelNameForRoom } from '../lib/roomCode'
import { getSupabase } from '../lib/supabaseClient'
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

type SyncStatus =
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

  const channelRef = useRef<RealtimeChannel | null>(null)
  const lastSentRef = useRef(0)
  const lastPayloadRef = useRef('')
  const roleRef = useRef(role)
  roleRef.current = role

  const cleanup = useCallback(async () => {
    const ch = channelRef.current
    channelRef.current = null
    if (ch) {
      try {
        await getSupabase().removeChannel(ch)
      } catch {
        /* ignore */
      }
    }
  }, [])

  useEffect(() => {
    if (!enabled || !room || !role) {
      void cleanup()
      setStatus('idle')
      setPeerConnected(false)
      setRemote(null)
      setError(null)
      return
    }

    let cancelled = false
    setStatus('connecting')
    setError(null)
    setPeerConnected(false)

    const supabase = getSupabase()
    const channel = supabase.channel(channelNameForRoom(room), {
      config: {
        broadcast: { self: false },
        presence: { key: `${role}-${Math.random().toString(36).slice(2, 8)}` },
      },
    })
    channelRef.current = channel

    channel.on('broadcast', { event: 'control' }, ({ payload }) => {
      if (roleRef.current !== 'viewer') return
      if (isRemoteControlState(payload)) {
        setRemote(payload)
      }
    })

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState() as Record<
        string,
        Array<{ role?: string }>
      >
      const roles = new Set<string>()
      for (const key of Object.keys(state)) {
        for (const meta of state[key] ?? []) {
          if (meta?.role) roles.add(meta.role)
        }
      }
      const wantPeer = roleRef.current === 'controller' ? 'viewer' : 'controller'
      const linked = roles.has(wantPeer)
      setPeerConnected(linked)
      setStatus(linked ? 'linked' : 'waiting')
    })

    channel.subscribe(async (subStatus) => {
      if (cancelled) return
      if (subStatus === 'SUBSCRIBED') {
        try {
          await channel.track({ role, at: Date.now() })
          setStatus('waiting')
        } catch (err) {
          setStatus('error')
          setError(
            err instanceof Error ? err.message : '방에 연결하지 못했어요.',
          )
        }
      } else if (
        subStatus === 'CHANNEL_ERROR' ||
        subStatus === 'TIMED_OUT' ||
        subStatus === 'CLOSED'
      ) {
        setStatus('error')
        setError('연결이 끊겼어요. 코드를 다시 확인해 주세요.')
      }
    })

    return () => {
      cancelled = true
      void cleanup()
    }
  }, [cleanup, enabled, room, role])

  // Controller → broadcast (throttle ~8Hz, skip identical payloads)
  useEffect(() => {
    if (!enabled || role !== 'controller' || !outbound || !channelRef.current) {
      return
    }
    const now = performance.now()
    const json = JSON.stringify({
      shouldPlay: outbound.shouldPlay,
      showChewNudge: outbound.showChewNudge,
      showBlinkNudge: outbound.showBlinkNudge,
      showFriendNudge: outbound.showFriendNudge,
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
    void channelRef.current.send({
      type: 'broadcast',
      event: 'control',
      payload: outbound,
    })
  }, [enabled, outbound, role])

  return {
    status,
    error,
    peerConnected,
    remote,
  }
}
