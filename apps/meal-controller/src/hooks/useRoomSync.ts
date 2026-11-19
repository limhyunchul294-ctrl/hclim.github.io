import { useCallback, useEffect, useRef, useState } from 'react'
import { connectRoomMqtt } from '../lib/mqttRoomClient'
import {
  isCommandBroadcast,
  isDetectBroadcast,
  isPreviewBroadcast,
  isRemoteControlState,
  type CommandBroadcast,
  type DetectBroadcast,
  type PreviewBroadcast,
} from '../lib/roomSyncTypes'

type Role = 'controller' | 'viewer'

type Options = {
  room: string | null
  role: Role | null
  /** Viewer publishes detection / play outcome. */
  outboundDetect?: DetectBroadcast | null
  /** Phone publishes play/pause + settings. */
  outboundCommand?: CommandBroadcast | null
  /** Viewer publishes JPEG thumbnails while phone wants preview. */
  outboundPreview?: PreviewBroadcast | null
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
  const m = c.ytMedia
  return JSON.stringify({
    forcePlay: c.forcePlay,
    manualPaused: c.manualPaused,
    settings: c.settings,
    wantPreview: c.wantPreview,
    ytMedia: m
      ? {
          volume: m.volume,
          muted: m.muted,
          playbackRate: m.playbackRate,
          seekSeq: m.seekSeq,
          seekDeltaSec: m.seekDeltaSec,
        }
      : null,
  })
}

export function useRoomSync({
  room,
  role,
  outboundDetect = null,
  outboundCommand = null,
  outboundPreview = null,
  enabled = true,
}: Options) {
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [peerConnected, setPeerConnected] = useState(false)
  const [remoteDetect, setRemoteDetect] = useState<DetectBroadcast | null>(null)
  const [remoteCommand, setRemoteCommand] = useState<CommandBroadcast | null>(
    null,
  )
  const [remotePreview, setRemotePreview] = useState<PreviewBroadcast | null>(
    null,
  )
  /** Bumps when MQTT is connected+subscribed so outbound effects flush. */
  const [mqttEpoch, setMqttEpoch] = useState(0)

  const publishDetectRef = useRef<((payload: unknown) => boolean) | null>(null)
  const publishCommandRef = useRef<((payload: unknown) => boolean) | null>(null)
  const publishPreviewRef = useRef<((payload: unknown) => boolean) | null>(null)
  const lastDetectSentRef = useRef(0)
  const lastDetectPayloadRef = useRef('')
  const lastCommandSentRef = useRef(0)
  const lastCommandPayloadRef = useRef('')
  const lastPreviewTsRef = useRef(0)
  const pendingCommandRef = useRef<CommandBroadcast | null>(null)
  const commandRetryTimerRef = useRef<number | null>(null)
  const roleRef = useRef(role)
  roleRef.current = role

  const clearCommandRetry = useCallback(() => {
    if (commandRetryTimerRef.current != null) {
      window.clearTimeout(commandRetryTimerRef.current)
      commandRetryTimerRef.current = null
    }
  }, [])

  const cleanup = useCallback(() => {
    publishDetectRef.current = null
    publishCommandRef.current = null
    publishPreviewRef.current = null
    pendingCommandRef.current = null
    clearCommandRetry()
  }, [clearCommandRetry])

  useEffect(() => {
    if (!enabled || !room || !role) {
      cleanup()
      setStatus('idle')
      setPeerConnected(false)
      setRemoteDetect(null)
      setRemoteCommand(null)
      setRemotePreview(null)
      setError(null)
      return
    }

    let disposed = false
    setStatus('connecting')
    setError(null)
    setPeerConnected(false)
    setRemotePreview(null)

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
          // Flush outbound after subscribe — epoch bump re-runs publish effects
          setMqttEpoch((n) => n + 1)
        } else if (s === 'error') {
          setStatus('error')
          setRemotePreview(null)
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
        if (!linked) {
          setRemotePreview(null)
        }
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
      onPreview: (payload) => {
        if (disposed) return
        if (roleRef.current !== 'controller') return
        if (isPreviewBroadcast(payload)) {
          setRemotePreview(payload)
        }
      },
    })

    publishDetectRef.current = session.publishDetect
    publishCommandRef.current = session.publishCommand
    publishPreviewRef.current = session.publishPreview

    return () => {
      disposed = true
      publishDetectRef.current = null
      publishCommandRef.current = null
      publishPreviewRef.current = null
      session.dispose()
      cleanup()
      setRemotePreview(null)
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
    const ok = publishDetectRef.current(outboundDetect)
    if (!ok) return
    lastDetectSentRef.current = now
    lastDetectPayloadRef.current = json
  }, [enabled, outboundDetect, role, mqttEpoch])

  const flushCommand = useCallback(
    (cmd: CommandBroadcast, force = false) => {
      const publish = publishCommandRef.current
      if (!publish) {
        pendingCommandRef.current = cmd
        return
      }
      const now = performance.now()
      const json = commandFingerprint(cmd)
      if (
        !force &&
        json === lastCommandPayloadRef.current &&
        now - lastCommandSentRef.current < 500
      ) {
        return
      }
      // Different payload must not be dropped by the rate limit — queue a retry
      if (!force && now - lastCommandSentRef.current < 80) {
        pendingCommandRef.current = cmd
        if (commandRetryTimerRef.current == null) {
          const wait = Math.max(16, 80 - (now - lastCommandSentRef.current))
          commandRetryTimerRef.current = window.setTimeout(() => {
            commandRetryTimerRef.current = null
            const pending = pendingCommandRef.current
            if (pending) flushCommand(pending, true)
          }, wait)
        }
        return
      }
      const ok = publish(cmd)
      if (!ok) {
        pendingCommandRef.current = cmd
        if (commandRetryTimerRef.current == null) {
          commandRetryTimerRef.current = window.setTimeout(() => {
            commandRetryTimerRef.current = null
            const pending = pendingCommandRef.current
            if (pending) flushCommand(pending, true)
          }, 200)
        }
        return
      }
      pendingCommandRef.current = null
      lastCommandSentRef.current = now
      lastCommandPayloadRef.current = json
    },
    [],
  )

  // Phone → viewer command (never permanently drop wantPreview / settings)
  useEffect(() => {
    if (!enabled || role !== 'controller' || !outboundCommand) {
      return
    }
    flushCommand(outboundCommand)
  }, [enabled, outboundCommand, role, mqttEpoch, flushCommand])

  // While preview is requested, re-announce periodically (QoS0 can drop)
  useEffect(() => {
    if (
      !enabled ||
      role !== 'controller' ||
      !outboundCommand?.wantPreview
    ) {
      return
    }
    const id = window.setInterval(() => {
      flushCommand(
        {
          ...outboundCommand,
          ts: Date.now(),
        },
        true,
      )
    }, 1500)
    return () => window.clearInterval(id)
  }, [enabled, role, outboundCommand, flushCommand])

  // Viewer → phone preview frames (already rate-limited by capture loop)
  useEffect(() => {
    if (
      !enabled ||
      role !== 'viewer' ||
      !outboundPreview ||
      !publishPreviewRef.current
    ) {
      return
    }
    if (outboundPreview.ts && outboundPreview.ts <= lastPreviewTsRef.current) {
      return
    }
    const ok = publishPreviewRef.current(outboundPreview)
    if (!ok) return
    lastPreviewTsRef.current = outboundPreview.ts
  }, [enabled, outboundPreview, role, mqttEpoch])

  return {
    status,
    error,
    peerConnected,
    remoteDetect,
    remoteCommand,
    remotePreview,
  }
}
